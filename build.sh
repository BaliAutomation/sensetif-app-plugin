#!/bin/bash
#

. $USER.env

VERSION=DEV

rm -rf dist 2>/dev/null
yarn build --preserveConsole|| exit 1

export GRAFANA_API_KEY=eyJrIjoiMzkwNTNkZTgxZTA4ODBjY2Q2YTIwNzg1NzBjZDAyOTNjOGNkZDU3OCIsIm4iOiJQdWJsaXNoIEtleSIsImlkIjo0OTA0MDZ9
npx @grafana/toolkit plugin:sign --rootUrls "https://sensetif.net/,http://localhost:3000/,https://staging.sensetif.net/"

sudo service grafana-server stop
mkdir $BUILD_DIR/sensetif-app 2>/dev/null
sudo cp -r dist/* $BUILD_DIR/sensetif-app
sudo service grafana-server start
