#!/bin/bash
rm -fr ~/project/ios/lingo/WebAssets/*
pnpm build
cp -rf dist/* ~/project/ios/lingo/WebAssets/
du -sh dist