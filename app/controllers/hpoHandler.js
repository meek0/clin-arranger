import EsInstance from "../../services/esClient.js";
import {
  indexNameHPO,
} from "../../config/vars.js";

const SIZE_HPO_CHILDREN = 1000

export async function searchHPOAutocomplete(req, res) {

  const params = req.query || req.params || req.body
  const { prefix } = params

  const client = EsInstance.getInstance();

  const {body} = await client.search({
    index: indexNameHPO,
    body: {
      query: {
        multi_match: {
          query: prefix,
          type: "bool_prefix",
          fields: [
            "hpo_id",
            "name",
            "name._2gram",
            "name._3gram",
            "name._index_prefix"
          ]
        }
      },
      highlight: {
        fields: {
          name: {}
        }
      }
    }
  });

  res.status(200).send({
    total: body.hits.total.value,
    hits: body.hits.hits
  });
};

export async function searchHPODescendants(req, res) {

  const params = req.query || req.params || req.body
  const { parentHpoId } = params

  const client = EsInstance.getInstance();

  const {body} = await client.search({
    index: indexNameHPO,
    body: {
      size: SIZE_HPO_CHILDREN,
      query: {
          term: {
              parents: {
                  value: parentHpoId
              }
          }
      }
    }
  });

  res.status(200).send({
    total: body.hits.total.value,
    hits: body.hits.hits
  });
};

export async function searchHPOAncestors (req, res) {

  const params = req.query || req.params || req.body
  const { hpoId, size, after } = params

  const client = EsInstance.getInstance();

  const {body} = await client.search({
    index: indexNameHPO,
    body: {
      size: size,
      query: {
          term: {
              'compact_ancestors.hpo_id.keyword': {
                  value: hpoId
              }
          }
      },
      sort: [
          {
              'hpo_id.keyword': {
                  order: 'desc'
              }
          }
      ],
      search_after: [
          after
      ]
    }
  });

  res.status(200).send({
    total: body.hits.total.value,
    hits: body.hits.hits,
  });
};

export const countHPO = async (_,res) => {
  const client = EsInstance.getInstance();

  const {body} = await client.count({
    index: indexNameHPO
  })

  res.status(200).send({count: body.count})
}
