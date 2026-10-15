#!/usr/bin/env bash
# Builds the frame sequences and audio stems used by v1.html (creative V1 "Que pressão").
# Footage is only flipped (05 was filmed in a mirror), scaled and lightly graded.
set -euo pipefail
cd "$(dirname "$0")"
F=frames; A=audio; mkdir -p $F/u05 $F/u05p $F/s01 $F/g04a $F/g04b $F/f03 $A
GRADE="eq=contrast=1.07:saturation=1.16:gamma=0.98,colorbalance=rs=-0.03:bs=0.04:rm=-0.02:bm=0.03"

# 05 UGC (mirror selfie): un-mirror, cool down the warm room light. Window 5.6–22.7s.
ffmpeg -v error -y -ss 5.6 -t 17.1 -i src/v05_ugc.mp4 -vf "hflip,scale=1080:1920:flags=lanczos,$GRADE" -r 30 -q:v 3 $F/u05/%04d.jpg
# 05 pocket close-up (12.3–13.6s) at full 4K so the push-in on the pocket stays sharp.
ffmpeg -v error -y -ss 12.3 -t 1.3 -i src/v05_ugc.mp4 -vf "hflip,$GRADE" -r 30 -q:v 3 $F/u05p/%04d.jpg
# 01 studio film: 3 models (0.3–2.6s). Extracted larger so the 1.3x zoom that hides the burned-in titles stays sharp.
ffmpeg -v error -y -ss 0.3 -t 2.3 -i src/v01_studio.mp4 -vf "scale=1404:2496:flags=lanczos" -r 30 -q:v 3 $F/s01/%04d.jpg
# 04 gym: kettlebell squat (37.9s) and box step-up (57.9s).
ffmpeg -v error -y -ss 37.9 -t 1.6 -i src/v04_treino.mp4 -vf "$GRADE" -r 30 -q:v 3 $F/g04a/%04d.jpg
ffmpeg -v error -y -ss 57.9 -t 1.6 -i src/v04_treino.mp4 -vf "$GRADE" -r 30 -q:v 3 $F/g04b/%04d.jpg
# 03 flat lay (4K60): keep 60fps for the slow-motion end card. Window 4.9–7.6s.
ffmpeg -v error -y -ss 4.9 -t 2.7 -i src/v03_flatlay.mp4 -vf "scale=1080:1920:flags=lanczos,eq=contrast=1.05:saturation=1.1" -r 60 -q:v 3 $F/f03/%04d.jpg

# Voice: the influencer's lines from 05, cut on word boundaries (see build/v05_words.json), cleaned and levelled.
VO="highpass=f=90,afftdn=nf=-30,acompressor=threshold=-20dB:ratio=3:attack=5:release=120"
cut() { ffmpeg -v error -y -ss $1 -to $2 -i src/v05_ugc.mp4 -vn -ac 2 -ar 48000 -af "$VO,afade=t=in:d=0.02,afade=t=out:st=$(python3 -c "print(round($2-$1-0.03,3))"):d=0.03" $A/$3.wav; }
cut 5.80 8.20 vo1      # "Olha que pressão que tá esse uniforme novo, gente"
cut 1.00 3.18 vo2      # "chegou a coleção nova da Sand Walk pra mim"
cut 8.88 9.60 vo3      # "o melhor de tudo"
cut 10.40 11.80 vo4    # "esse aqui tem bolso, ó"
cut 13.28 15.70 vo5    # "tá na academia, rapaz, pra guardar o celular agora"
cut 20.95 22.51 vo6    # "Sand Walk tá pra brincadeira não"
# Bed: the brand's own Ever Flame film soundtrack (ambient until 10s, impacts at 10.5 / 12.5).
ffmpeg -v error -y -i src/v01_studio.mp4 -vn -ac 2 -ar 48000 $A/bed.wav
echo ok
