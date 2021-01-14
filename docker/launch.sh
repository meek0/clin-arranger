export DATA_DIRECTORY="$(pwd)/esdata";
if [ ! -d "$DATA_DIRECTORY" ]; then
    mkdir -p $DATA_DIRECTORY;
fi

#if ES not already running
if [ -z `docker-compose ps -q elasticsearch` ] || [ -z `docker ps -q --no-trunc | grep $(docker-compose ps -q elasticsearch)` ]; then
    docker-compose up -d --remove-orphans;
fi

(cd ../; npm start)
