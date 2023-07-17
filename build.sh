#!/bin/bash
#

. $USER.env

VERSION=DEV

rm -rf dist 2>/dev/null
yarn build --preserveConsole|| exit 1

# after migrating to go1.20 we can use "-C" flag instead of "cd"
(cd src/sensetif-datasource && go build -o ../../dist/sensetif-datasource/gpx_sensetif-datasource_linux_amd64 ./pkg)

export GRAFANA_API_KEY=eyJrIjoiMzkwNTNkZTgxZTA4ODBjY2Q2YTIwNzg1NzBjZDAyOTNjOGNkZDU3OCIsIm4iOiJQdWJsaXNoIEtleSIsImlkIjo0OTA0MDZ9
npx @grafana/toolkit plugin:sign --rootUrls "https://sensetif.net/,http://localhost:3000/,https://staging.sensetif.net/"

sudo service grafana-server stop
sudo mkdir -p $BUILD_DIR/sensetif-app 2>/dev/null
sudo cp -r dist/* $BUILD_DIR/sensetif-app
sudo service grafana-server start
