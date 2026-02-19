import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../shared/Toast.jsx";
import { lookupISBN } from "../../api/isbn.js";
import BarcodeScannerModal from "./BarcodeScannerModal.jsx";

const hasCamera = typeof navigator !== "undefined" && !!navigator.mediaDevices;

export default function SearchBar({ value = "", onChange, placeholder = "Search books..." }) {
  const [input, setInput] = useState(value);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [lookingUp, setLookingUp] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();
  const addToast = useToast();

  useEffect(() => {
    setInput(value);
  }, [value]);

  useEffect(() => {
    const h = (e) => {
      if (e.key === "/" && !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) {
        e.preventDefault();
        ref.current?.focus();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const handleScanSuccess = useCallback(
    async (isbn) => {
      setScannerOpen(false);
      setLookingUp(true);
      addToast("Looking up ISBN...", "info");
      try {
        const { ol_work_key } = await lookupISBN(isbn);
        const workId = ol_work_key.replace("/works/", "");
        navigate(`/book/ol/${workId}`);
      } catch (err) {
        addToast(err.message || "Book not found for this ISBN", "error");
      } finally {
        setLookingUp(false);
      }
    },
    [navigate, addToast],
  );

  return (
    <>
      <form
        style={{ display: "flex", gap: 8, maxWidth: 600 }}
        onSubmit={(e) => {
          e.preventDefault();
          if (onChange) onChange(input.trim());
        }}
      >
        <input
          ref={ref}
          type="text"
          className="form-input"
          style={{ flex: 1 }}
          placeholder={placeholder}
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        {hasCamera && (
          <button
            type="button"
            className="btn btn-outline"
            style={{ padding: "8px 12px", fontSize: 18 }}
            onClick={() => setScannerOpen(true)}
            disabled={lookingUp}
            title="Scan ISBN barcode"
          >
            {"\uD83D\uDCF7"}
          </button>
        )}
        <button type="submit" className="btn btn-primary">
          Search
        </button>
      </form>

      <BarcodeScannerModal isOpen={scannerOpen} onClose={() => { setScannerOpen(false); navigate("/"); }} onScanSuccess={handleScanSuccess} />
    </>
  );
}
