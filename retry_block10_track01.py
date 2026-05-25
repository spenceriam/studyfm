#!/usr/bin/env python3
"""Retry single failed track"""
import json, time, os, urllib.request

API_KEY = "VENICE_INFERENCE_KEY_pHZYe6pYdNniiREtHzuh2qGoNk30w8sexBVRpyeEdY"
BASE = "https://api.venice.ai/api/v1/audio"
OUT_PATH = "/tmp/study_fm/block_10/track_01.mp3"

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

# Queue
prompt = "G major, 58 BPM, Solo Cello, Baroque Suite, warm resonant tone, bow changes natural, Bach-inspired prelude, wooden library, instrumental"
payload = json.dumps({"model": "minimax-music-v26", "prompt": prompt, "force_instrumental": True}).encode()
req = urllib.request.Request(f"{BASE}/queue", data=payload,
    headers={"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"})
qid = json.loads(urllib.request.urlopen(req, timeout=30).read())["queue_id"]
print(f"Queued: {qid[:8]}...")

# Retrieve
for i in range(30):
    time.sleep(5)
    payload = json.dumps({"model": "minimax-music-v26", "queue_id": qid}).encode()
    try:
        req = urllib.request.Request(f"{BASE}/retrieve", data=payload,
            headers={"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"})
        resp = urllib.request.urlopen(req, timeout=60)
        ct = resp.headers.get("Content-Type", "")
        if "application/json" in ct:
            data = json.loads(resp.read())
            s = data.get("status", "")
            print(f"  {s}")
            if s == "FAILED":
                print(f"  FAILED: {data}")
                break
        else:
            raw = resp.read()
            if len(raw) > 50000:
                with open(OUT_PATH, "wb") as f:
                    f.write(raw)
                strip_id3(OUT_PATH)
                print(f"  OK ({len(raw)} bytes)")
            break
    except urllib.error.HTTPError as e:
        if e.code == 429:
            time.sleep(15 * (i + 1))
        else:
            print(f"  HTTP {e.code}")
            break
    except Exception as e:
        print(f"  Error: {e}")
        break
