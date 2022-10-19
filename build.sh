#!/bin/bash
#

. $USER.env

VERSION=DEV

rm -rf dist 2>/dev/null
yarn build --preserveConsole|| exit 1

export GRAFANA_API_KEY=eyJrIjoiMzkwNTNkZTgxZTA4ODBjY2Q2YTIwNzg1NzBjZDAyOTNjOGNkZDU3OCIsIm4iOiJQdWJsaXNoIEtleSIsImlkIjo0OTA0MDZ9
$HOME/node_modules/npx/node_modules/.bin/npx @grafana/toolkit plugin:sign --rootUrls "https://sensetif.net/,http://localhost:3000/"

mkdir $BUILD_DIR/sensetif-app 2>/dev/null
cp -r dist/* $BUILD_DIR/sensetif-app
