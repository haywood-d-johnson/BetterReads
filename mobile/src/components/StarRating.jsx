// Mobile port of client/src/components/reviews/StarRating.jsx.
// Tapping a star sets the rating; tapping the current rating clears it.
import { View, Text, Pressable, StyleSheet } from "react-native";
import { colors } from "../theme.js";

export default function StarRating({ rating = 0, readonly = false, size = "md", onChange }) {
  const sizes = { sm: 16, md: 24, lg: 34 };
  const fs = sizes[size] || 24;

  return (
    <View style={styles.row}>
      {[1, 2, 3, 4, 5].map((v) => {
        const filled = rating >= v;
        const star = (
          <Text style={[styles.star, { fontSize: fs, color: filled ? colors.star : colors.starEmpty }]}>★</Text>
        );
        if (readonly) return <View key={v}>{star}</View>;
        return (
          <Pressable
            key={v}
            hitSlop={6}
            onPress={() => onChange && onChange(v === rating ? 0 : v)}
            accessibilityRole="button"
            accessibilityLabel={`Rate ${v} star${v > 1 ? "s" : ""}`}
          >
            {star}
          </Pressable>
        );
      })}
      {rating > 0 && size !== "sm" && <Text style={styles.value}>{rating}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 2 },
  star: { lineHeight: undefined },
  value: { marginLeft: 6, color: colors.textMuted, fontSize: 14 },
});
