#!/bin/bash

mkdir -p build
rm -rf build/*

for file in assets lib templates translations app.css app.js manifest.json requirements.json
do
  cp -R "$file" build
done

cd build

zat package
