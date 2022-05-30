#!/bin/bash

trap - SIGINT

readonly FILE_ENV=".env-dev"

if [ ! -f "$FILE_ENV" ]; then
  echo "You must provide a file named '$FILE_ENV' for environment variables"
  exit 1
fi

if [ ! -d es_data ]; then
  echo "You must provide create a directory named 'es_data' for elasticsearch"
  exit 1
fi

# shellcheck source=src/.env-dev
source $FILE_ENV

export INDICES
export SIZE
export URL_REMOTE_ES

read -r -a INDICES_TO_IMPORT <<<"$INDICES"

docker pull elasticdump/elasticsearch-dump

for ES_INDEX in "${INDICES_TO_IMPORT[@]}"; do
  echo "about to copy: $ES_INDEX ."

  docker run --rm -ti --network=host -e NODE_TLS_REJECT_UNAUTHORIZED=0 elasticdump/elasticsearch-dump \
    --input="$URL_REMOTE_ES"/"$ES_INDEX" \
    --output=http://localhost:9200/"$ES_INDEX" \
    --size="$SIZE" \
    --type=mapping

  docker run --rm -ti --network=host -e NODE_TLS_REJECT_UNAUTHORIZED=0 elasticdump/elasticsearch-dump \
    --input="$URL_REMOTE_ES"/"$ES_INDEX" \
    --output=http://localhost:9200/"$ES_INDEX" \
    --size="$SIZE" \
    --type=data
done
