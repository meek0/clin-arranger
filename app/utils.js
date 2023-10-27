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

export const DONORS_PATIENT_ID = 'donors.patient_id';
export const DONORS_ANALYSIS_SERVICE_REQUEST_ID = 'donors.analysis_service_request_id';

export const findSqonValueInQuery = (obj, fieldName) => {
  for (var key in obj) {
      if (key === fieldName) {
          return obj[key][0];
      } else if (typeof obj[key] === 'object') {
          const result = findSqonValueInQuery(obj[key], fieldName);
          if (result !== null) {
              return result;
          }
      }
  }
  return null;
}