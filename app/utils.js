//ref:vhttps://jsmanifest.com/composing-in-javascript/
export const compose =
  (...fns) =>
    (arg) =>
      fns.reduceRight((acc, fn) => (fn ? fn(acc) : acc), arg);

export const extractValuesFromContent = (content, field) => {
  const values = [];
  if (content.field === field) {
    if (Array.isArray(content.value)) {
      values.push(...content.value);
    } else {
      values.push(content.value);
    }
  }
  return values.map((v) => String(v));
};

export function extractValuesFromSqonByField(jsonObj, field) {
  const ids = [];

  function traverse(obj) {
    if (typeof obj === "object" && obj !== null) {
      if (obj.field === field) {
        ids.push(...obj.value);
      }

      for (const key in obj) {
        traverse(obj[key]);
      }
    }
  }

  traverse(jsonObj);
  return Array.from(new Set(ids));
}

export const extractNestedFields = (obj) => {

  let result = [];

  function traverse(node) {
    if (node.op === "and" || (node.content && Array.isArray(node.content))) {
      for (let i = 0; i < node.content.length; i++) {
        traverse(node.content[i]);
      }
    } else if (node.content.field && node.content.field.includes('.')) {
      result.push(node.content.field);
    }

  }

  traverse(obj);

  const cleanKeys = (keys) => {
    const res = []
    keys.forEach((k) => {
      if (!k.includes('patient_id')) {
        res.push(k.split('.')[0])
      }
    })
    return res
  }
  return [...new Set(cleanKeys(result))];
};

function findObjectsToCombine(json, fields) {
  let result = [];
  let toRemove = [];

  function traverse(obj) {
    obj.forEach((o) => {
      if (o.nested && fields.includes(o.nested.path)) {
        result.push({field: o.nested.path, values: o.nested.query.bool.must})
        toRemove.push(o)
      } else if (o.bool && o.bool.must) {
        traverse(o.bool.must)
      }
    })
  }

  traverse(json);
  return [result, toRemove];
}
function removeSpecificObject(json, objectToRemove, toReplace = null) {
  if (typeof json !== 'object' || json === null) {
    return json;
  }

  if (Array.isArray(json)) {
    return json.map(item => removeSpecificObject(item, objectToRemove, toReplace)).filter((item) => item !== undefined);
  }

  if (JSON.stringify(json) === JSON.stringify(objectToRemove)) {
    if (!toReplace) {
      return undefined;
    } else {
      return toReplace;
    }
  }

  const result = {};
  for (const key in json) {
    if (json.hasOwnProperty(key)) {
      const value = removeSpecificObject(json[key], objectToRemove, toReplace);
      if (value !== undefined) {
        result[key] = value;
      }
    }
  }

  return result;
}

export const groupNestedFields = (initialObj, fields) => {
  let obj = {...initialObj}

  const [toCombine, toRemove] = findObjectsToCombine(obj.query.bool.must, fields)

  if (!toCombine.length) return obj
  let toReturn = obj

  fields.forEach((field) => {
    const fieldToCombine = []
      toCombine.forEach((o) => {
        if(o.field === field) {
          fieldToCombine.push(o.values)
        }
      })
    const combined = {nested: {path: field, query: {bool: {must: fieldToCombine.flat()}}}}
      toRemove.forEach((r, index) => {
        if(JSON.stringify(r).includes(field)) {
          toReturn = removeSpecificObject(toReturn, r, index === 0 ? combined : null)
        }
      })
  })
  return toReturn
}
