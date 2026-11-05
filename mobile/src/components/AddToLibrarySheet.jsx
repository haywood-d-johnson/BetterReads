// Modal shelf + reader picker used when adding a search result to the library.
// Mirrors the choices in client/src/components/books/AddToLibraryButton.jsx.
import { useState } from "react";
import { Modal, View, Text, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { addBook } from "../api/books.js";
import { colors, spacing, radius, fontSize } from "../theme.js";

export default function AddToLibrarySheet({ visible, bookData, shelves, onClose, onAdded }) {
  const [reader, setReader] = useState("me");
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState(null);

  async function handleAdd(shelfId) {
    setSavingId(shelfId);
    setError(null);
    try {
      await addBook({ ...bookData, shelf_id: shelfId, reader });
      onAdded && onAdded();
      onClose();
    } catch (err) {
      setError(err.message || "Failed to add book");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.handle} />
          <Text style={styles.title} numberOfLines={2}>
            Add “{bookData?.title}”
          </Text>

          <Text style={styles.sectionLabel}>Reader</Text>
          <View style={styles.readerRow}>
            {[
              { key: "me", label: "Me" },
              { key: "partner", label: "Partner" },
            ].map((r) => (
              <Pressable
                key={r.key}
                style={[styles.readerBtn, reader === r.key && styles.readerBtnActive]}
                onPress={() => setReader(r.key)}
              >
                <Text style={[styles.readerText, reader === r.key && styles.readerTextActive]}>{r.label}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.sectionLabel}>Add to shelf</Text>
          {shelves.map((s) => (
            <Pressable key={s.id} style={styles.shelfBtn} onPress={() => handleAdd(s.id)} disabled={savingId !== null}>
              <Text style={styles.shelfText}>{s.name}</Text>
              {savingId === s.id ? <ActivityIndicator size="small" color={colors.primary} /> : null}
            </Pressable>
          ))}

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable style={styles.cancel} onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: colors.bgCard,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.sm,
  },
  handle: { alignSelf: "center", width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border, marginBottom: spacing.sm },
  title: { fontSize: fontSize.lg, fontWeight: "700", color: colors.text, marginBottom: spacing.sm },
  sectionLabel: { fontSize: fontSize.xs, color: colors.textMuted, textTransform: "uppercase", marginTop: spacing.sm },
  readerRow: { flexDirection: "row", gap: spacing.sm },
  readerBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },
  readerBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  readerText: { color: colors.textLight, fontWeight: "600" },
  readerTextActive: { color: "white" },
  shelfBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.bgInput,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  shelfText: { fontSize: fontSize.md, color: colors.text, fontWeight: "500" },
  error: { color: colors.dangerDark, fontSize: fontSize.sm, marginTop: spacing.sm },
  cancel: { alignItems: "center", paddingVertical: 12, marginTop: spacing.sm },
  cancelText: { color: colors.textMuted, fontSize: fontSize.md, fontWeight: "600" },
});
