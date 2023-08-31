#!/usr/bin/bash

pkg install imagemagick git nodejs ffmpeg libwebp mc nano yarn
rm -rf session.json 
rm -rf node_modules
yarn
npm start
echo "ATLAS MD and all of it's Dependencies are Installed Successfully!"