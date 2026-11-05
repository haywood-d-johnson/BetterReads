// Search tab: debounced Open Library search with add-to-library.
import { useState, useEffect, useCallback } from "react";
import { View, Text, FlatList, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { searchBooks } from "../../src/api/search.js";
import { getLibraryWorkKeys } from "../../src/api/books.js";
import { getShelves } from "../../src/api/shelves.js";
import { useDebounce } from "../../src/hooks/useDebounce.js";
import SearchBar from "../../src/components/SearchBar.jsx";
import SearchResultRow from "../../src/components/SearchResultRow.jsx";
import BarcodeScanner from "../../src/components/BarcodeScanner.jsx";
import LoadingSpinner from "../../src/components/LoadingSpinner.jsx";
import EmptyState from "../../src/components/EmptyState.jsx";
import { colors, spacing, radius, fontSize } from "../../src/theme.js";

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 450);
  const [results, setResults] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [libraryKeys, setLibraryKeys] = useState(new Set());
  const [shelves, setShelves] = useState([]);
  const [scannerVisible, setScannerVisible] = useState(false);

  useEffect(() => {
    getLibraryWorkKeys().then((keys) => setLibraryKeys(new Set(keys))).catch(() => {});
    getShelves().then(setShelves).catch(() => {});
  }, []);

  const runSearch = useCallback(async (q) => {
    if (!q.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const data = await searchBooks({ q: q.trim(), page: 1, limit: 20 });
      setResults(data.docs || data.results || []);
      setTotal(data.numFound || data.total || 0);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    runSearch(debouncedQuery);
  }, [debouncedQuery, runSearch]);

  function handleAdded(workKey) {
    setLibraryKeys((prev) => new Set([...prev, workKey]));
  }

  function handleScanned(isbn) {
    setScannerVisible(false);
    setQuery(isbn);
    runSearch(isbn);
  }

  return (
    <View style={styles.screen}>
      <View style={styles.searchWrap}>
        <View style={styles.searchRow}>
          <View style={{ flex: 1 }}>
            <SearchBar value={query} onChangeText={setQuery} onSubmit={() => runSearch(query)} />
          </View>
          <Pressable
            style={styles.scanBtn}
            onPress={() => setScannerVisible(true)}
            accessibilityLabel="Scan ISBN barcode"
          >
            <Ionicons name="barcode-outline" size={24} color="#fff" />
          </Pressable>
        </View>
      </View>

      {loading ? (
        <LoadingSpinner text="Searching..." />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            results.length ? (
              <Text style={styles.count}>
                {total.toLocaleString()} result{total === 1 ? "" : "s"}
              </Text>
            ) : null
          }
          renderItem={({ item }) => (
            <SearchResultRow
              result={item}
              shelves={shelves}
              inLibrary={libraryKeys.has(item.key)}
              onAdded={handleAdded}
            />
          )}
          ListEmptyComponent={
            searched ? (
              <EmptyState icon="🔍" title="No results" message={`Nothing found for “${query}”.`} />
            ) : (
              <EmptyState icon="🔍" title="Search for books" message="Find titles by name, author, or ISBN." />
            )
          }
        />
      )}

      <BarcodeScanner
        visible={scannerVisible}
        onClose={() => setScannerVisible(false)}
        onScan={handleScanned}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  searchWrap: { padding: spacing.md, paddingBottom: spacing.sm },
  searchRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  scanBtn: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  list: { padding: spacing.md, paddingTop: 0, gap: spacing.sm },
  count: { fontSize: fontSize.sm, color: colors.textMuted, marginBottom: spacing.sm },
});
