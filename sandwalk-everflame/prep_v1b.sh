#!/usr/bin/env bash
# Frames + voice cuts for V1b (organic / creator-native version of V1). Only the creator's own footage (05).
set -euo pipefail
cd "$(dirname "$0")"
F=frames; A=audio; mkdir -p $F/u05all $F/u05p $A
GRADE="eq=contrast=1.05:saturation=1.08:gamma=0.99,colorbalance=rs=-0.02:bs=0.03"   # lighter grade: keep the phone look
ffmpeg -v error -y -ss 0 -t 23.0 -i src/v05_ugc.mp4 -vf "hflip,scale=1080:1920:flags=lanczos,$GRADE" -r 30 -q:v 3 $F/u05all/%04d.jpg
[ -f $F/u05p/0039.jpg ] || ffmpeg -v error -y -ss 12.3 -t 1.3 -i src/v05_ugc.mp4 -vf "hflip,eq=contrast=1.07:saturation=1.16:gamma=0.98,colorbalance=rs=-0.03:bs=0.04:rm=-0.02:bm=0.03" -r 30 -q:v 3 $F/u05p/%04d.jpg
VO="highpass=f=90,afftdn=nf=-30,acompressor=threshold=-20dB:ratio=3:attack=5:release=120"
cut() { ffmpeg -v error -y -ss $1 -to $2 -i src/v05_ugc.mp4 -vn -ac 2 -ar 48000 -af "$VO,afade=t=in:d=0.02,afade=t=out:st=$(python3 -c "print(round($2-$1-0.03,3))"):d=0.03" $A/$3.wav; }
cut 0.00 0.44 b1     # "Meus filhos"
cut 1.00 3.42 b2     # "chegou a coleção nova da Sand Walk pra mim, gente"
cut 5.80 8.20 b3     # "olha que pressão que tá esse uniforme novo, gente"
cut 8.88 9.60 b4     # "o melhor de tudo"
cut 10.40 11.80 b5   # "esse aqui tem bolso, ó"
cut 13.28 15.70 b6   # "tá na academia, rapaz, pra guardar o celular agora"
cut 18.40 19.98 b7   # "já tô usando o meu"
cut 20.95 22.50 b8   # "Sand Walk tá pra brincadeira não"
echo ok
