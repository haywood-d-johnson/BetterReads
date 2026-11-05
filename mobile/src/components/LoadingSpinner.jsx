import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { colors, spacing } from "../theme.js";

export default function LoadingSpinner({ text }) {
  return (
    <View style={styles.wrap}>
      <ActivityIndicator size="large" color={colors.primary} />
      {text ? <Text style={styles.text}>{text}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xl, gap: spacing.md },
  text: { color: colors.textMuted, fontSize: 15 },
});
