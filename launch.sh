#!/bin/bash

FNM_PATH="/home/ray/.local/share/fnm"
if [ -d "$FNM_PATH" ]; then
  export PATH="$FNM_PATH:$PATH"
  eval "`fnm env`"
fi
eval "$(fnm env --use-on-cd --shell bash)"

cd /home/ray/MEGA/Rays/Programming/github/FileSearcherGUIV4
./node_modules/.bin/electron .
