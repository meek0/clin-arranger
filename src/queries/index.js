const graphql = require('../services/graphql')

const homepageCharts = async () => {
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
            diagnoses__icd_category_keyword {
              buckets {
                key
                doc_count
              }
            }
            phenotypes__hpo_category_keyword {
              buckets {
                key
                doc_count
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

module.exports = {
  homepageCharts
}