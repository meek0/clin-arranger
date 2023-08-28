# About

This section allows to create or update automatically an arranger project based on a configuration file. Moreover, it allows to fix elements in the extended mapping that arranger creates.

# Usage

The Law of the Land is: 1 arranger project per environment (qa, staging, prod). However, it is still possible to create more manually.

## Variables
- **VARIANTS_INDEX_NAME**: index for variants in ES.
- **CNV_INDEX_NAME**: index for cnv in ES.
- **COVERAGE_BY_GENE_INDEX_NAME**: index of coverage by gene in ES
- **GENES_INDEX_NAME**: index for genes in ES.
- **HPO_INDEX_NAME**: Index of HPOs in ES.
- **SEQUENCINGS_INDEX_NAME**: index for sequences in ES.
- **ANALYSES_INDEX_NAME**: index for analyses in ES.
- **ES_HOST**: Elastic search instance.

### Steps

```bash
# 1. Make sure that targeted ES works (ES_HOST)
  
# 2. Run script (PWD =  root of the project)
  npm run admin-project
or 
 # run the script with docker (PWD = root of the project) and local elastic search (from /dev) 
 docker run -it --rm -p --network es-net -v ${PWD}:/code --workdir /code node:18.1-alpine npm run admin-project
```

