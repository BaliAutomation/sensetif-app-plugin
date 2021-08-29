#!/bin/bash
#

. $USER.env

VERSION=DEV

rm -rf dist 2>/dev/null
yarn build || exit 1
mkdir $BUILD_DIR/sensetif-app 2>/dev/null
cp -r dist/* $BUILD_DIR/sensetif-app
