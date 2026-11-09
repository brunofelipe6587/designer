#!/usr/bin/env bash
# Renders the given videos one after another: ./queue.sh v4:16.8 v6:17
cd "$(dirname "$0")"
for job in "$@"; do v=${job%%:*}; d=${job##*:}; PAGE=$v.html DUR=$d node render.js video 30 > build/log_$v.txt 2>&1; done
