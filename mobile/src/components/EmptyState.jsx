import { View, Text, StyleSheet } from "react-native";
import { colors, spacing, fontSize } from "../theme.js";

export default function EmptyState({ icon = "📚", title, message }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.icon}>{icon}</Text>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", justifyContent: "center", padding: spacing.xl, gap: spacing.sm },
  icon: { fontSize: 48 },
  title: { fontSize: fontSize.lg, fontWeight: "600", color: colors.text, textAlign: "center" },
  message: { fontSize: fontSize.sm, color: colors.textMuted, textAlign: "center", lineHeight: 20 },
});
