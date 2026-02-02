#!/bin/bash
cd /home/kavia/workspace/code-generation/online-chess-platform-208691-208707/chess_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

