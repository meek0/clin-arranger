import {extractValuesFromSqonByField} from "../utils.js"


export const cleanupDonors = (body, ids) => {
    if (!ids?.length || !body?.length) {
        return body;
    }

    const data = JSON.parse(body);
    const variants = data?.data?.Variants?.hits?.edges;

    if (variants?.length) {
        // Create a set of patient_ids for faster lookup
        const idSet = new Set(ids.map(id => String(id)));

        variants.forEach(variant => {
            const donors = variant.node.donors?.hits?.edges;

            if (donors?.length) {
                const newDonors = donors.filter(d => idSet.has(String(d.node.patient_id)));
                variant.node.donors.hits.edges = newDonors;
                variant.node.donors.hits.total = newDonors.length;
            }
        });

        return JSON.stringify(data);
    }

    return body;
};


export default (req, res, next) => {
    const ids = extractValuesFromSqonByField(req.body?.variables?.sqon, 'donors.patient_id')

    if (ids?.length > 0) {
        // one way to modify body is to replace the res.send() function
        const originalSend = res.send;
        res.send = function () { // function is mandatory, () => {} doesn't work here
            arguments[0] = cleanupDonors(arguments[0], ids)
            originalSend.apply(res, arguments);
        };
    }
    return next();
}