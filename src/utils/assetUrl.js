export const constructAssetUrl = (siteUrl, relativeAssetUrl) => {
  if (!relativeAssetUrl) {
    return null;
  }

  // OG Image won't resolve relative URLs, but for local development they should still be local
  return process.env.NODE_ENV === "development"
    ? relativeAssetUrl
    : siteUrl + relativeAssetUrl;
}
