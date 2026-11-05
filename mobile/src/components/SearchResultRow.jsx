// Mobile port of client/src/components/search/SearchResultCard.jsx.
// Builds the same bookData payload the web app sends to addBook.
import { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import BookCover from "./BookCover.jsx";
import AddToLibrarySheet from "./AddToLibrarySheet.jsx";
import { colors, spacing, radius, fontSize } from "../theme.js";

export default function SearchResultRow({ result, shelves, inLibrary, onAdded }) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const workKey = result.key;

  const bookData = {
    ol_work_key: workKey,
    title: result.title,
    author_name: result.author_name?.[0] || null,
    ol_author_key: result.author_key?.[0] ? `/authors/${result.author_key[0]}` : null,
    cover_id: result.cover_i || null,
    cover_url: result.cover_url || null,
    number_of_pages: result.number_of_pages_median || null,
    publish_date: result.first_publish_year ? String(result.first_publish_year) : null,
    subjects: result.subject?.slice(0, 10) || null,
    isbn_13: result.isbn?.[0] || null,
  };

  return (
    <View style={styles.card}>
      <View style={styles.coverWrap}>
        <BookCover coverId={result.cover_i} coverUrl={result.cover_url} title={result.title} size="M" />
      </View>
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>
          {result.title}
        </Text>
        {result.author_name ? (
          <Text style={styles.author} numberOfLines={1}>
            by {result.author_name[0]}
          </Text>
        ) : null}
        <View style={styles.meta}>
          {result.first_publish_year ? <Text style={styles.metaText}>First published {result.first_publish_year}</Text> : null}
          {result.number_of_pages_median ? <Text style={styles.metaText}>{result.number_of_pages_median} pages</Text> : null}
        </View>

        {inLibrary ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>In Library</Text>
          </View>
        ) : (
          <Pressable style={styles.addBtn} onPress={() => setSheetOpen(true)}>
            <Text style={styles.addText}>+ Add</Text>
          </Pressable>
        )}
      </View>

      <AddToLibrarySheet
        visible={sheetOpen}
        bookData={bookData}
        shelves={shelves}
        onClose={() => setSheetOpen(false)}
        onAdded={() => onAdded && onAdded(workKey)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  coverWrap: { width: 70, height: 105, borderRadius: radius.sm, overflow: "hidden", backgroundColor: colors.borderLight },
  body: { flex: 1, gap: 4 },
  title: { fontSize: fontSize.md, fontWeight: "600", color: colors.text, lineHeight: 20 },
  author: { fontSize: fontSize.sm, color: colors.textLight },
  meta: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginTop: 2 },
  metaText: { fontSize: fontSize.xs, color: colors.textMuted },
  addBtn: {
    alignSelf: "flex-start",
    marginTop: spacing.sm,
    backgroundColor: colors.accent,
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: radius.md,
  },
  addText: { color: "white", fontWeight: "700", fontSize: fontSize.sm },
  badge: {
    alignSelf: "flex-start",
    marginTop: spacing.sm,
    backgroundColor: "rgba(90,143,92,0.15)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radius.full,
  },
  badgeText: { color: colors.success, fontWeight: "600", fontSize: fontSize.xs },
});
