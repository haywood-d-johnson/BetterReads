// Dashboard: currently-reading + recently-added, with a sign-out action.
import { useState, useCallback } from "react";
import { View, Text, ScrollView, RefreshControl, Pressable, StyleSheet, Alert } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { getBooks } from "../../src/api/books.js";
import { useAuth } from "../../src/hooks/useAuth.js";
import BookCard from "../../src/components/BookCard.jsx";
import LoadingSpinner from "../../src/components/LoadingSpinner.jsx";
import EmptyState from "../../src/components/EmptyState.jsx";
import { colors, spacing, fontSize } from "../../src/theme.js";

export default function DashboardScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [reading, setReading] = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [readingData, recentData] = await Promise.all([
        getBooks({ shelf: "currently-reading", limit: 10 }),
        getBooks({ sort: "date_added", order: "desc", limit: 6 }),
      ]);
      setReading(readingData.books || []);
      setRecent(recentData.books || []);
    } catch {
      // network/error state handled by empty sections
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  function confirmLogout() {
    Alert.alert("Sign out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign out", style: "destructive", onPress: () => logout() },
    ]);
  }

  if (loading) return <LoadingSpinner text="Loading..." />;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
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
    >
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.greeting}>Hi, {user?.username || "reader"}</Text>
          <Text style={styles.sub}>Welcome back to your library</Text>
        </View>
        <Pressable onPress={confirmLogout} style={styles.signOut}>
          <Text style={styles.signOutText}>Sign out</Text>
        </Pressable>
      </View>

      <Section title="Currently Reading">
        {reading.length ? (
          <Grid books={reading} />
        ) : (
          <EmptyState icon="📖" title="Nothing in progress" message="Move a book to “Currently Reading” to see it here." />
        )}
      </Section>

      <Section title="Recently Added">
        {recent.length ? (
          <Grid books={recent} />
        ) : (
          <EmptyState icon="📚" title="No books yet" message="Search for books and add them to your library." />
        )}
      </Section>

      <Pressable style={styles.searchCta} onPress={() => router.push("/search")}>
        <Text style={styles.searchCtaText}>🔍  Find a book</Text>
      </Pressable>
    </ScrollView>
  );
}

function Section({ title, children }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Grid({ books }) {
  return (
    <View style={styles.grid}>
      {books.map((b) => (
        <View key={b.id} style={styles.gridItem}>
          <BookCard book={b} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.md, gap: spacing.lg, paddingBottom: spacing.xl },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  greeting: { fontSize: fontSize.xl, fontWeight: "800", color: colors.text },
  sub: { fontSize: fontSize.sm, color: colors.textMuted },
  signOut: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: colors.border },
  signOutText: { color: colors.textLight, fontWeight: "600", fontSize: fontSize.sm },
  section: { gap: spacing.sm },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: "700", color: colors.text },
  grid: { flexDirection: "row", flexWrap: "wrap", marginHorizontal: -spacing.xs },
  gridItem: { width: "33.333%", padding: spacing.xs },
  searchCta: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  searchCtaText: { color: "white", fontWeight: "700", fontSize: fontSize.md },
});
