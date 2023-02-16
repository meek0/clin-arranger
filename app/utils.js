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

export const extractValuesFromSqonByField = (sqon, field) => {
  const ids = []
  sqon?.content?.forEach(c1 => {
    if (Array.isArray(c1.content)) {
      c1.content.forEach(c2 => {
        ids.push(...extractValuesFromContent(c2.content, field))
      })
    } else {
      ids.push(...extractValuesFromContent(c1.content, field))
    }
  });
  return Array.from(new Set(ids));
}