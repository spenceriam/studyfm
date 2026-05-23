#!/usr/bin/env python3
"""
Code.FM — SpaceX Livestream Ambient Station
True Live Broadcast Server — all listeners hear the same position.
"""
import os, time, queue, threading, random, json, http.server, socketserver

BLOCKS_DIR = "/tmp/code_fm"
PORT = 8898
BITRATE = 192000
CHUNK_SIZE = 8192
CHUNK_INTERVAL = CHUNK_SIZE / (BITRATE / 8)

def log(msg):
    print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] {msg}", flush=True)

def get_blocks():
    """Find all block_N/final_show.mp3 files"""
    blocks = []
    for i in range(1, 31):
        path = f"{BLOCKS_DIR}/block_{i:02d}/final_show.mp3"
        if os.path.exists(path):
            blocks.append(path)
    return blocks

ALL_BLOCKS = get_blocks()
log(f"Found {len(ALL_BLOCKS)} blocks, {sum(os.path.getsize(b) for b in ALL_BLOCKS) / 1024 / 1024:.0f}MB total")

class LiveBroadcast:
    def __init__(self, block_paths):
        self.block_paths = block_paths
        self.listeners = []
        self.lock = threading.Lock()
        self.running = True
        self.current_file = "starting up..."
        self.total_bytes = 0
        self.start_time = time.time()
        self.thread = threading.Thread(target=self._broadcast_loop, daemon=True)
        self.thread.start()
    
    def add_listener(self):
        q = queue.Queue(maxsize=200)
        with self.lock:
            self.listeners.append(q)
        log(f"[+ Listener] ({len(self.listeners)} total)")
        return q
    
    def remove_listener(self, q):
        with self.lock:
            if q in self.listeners:
                self.listeners.remove(q)
        log(f"[- Listener] ({len(self.listeners)} total)")
    
    def scan_for_new_blocks(self):
        """Periodically scan for new blocks added while running"""
        current = set(self.block_paths)
        all_found = set(get_blocks())
        new = all_found - current
        if new:
            log(f"[Scan] Found {len(new)} new block(s): {list(new)}")
            self.block_paths = list(all_found)
    
    def _broadcast_loop(self):
        while self.running:
            self.scan_for_new_blocks()
            blocks = list(self.block_paths)
            random.shuffle(blocks)
            log(f"[Broadcast] Shuffled {len(blocks)} blocks, starting live stream...")
            
            for block_path in blocks:
                if not self.running:
                    return
                self.current_file = os.path.basename(os.path.dirname(block_path))
                log(f"[Broadcast] Now playing: {self.current_file}")
                
                try:
                    with open(block_path, "rb") as f:
                        while self.running:
                            chunk = f.read(CHUNK_SIZE)
                            if not chunk:
                                break
                            self.total_bytes += len(chunk)
                            
                            with self.lock:
                                for q in list(self.listeners):
                                    try:
                                        q.put_nowait(chunk)
                                    except queue.Full:
                                        try:
                                            q.get_nowait()
                                            q.put_nowait(chunk)
                                        except queue.Empty:
                                            pass
                            time.sleep(CHUNK_INTERVAL)
                except FileNotFoundError:
                    log(f"[Broadcast] Missing: {block_path}")
                    continue
            
            log(f"[Broadcast] All blocks played, reshuffling...")

broadcast = LiveBroadcast(ALL_BLOCKS)

class Handler(http.server.BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"
    
    extensions_map = {
        '': 'application/octet-stream',
        '.html': 'text/html',
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.svg': 'image/svg+xml',
    }
    
    def log_message(self, fmt, *args):
        pass
    
    def do_GET(self):
        if self.path == "/stream" or self.path == "/stream.mp3":
            self.serve_stream()
        elif self.path == "/status":
            self.serve_status()
        elif self.path == "/" or self.path == "/index.html":
            self.serve_page()
        elif self.path.startswith("/assets/") or self.path.startswith("/vendor/"):
            self.serve_static(self.path)
        elif self.path.endswith(".js"):
            self.serve_static(self.path)
        else:
            self.send_error(404)
    
    def serve_static(self, path):
        file_path = "/tmp/code_fm/web" + path
        try:
            with open(file_path, "rb") as f:
                content = f.read()
        except FileNotFoundError:
            self.send_error(404)
            return
        
        ext = os.path.splitext(path)[1]
        mime = self.extensions_map.get(ext, 'application/octet-stream')
        self.send_response(200)
        self.send_header("Content-Type", mime)
        self.send_header("Content-Length", str(len(content)))
        self.send_header("Access-Control-Allow-Origin", "*")
        if path.startswith("/vendor/"):
            self.send_header("Cache-Control", "public, max-age=31536000, immutable")
        else:
            self.send_header("Cache-Control", "no-cache")
        self.end_headers()
        self.wfile.write(content)
    
    def serve_page(self):
        try:
            with open("/tmp/code_fm/web/Code.FM.html") as f:
                html = f.read()
        except FileNotFoundError:
            self.send_error(500, "HTML file not found")
            return
        body = html.encode()
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)
    
    def serve_status(self):
        elapsed = time.time() - broadcast.start_time
        body = json.dumps({
            "status": "live",
            "listeners": len(broadcast.listeners),
            "current_file": broadcast.current_file,
            "bytes_served": broadcast.total_bytes,
            "uptime_seconds": round(elapsed),
            "block_count": len(broadcast.block_paths),
        }).encode()
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)
    
    def serve_stream(self):
        q = broadcast.add_listener()
        try:
            self.send_response(200)
            self.send_header("Content-Type", "audio/mpeg")
            self.send_header("Cache-Control", "no-cache")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Connection", "keep-alive")
            self.end_headers()
            
            chunk_count = 0
            while broadcast.running:
                try:
                    chunk = q.get(timeout=10)
                    self.wfile.write(chunk)
                    self.wfile.flush()
                    chunk_count += 1
                except queue.Empty:
                    log(f"[Stream] Queue timeout after {chunk_count} chunks")
                    break
                except (BrokenPipeError, ConnectionResetError, OSError) as e:
                    log(f"[Stream] Connection error: {e}")
                    break
        finally:
            broadcast.remove_listener(q)

class ThreadedTCPServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
    allow_reuse_address = True
    daemon_threads = True

if __name__ == "__main__":
    log(f"\n{'='*50}")
    log(f"Code.FM — SpaceX Livestream Ambient")
    log(f"{'='*50}")
    log(f"Web:    http://0.0.0.0:{PORT}/")
    log(f"Stream: http://0.0.0.0:{PORT}/stream")
    log(f"All listeners hear the same stream at the same position.\n")
    
    with ThreadedTCPServer(("", PORT), Handler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            broadcast.running = False
            log("\nShutting down...")
