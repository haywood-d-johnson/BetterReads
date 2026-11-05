// Mobile port of client/src/components/books/ProgressUpdateForm.jsx.
import { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { updateProgress } from "../api/books.js";
import { colors, spacing, radius, fontSize } from "../theme.js";

export default function ProgressUpdateForm({ bookId, currentPage, totalPages, onUpdate }) {
  const [page, setPage] = useState(String(currentPage || 0));
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    setSaving(true);
    try {
      const u = await updateProgress(bookId, Number(page) || 0);
      if (onUpdate) onUpdate(u);
    } catch {
      // surfaced by caller via re-fetch; keep form resilient
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.row}>
      <Text style={styles.label}>Page:</Text>
      <TextInput
        style={styles.input}
        keyboardType="number-pad"
        value={page}
        onChangeText={setPage}
        maxLength={6}
      />
      {totalPages ? <Text style={styles.total}>/ {totalPages}</Text> : null}
      <Pressable style={[styles.btn, saving && styles.btnDisabled]} onPress={handleSubmit} disabled={saving}>
        <Text style={styles.btnText}>{saving ? "..." : "Update"}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  label: { fontSize: fontSize.sm, color: colors.textLight },
  input: {
    width: 72,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgInput,
    color: colors.text,
    fontSize: fontSize.md,
  },
  total: { fontSize: fontSize.sm, color: colors.textMuted },
  btn: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: radius.md,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: "white", fontWeight: "600", fontSize: fontSize.sm },
});
