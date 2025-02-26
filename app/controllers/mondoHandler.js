import EsInstance from "../../services/esClient.js";
import {
  indexNameMONDO,
} from "../../config/vars.js";

const SIZE_MONDO_CHILDREN = 1000

export async function searchMONDOAutocomplete(req, res) {

  const params = req.query || req.params || req.body
  const { prefix, no_highlight } = params

  const client = EsInstance.getInstance();

  const {body} = await client.search({
    index: indexNameMONDO,
    body: {
      size: 25,
      query: {
        bool: {
          should: [
            {
              multi_match: {
                query: prefix,
                fields: [
                  "name",
                  "name._2gram",
                  "name._3gram",
                ],
                analyzer: 'standard',
                operator: 'and'
              }
            },
            {
              multi_match: {
                type: "bool_prefix",
                query: prefix,
                fields: [
                  "mondo_id",
                  "mondo_id.autocomplete"
                ],
                analyzer: 'standard',
                operator: 'and'
              }
            }
          ]
        }
      },
      highlight: {
        pre_tags: no_highlight ? [""] : ["<strong>"],
        post_tags: no_highlight ? [""] : ["</strong>"],
        fields: {
          "name": {},
          "mondo_id*": {}
        }
      }
    }
  });

  res.status(200).send({
    total: body.hits.total.value,
    hits: body.hits.hits
  });
};
