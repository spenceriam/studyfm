# Code.FM — SpaceX Livestream Ambient Station

AI-generated instrumental ambient/electronic music inspired by the music played during SpaceX livestreams (Test Shot Starfish style). Hosted locally on Bearcat as an internet radio station.

## Architecture

- **Music:** Venice.ai Minimax V26, `force_instrumental=true`, MP3 256kbps 44.1kHz
- **Blocks:** 10 blocks, each containing 5 unique ~3-6min tracks (30+ min continuous)
- **Server:** Python ThreadedTCPServer — live broadcast (all listeners hear same position)
- **Web UI:** React-based player with sky-themed design, rebranded from Spencer.FM
- **Port:** 8898 (local only, not exposed externally)

## Block Variations

| Block | Identity | BPM | Key | Character |
|-------|----------|-----|-----|-----------|
| 01 | Flight Proven | 95 | Dm | Classic TSS — Moog bass, IDM beats |
| 02 | Zero-G Drift | 85 | Am | Ambient space sleep — weightless, sparse |
| 03 | Earth Analog | 108 | Cm | Synthwave bright — neon arpeggios |
| 04 | Telemetry | 100 | Em | Glitchy IDM — data-stream percussion |
| 05 | Heavy Lift | 95 | Fm | Cinematic launch — orchestral swells |
| 06 | Orbital Sunset | 90 | Gm | Floating serene — glass pads |
| 07 | Mars Surface | 75 | C#m | Sparse alien — granular, drones |
| 08 | Deep Space | 60 | Dm | Dark ambient — gravitational pull |
| 09 | Re-Entry | 105 | Am | Driving — bright leads, arpeggio runs |
| 10 | Mission Control | 95 | Bbm | Clean precise — telemetry bleeps |

## Files

- `stream_server.py` — Live broadcast HTTP server
- `gen_all_tracks.py` — Generates 50 tracks via Venice Minimax V26
- `assemble_blocks.py` — Stitches tracks into 30-min block MP3s with crossfades
- `web/` — React-based player UI (Code.FM branded)
- `blocks/` — Generated music blocks (`block_01/final_show.mp3` through `block_10/`)

## Usage

```bash
# Generate music (50 tracks, ~$12 cost)
python3 gen_all_tracks.py

# Assemble tracks into blocks
python3 assemble_blocks.py

# Start station
systemctl --user enable --now codefm.service

# Listen
http://localhost:8898/
```

## Inspired By

- Test Shot Starfish — Music for Space, Earth Analog
- SpaceX webcast hold-time music (CRS-14 through Starship missions)
- Downtempo, Space Ambient, IDM, Cinematic Electronic

## Created By

Hermes (pocAgent) on behalf of Spencer Francisco — May 2026
