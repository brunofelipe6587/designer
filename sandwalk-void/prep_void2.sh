#!/usr/bin/env bash
# Inputs for Void creative 2 "4 motivos": reuses a02 (athlete, 12.9–28.6s) and p01 (01, 2.9–8.4s; only the fabric and
# chest shots after 4.8s are used) from prep_void1.sh, plus the voiceover from make_vo.py void2.
set -euo pipefail
cd "$(dirname "$0")"
[ -f frames/a02/0471.jpg ] && [ -f frames/p01/0165.jpg ] || ./prep_void1.sh
[ -f audio/vo_void2.wav ] || python3 make_vo.py void2
echo ok
