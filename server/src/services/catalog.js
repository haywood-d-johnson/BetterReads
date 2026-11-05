import * as openLibrary from "./openLibrary.js";
import * as googleBooks from "./googleBooks.js";
import * as bookService from "./bookService.js";

// The catalog layer is the single boundary between external book providers and
// the rest of the app. Both Open Library and Google Books are normalized into
// one shape so routes, components, and the DB never see provider-specific JSON.
// Open Library is primary; Google Books fills gaps (books OL is missing).

// Normalized search item — a superset of the Open Library search "doc" shape the
// client already consumes, plus `provider` and `cover_url` for non-OL sources.
function normalizeOLDoc(doc) {
  return { ...doc, provider: "openlibrary", cover_url: null };
}

function normalizeGoogleVolume(vol) {
  const info = vol.volumeInfo || {};
  const ids = info.industryIdentifiers || [];
  const isbn13 = ids.find((i) => i.type === "ISBN_13")?.identifier;
  const isbn10 = ids.find((i) => i.type === "ISBN_10")?.identifier;
  const thumb = info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail || null;
  const year = info.publishedDate ? parseInt(info.publishedDate.slice(0, 4), 10) : null;
  return {
    key: `gb:${vol.id}`,
    title: info.title || "Unknown Title",
    author_name: info.authors || [],
    author_key: undefined, // Google has no OL author keys → author links degrade gracefully
    cover_i: null,
    cover_url: thumb ? thumb.replace(/^http:/, "https:") : null,
    first_publish_year: Number.isFinite(year) ? year : null,
    number_of_pages_median: info.pageCount || null,
    subject: info.categories || [],
    isbn: [isbn13, isbn10].filter(Boolean),
    edition_count: undefined,
    provider: "google",
  };
}

function titleAuthorKey(item) {
  const norm = (s) => (s || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  return `${norm(item.title)}|${norm(item.author_name?.[0])}`;
}

export async function search(query, page = 1, limit = 20) {
  const ol = await openLibrary.searchBooks(query, page, limit).catch((err) => {
    console.error("Open Library search failed:", err.message);
    return null;
  });
  const olDocs = (ol?.docs || []).map(normalizeOLDoc);
  let docs = olDocs;
  let numFound = ol?.numFound ?? olDocs.length;

  // Only reach for Google Books when OL didn't fill the page — i.e. a sparse or
  // missing result. A full OL page is left untouched (fast, fewer API calls).
  if (olDocs.length < limit) {
    let gbDocs = [];
    try {
      const gb = await googleBooks.searchVolumes(query, page, limit);
      gbDocs = (gb.items || []).map(normalizeGoogleVolume);
    } catch (err) {
      console.error("Google Books supplement failed:", err.message);
    }
    if (gbDocs.length) {
      const seenIsbn = new Set(olDocs.flatMap((d) => d.isbn || []));
      const seenTA = new Set(olDocs.map(titleAuthorKey));
      const additions = gbDocs.filter((g) => {
        if ((g.isbn || []).some((i) => seenIsbn.has(i))) return false;
        return !seenTA.has(titleAuthorKey(g));
      });
      docs = [...olDocs, ...additions];
      numFound = Math.max(numFound, docs.length);
    }
  }

  return { docs, numFound };
}

// Detail shape consumed by OLBookDetailPage. Works for either provider; the
// `gb:` prefix on the key routes to Google Books, otherwise Open Library.
export async function getWorkDetail(rawKey) {
  if (rawKey.startsWith("gb:")) return getGoogleWorkDetail(rawKey);
  return getOLWorkDetail(rawKey);
}

async function getGoogleWorkDetail(rawKey) {
  const volumeId = rawKey.slice(3);
  const vol = await googleBooks.getVolume(volumeId);
  const info = vol.volumeInfo || {};
  const norm = normalizeGoogleVolume(vol);
  const sourceKey = `gb:${vol.id}`;
  const localBook = await bookService.getBookByWorkKey(sourceKey);
  // Google descriptions can contain light HTML — strip tags for plain display.
  const description = info.description ? info.description.replace(/<[^>]+>/g, "") : null;
  return {
    ol_work_key: sourceKey,
    title: info.title || "Unknown Title",
    subtitle: info.subtitle || null,
    author_name: info.authors?.[0] || null,
    ol_author_key: null,
    cover_id: null,
    cover_url: norm.cover_url,
    description,
    subjects: info.categories || [],
    first_publish_date: info.publishedDate || null,
    isbn_13: norm.isbn.find((i) => i.length === 13) || null,
    in_library: !!localBook,
    local_book: localBook || null,
  };
}

async function getOLWorkDetail(rawKey) {
  const olWorkKey = `/works/${rawKey}`;
  const localBook = await bookService.getBookByWorkKey(olWorkKey);
  const work = await openLibrary.getWork(olWorkKey);
  const description = typeof work.description === "string" ? work.description : work.description?.value || null;
  const coverId = work.covers?.[0] || null;
  const subjects = work.subjects?.slice(0, 15) || [];
  const authorKeys = work.authors?.map((a) => a.author?.key) || [];
  let authorName = null;
  if (authorKeys[0]) {
    try {
      const author = await openLibrary.getAuthor(authorKeys[0]);
      authorName = author.name || null;
    } catch {}
  }
  return {
    ol_work_key: olWorkKey,
    title: work.title || "Unknown Title",
    subtitle: work.subtitle || null,
    author_name: authorName,
    ol_author_key: authorKeys[0] || null,
    cover_id: coverId,
    cover_url: null,
    description,
    subjects,
    first_publish_date: work.first_publish_date || null,
    in_library: !!localBook,
    local_book: localBook || null,
  };
}
