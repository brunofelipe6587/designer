#!/bin/sh
# Rebuilds V1 inputs from the client's Drive footage (folder "Iron shorts 1809").
# $1 = path to video-output-E8CF0603-ED11-494A-8732-0F6D8263B8BE-2.mov (presenter, 4K 60fps)
set -e
cd "$(dirname "$0")"
mkdir -p ugc/raw ugc/frames/v1
# 4K -> 1080x1920 30fps first (trimming 4K in one filter graph runs out of memory)
ffmpeg -v error -y -threads 4 -i "$1" -vf "fps=30,scale=1080:1920:flags=lanczos,format=yuv420p" -c:v libx264 -crf 14 -preset fast -c:a pcm_s16le -ar 48000 ugc/raw/vo4_1080.mov
# re-cut: drop src 7.0–15.2 (B-roll line) and the 23.1–23.95 gap -> 33.95 s
ffmpeg -v error -y -i ugc/raw/vo4_1080.mov -filter_complex "
[0:v]trim=0:7.0,setpts=PTS-STARTPTS[v0];[0:v]trim=15.2:23.1,setpts=PTS-STARTPTS[v1];[0:v]trim=23.95:43.0,setpts=PTS-STARTPTS[v2];
[v0][v1][v2]concat=n=3:v=1:a=0[v];
[0:a]atrim=0:7.0,asetpts=PTS-STARTPTS,afade=t=out:st=6.97:d=0.03[a0];[0:a]atrim=15.2:23.1,asetpts=PTS-STARTPTS,afade=t=in:d=0.03,afade=t=out:st=7.87:d=0.03[a1];[0:a]atrim=23.95:43.0,asetpts=PTS-STARTPTS,afade=t=in:d=0.03[a2];
[a0][a1][a2]concat=n=3:v=0:a=1[a]" -map "[v]" -map "[a]" -c:v libx264 -crf 20 -preset medium -c:a aac -b:a 192k -movflags +faststart ugc/raw/v1_cut.mp4
ffmpeg -v error -y -i ugc/raw/v1_cut.mp4 -q:v 2 -start_number 1 ugc/frames/v1/%04d.jpg
