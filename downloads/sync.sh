#!/usr/bin/env bash

if [ -z `which aws` ]; then
  echo "aws cli can be installed with: brew install awscli"
  exit 1
fi

rm -rf   sync
mkdir -p sync

pushd experiences > /dev/null
    for EXPERIENCE in *; do
      pushd $EXPERIENCE > /dev/null
        zip -qrX ../../sync/$EXPERIENCE.zip *
      popd > /dev/null
    done
popd > /dev/null

for EXPERIENCE in sync/*; do
    unzip -l $EXPERIENCE
done

LOCAL="sync"
REMOTE="s3://childrens-data-public-int/apps/cbeebies-picknmix-dev/downloads/demo-examples"
PROFILE="childrens-data-int"
CACHE_CONTROL="max-age=60, must-revalidate"

aws --profile "$PROFILE"                   \
    s3 sync                                \
    "$LOCAL"                               \
    "$REMOTE"                              \
    --delete                               \
    --exclude             "*.DS_Store*"    \
    --exclude             "*.git*"         \
    --exclude             "*.gitkeep*"     \
    --exclude             "*.gitignore*"   \
    --exclude             "*.svn*"         \
    --exclude             "*.sh*"          \
    --acl                 public-read      \
    --cache-control       "$CACHE_CONTROL" \
    --follow-symlinks                      \
    --metadata-directive  REPLACE
