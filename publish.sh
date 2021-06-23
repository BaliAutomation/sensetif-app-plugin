#!/bin/bash
#

UNTRACKED=`git status | grep Untracked`
if [ "$UNTRACKED!" != "!" ] ; then
  echo "Repository is not committed."
  exit 1
fi

CHANGES=`git status | grep Changes`
if [ "$CHANGES!" != "!" ] ; then
  echo "Repository is not committed."
  exit 1
fi

VERSIONS=`git tag | grep "^[0-9]"`
VERSION=`echo "$VERSIONS" | sort -V | tail -1`

echo $VERSION

rm -rf dist 2>/dev/null
yarn build || exit 1
mkdir sensetif-app
cp -r dist/* sensetif-app/
tar cf sensetif-app_$VERSION.tar.gz sensetif-app
scp sensetif-app_$VERSION.tar.gz root@repo.sensetif.com:/var/www/repository/grafana-plugins/sensetif-app/
rm -rf sensetif-app sensetif-app_$VERSION.tar.gz
