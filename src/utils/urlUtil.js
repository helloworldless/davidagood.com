// Be lenient with null values making sure we
// return null if either argument is not provided
export const constructUrl = (baseUrl, path) =>
  (!baseUrl || !path) ? null : `${baseUrl}${path}`;
