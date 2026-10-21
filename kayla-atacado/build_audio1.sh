#!/bin/bash
# Cuts Fran's voice with the same EDL as video1.html. The reel's audio already peaks near 0 dBFS, so the chain tames it:
# rumble/plosive cut (high-pass + low shelf), declip, gentle compression, then a linear two-pass loudness match to
# -16 LUFS with a -2 dBTP limiter.
# From the call to action on (out 23.89s) the voice comes from a Demucs vocal stem, cut exactly after "atacado.",
# over a continuous bed of the reel's own background music that runs on under the end card and fades out.
set -e
cd "$(dirname "$0")"
SRC=brutos/reel-fran-como-comprar_720p.mp4
DUR=33.0; CTA=23.89
STEM=build/sep/htdemucs/fran
if [ ! -f $STEM/vocals.wav ]; then
  mkdir -p build/sep && ffmpeg -y -loglevel error -i $SRC -vn -ac 2 -ar 44100 build/sep/fran.wav
  (cd build/sep && python3 -m demucs --two-stems=vocals -n htdemucs -o . fran.wav)
fi
cut() { # $1 input index, $2 list of a:b, $3 label prefix -> appends filters to F, labels to L
  local i=0
  for s in $2; do
    a=${s%:*}; b=${s#*:}; d=$(python3 -c "print(round($b-$a-0.035,3))")
    F="$F[$1:a]atrim=$a:$b,asetpts=PTS-STARTPTS,aformat=sample_rates=48000:channel_layouts=mono,afade=t=in:d=0.035,afade=t=out:st=$d:d=0.035[$3$i];"; L="$L[$3$i]"; i=$((i+1))
  done
  N=$i
}
F=""; L=""; cut 0 "0.00:4.02 12.00:19.50 20.55:26.32 34.45:41.05" m; LA=$L; NA=$N
L=""; cut 1 "41.84:43.74 4.45:5.42 6.12:7.66 9.72:11.74" v; LB=$L; NB=$N
MUS0=$(python3 -c "print(round(47.0-($DUR-$CTA),2))")
F="$F${LA}concat=n=$NA:v=0:a=1[A];${LB}concat=n=$NB:v=0:a=1,apad=whole_dur=$(python3 -c "print(round($DUR-$CTA,3))")[VB];"
F="$F[2:a]atrim=$MUS0:47.0,asetpts=PTS-STARTPTS,aformat=sample_rates=48000:channel_layouts=mono,afade=t=in:d=0.04,afade=t=out:st=$(python3 -c "print(round($DUR-$CTA-1.3,2))"):d=1.25[MB];"
F="$F[VB][MB]amix=inputs=2:duration=first:normalize=0[B];[A][B]concat=n=2:v=0:a=1"
CHAIN="highpass=f=90:poles=2,lowshelf=f=220:g=-3,adeclip,acompressor=threshold=0.125:ratio=3:attack=4:release=90:knee=4:makeup=1"
ffmpeg -y -loglevel error -i $SRC -i $STEM/vocals.wav -i $STEM/no_vocals.wav -filter_complex "$F,$CHAIN,apad=whole_dur=$DUR[a]" -map "[a]" -ar 48000 -ac 1 build/voice1.wav
M=$(ffmpeg -hide_banner -i build/voice1.wav -af loudnorm=I=-16:TP=-2:LRA=9:print_format=json -f null - 2>&1 | python3 -c "import sys,json; t=sys.stdin.read(); j=json.loads(t[t.rindex('{'):]); print(j['input_i'],j['input_tp'],j['input_lra'],j['input_thresh'])")
read II TP LRA TH <<< "$M"
ffmpeg -y -loglevel error -i build/voice1.wav -af "loudnorm=I=-16:TP=-2:LRA=9:measured_I=$II:measured_TP=$TP:measured_LRA=$LRA:measured_thresh=$TH:linear=true,alimiter=limit=0.79:attack=3:release=60" -ar 48000 -ac 2 -c:a aac -b:a 192k out/video1_audio.m4a
