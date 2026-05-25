#!/usr/bin/env python3
"""Study.FM — Generate 50 library-study tracks via Venice Minimax V26"""

import json, time, os, sys, urllib.request, subprocess

API_KEY = "VENICE_INFERENCE_KEY_pHZYe6pYdNniiREtHzuh2qGoNk30w8sexBVRpyeEdY"
BASE = "https://api.venice.ai/api/v1/audio"
OUT_DIR = "/tmp/study_fm"
BLOCKS = 10
TRACKS_PER_BLOCK = 5
TOTAL = BLOCKS * TRACKS_PER_BLOCK

# ── Library / Study Music prompt templates ──
# Design: calm, focused, no lyrics, gentle fade-friendly, lo-fi / ambient / piano
BLOCK_PROMPTS = {
    1: [  # Quiet Stacks — warm lo-fi study beats
        "C major, 80 BPM, Lo-Fi Hip Hop, warm vinyl crackle, soft Rhodes piano chords, laid-back boom-bap drum loop, cozy library atmosphere, focused but relaxed, instrumental",
        "D minor, 78 BPM, Lo-Fi Beats, Chillhop, mellow electric piano, subtle tape hiss, gentle kick and snare, reading room warmth, calm concentration, instrumental",
        "A minor, 82 BPM, Lo-Fi Study, jazzy guitar chords, soft brushed snare, warm sub-bass, dusty vinyl texture, late-night library session, peaceful, instrumental",
        "F major, 76 BPM, Chill Beats, Ambient Lo-Fi, soft analog synth pads, gentle hi-hats, slow kick pattern, bookshelf serenity, meditative focus, instrumental",
        "G major, 84 BPM, Lo-Fi Hip Hop, warm upright bass sample, light piano melody, soft crackle, wooden desk vibes, productive calm, instrumental",
    ],
    2: [  # Reading Room — solo piano study
        "C major, 72 BPM, Solo Piano, Neo-Classical, gentle arpeggios, soft sustain pedal, felt piano tone, quiet library reading room, contemplative, instrumental",
        "Eb major, 68 BPM, Solo Piano, Ambient Classical, slow chord progression, minimal melody, warm room reverb, pages turning quietly, peaceful focus, instrumental",
        "A minor, 70 BPM, Piano Study, Modern Classical, repetitive meditative patterns, soft dynamics, Erik Satie-like simplicity, deep concentration, instrumental",
        "D major, 74 BPM, Solo Piano, Cinematic Minimal, gentle left-hand ostinato, right-hand simple melody, library window light, hopeful calm, instrumental",
        "F major, 66 BPM, Felt Piano, Ambient, very soft attack, long decays, sparse notes, silent study hall at dawn, introspective, instrumental",
    ],
    3: [  # Window Seat — ambient pads + light texture
        "Db major, 70 BPM, Ambient, Drone, warm analog pad wash, no drums, slow filter sweeps, rain on library windows, weightless concentration, instrumental",
        "E major, 65 BPM, Ambient, Soundscape, glass-like synth tones, gentle LFO movement, distant field recordings, study carrel cocoon, serene, instrumental",
        "Bb major, 72 BPM, Ambient Chill, soft evolving pads, subtle granular texture, no percussion, afternoon light through stained glass, peaceful, instrumental",
        "G minor, 68 BPM, Dark Ambient Light, warm bass drone, slow-attack synth strings, minimal movement, quiet archive room, deep focus, instrumental",
        "Ab major, 74 BPM, Ambient, Space Music, floating synth chords, celestial but grounded, soft noise floor, late-night research, dreamy concentration, instrumental",
    ],
    4: [  # Coffee & Notes — gentle acoustic-electronic blend
        "C major, 85 BPM, Acoustic Electronic, Chillout, fingerpicked nylon guitar, soft electronic beats, warm pad bed, cozy cafe-library hybrid, productive, instrumental",
        "G major, 82 BPM, Folktronica, Downtempo, acoustic guitar loops, gentle kick drum, subtle synth bass, sunlit study corner, organic focus, instrumental",
        "D minor, 80 BPM, Ambient Folk, Electronic, kalimba-like plucks, soft percussive texture, warm drone, botanical library, calm productivity, instrumental",
        "A major, 88 BPM, Chill Beats, Organic Electronic, light marimba melody, gentle hi-hat pattern, acoustic bass, morning study session, fresh, instrumental",
        "E minor, 78 BPM, Downtempo, Cinematic Chill, fingerpicked patterns, soft strings pad, brushed drums, late afternoon focus, warm, instrumental",
    ],
    5: [  # Archive Hour — deep focus minimal
        "D minor, 60 BPM, Minimal Ambient, Drone, deep sub-bass pulse, no percussion, slow-attack synth organs, underground archive, tunnel vision focus, instrumental",
        "C minor, 58 BPM, Drone, Dark Ambient Light, breathing pad cycle, gentle harmonic shifts, stone library basement, timeless concentration, instrumental",
        "F minor, 62 BPM, Minimal, Cinematic, single note motifs, long reverb decays, subtle tension, rare books room, intense quiet focus, instrumental",
        "G minor, 64 BPM, Ambient, Experimental, analog oscillator warmth, slow LFO modulation, wooden shelves stretching infinitely, meditative, instrumental",
        "Bb minor, 56 BPM, Drone, Space Ambient, gravitational bass, distant bell-like tones, infinite archive, profound silence, instrumental",
    ],
    6: [  # Study Hall — bright focused lo-fi
        "F major, 86 BPM, Lo-Fi Beats, Chillhop, bright piano chords, crisp boom-bap drums, warm bassline, grand reading room with high ceilings, energetic focus, instrumental",
        "C major, 88 BPM, Lo-Fi Study, Jazzhop, Rhodes electric piano, soft snare on 2 and 4, walking bass feel, afternoon study hall, uplifting concentration, instrumental",
        "G major, 84 BPM, Chill Beats, Lo-Fi, acoustic guitar loops, light vinyl crackle, gentle beat, sunlit study table, optimistic productivity, instrumental",
        "A minor, 82 BPM, Lo-Fi Hip Hop, Mellow, warm sample chops, soft kick pattern, cozy hoodie study session, focused but relaxed, instrumental",
        "D major, 90 BPM, Chillhop, Upbeat Lo-Fi, bright piano melody, crisp drums, warm pad undercurrent, morning study rush, energetic calm, instrumental",
    ],
    7: [  # Night Owl — late night focus
        "E minor, 74 BPM, Lo-Fi, Night Study, muted piano, soft 808 bass, slow trap-influenced beat, desk lamp glow, quiet nighttime focus, instrumental",
        "D minor, 72 BPM, Chill Beats, Dark Lo-Fi, filtered Rhodes, subtle vinyl noise, slow kick, 2am library session, deep work, instrumental",
        "B minor, 70 BPM, Ambient Lo-Fi, Nighttime, sparse guitar plucks, warm sub-bass, minimal drums, moonlight through windows, solitary focus, instrumental",
        "F# minor, 76 BPM, Lo-Fi Hip Hop, Moody, reversed piano textures, soft crackle, gentle boom-bap, insomnia study session, meditative, instrumental",
        "C minor, 68 BPM, Dark Chill, Ambient Beats, low-pass filter sweeps, slow pulse, quiet library after hours, deep concentration, instrumental",
    ],
    8: [  # Botanical Library — nature-infused study
        "G major, 78 BPM, Organic Ambient, Nature Lo-Fi, soft bird chirps, acoustic guitar melody, gentle electronic beat, greenhouse study room, fresh, instrumental",
        "C major, 76 BPM, Chill Beats, Organic, rain texture, warm piano chords, light percussion, conservatory reading nook, peaceful focus, instrumental",
        "D major, 80 BPM, Folktronica, Nature, fingerpicked patterns, subtle field recordings, soft kick, botanical garden study, renewing calm, instrumental",
        "A minor, 74 BPM, Ambient Organic, Lo-Fi, flowing water texture, kalimba melody, warm pad, fern-filled study corner, serene, instrumental",
        "F major, 82 BPM, Chillhop, Nature, leaf-rustle ambience, acoustic guitar, gentle boom-bap, sunroom study session, organic productivity, instrumental",
    ],
    9: [  # Fireside Study — warm cozy focus
    "Eb major, 75 BPM, Lo-Fi, Cozy, warm crackling fire texture, soft Rhodes chords, gentle beat, armchair study session, hygge focus, instrumental",
    "Bb major, 72 BPM, Chill Beats, Warm, vinyl warmth, muted trumpet-like synth, slow drums, hearthside reading, comforting concentration, instrumental",
    "F major, 78 BPM, Lo-Fi Study, Cozy Jazzhop, warm upright bass, brushed snare, fireplace ambience, winter study evening, peaceful, instrumental",
    "C minor, 70 BPM, Ambient Lo-Fi, Warm, soft analog synth, slow pulse, ember glow, wool blanket study, introspective focus, instrumental",
    "Ab major, 80 BPM, Chillhop, Cozy Beats, gentle piano, warm sub-bass, soft crackle, cabin study retreat, contented productivity, instrumental",
    ],
    10: [  # Sunrise Study — morning routine
        "C major, 85 BPM, Lo-Fi, Morning, bright piano melody, crisp drums, warm sunrise ambience, early library session, fresh start energy, instrumental",
        "G major, 88 BPM, Chill Beats, Uplifting, acoustic guitar loops, gentle beat, morning light through windows, new day focus, optimistic, instrumental",
        "D major, 82 BPM, Lo-Fi Study, Fresh, Rhodes chords, soft hi-hats, birdsong texture, dawn study ritual, clean energy, instrumental",
        "F major, 86 BPM, Chillhop, Morning, warm synth pads, light percussion, sunrise over campus, productive morning, bright focus, instrumental",
        "A minor, 80 BPM, Ambient Lo-Fi, Dawn, slow-build pads, gentle kick entrance, first light study, calm awakening, instrumental",
    ],
}

def strip_id3(filepath):
    """Remove corrupt ID3v2 tags from Minimax V26 MP3s"""
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

def queue_track(prompt):
    payload = json.dumps({
        "model": "minimax-music-v26",
        "prompt": prompt,
        "force_instrumental": True
    }).encode()
    req = urllib.request.Request(
        f"{BASE}/queue",
        data=payload,
        headers={"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"}
    )
    resp = urllib.request.urlopen(req, timeout=30)
    return json.loads(resp.read())["queue_id"]

def retrieve_track(queue_id, retries=30, delay=5):
    payload = json.dumps({"model": "minimax-music-v26", "queue_id": queue_id}).encode()
    for i in range(retries):
        time.sleep(delay)
        try:
            req = urllib.request.Request(
                f"{BASE}/retrieve",
                data=payload,
                headers={"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"}
            )
            resp = urllib.request.urlopen(req, timeout=60)
            ct = resp.headers.get("Content-Type", "")
            if "application/json" in ct:
                data = json.loads(resp.read())
                status = data.get("status", data)
                if status in ("COMPLETED", "SUCCESS"):
                    return None
                if status == "FAILED":
                    print(f"    FAILED: {data}")
                    return None
            else:
                raw = resp.read()
                return raw
        except urllib.error.HTTPError as e:
            if e.code == 429:
                wait = 15 * (i + 1)
                print(f"    Rate limited, waiting {wait}s...")
                time.sleep(wait)
            else:
                print(f"    HTTP {e.code}: {e.read().decode()[:200]}")
                return None
        except Exception as e:
            print(f"    Error: {e}")
            return None
    print(f"    Timed out after {retries} polls")
    return None

def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    
    for b in range(1, BLOCKS + 1):
        os.makedirs(f"{OUT_DIR}/block_{b:02d}", exist_ok=True)
    
    all_queued = []
    
    print(f"=== Phase 1: Queuing {TOTAL} tracks ===\n")
    for block_num in range(1, BLOCKS + 1):
        prompts = BLOCK_PROMPTS[block_num]
        for track_idx, prompt in enumerate(prompts):
            track_name = f"block_{block_num:02d}/track_{track_idx+1:02d}"
            try:
                qid = queue_track(prompt)
                all_queued.append((qid, track_name, block_num))
                print(f"  Queued {track_name} [{qid[:8]}...]")
            except Exception as e:
                print(f"  FAILED to queue {track_name}: {e}")
            time.sleep(0.5)
    
    print(f"\n=== Phase 2: Retrieving {len(all_queued)} tracks ===\n")
    
    generated = 0
    for qid, track_name, block_num in all_queued:
        outpath = f"{OUT_DIR}/{track_name}.mp3"
        if os.path.exists(outpath) and os.path.getsize(outpath) > 100000:
            print(f"  {track_name} already exists ({os.path.getsize(outpath)} bytes), skipping")
            generated += 1
            continue
        
        print(f"  Polling {track_name}...", end=" ", flush=True)
        raw = retrieve_track(qid)
        if raw and len(raw) > 50000:
            with open(outpath, "wb") as f:
                f.write(raw)
            if strip_id3(outpath):
                print(f"OK ({len(raw)} bytes, stripped ID3)")
            else:
                print(f"OK ({len(raw)} bytes)")
            generated += 1
        else:
            print(f"FAILED (got {len(raw) if raw else 0} bytes)")
        
        with open(f"{OUT_DIR}/progress.json", "w") as f:
            json.dump({"generated": generated, "total": TOTAL, "last": track_name}, f)
    
    print(f"\n=== Complete: {generated}/{TOTAL} tracks ===")
    subprocess.run(["find", OUT_DIR, "-name", "*.mp3", "-type", "f"], capture_output=False)

if __name__ == "__main__":
    main()
