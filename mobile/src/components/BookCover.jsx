// Mobile port of client/src/components/books/BookCover.jsx.
// Prefers an explicit full URL; otherwise builds the Open Library cover URL
// from the numeric cover ID. Falls back to a gradient-ish placeholder tile.
import { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { colors, radius, fontSize } from "../theme.js";

export default function BookCover({ coverId, coverUrl, title, size = "M", style }) {
  const [error, setError] = useState(false);
  const src = coverUrl || (coverId ? `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg?default=false` : null);

  if (!src || error) {
    return (
      <View style={[styles.placeholder, style]}>
        <Text style={styles.placeholderText} numberOfLines={4}>
          {title || "No Cover"}
        </Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri: src }}
      style={[styles.image, style]}
      contentFit="cover"
      transition={150}
      onError={() => setError(true)}
      accessibilityLabel={`Cover of ${title}`}
    />
  );
}

const styles = StyleSheet.create({
  image: {
    width: "100%",
    height: "100%",
    borderRadius: radius.sm,
    backgroundColor: colors.borderLight,
  },
  placeholder: {
    width: "100%",
    height: "100%",
    borderRadius: radius.sm,
    backgroundColor: colors.coverA,
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
  },
  placeholderText: {
    color: "white",
    fontSize: fontSize.xs,
    fontWeight: "600",
    textAlign: "center",
  },
});
