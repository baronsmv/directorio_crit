#!/usr/bin/env sh

cd "$(dirname "$(dirname "$0")")"
python3 -m http.server
