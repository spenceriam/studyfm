#!/usr/bin/env python3
"""Study.FM — Stitch 5 tracks per block into final_show.mp3 with 2s silence buffers"""

import subprocess, os, sys

BLOCKS_DIR = "/tmp/study_fm"
SILENCE_PATH = "/tmp/silence_2s.mp3"
BLOCK_COUNT = 10
TRACKS_PER = 5

# Create 2s silence if missing
if not os.path.exists(SILENCE_PATH):
    subprocess.run([
        "ffmpeg", "-f", "lavfi", "-i", "anullsrc=r=44100:cl=stereo",
        "-t", "2", "-q:a", "9", "-acodec", "libmp3lame", SILENCE_PATH
    ], check=True, capture_output=True)
    print(f"Created {SILENCE_PATH}")

built = 0
for block_num in range(1, BLOCK_COUNT + 1):
    block_dir = f"{BLOCKS_DIR}/block_{block_num:02d}"
    outfile = f"{block_dir}/final_show.mp3"
    
    tracks = []
    for t in range(1, TRACKS_PER + 1):
        path = f"{block_dir}/track_{t:02d}.mp3"
        if os.path.exists(path) and os.path.getsize(path) > 100000:
            tracks.append(path)
    
    if len(tracks) == 0:
        print(f"Block {block_num:02d}: no tracks yet, skipping")
        continue
    
    if len(tracks) < TRACKS_PER:
        print(f"Block {block_num:02d}: only {len(tracks)}/{TRACKS_PER} tracks, skipping")
        continue
    
    total_secs = 0
    for tpath in tracks:
        result = subprocess.run([
            "ffprobe", "-v", "error", "-show_entries",
            "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", tpath
        ], capture_output=True, text=True)
        try:
            total_secs += float(result.stdout.strip())
        except:
            pass
    
    if total_secs < 300:
        print(f"Block {block_num:02d}: only {total_secs:.0f}s, skipping")
        continue
    
    print(f"Block {block_num:02d}: stitching {len(tracks)} tracks ({total_secs:.0f}s total) with 2s silence...")
    
    concat_list = f"{block_dir}/concat_list.txt"
    with open(concat_list, "w") as f:
        for i, tpath in enumerate(tracks):
            f.write(f"file '{tpath}'\n")
            if i < len(tracks) - 1:
                f.write(f"file '{SILENCE_PATH}'\n")
    
    subprocess.run([
        "ffmpeg", "-y",
        "-f", "concat", "-safe", "0", "-i", concat_list,
        "-c:a", "libmp3lame", "-b:a", "192k",
        outfile
    ], check=True, capture_output=True)
    
    size_mb = os.path.getsize(outfile) / 1024 / 1024
    print(f"  -> {outfile} ({size_mb:.1f} MB)")
    built += 1

print(f"\nBuilt {built}/{BLOCK_COUNT} blocks successfully")
