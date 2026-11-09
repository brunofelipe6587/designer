#!/usr/bin/env bash
# Audio for the 7 week-2 videos (kits femininos 15% OFF): female TTS voice (make_vo.py) over the tracks of the two
# client-approved women's videos — V02 = Outfit Check instrumental (sandwalk-voidfem/src/v02_insta.mp4 from 0.30 s),
# BIP = the "bipolar" track (v03_insta.mp4 from 0). The bed is EQ-carved under the voice and ducked while she speaks,
# rises after her last line; fades in/out, -14 LUFS, true peak -1.5 dB. Usage: ./mix.sh f1 f2 ... (no args = all)
set -euo pipefail
cd "$(dirname "$0")"
V02=../sandwalk-voidfem/src/v02_insta.mp4; BIP=../sandwalk-voidfem/src/v03_insta.mp4
declare -A TR=([f1]=V02 [f2]=BIP [f3]=V02 [f4]=BIP [f5]=V02 [f6]=BIP [f7]=V02)
declare -A NAME=([f1]=MaisVendidos [f2]=ParaTudo [f3]=OutfitCheck [f4]=QuantoCusta [f5]=QualEstampa [f6]=FeitoPraQuemJoga [f7]=So7Dias)
for v in ${@:-f1 f2 f3 f4 f5 f6 f7}; do
  [ -f out/${v}_silent.mp4 ] || { echo "skip $v"; continue; }
  D=$(ffprobe -v error -show_entries format=duration -of csv=p=0 out/${v}_silent.mp4)
  VOEND=$(python3 -c "import json,re;s=open('build/vo_$v.js').read();d=json.loads(s[s.index('['):s.rindex(']')+1]);print(d[-1]['e']+0.25)")
  if [ ${TR[$v]} = V02 ]; then SRC=$V02; SS=0.30; LOW=0.24; else SRC=$BIP; SS=0; LOW=0.15; fi
  ffmpeg -v error -y -i audio/vo_$v.wav -ss $SS -t $D -i $SRC -filter_complex "\
[1:a]aresample=48000,afade=t=in:d=0.04,equalizer=f=2500:t=q:w=1.0:g=-7,volume='if(lt(t,$VOEND),$LOW,$LOW+(0.62-$LOW)*min(1,(t-$VOEND)/0.4))':eval=frame,afade=t=out:st=$(echo "$D-0.7" | bc):d=0.7,apad,atrim=0:$D[bed];\
[0:a]aresample=48000,highpass=f=80,acompressor=threshold=-18dB:ratio=2.5:attack=8:release=120,volume=1.15[vo];\
[vo][bed]amix=inputs=2:normalize=0:duration=longest,apad,atrim=0:$D,loudnorm=I=-14:TP=-1.5:LRA=9,alimiter=limit=0.89[o]" -map "[o]" -ar 48000 -ac 2 audio/mix_$v.wav
  ffmpeg -v error -y -i out/${v}_silent.mp4 -i audio/mix_$v.wav -map 0:v -map 1:a -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p \
    -c:a aac -b:a 192k -shortest -movflags +faststart out/SandWalk_BlackS2_Feminino_${v^^}_${NAME[$v]}_9x16.mp4
  echo "$v ok ($D s)"
done
