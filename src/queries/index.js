const graphql = require('../services/graphql')

const homepageCharts = async () => {
  const gqlQuery = `
    query{
      viewer{
        File {
          aggregations{
            data_type{
              buckets{
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

module.exports = {
  homepageCharts
}