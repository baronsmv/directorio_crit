#!/usr/bin/env sh

cd "$(dirname "$(dirname "$0")")" || exit
python3 -m http.server
