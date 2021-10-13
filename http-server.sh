#!/usr/bin/env bash

# set -u

# PUBLIC_PATH="$1"
# shift
# SERVER_OPTS="$@"

# ./node_modules/.bin/http-server $PUBLIC_PATH -p 9001 -c-1 --cors $SERVER_OPTS

_dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $_dir
# ts-node $_dir/deploy/main.js
node --inspect $_dir/deploy/main.js
