import EsInstance from "../../services/esClient.js";
import {
  indexNameGeneFeatureSuggestion,
  indexNameVariantFeatureSuggestion,
  maxNOfGenomicFeatureSuggestions,
} from "../../config/vars.js";

export const SUGGESTIONS_TYPES = {
  VARIANT: "variant",
  GENE: "gene",
};

export default async (req, res, type) => {
  const prefix = req.params.prefix;
  const client = EsInstance.getInstance();
  const _index =
    type === SUGGESTIONS_TYPES.GENE
      ? indexNameGeneFeatureSuggestion
      : indexNameVariantFeatureSuggestion;

  const { body } = await client.search({
    index: _index,
    body: {
      suggest: {
        suggestions: {
          prefix,
          completion: {
            field: "suggest",
            size: maxNOfGenomicFeatureSuggestions,
          },
        },
      },
    },
  });

  const suggestionResponse = body.suggest.suggestions[0];

  const searchText = suggestionResponse.text;
  const suggestions = suggestionResponse.options.map(
    (suggestion) => suggestion._source
  );

  res.status(200).send({
    searchText,
    suggestions,
  });
};
