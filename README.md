# About

This is a clin specific extension of the  [arranger project](https://github.com/overture-stack/arranger) . More specifically, It is an ExpressJs app on top of 
arranger with extra endpoints.
# Usage

## Variables

This application takes minimally the following variables as input:

- **PORT**: Port number you want to the server to listen to. Please note that for admin service, PORT is hardcoded.
- **LOGS_REQUEST_INTERCEPTOR**: Log or not incoming request.
- **AUTH_CLIENT_ID**: Keycloack config.
- **AUTH_SERVER_URL**: Keycloack config.
- **AUTH_REALM**: Keycloack config.
- **ES_HOST**: Elastic search config.
- **ES_USER**: Elastic search config.
- **ES_PASS**: Elastic search config.
- **PATIENTS_INDEX_NAME**: Index of patients in ES.
- **VARIANTS_INDEX_NAME**: Index of variants in ES.
- **PRESCRIPTIONS_INDEX_NAME**: Index of prescriptions in ES.
- **NODE_TLS_REJECT_UNAUTHORIZED**: Certificate validation: if equals to 0, certificate validation is disabled for TLS connections.


### Development Setup with Docker

Before going further, make sure that ```docker``` and ```docker-compose``` are installed on your system.

```bash
# 1. clone the repository
  git clone git@github.com:Ferlab-Ste-Justine/clin-arranger.git

# 2. enter the project's folder
  cd clin-arranger

# 3. create an .env file (you may have to adjust the template to your needs)
  touch .env

# 4.1 in a terminal, run docker-compose from project's docker-compose file. 
  docker-compose up # for regular service

# 4.2 in a terminal, run docker-compose from project's docker-compose file. 
  docker-compose --profile admin up # for admin service

# 5.1 to clean up regular service afterwards once your are done developing.
  docker-compose down
  
# 5.2 to clean up admin afterwards once your are done developing.
  docker-compose --profile admin down
```
:warning: _With this setup, your host and the app's container share the project directory/volume._

### Deactivating arranger-projects
As a rule of thumb, it is best to keep the number of arranger-projects small (*at least in versions 2.X.X*). Every active arranger project creates a self-contained Apollo server and emits various events. In order to deactivate some projects one can post a similar query to ES [^1]:
```bash
https://<ES_HOSTS>/arranger-projects/_update_by_query
{
  "script": {
    "lang": "painless",
    "source": "if (params['projects'].contains(ctx._source.id)) { ctx._source.active = false }",
    "params": {
      "projects": ["project_to_deactivate_x1", "project_to_deactivate_x2", "project_to_deactivate_x3"]
    }
  }
}
```
[^1]: Please note that this was tested on elasticsearch *v7.17.0*.