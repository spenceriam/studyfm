#!/usr/bin/env python3
"""Generate 8 pomodoro alert sound effects via Venice ElevenLabs Sound Effects"""

import json, time, os, urllib.request

API_KEY = "VENICE_INFERENCE_KEY_pHZYe6pYdNniiREtHzuh2qGoNk30w8sexBVRpyeEdY"
BASE = "https://api.venice.ai/api/v1/audio"
OUT_DIR = "/tmp/study_fm/alerts"
MODEL = "elevenlabs-sound-effects-v2"

PROMPTS = {
    # ── Focus Alerts (session complete → time for break) ──
    "focus_01_meditation_bell": "A single warm resonant meditation bell with long natural decay, gentle, calming, like a temple gong struck softly",
    "focus_02_xylophone": "Gentle wooden xylophone playing four ascending notes, soft mallets, warm resonance, peaceful resolution, like a music box",
    "focus_03_singing_bowl": "Tibetan singing bowl struck once and humming, rich overtones, slow fade, meditative, pure clean tone, spa-like",
    "focus_04_harp_glissando": "Soft harp glissando sweeping upward gently, delicate plucks, dreamy resolution, fairy-tale like, light and airy",

    # ── Break Alerts (break over → back to focus) ──
    "break_01_wooden_block": "Two gentle wooden percussion blocks struck softly, short resonant tap followed by a slightly higher second tap, calm but present, like a gentle nudge",
    "break_02_kalimba": "Bright kalimba thumb piano playing a short 4-note melody, warm and uplifting, gentle attack, natural wood resonance, encouraging",
    "break_03_wind_chimes": "Soft bamboo wind chimes gently stirred by a light breeze, cascading random notes, peaceful, outdoor garden feel, subtle",
    "break_04_piano_chord": "A warm felt piano playing a single resolved major chord, soft attack, gentle sustain, comforting, like a warm hug, studio close-mic",
}

os.makedirs(OUT_DIR, exist_ok=True)

def queue(prompt):
    payload = json.dumps({"model": MODEL, "prompt": prompt}).encode()
    req = urllib.request.Request(f"{BASE}/queue", data=payload,
        headers={"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"})
    return json.loads(urllib.request.urlopen(req, timeout=30).read())["queue_id"]

def retrieve(qid, retries=40, delay=3):
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
                status = data.get("status", "")
                if status == "FAILED":
                    print(f"    FAILED: {data}")
                    return None
                print(f"    {status}...")
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

# Phase 1: Queue all
print(f"=== Queuing {len(PROMPTS)} sound effects via {MODEL} ===\n")
queued = []
for name, prompt in PROMPTS.items():
    outpath = f"{OUT_DIR}/{name}.mp3"
    if os.path.exists(outpath) and os.path.getsize(outpath) > 1000:
        print(f"  {name}: already exists, skipping")
        continue
    try:
        qid = queue(prompt)
        queued.append((qid, name))
        print(f"  {name}: queued [{qid[:8]}...]")
    except Exception as e:
        print(f"  {name}: FAILED to queue: {e}")
    time.sleep(0.3)

# Phase 2: Retrieve
print(f"\n=== Retrieving {len(queued)} effects ===\n")
for qid, name in queued:
    outpath = f"{OUT_DIR}/{name}.mp3"
    print(f"  {name}...", end=" ", flush=True)
    raw = retrieve(qid)
    if raw and len(raw) > 500:
        with open(outpath, "wb") as f:
            f.write(raw)
        size_kb = len(raw) / 1024
        print(f"OK ({size_kb:.1f} KB)")
    else:
        print(f"FAILED")

print(f"\n=== Done ===")
for f in sorted(os.listdir(OUT_DIR)):
    size = os.path.getsize(f"{OUT_DIR}/{f}")
    print(f"  {f}: {size} bytes ({size/1024:.1f} KB)")
