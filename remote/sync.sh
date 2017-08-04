#!/usr/bin/env bash

if [ -z `which aws` ]; then
  echo "aws cli can be installed with: brew install awscli"
  exit 1
fi

LOCAL="sync"
REMOTE="s3://childrens-data-public-int/apps/cbeebies-picknmix-dev/remote/"
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
