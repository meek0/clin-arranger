import { extractValuesFromSqonByField } from "../utils.js"
import set from "lodash/set.js"

// where we cleanup the response body
export const cleanupDonors = (body, ids) => {
  if (ids?.length && body?.length) {
    const data = JSON.parse(body)
    // check if response contains variants
    const variants = data?.data?.Variants?.hits?.edges;
    if (variants?.length) {
      //const start = Date.now()
      variants.forEach(variant => {
        const donors = variant.node.donors?.hits?.edges
        if (donors?.length) {
          const newDonors = donors.filter(d => ids.includes(String(d.node.patient_id)))
          set(variant, 'node.donors.hits.edges', newDonors)
          set(variant, 'node.donors.hits.total', newDonors.length)
        }
      })

      const newBody = JSON.stringify(data)
      //console.log('cleanupDonors - reduction in size of the body (%)', (1 - (newBody.length / body.length).toFixed(4)) * 100, 'in (ms)', Date.now() - start)
      return newBody
    }
  }
  return body;
}

export default (req, res, next) => {
  const ids = extractValuesFromSqonByField(req.body?.variables?.sqon, 'donors.patient_id')
  if (ids?.length > 0) {
  // one way to modify body is to replace the res.send() function
    const originalSend = res.send;
    res.send = function(){ // function is mandatory, () => {} doesn't work here
      arguments[0] = cleanupDonors(arguments[0], ids)
      originalSend.apply(res, arguments);
    };
  }
  return next();
}