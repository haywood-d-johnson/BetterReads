// Full-screen ISBN barcode scanner (expo-camera), the mobile counterpart to the
// web's BarcodeScannerModal. Scans EAN-13 (book ISBNs) + UPC and hands the raw
// digits back via onScan. Camera is included in Expo Go, so no dev build needed.
import { useRef, useEffect } from "react";
import { Modal, View, Text, Pressable, StyleSheet, Platform } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius, fontSize } from "../theme.js";

const BARCODE_TYPES = ["ean13", "ean8", "upc_a", "upc_e"];

export default function BarcodeScanner({ visible, onClose, onScan }) {
  const [permission, requestPermission] = useCameraPermissions();
  const lockRef = useRef(false);

  // Reset the one-shot lock each time the scanner opens.
  useEffect(() => {
    if (visible) lockRef.current = false;
  }, [visible]);

  function handleBarcode({ data }) {
    if (lockRef.current) return;
    const isbn = String(data || "").replace(/[-\s]/g, "");
    if (!isbn) return;
    lockRef.current = true; // fire once per open
    onScan(isbn);
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.root}>
        {/* Camera / permission states */}
        {!permission ? (
          <View style={styles.center}>
            <Text style={styles.msg}>Preparing camera…</Text>
          </View>
        ) : !permission.granted ? (
          <View style={styles.center}>
            <Ionicons name="camera-outline" size={48} color="#fff" />
            <Text style={styles.msg}>
              {permission.canAskAgain
                ? "Camera access is needed to scan book barcodes."
                : "Camera access is blocked. Enable it in Settings to scan, or enter the ISBN by hand."}
            </Text>
            {permission.canAskAgain && (
              <Pressable style={styles.permBtn} onPress={requestPermission}>
                <Text style={styles.permBtnText}>Allow Camera</Text>
              </Pressable>
            )}
          </View>
        ) : (
          <CameraView
            style={StyleSheet.absoluteFill}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: BARCODE_TYPES }}
            onBarcodeScanned={visible ? handleBarcode : undefined}
          />
        )}

        {/* Scan frame overlay */}
        {permission?.granted && (
          <View style={styles.overlay} pointerEvents="none">
            <View style={styles.frame} />
            <Text style={styles.hint}>Point at a book's barcode (ISBN)</Text>
          </View>
        )}

        {/* Header: title + close */}
        <View style={styles.header} pointerEvents="box-none">
          <Text style={styles.title}>Scan ISBN</Text>
          <Pressable style={styles.close} onPress={onClose} hitSlop={10}>
            <Ionicons name="close" size={26} color="#fff" />
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#000" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xl, gap: spacing.md },
  msg: { color: "#fff", fontSize: fontSize.md, textAlign: "center", lineHeight: 22 },
  permBtn: {
    backgroundColor: colors.accent,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: radius.md,
    marginTop: spacing.sm,
  },
  permBtnText: { color: "#fff", fontWeight: "700", fontSize: fontSize.md },
  overlay: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center", gap: spacing.lg },
  frame: {
    width: "72%",
    height: 150,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.9)",
    borderRadius: radius.lg,
    backgroundColor: "transparent",
  },
  hint: { color: "rgba(255,255,255,0.85)", fontSize: fontSize.sm, fontWeight: "600" },
  header: {
    position: "absolute",
    top: Platform.OS === "ios" ? 56 : 24,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: { color: "#fff", fontSize: fontSize.lg, fontWeight: "700" },
  close: { padding: 4 },
});
