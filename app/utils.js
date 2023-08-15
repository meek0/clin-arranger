//ref:vhttps://jsmanifest.com/composing-in-javascript/
export const compose =
  (...fns) =>
  (arg) =>
    fns.reduceRight((acc, fn) => (fn ? fn(acc) : acc), arg);

export const extractValuesFromContent = (content, field) => {
  const values = []
  if (content.field === field){
    if (Array.isArray(content.value)) {
      values.push(...content.value)
    } else {
      values.push(content.value)
    }
  }
  return values.map((v) =>  String(v))
}


export function extractValuesFromSqonByField(jsonObj, field) {
  const ids = [];

  function traverse(obj) {
    if (typeof obj === 'object' && obj !== null) {
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