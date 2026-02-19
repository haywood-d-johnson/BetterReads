import { useState, useEffect, useRef, useCallback } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";

const SCANNER_ID = "barcode-scanner-region";

export default function BarcodeScannerModal({ isOpen, onClose, onScanSuccess }) {
  const [manualISBN, setManualISBN] = useState("");
  const [error, setError] = useState(null);
  const scannerRef = useRef(null);
  const stoppingRef = useRef(false);

  const stopScanner = useCallback(async () => {
    const scanner = scannerRef.current;
    if (!scanner || stoppingRef.current) return;
    stoppingRef.current = true;
    try {
      const state = scanner.getState();
      if (state === 2) {
        // 2 = SCANNING
        await scanner.stop();
      }
      scanner.clear();
    } catch {
      // ignore — DOM element may already be gone
    }
    scannerRef.current = null;
    stoppingRef.current = false;
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;

    async function startScanner() {
      await new Promise((r) => setTimeout(r, 150));
      if (cancelled) return;

      try {
        const scanner = new Html5Qrcode(SCANNER_ID, {
          formatsToSupport: [Html5QrcodeSupportedFormats.EAN_13],
          verbose: false,
        });
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 150 }, aspectRatio: 1.5 },
          (decodedText) => {
            if (!cancelled) onScanSuccess(decodedText);
          },
          () => {},
        );
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || "Could not access camera. You can enter an ISBN manually below.");
        }
      }
    }

    startScanner();

    return () => {
      cancelled = true;
      stopScanner();
    };
  }, [isOpen, onScanSuccess, stopScanner]);

  async function handleClose() {
    setError(null);
    setManualISBN("");
    await stopScanner();
    onClose();
  }

  function handleManualSubmit(e) {
    e.preventDefault();
    const isbn = manualISBN.trim().replace(/[-\s]/g, "");
    if (isbn) {
      onScanSuccess(isbn);
      setManualISBN("");
    }
  }

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 3000,
        background: "rgba(0, 0, 0, 0.92)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      {/* Close button */}
      <button
        onClick={handleClose}
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          background: "none",
          border: "none",
          color: "white",
          fontSize: 28,
          cursor: "pointer",
          padding: 8,
          lineHeight: 1,
        }}
      >
        {"\u2715"}
      </button>

      <h2 style={{ color: "white", marginBottom: 16, fontSize: "var(--font-size-xl, 1.25rem)" }}>Scan ISBN Barcode</h2>

      {/* Scanner viewport */}
      <div
        style={{
          width: "100%",
          maxWidth: 400,
          borderRadius: 12,
          overflow: "hidden",
          background: "#111",
        }}
      >
        <div id={SCANNER_ID} style={{ width: "100%" }} />
      </div>

      {error && (
        <p style={{ color: "#f59e0b", marginTop: 12, textAlign: "center", fontSize: "var(--font-size-sm, 0.875rem)" }}>
          {error}
        </p>
      )}

      {/* Manual entry fallback */}
      <div
        style={{
          marginTop: 24,
          padding: 16,
          background: "rgba(255, 255, 255, 0.08)",
          borderRadius: 12,
          width: "100%",
          maxWidth: 400,
        }}
      >
        <p style={{ color: "rgba(255,255,255,0.6)", marginBottom: 8, fontSize: "var(--font-size-sm, 0.875rem)" }}>
          Or enter ISBN manually:
        </p>
        <form onSubmit={handleManualSubmit} style={{ display: "flex", gap: 8 }}>
          <input
            type="text"
            placeholder="978-0-123456-78-9"
            value={manualISBN}
            onChange={(e) => setManualISBN(e.target.value)}
            style={{
              flex: 1,
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.2)",
              background: "rgba(255,255,255,0.1)",
              color: "white",
              fontSize: "var(--font-size-base, 1rem)",
            }}
          />
          <button type="submit" className="btn btn-accent" style={{ whiteSpace: "nowrap" }}>
            Look Up
          </button>
        </form>
      </div>
    </div>
  );
}
