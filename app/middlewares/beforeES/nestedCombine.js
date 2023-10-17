import {extractNestedFields, groupNestedFields} from "../../utils.js";

export default function (body) {
  // loop through all sqon to determine if nested fields with pivot have AND OP
  const filterToCombine = extractNestedFields(global.sqonQuery)

  if(!filterToCombine.includes('consequences')) return body

  // code is ready to handle all nested fields but we only want to update queries with consequences field
  return groupNestedFields(body, ['consequences']);
}
