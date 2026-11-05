// Library tab: shelf filter chips + a 2-column grid of books.
import { useState, useCallback } from "react";
import { View, Text, FlatList, Pressable, ScrollView, RefreshControl, StyleSheet } from "react-native";
import { useFocusEffect } from "expo-router";
import { getBooks } from "../../src/api/books.js";
import { getShelves } from "../../src/api/shelves.js";
import BookCard from "../../src/components/BookCard.jsx";
import LoadingSpinner from "../../src/components/LoadingSpinner.jsx";
import EmptyState from "../../src/components/EmptyState.jsx";
import { colors, spacing, radius, fontSize } from "../../src/theme.js";

const SORTS = [
  { key: "date_added", label: "Recent" },
  { key: "title", label: "Title" },
  { key: "author_name", label: "Author" },
  { key: "rating", label: "Rating" },
];

export default function LibraryScreen() {
  const [books, setBooks] = useState([]);
  const [total, setTotal] = useState(0);
  const [shelves, setShelves] = useState([]);
  const [activeShelf, setActiveShelf] = useState(null); // slug or null (All)
  const [sort, setSort] = useState("date_added");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const params = { sort, order: sort === "title" || sort === "author_name" ? "asc" : "desc", limit: 100 };
      if (activeShelf) params.shelf = activeShelf;
      const [data, shelfData] = await Promise.all([getBooks(params), getShelves()]);
      setBooks(data.books || []);
      setTotal(data.total || 0);
      setShelves(shelfData || []);
    } catch {
      setBooks([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeShelf, sort]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const chips = [{ slug: null, name: "All" }, ...shelves];

  return (
    <View style={styles.screen}>
      <View style={styles.filters}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          {chips.map((s) => {
            const active = activeShelf === s.slug;
            return (
              <Pressable
                key={s.slug || "all"}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => setActiveShelf(s.slug)}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{s.name}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          {SORTS.map((s) => {
            const active = sort === s.key;
            return (
              <Pressable
                key={s.key}
                style={[styles.sortChip, active && styles.sortChipActive]}
                onPress={() => setSort(s.key)}
              >
                <Text style={[styles.sortText, active && styles.sortTextActive]}>{s.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {loading ? (
        <LoadingSpinner text="Loading library..." />
      ) : (
        <FlatList
          data={books}
          key="grid-2col"
          numColumns={2}
          keyExtractor={(item) => String(item.id)}
          columnWrapperStyle={styles.column}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                load();
              }}
              tintColor={colors.primary}
            />
          }
          ListHeaderComponent={total > 0 ? <Text style={styles.count}>{total} books</Text> : null}
          renderItem={({ item }) => (
            <View style={styles.cell}>
              <BookCard book={item} />
            </View>
          )}
          ListEmptyComponent={
            <EmptyState
              icon="📚"
              title="No books here yet"
              message={activeShelf ? "Move books to this shelf, or search for new ones." : "Search for books and add them to your library."}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  filters: { paddingTop: spacing.sm, gap: spacing.xs },
  chipRow: { paddingHorizontal: spacing.md, gap: spacing.sm, paddingVertical: spacing.xs },
  chip: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: radius.full,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.textLight, fontWeight: "600", fontSize: fontSize.sm },
  chipTextActive: { color: "white" },
  sortChip: { paddingVertical: 5, paddingHorizontal: 12, borderRadius: radius.full },
  sortChipActive: { backgroundColor: colors.badgeAccent || "rgba(212,162,78,0.18)" },
  sortText: { color: colors.textMuted, fontSize: fontSize.xs, fontWeight: "600" },
  sortTextActive: { color: colors.accentDark },
  list: { padding: spacing.md, gap: spacing.md },
  column: { gap: spacing.md },
  cell: { flex: 1 },
  count: { fontSize: fontSize.sm, color: colors.textMuted, marginBottom: spacing.sm },
});
