function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

/**
 * Builds URLSearchParams from an object of parameters
 *
 * @param {Object} params - Object containing query parameters
 * @param {string[]} [partialSearchFields=[]] - Array of field names that should use partial/regex search
 *
 * @returns {URLSearchParams} - URLSearchParams object ready to append to URL
 */
export const buildQueryParams = (params, partialSearchFields = []) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (Array.isArray(value)) {
      value.forEach(v => searchParams.append(key, v));
      return;
    }

    if (partialSearchFields.includes(key) && value) {
      const escapedValue = escapeRegExp(value);
      searchParams.set(key, `/${escapedValue}/i`);
      return;
    }

    searchParams.set(key, value.toString());
  });

  return searchParams;
};
