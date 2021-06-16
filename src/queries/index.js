import graphql from '../services/graphql';

export const homepageCharts = async () => {
  const gqlQuery = `
    query{
      viewer{
        Study {
          hits {
            total
          }
          aggregations {
            domain {
              buckets {
                doc_count
                key
              }
            }
          }
        }
        File {
          hits {
            total
          }
          aggregations {
            file_size {
              stats {
                sum
              }
            }
          }
        }
        Donor {
          hits {
            total
          }
          aggregations {
            diagnoses__tagged_icd__main_category {
              buckets {
                doc_count
                key
              }
            }
            observed_phenotype_tagged__main_category {
              buckets {
                doc_count
                key
              }
            }
          }
        }
      }
    }
  `;

  const response = await graphql(gqlQuery, {});
  const data = response.data || {};

  return data;
}

export const studyDataByStudyId = async (id, token) => {
  const gqlQuery = `
    query getRequestAccessData($studyFilters: JSON){
      viewer{
        Study {
          hits(filters: $studyFilters) {
            edges {
              node {
                access_authority
                name
                data_access_codes {
                  access_limitations
                  access_requirements
                }
                files {
                  hits {
                    edges {
                      node {
                        internal_file_id
                        data_type
                        experimental_strategy
                        file_format
                        file_size
                        submitter_donor_id  
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `;
  const studyFilters = {op: 'and', content: [
    {content: {field: 'internal_study_id', value: [id]}, op: 'in'}
  ]}
  const response = await graphql(gqlQuery, {studyFilters}, token);
  const data = response.data || {};

  return data;
}