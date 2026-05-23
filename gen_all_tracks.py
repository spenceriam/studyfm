#!/usr/bin/env python3
"""Code.FM — Generate 50 SpaceX-style tracks via Venice Minimax V26"""

import json, time, os, sys, urllib.request, subprocess

API_KEY = "VENICE_INFERENCE_KEY_pHZYe6pYdNniiREtHzuh2qGoNk30w8sexBVRpyeEdY"
BASE = "https://api.venice.ai/api/v1/audio"
OUT_DIR = "/tmp/code_fm"
BLOCKS = 10
TRACKS_PER_BLOCK = 5
TOTAL = BLOCKS * TRACKS_PER_BLOCK

# ── Block-specific prompt templates ──
BLOCK_PROMPTS = {
    1: [  # Flight Proven — classic TSS
        "D minor, 95 BPM, Space Ambient, IDM, cinematic, Moog bass synth, crisp electronic percussion, warm analog pads, wide stereo, space delays, clean mix, uplifting, instrumental",
        "D minor, 94 BPM, Cinematic Electronic, Downtempo, driving bassline, clean hi-hats, arpeggio layers, cosmic sweeps, analog warmth, high-tech, focused, instrumental",
        "G minor, 96 BPM, IDM, Progressive Ambient, pulsing sub-bass, sharp snare snaps, glistening synth plucks, echoing telemetry sounds, patient, futuristic, instrumental",
        "D minor, 93 BPM, Space Ambient, IDM, analog synth wash, side-chained bass, minimal percussion, distant radio chatter texture, awe-inspiring, vast, instrumental",
        "F major, 97 BPM, Cinematic Synthwave, Downtempo, bright analog lead, warm pads, four-on-the-floor soft kick, building arrangement, optimistic, anthemic, instrumental",
    ],
    2: [  # Zero-G Drift — ambient space sleep
        "A minor, 85 BPM, Ambient, Space Ambient, floating, weightless, slow-evolving synth pads, no drums, deep sub-bass drones, celestial echoes, serene, dreamy, instrumental",
        "A minor, 82 BPM, Ambient Drone, Dreamy Electronic, sparse piano-like synths, reverb tails, gentle noise textures, zero gravity feel, peaceful, meditative, instrumental",
        "C major, 88 BPM, Ambient Chillout, glass-like synth pads, soft acoustic electronic percussion, warm sub-bass, beautiful melodies, floating, resolution, instrumental",
        "A minor, 80 BPM, Dark Ambient, Space Drone, deep bass rumble, granular textures, distant star fields, minimal movement, patient, hypnotic, vast, instrumental",
        "E minor, 86 BPM, Ambient, Cinematic, slow attack synth strings, breathing pads, no percussion, pure atmosphere, sunrise over Earth, emotional, instrumental",
    ],
    3: [  # Earth Analog — retro synthwave
        "C minor, 108 BPM, Synthwave, Retrowave, neon pads, analog arpeggios, gated snare, pulsing bass, retro sci-fi aesthetic, energetic, hopeful, instrumental",
        "C minor, 105 BPM, Cinematic Synthwave, Downtempo, bright analog leads, arpeggiator runs, warm Jupiter-style pads, driving beat, nostalgic, uplifting, instrumental",
        "Eb major, 110 BPM, Progressive Synthwave, four-on-the-floor kick, arpeggiated bass, shimmering pads, build and release, retro future, anthemic, instrumental",
        "C minor, 106 BPM, Space Synthwave, IDM crossover, analog drum machine, FM synth bells, cosmic reverb, patient but energetic, exploratory, instrumental",
        "G minor, 107 BPM, Retrowave, Chillwave, tape-warm synth, gentle sidechain, 80s drum machine, soft arpeggios, space exploration theme, wondrous, instrumental",
    ],
    4: [  # Telemetry — glitchy IDM
        "E minor, 100 BPM, IDM, Glitch, data-stream percussion, rapid hi-hats, pulsing sub-bass, digital clicks, telemetry beeps, space delays, analytical, precise, instrumental",
        "E minor, 102 BPM, Experimental Electronic, Glitch Hop, chopped drum patterns, bit-crushed textures, synth stabs, data transmission aesthetic, high-tech, rhythmic, instrumental",
        "B minor, 98 BPM, IDM, Downtempo, mechanical rhythms, analog synth blips, deep sub-bass pulses, modem-like chirps, counting clockwork, focused, instrumental",
        "E minor, 101 BPM, Minimal Electronic, Microhouse, precise percussion grid, soft synth wash, bass pulses, telemetry tracking, hypnotic, clean, instrumental",
        "F# minor, 99 BPM, IDM, Ambient Techno, glitchy hi-hats, warm pad undercurrent, sub-bass line, digital artifacts as texture, space control room, instrumental",
    ],
    5: [  # Heavy Lift — cinematic launch
        "F minor, 95 BPM, Cinematic, Epic Electronic, orchestral synth swells, dramatic builds, thunderous sub drops, anticipation tension, rocket on pad, powerful, instrumental",
        "F minor, 93 BPM, Trailer Music, Cinematic Synthwave, building drums, heroic synth leads, tension and release, countdown energy, massive scale engineering, instrumental",
        "C minor, 97 BPM, Cinematic, Progressive Electronic, slow build, layered pads, rising arpeggios, powerful kick entrance, launch sequence, emotional, vast, instrumental",
        "F minor, 96 BPM, Epic, Cinematic Ambient, low brass synth drones, ticking clock percussion, building intensity, ignition moment, awe-inspiring, instrumental",
        "Bb minor, 94 BPM, Cinematic, Downtempo, heavy analog bass, dramatic pauses, re-ignition beats, massive rocket thrust, mechanical yet emotional, clean, instrumental",
    ],
    6: [  # Orbital Sunset — floating serene
        "G minor, 90 BPM, Ambient Chillout, Downtempo, floating synth pads, gentle four-on-floor kick, celestial melody, Earth horizon, weightless, peaceful, instrumental",
        "G minor, 88 BPM, Dreamy Electronic, Space Ambient, glass-like arpeggios, soft bass pulse, reverb clouds, watching the planet below, serene, beautiful, instrumental",
        "D minor, 92 BPM, Ambient, Cinematic, slow-attack pad swells, gentle acoustic electronic drums, warm sub-bass, golden hour in orbit, emotional, instrumental",
        "G minor, 91 BPM, Chillout, IDM, clean electronic beat, warm pad chord progression, subtle delay tails, orbital tranquility, hypnotic, peaceful, instrumental",
        "Bb major, 89 BPM, Ambient, Dream Pop Electronic, shimmering synths, soft kick, bass warmth, sunset over terminator line, beautiful, hopeful, instrumental",
    ],
    7: [  # Mars Surface — sparse alien
        "C# minor, 75 BPM, Dark Ambient, Experimental, granular textures, deep bass drones, dust-wind delays, alien landscape, sparse percussion, mysterious, vast, instrumental",
        "C# minor, 72 BPM, Ambient, Cinematic, metallic resonance, slow filter sweeps, martian atmosphere, minimal beats, isolated, haunting beautiful, instrumental",
        "E minor, 78 BPM, Dark Electronic, Industrial Ambient, processed field recordings, distant rumbles, thin atmosphere synth, red planet, patient, desolate, instrumental",
        "C# minor, 74 BPM, Space Ambient, Drone, tectonic bass shifts, granular wind, glitch particles, no drums, pure alien environment, meditative, instrumental",
        "A minor, 76 BPM, Experimental, Ambient, distorted pads, radio static textures, slow pulse, martian sunrise, otherworldly, contemplative, instrumental",
    ],
    8: [  # Deep Space — dark ambient
        "D minor, 60 BPM, Dark Ambient, Drone, gravitational pull bass, no percussion, slow evolving textures, event horizon, infinite void, profound, minimal, instrumental",
        "D minor, 58 BPM, Space Drone, Cinematic, deep sub-bass waves, filter movement, distant star clusters, eternal darkness, patient, meditative, instrumental",
        "A minor, 62 BPM, Ambient, Dark Ambient, long reverb tails, breathing pad cycle, no beats, cosmic background radiation hum, deep meditation, instrumental",
        "D minor, 55 BPM, Drone, Experimental, analog oscillator drift, slow LFO modulation, black hole gravity, vast emptiness, minimal movement, profound, instrumental",
        "G minor, 64 BPM, Ambient, Space Music, processed piano tones, infinite sustain, no percussion, light years of silence, beautiful isolation, instrumental",
    ],
    9: [  # Re-Entry — driving controlled
        "A minor, 105 BPM, Progressive Electronic, Cinematic, bright analog lead, arpeggio runs, driving bassline, clean drums, re-entry plasma glow, focused, energetic, instrumental",
        "A minor, 107 BPM, Melodic Techno, Space Electronic, four-on-the-floor, building synth layers, controlled intensity, heat shield friction, determined, clean, instrumental",
        "D minor, 104 BPM, Progressive House, Cinematic, rolling bass, arpeggiated leads, crisp percussion, descending through atmosphere, triumphant, driving, instrumental",
        "A minor, 106 BPM, IDM, Downtempo, rhythmic synth bass, sharp snare snaps, glistening arpeggios, warm backing pads, re-entry burn, expectant, instrumental",
        "E minor, 103 BPM, Cinematic Electronic, Melodic, filter-swept leads, pumping bass, precision drums, parachute deploy moment, emotional release, instrumental",
    ],
    10: [  # Mission Control — clean precise
        "Bb minor, 95 BPM, IDM, Cinematic, precise electronic percussion, telemetry bleeps, warm pads, analog synth bass, control room focus, mechanical yet emotional, instrumental",
        "Bb minor, 97 BPM, Downtempo, Ambient Techno, clean production, arpeggiated sequences, data-stream hi-hats, mission operations, patient, high-tech, instrumental",
        "Eb minor, 94 BPM, Minimal Electronic, IDM, crisp drum programming, sub-bass pulses, synth stabs, comms chatter texture, launch control center, focused, instrumental",
        "Bb minor, 96 BPM, Cinematic Electronic, Space Ambient crossover, warm analog washes, precise beats, telemetry tracking, human achievement, optimistic, instrumental",
        "F minor, 98 BPM, Progressive, IDM, building arrangement, clean mix, rhythmic bassline, celebration of success, mission complete, uplifting, anthemic, instrumental",
    ],
}

def strip_id3(filepath):
    """Remove corrupt ID3v2 tags from Minimax V26 MP3s"""
    with open(filepath, "rb") as f:
        data = f.read()
    # Find first sync frame (0xFF 0xFB or 0xFF 0xFA etc)
    idx = 0
    if data[:3] == b"ID3":
        # ID3v2 header: skip to actual audio
        idx = 10  # header size
        if len(data) > 6:
            # ID3 size is stored as synchsafe int at bytes 6-9
            size = ((data[6] & 0x7F) << 21) | ((data[7] & 0x7F) << 14) | ((data[8] & 0x7F) << 7) | (data[9] & 0x7F)
            idx = 10 + size
        # Find sync frame (0xFF 0xE0-0xFF)
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
                    return None  # Should be audio, retry
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
    
    # Create block directories
    for b in range(1, BLOCKS + 1):
        os.makedirs(f"{OUT_DIR}/block_{b:02d}", exist_ok=True)
    
    all_queued = []
    
    # Phase 1: Queue all 50 tracks in batches of 10 (avoid 429)
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
            time.sleep(0.5)  # Gentle spacing
    
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
        
        # Save progress
        with open(f"{OUT_DIR}/progress.json", "w") as f:
            json.dump({"generated": generated, "total": TOTAL, "last": track_name}, f)
    
    print(f"\n=== Complete: {generated}/{TOTAL} tracks ===")
    subprocess.run(["find", OUT_DIR, "-name", "*.mp3", "-type", "f"], capture_output=False)

if __name__ == "__main__":
    main()
