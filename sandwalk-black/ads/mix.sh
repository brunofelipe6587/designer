#!/usr/bin/env bash
# Audio for the 7 Black Sand Walk videos (all tracks are originals synthesised with numpy; the voice is TTS) at -14 LUFS,
# muxed with each render (out/<v>_silent.mp4). Usage: ./mix.sh v1 v2 ...  (no args = all that have a render)
# Tracks: v1 phonk 128 (../../sandwalk-shadow/make_beat.py), v2 trap140, v3 funk130, v5 tick120 (make_beats.py),
#         v4 beach house 100 and v6 lo-fi 85 (../../sandwalk-ftvpreta/make_beat.py / make_beat2.py), v7 voice + funk130 bed.
set -euo pipefail
cd "$(dirname "$0")"
SHD=../../sandwalk-shadow/audio; FTV=../../sandwalk-ftvpreta/audio
[ -f audio/trap140.wav ] || python3 make_beats.py
declare -A NAME=([v1]=Lances [v2]=Bicicleta [v3]=Contador [v4]=Montagem [v5]=So7Dias [v6]=Matematica [v7]=Narracao)
norm() { echo "loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000"; }
for v in ${@:-v1 v2 v3 v4 v5 v6 v7}; do
  [ -f out/${v}_silent.mp4 ] || { echo "skip $v (no render)"; continue; }
  D=$(ffprobe -v error -show_entries format=duration -of csv=p=0 out/${v}_silent.mp4)
  case $v in
    v1) ffmpeg -v error -y -i $SHD/beat_shd2.wav -af "$(norm),apad,atrim=0:$D" -ac 2 audio/mix_$v.wav ;;
    v2) ffmpeg -v error -y -i audio/trap140.wav -af "$(norm),apad,atrim=0:$D" -ac 2 audio/mix_$v.wav ;;
    v3) ffmpeg -v error -y -i audio/funk130.wav -af "$(norm),apad,atrim=0:$D" -ac 2 audio/mix_$v.wav ;;
    v4) ffmpeg -v error -y -i $FTV/beat_ftv.wav -af "atrim=0:$D,afade=t=out:st=$(echo "$D-1" | bc):d=1,$(norm),apad,atrim=0:$D" -ac 2 audio/mix_$v.wav ;;
    v5) ffmpeg -v error -y -i audio/tick120.wav -af "$(norm),apad,atrim=0:$D" -ac 2 audio/mix_$v.wav ;;
    v6) ffmpeg -v error -y -i $FTV/lofi_ftv2.wav -af "atrim=0:$D,afade=t=out:st=$(echo "$D-0.8" | bc):d=0.8,$(norm),apad,atrim=0:$D" -ac 2 audio/mix_$v.wav ;;
    v7) [ -f audio/vo_black7.wav ] || python3 make_vo.py black7
        ffmpeg -v error -y -i audio/vo_black7.wav -i audio/funk130.wav -filter_complex "\
[1:a]aresample=48000,equalizer=f=2200:t=q:w=1.2:g=-7,volume='if(lt(t,15.3),0.17,0.6)':eval=frame,apad,atrim=0:$D,afade=t=out:st=$(echo "$D-0.6" | bc):d=0.6[bed];\
[0:a]aresample=48000,volume=1.0[vo];[vo][bed]amix=inputs=2:normalize=0:duration=longest,apad,atrim=0:$D,$(norm)[o]" -map "[o]" -ac 2 audio/mix_$v.wav ;;
  esac
  ffmpeg -v error -y -i out/${v}_silent.mp4 -i audio/mix_$v.wav -map 0:v -map 1:a -c:v libx264 -preset slow -crf 19 -pix_fmt yuv420p \
    -c:a aac -b:a 192k -shortest -movflags +faststart out/SandWalk_BlackS1_${v^^}_${NAME[$v]}_9x16.mp4
  echo "$v ok ($D s)"
done
