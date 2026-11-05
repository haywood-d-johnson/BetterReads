import { View, Text, StyleSheet } from "react-native";
import { colors, spacing, radius, fontSize } from "../theme.js";

export default function ErrorMessage({ message }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.text}>{message || "Something went wrong"}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    margin: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: "rgba(196, 92, 74, 0.12)",
    borderWidth: 1,
    borderColor: colors.danger,
  },
  text: { color: colors.dangerDark, fontSize: fontSize.sm },
});
