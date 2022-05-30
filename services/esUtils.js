export const createIndexIfNeeded = async (esClient, indexName) => {
  const existsResp = await esClient.indices.exists({
    index: indexName,
  });
  const mustCreateIndex = !existsResp?.body;
  if (mustCreateIndex) {
    await esClient.indices.create({
      index: indexName,
    });
  }
  return mustCreateIndex;
};

export const countNOfDocs = async (esClient, indexName) => {
    const respCounts = await esClient.count({
        index: indexName,
    });
    return respCounts?.body?.count;
}