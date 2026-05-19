#!/usr/bin/env bash
set -euo pipefail
command -v ffmpeg >/dev/null 2>&1 || { echo "需要安装 ffmpeg: brew install ffmpeg"; exit 1; }
mkdir -p public/audio
ffmpeg -y \
  -f lavfi -i "anoisesrc=color=pink:duration=30:amplitude=0.06" \
  -f lavfi -i "sine=frequency=80:duration=30" \
  -f lavfi -i "sine=frequency=220.5:duration=30" \
  -filter_complex "
    [0:a]lowpass=f=200,volume=0.6[noise];
    [1:a]volume=0.18[drone1];
    [2:a]volume=0.15[drone2];
    [noise][drone1][drone2]amix=inputs=3:normalize=0,
    afade=t=in:st=0:d=2,afade=t=out:st=28:d=2,
    aresample=44100
  " \
  -ac 1 -c:a libvorbis -q:a 4 \
  public/audio/ambient.ogg
echo "Done: $(du -h public/audio/ambient.ogg | cut -f1)"
