// Book detail: cover, metadata, editable rating, reading progress, shelf, review.
// Mobile port of client/src/pages/BookDetailPage.jsx (MVP subset — no locations).
import { useState, useEffect, useCallback } from "react";
import { View, Text, ScrollView, Pressable, TextInput, StyleSheet, Alert } from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import {
  getBook,
  updateRating,
  updateReview,
  moveBookToShelf,
  deleteBook,
} from "../../src/api/books.js";
import { getShelves } from "../../src/api/shelves.js";
import BookCover from "../../src/components/BookCover.jsx";
import StarRating from "../../src/components/StarRating.jsx";
import ProgressUpdateForm from "../../src/components/ProgressUpdateForm.jsx";
import LoadingSpinner from "../../src/components/LoadingSpinner.jsx";
import ErrorMessage from "../../src/components/ErrorMessage.jsx";
import { colors, spacing, radius, fontSize } from "../../src/theme.js";

export default function BookDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [book, setBook] = useState(null);
  const [shelves, setShelves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingReview, setEditingReview] = useState(false);
  const [reviewDraft, setReviewDraft] = useState("");

  const fetchBook = useCallback(async () => {
    try {
      const [b, s] = await Promise.all([getBook(id), getShelves()]);
      setBook(b);
      setShelves(s || []);
      setReviewDraft(b.review || "");
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to load book");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchBook();
  }, [fetchBook]);

  async function handleRating(rating) {
    try {
      await updateRating(id, rating);
      setBook((prev) => ({ ...prev, rating }));
    } catch {
      /* ignore */
    }
  }

  async function handleShelf(shelfId) {
    try {
      await moveBookToShelf(id, shelfId);
      await fetchBook();
    } catch {
      /* ignore */
    }
  }

  async function saveReview() {
    try {
      await updateReview(id, reviewDraft);
      setBook((prev) => ({ ...prev, review: reviewDraft }));
      setEditingReview(false);
    } catch {
      /* ignore */
    }
  }

  function confirmDelete() {
    Alert.alert("Remove book", `Remove “${book.title}” from your library? This cannot be undone.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteBook(id);
            router.replace("/library");
          } catch {
            /* ignore */
          }
        },
      },
    ]);
  }

  if (loading) return <LoadingSpinner text="Loading book..." />;
  if (error) return <ErrorMessage message={error} />;
  if (!book) return <ErrorMessage message="Book not found" />;

  const hasProgress = book.total_pages || book.current_page > 0;
  const pct =
    book.total_pages && book.current_page
      ? Math.min(100, Math.round((book.current_page / book.total_pages) * 100))
      : 0;
  const description =
    typeof book.description === "string" ? book.description : book.description?.value || "";

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: book.title, headerBackTitle: "Library" }} />

      <View style={styles.hero}>
        <View style={styles.coverWrap}>
          <BookCover coverId={book.cover_id} coverUrl={book.cover_url} title={book.title} size="L" />
        </View>
        <View style={styles.heroInfo}>
          <Text style={styles.title}>{book.title}</Text>
          {book.subtitle ? <Text style={styles.subtitle}>{book.subtitle}</Text> : null}
          {book.author_name ? <Text style={styles.author}>by {book.author_name}</Text> : null}
          <View style={styles.ratingRow}>
            <StarRating rating={book.rating || 0} onChange={handleRating} size="lg" />
          </View>
        </View>
      </View>

      {hasProgress ? (
        <Card title="Reading Progress">
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${pct}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {book.current_page || 0}
            {book.total_pages ? ` / ${book.total_pages}` : ""} pages{pct ? ` · ${pct}%` : ""}
          </Text>
          <ProgressUpdateForm
            bookId={book.id}
            currentPage={book.current_page}
            totalPages={book.total_pages}
            onUpdate={fetchBook}
          />
        </Card>
      ) : null}

      <Card title="Shelf">
        <View style={styles.shelfRow}>
          {shelves.map((s) => {
            const active = s.id === book.shelf_id;
            return (
              <Pressable
                key={s.id}
                style={[styles.shelfChip, active && styles.shelfChipActive]}
                onPress={() => handleShelf(s.id)}
              >
                <Text style={[styles.shelfChipText, active && styles.shelfChipTextActive]}>{s.name}</Text>
              </Pressable>
            );
          })}
        </View>
      </Card>

      <Card title="Review">
        {editingReview ? (
          <View style={{ gap: spacing.sm }}>
            <TextInput
              style={styles.reviewInput}
              value={reviewDraft}
              onChangeText={setReviewDraft}
              placeholder="Write your thoughts..."
              placeholderTextColor={colors.textMuted}
              multiline
            />
            <View style={styles.reviewActions}>
              <Pressable style={styles.secondaryBtn} onPress={() => { setReviewDraft(book.review || ""); setEditingReview(false); }}>
                <Text style={styles.secondaryBtnText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.primaryBtn} onPress={saveReview}>
                <Text style={styles.primaryBtnText}>Save</Text>
              </Pressable>
            </View>
          </View>
        ) : book.review ? (
          <View style={{ gap: spacing.sm }}>
            <Text style={styles.reviewText}>{book.review}</Text>
            <Pressable style={styles.secondaryBtn} onPress={() => setEditingReview(true)}>
              <Text style={styles.secondaryBtnText}>Edit Review</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable style={styles.secondaryBtn} onPress={() => setEditingReview(true)}>
            <Text style={styles.secondaryBtnText}>Write a Review</Text>
          </Pressable>
        )}
      </Card>

      {description ? (
        <Card title="Description">
          <Text style={styles.body}>{description}</Text>
        </Card>
      ) : null}

      <View style={styles.metaGrid}>
        {book.number_of_pages ? <Meta label="Pages" value={book.number_of_pages} /> : null}
        {book.publish_date ? <Meta label="Published" value={book.publish_date} /> : null}
        {book.publisher ? <Meta label="Publisher" value={book.publisher} /> : null}
        {book.isbn_13 ? <Meta label="ISBN" value={book.isbn_13} /> : null}
      </View>

      <Pressable style={styles.deleteBtn} onPress={confirmDelete}>
        <Text style={styles.deleteText}>Remove from Library</Text>
      </Pressable>
    </ScrollView>
  );
}

function Card({ title, children }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Meta({ label, value }) {
  return (
    <View style={styles.metaItem}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue}>{String(value)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xl },
  hero: { flexDirection: "row", gap: spacing.md },
  coverWrap: { width: 120, height: 180, borderRadius: radius.md, overflow: "hidden", backgroundColor: colors.borderLight },
  heroInfo: { flex: 1, gap: 4 },
  title: { fontSize: fontSize.xl, fontWeight: "800", color: colors.text },
  subtitle: { fontSize: fontSize.md, color: colors.textLight },
  author: { fontSize: fontSize.md, color: colors.textLight, marginTop: 2 },
  ratingRow: { marginTop: spacing.sm },
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  cardTitle: { fontSize: fontSize.md, fontWeight: "700", color: colors.text },
  progressTrack: { height: 8, borderRadius: 4, backgroundColor: colors.progressBg, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: colors.progress },
  progressText: { fontSize: fontSize.sm, color: colors.textLight },
  shelfRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  shelfChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgInput,
  },
  shelfChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  shelfChipText: { color: colors.textLight, fontWeight: "600", fontSize: fontSize.sm },
  shelfChipTextActive: { color: "white" },
  reviewInput: {
    minHeight: 100,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: fontSize.md,
    color: colors.text,
    backgroundColor: colors.bgInput,
    textAlignVertical: "top",
  },
  reviewText: { fontSize: fontSize.md, color: colors.text, lineHeight: 22 },
  reviewActions: { flexDirection: "row", justifyContent: "flex-end", gap: spacing.sm },
  body: { fontSize: fontSize.md, color: colors.textLight, lineHeight: 22 },
  primaryBtn: { backgroundColor: colors.primary, paddingVertical: 9, paddingHorizontal: 16, borderRadius: radius.md },
  primaryBtnText: { color: "white", fontWeight: "700", fontSize: fontSize.sm },
  secondaryBtn: {
    alignSelf: "flex-start",
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryBtnText: { color: colors.textLight, fontWeight: "600", fontSize: fontSize.sm },
  metaGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md, paddingHorizontal: spacing.xs },
  metaItem: { minWidth: "40%" },
  metaLabel: { fontSize: fontSize.xs, color: colors.textMuted },
  metaValue: { fontSize: fontSize.sm, color: colors.text, fontWeight: "500" },
  deleteBtn: {
    marginTop: spacing.sm,
    paddingVertical: 13,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.danger,
    alignItems: "center",
  },
  deleteText: { color: colors.danger, fontWeight: "700", fontSize: fontSize.md },
});
