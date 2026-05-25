#!/usr/bin/env python3
"""
Study.FM — Library Study Music Station
True Live Broadcast Server — all listeners hear the same position.
"""
import os, time, queue, threading, random, json, http.server, socketserver

BLOCKS_DIR = "/tmp/study_fm"
PORT = 8897
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

# Load track manifest for display
MANIFEST = {}
try:
    with open(f"{BLOCKS_DIR}/track_manifest.json") as f:
        MANIFEST = json.load(f)
    log(f"Loaded track manifest with {len(MANIFEST)} blocks")
except FileNotFoundError:
    log("No track_manifest.json found — track titles unavailable")

# Load track boundaries for per-track display
TRACK_BOUNDARIES = {}
try:
    with open(f"{BLOCKS_DIR}/track_boundaries.json") as f:
        TRACK_BOUNDARIES = json.load(f)
    log(f"Loaded track boundaries for {len(TRACK_BOUNDARIES)} blocks")
except FileNotFoundError:
    log("No track_boundaries.json found — per-track display unavailable")

class LiveBroadcast:
    def __init__(self, block_paths):
        self.block_paths = block_paths
        self.listeners = []
        self.lock = threading.Lock()
        self.running = True
        self.current_file = "starting up..."
        self.block_byte_offset = 0
        self.total_bytes = 0
        self.start_time = time.time()
        self.genre_filter = None   # None = all genres
        self.skip_current = False
        self.needs_reshuffle = False
        self.thread = threading.Thread(target=self._broadcast_loop, daemon=True)
        self.thread.start()
    
    def load_genres(self):
        try:
            with open("/tmp/study_fm/block_genres.json") as f:
                return json.load(f)
        except:
            return {}
    
    def filter_by_genre(self, blocks):
        if not self.genre_filter or self.genre_filter == "All":
            return blocks
        genres = self.load_genres()
        matching = set()
        for bid, info in genres.items():
            if info.get("genre") == self.genre_filter:
                matching.add(bid)
        return [b for b in blocks if os.path.basename(os.path.dirname(b)) in matching]
    
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
            self.needs_reshuffle = False
            blocks = self.filter_by_genre(list(self.block_paths))
            if not blocks:
                log(f"[Broadcast] No blocks for genre '{self.genre_filter or 'All'}', will retry in 30s...")
                time.sleep(30)
                continue
            random.shuffle(blocks)
            log(f"[Broadcast] Shuffled {len(blocks)} blocks, starting live stream...")
            
            for block_path in blocks:
                if not self.running:
                    return
                if self.needs_reshuffle:
                    log(f"[Broadcast] Reshuffle triggered (genre/skip) → reshuffling blocks")
                    break
                self.current_file = os.path.basename(os.path.dirname(block_path))
                self.block_byte_offset = 0
                log(f"[Broadcast] Now playing: {self.current_file}")
                
                try:
                    with open(block_path, "rb") as f:
                        while self.running:
                            if self.skip_current:
                                self.skip_current = False
                                log(f"[Broadcast] Skip requested → advancing to next block")
                                break
                            chunk = f.read(CHUNK_SIZE)
                            if not chunk:
                                break
                            self.total_bytes += len(chunk)
                            self.block_byte_offset += len(chunk)
                            
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
        '.jsx': 'application/javascript',
        '.css': 'text/css',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.svg': 'image/svg+xml',
    }
    
    def log_message(self, fmt, *args):
        pass
    
    def do_GET(self):
        path = self.path.split("?")[0]  # strip cache-busting query strings
        if path == "/stream" or path == "/stream.mp3":
            self.serve_stream()
        elif path == "/status":
            self.serve_status()
        elif path == "/next":
            self.serve_next()
        elif path == "/" or path == "/index.html":
            self.serve_page()
        elif path == "/legacy":
            self.serve_legacy()
        elif path.startswith("/genre"):
            self.serve_genre(path)
        elif path.startswith("/compiled/") or path.startswith("/assets/") or path.startswith("/vendor/") or path.startswith("/uploads/") or path.startswith("/alerts/"):
            self.serve_static(path)
        elif path.endswith(".js") or path.endswith(".css"):
            self.serve_static(path)
        else:
            self.send_error(404)
    
    def serve_genre(self, path):
        """Return block-genre mapping + handle genre selection and filtered blocks"""
        try:
            with open("/tmp/study_fm/block_genres.json") as f:
                genres = json.load(f)
        except FileNotFoundError:
            genres = {}
        
        # /genre/select?genre=Name — set active genre filter
        if path.startswith("/genre/select"):
            qs = self.path.split("?")[-1] if "?" in self.path else ""
            genre_name = "All"
            if "genre=" in qs:
                genre_name = qs.split("genre=")[-1].split("&")[0]
            broadcast.genre_filter = genre_name
            broadcast.skip_current = True
            broadcast.needs_reshuffle = True  # break out of both loops + re-filter
            log(f"[Genre] Set filter to '{genre_name}' — forcing reshuffle with new filter")
            body = json.dumps({"genre": genre_name, "status": "ok"}).encode()
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(body)
            return
        
        # /genre/list — full mapping
        if path == "/genre/list" or path == "/genre/list/":
            body = json.dumps(genres).encode()
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(body)
            return
        
        # /genre/current — current filter
        if path == "/genre/current":
            body = json.dumps({"genre": broadcast.genre_filter or "All"}).encode()
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(body)
            return
        
        # /genre/{name} — return block IDs matching genre (for debug)
        genre_name = path.split("/genre/")[-1] if "/genre/" in path else ""
        if genre_name and genre_name != "All":
            matching = [bid for bid, info in genres.items() if info.get("genre") == genre_name]
        else:
            matching = list(genres.keys())
        
        body = json.dumps({"genre": genre_name, "blocks": matching}).encode()
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)
    
    def serve_next(self):
        """Skip to next block"""
        broadcast.skip_current = True
        body = json.dumps({"status": "skipping", "current": broadcast.current_file}).encode()
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)
    
    def serve_static(self, path):
        file_path = "/tmp/study_fm/web" + path
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
            with open("/tmp/study_fm/web/studyfm.html") as f:
                html = f.read()
        except FileNotFoundError:
            self.send_error(500, "HTML file not found")
            return
        
        # Inject current track info for first-paint data
        block_info = MANIFEST.get(broadcast.current_file, {})
        boundaries = TRACK_BOUNDARIES.get(broadcast.current_file, {}).get("boundaries", [])
        track_idx = 1
        for byte_offset, tidx in reversed(boundaries):
            if broadcast.block_byte_offset >= byte_offset:
                track_idx = tidx
                break
        titles = block_info.get("titles", [])
        track_title = titles[track_idx - 1] if track_idx <= len(titles) else ""
        block_name = block_info.get("name", "")
        
        initial = f'{{\n          "track_number": {track_idx},\n          "track_title": "{track_title}",\n          "block_name": "{block_name}",\n          "block_titles": {json.dumps(titles)},\n          "listeners": {len(broadcast.listeners)},\n          "uptime_seconds": {round(time.time() - broadcast.start_time)},\n          "block_count": {len(broadcast.block_paths)}\n        }}'
        html = html.replace('/*INIT-BEGIN*/{"track_number": 0,"track_title": "","block_name": "","block_titles": [],"listeners": 0,"uptime_seconds": 0,"block_count": 0}/*INIT-END*/',
                          f'/*INIT-BEGIN*/{initial}/*INIT-END*/')
        
        body = html.encode()
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)

    def serve_legacy(self):
        """Original Study.FM page with notch overlay (preserved for reference)."""
        try:
            with open("/tmp/study_fm/web/Study.FM.html") as f:
                html = f.read()
        except FileNotFoundError:
            self.send_error(500, "Legacy HTML not found")
            return
        # Inject current track info into the notch on page load
        block_info = MANIFEST.get(broadcast.current_file, {})
        boundaries = TRACK_BOUNDARIES.get(broadcast.current_file, {}).get("boundaries", [])
        track_idx = 1
        for byte_offset, tidx in reversed(boundaries):
            if broadcast.block_byte_offset >= byte_offset:
                track_idx = tidx
                break
        titles = block_info.get("titles", [])
        track_title = titles[track_idx - 1] if track_idx <= len(titles) else ""
        block_name = block_info.get("name", "")
        if block_name and track_title:
            notch = f"<b>0{track_idx}</b> <span style=\"opacity:0.6\">{block_name}</span> — {track_title}"
        else:
            notch = "Code.FM"
        html = html.replace('>Code.FM</div>', f'>{notch}</div>')
        body = html.encode()
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)
    
    def serve_status(self):
        elapsed = time.time() - broadcast.start_time
        block_info = MANIFEST.get(broadcast.current_file, {})
        
        # Compute current track index from byte offset
        track_idx = 1
        boundaries = TRACK_BOUNDARIES.get(broadcast.current_file, {}).get("boundaries", [])
        for byte_offset, tidx in reversed(boundaries):
            if broadcast.block_byte_offset >= byte_offset:
                track_idx = tidx
                break
        
        titles = block_info.get("titles", [])
        track_title = titles[track_idx - 1] if track_idx <= len(titles) else ""
        
        body = json.dumps({
            "status": "live",
            "listeners": len(broadcast.listeners),
            "current_file": broadcast.current_file,
            "block_name": block_info.get("name", ""),
            "block_titles": titles,
            "track_number": track_idx,
            "track_title": track_title,
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
    log(f"Study.FM — Library Study Music Station")
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
