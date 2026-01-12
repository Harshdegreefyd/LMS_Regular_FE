import qs from 'qs';


export function cleanQueryParams(params = {}) {
  const cleaned = {};

  for (const key in params) {
    const value = params[key];

    if (
      value === null ||
      value === undefined ||
      value === '' ||
      (Array.isArray(value) && value.length === 0)
    ) {
      continue;
    }

    cleaned[key] = value;
  }

  return qs.stringify(cleaned, { arrayFormat: 'repeat' });
}
