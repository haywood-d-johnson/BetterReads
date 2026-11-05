// Grid card for a library book. Navigates to the book detail route.
import { Pressable, View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import BookCover from "./BookCover.jsx";
import StarRating from "./StarRating.jsx";
import { colors, radius, spacing, fontSize } from "../theme.js";

export default function BookCard({ book, width }) {
  const router = useRouter();
  return (
    <Pressable
      style={[styles.card, width ? { width } : null]}
      onPress={() => router.push(`/book/${book.id}`)}
      accessibilityRole="button"
      accessibilityLabel={`Open ${book.title}`}
    >
      <View style={styles.coverWrap}>
        <BookCover coverId={book.cover_id} coverUrl={book.cover_url} title={book.title} size="M" />
      </View>
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>
          {book.title}
        </Text>
        {book.author_name ? (
          <Text style={styles.author} numberOfLines={1}>
            {book.author_name}
          </Text>
        ) : null}
        {book.rating > 0 ? <StarRating rating={book.rating} readonly size="sm" /> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  coverWrap: { width: "100%", aspectRatio: 2 / 3, backgroundColor: colors.borderLight },
  body: { padding: spacing.sm, gap: 4 },
  title: { fontSize: fontSize.sm, fontWeight: "600", color: colors.text, lineHeight: 18 },
  author: { fontSize: fontSize.xs, color: colors.textMuted },
});
