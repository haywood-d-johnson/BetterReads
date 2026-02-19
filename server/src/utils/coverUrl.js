export function bookCoverUrl(coverId, size = "M") {
  if (!coverId) return null;
  return `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg?default=false`;
}

export function authorPhotoUrl(olAuthorKey, size = "M") {
  if (!olAuthorKey) return null;
  const key = olAuthorKey.replace("/authors/", "");
  return `https://covers.openlibrary.org/a/olid/${key}-${size}.jpg?default=false`;
}
