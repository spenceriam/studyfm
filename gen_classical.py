#!/usr/bin/env python3
"""Generate classical blocks 09 (Chamber) and 10 (Solo Cello) via Venice Minimax V26"""

import json, time, os, urllib.request

API_KEY = "VENICE_INFERENCE_KEY_pHZYe6pYdNniiREtHzuh2qGoNk30w8sexBVRpyeEdY"
BASE = "https://api.venice.ai/api/v1/audio"
OUT_DIR = "/tmp/study_fm"
MODEL = "minimax-music-v26"

PROMPTS = {
    "block_09": {  # Chamber Study — string quartet focus
        "name": "Chamber Study",
        "tracks": [
            ("track_01", "D major, 72 BPM, String Quartet, Baroque-inspired, gentle cello counterpoint, violin pizzicato, intimate chamber hall, focused concentration, instrumental"),
            ("track_02", "G minor, 68 BPM, String Quartet, Neo-Classical, viola melody, soft cello pulse, no vibrato excess, library study room, contemplative, instrumental"),
            ("track_03", "A minor, 70 BPM, Chamber Music, Modern Classical, interweaving violin lines, warm bass foundation, slow harmonic changes, deep work, instrumental"),
            ("track_04", "C major, 74 BPM, String Quartet, Classical, light first violin melody, pizzicato strings accompaniment, airy and bright, morning study, instrumental"),
            ("track_05", "E minor, 66 BPM, Chamber Music, Adagio, cello and viola duet, sparse and breathing, quiet archive, profound focus, instrumental"),
        ]
    },
    "block_10": {  # Solo Cello — Bach-inspired suites
        "name": "Solo Cello",
        "tracks": [
            ("track_01", "G major, 58 BPM, Solo Cello, Baroque Suite, warm resonant tone, bow changes natural, Bach-inspired prelude, wooden library, instrumental"),
            ("track_02", "D minor, 62 BPM, Solo Cello, Sarabande, slow dance, deep vibrato, rich overtones, stone-walled study room, meditative, instrumental"),
            ("track_03", "C major, 64 BPM, Solo Cello, Allemande, flowing lines, dance-like phrasing, intimate close-mic sound, afternoon practice room, instrumental"),
            ("track_04", "A minor, 56 BPM, Solo Cello, Adagio, long sustained notes, melancholic warmth, gentle bow pressure, candle-lit study, introspective, instrumental"),
            ("track_05", "F major, 60 BPM, Solo Cello, Courante, light and lively, arpeggiated patterns, warm mid-range, sunlit conservatory, hopeful focus, instrumental"),
        ]
    },
}

def strip_id3(filepath):
    with open(filepath, "rb") as f:
        data = f.read()
    idx = 0
    if data[:3] == b"ID3":
        idx = 10
        if len(data) > 6:
            size = ((data[6] & 0x7F) << 21) | ((data[7] & 0x7F) << 14) | ((data[8] & 0x7F) << 7) | (data[9] & 0x7F)
            idx = 10 + size
        while idx < len(data) - 1:
            if data[idx] == 0xFF and (data[idx+1] & 0xE0) == 0xE0:
                break
            idx += 1
    if idx > 0 and idx < len(data) - 100:
        with open(filepath, "wb") as f:
            f.write(data[idx:])
        return True
    return False

def queue(prompt):
    payload = json.dumps({"model": MODEL, "prompt": prompt, "force_instrumental": True}).encode()
    req = urllib.request.Request(f"{BASE}/queue", data=payload,
        headers={"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"})
    return json.loads(urllib.request.urlopen(req, timeout=30).read())["queue_id"]

def retrieve(qid, retries=30, delay=5):
    payload = json.dumps({"model": MODEL, "queue_id": qid}).encode()
    for i in range(retries):
        time.sleep(delay)
        try:
            req = urllib.request.Request(f"{BASE}/retrieve", data=payload,
                headers={"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"})
            resp = urllib.request.urlopen(req, timeout=60)
            ct = resp.headers.get("Content-Type", "")
            if "application/json" in ct:
                data = json.loads(resp.read())
                s = data.get("status", "")
                if s in ("COMPLETED", "SUCCESS"):
                    return None
                if s == "FAILED":
                    print(f"    FAILED: {data}")
                    return None
            else:
                return resp.read()
        except urllib.error.HTTPError as e:
            if e.code == 429:
                time.sleep(15 * (i + 1))
            else:
                print(f"    HTTP {e.code}")
                return None
        except Exception as e:
            print(f"    Error: {e}")
            return None
    return None

for block_key, block in PROMPTS.items():
    os.makedirs(f"{OUT_DIR}/{block_key}", exist_ok=True)
    all_queued = []
    
    print(f"\n=== {block['name']} ({block_key}) ===\n")
    
    for tid, prompt in block["tracks"]:
        outpath = f"{OUT_DIR}/{block_key}/{tid}.mp3"
        if os.path.exists(outpath) and os.path.getsize(outpath) > 100000:
            print(f"  {block_key}/{tid}: exists, skip")
            continue
        try:
            qid = queue(prompt)
            all_queued.append((qid, tid))
            print(f"  {block_key}/{tid}: queued [{qid[:8]}...]")
        except Exception as e:
            print(f"  {block_key}/{tid}: FAILED queue: {e}")
        time.sleep(0.5)
    
    for qid, tid in all_queued:
        outpath = f"{OUT_DIR}/{block_key}/{tid}.mp3"
        print(f"  {block_key}/{tid}...", end=" ", flush=True)
        raw = retrieve(qid)
        if raw and len(raw) > 50000:
            with open(outpath, "wb") as f:
                f.write(raw)
            strip_id3(outpath)
            print(f"OK ({len(raw)} bytes)")
        else:
            print(f"FAILED")

print(f"\n=== Done! ===")
print(f"Block 09: {len(os.listdir('/tmp/study_fm/block_09'))} tracks")
print(f"Block 10: {len(os.listdir('/tmp/study_fm/block_10'))} tracks")
