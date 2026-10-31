#!/usr/bin/env bash
# Audio for the 7 Black Sand Walk videos — the client's tracks already validated on earlier male-product creatives
# (none from the women's kits), each video re-timed to its track's beat (see the BEAT constants in src/v*.js):
#   VJ    = Eduardinho dos Teclados – Baile do VJ (sent by the client to replace the funk), from the chorus the client marked at 0:37 (beat at 36.948 s)
#   VOID  = the Void product video soundtrack (Void V1 "Bicicleta na areia", bed of Void V2 and Shadow V1)
#   EVER  = the Ever Flame film soundtrack (Ever Flame V1–V3, Phoenix 1B)
# -14 LUFS, short fades, muxed with each render (out/<v>_silent.mp4). Usage: ./mix.sh v1 v2 ...  (no args = all)
set -euo pipefail
cd "$(dirname "$0")"
VJ=src/audio/baile_do_vj.mp3; VOID=../../sandwalk-void/src/v01_studio.mov; EVER=../../sandwalk-everflame/src/v01_studio.mp4
declare -A NAME=([v1]=Lances [v2]=Bicicleta [v3]=Contador [v4]=Montagem [v5]=So7Dias [v6]=Matematica [v7]=Narracao)
norm() { echo "loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000"; }
for v in ${@:-v1 v2 v3 v4 v5 v6 v7}; do
  [ -f out/${v}_silent.mp4 ] || { echo "skip $v (no render)"; continue; }
  D=$(ffprobe -v error -show_entries format=duration -of csv=p=0 out/${v}_silent.mp4)
  win() {  # src start
    ffmpeg -v error -y -ss $2 -t $D -i $1 -vn -af "aresample=48000,afade=t=in:d=0.03,afade=t=out:st=$(echo "$D-0.6" | bc):d=0.6,apad,atrim=0:$D,$(norm)" -ac 2 audio/mix_$v.wav
  }
  case $v in
    v1) win $VJ 36.948 ;;
    v2) win $VOID 1.965 ;;
    v3) win $VJ 36.948 ;;
    v4) win $VJ 36.948 ;;
    v5) win $VOID 1.965 ;;
    v6) win $EVER 4.49 ;;
    v7) [ -f audio/vo_black7.wav ] || python3 make_vo.py black7
        ffmpeg -v error -y -i audio/vo_black7.wav -i $VOID -filter_complex "\
[1:a]aresample=48000,equalizer=f=2000:t=q:w=1.2:g=-8,volume='if(lt(t,15.3),0.17,0.75)':eval=frame,apad,atrim=0:$D,afade=t=out:st=$(echo "$D-0.6" | bc):d=0.6[bed];\
[0:a]aresample=48000[vo];[vo][bed]amix=inputs=2:normalize=0:duration=longest,apad,atrim=0:$D,$(norm)[o]" -map "[o]" -ac 2 audio/mix_$v.wav ;;
  esac
  ffmpeg -v error -y -i out/${v}_silent.mp4 -i audio/mix_$v.wav -map 0:v -map 1:a -c:v libx264 -preset slow -crf 19 -pix_fmt yuv420p \
    -c:a aac -b:a 192k -shortest -movflags +faststart out/SandWalk_BlackS1_${v^^}_${NAME[$v]}_9x16.mp4
  echo "$v ok ($D s)"
done
