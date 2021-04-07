export DATA_DIRECTORY="$(pwd)/esdata";
if [ ! -d "$DATA_DIRECTORY" ]; then
    tar -xvf testdata.tar.gz esdata 
fi

#if ES not already running
if [ -z `docker container ls | grep -e cqdg-arranger_elasticsearch` ]; then
    docker-compose -p cqdg-arranger up -d --remove-orphans;
    
    i=15
    status=`curl --silent --fail http://localhost:9200/donors/_count?q=*`
    
    echo "Waiting for ElasticSearch to boot.  Timeout: $i seconds."

    while [ -z "$status" ] && [ $i -gt 0 ]
    do
      i=$((i-1))
      sleep 1
      status=`curl --silent --fail http://localhost:9200/donors/_count?q=*`
    done

    [ -z "$status" ] && (echo "ElasticSearch failed to start!"; exit 1;)
fi
