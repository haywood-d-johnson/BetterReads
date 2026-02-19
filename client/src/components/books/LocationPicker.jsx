import { useState, useEffect, useCallback } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import "../../utils/leafletSetup.js";
import { useDebounce } from "../../hooks/useDebounce.js";

// Inner component: handles map click events to place a pin
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng);
    },
  });
  return null;
}

// Inner component: flies the map to a new center when position changes
function FlyToPosition({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, 12);
    }
  }, [map, position]);
  return null;
}

// Nominatim geocoding search
async function searchNominatim(query) {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(query)}`,
    { headers: { "User-Agent": "BetterReads/1.0 (personal book tracker)" } },
  );
  if (!response.ok) throw new Error("Geocoding search failed");
  return response.json();
}

// Nominatim reverse geocoding: lat/lng -> place name
async function reverseGeocode(lat, lng) {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
    { headers: { "User-Agent": "BetterReads/1.0 (personal book tracker)" } },
  );
  if (!response.ok) return null;
  const data = await response.json();
  return data.display_name || null;
}

export default function LocationPicker({ isOpen, onClose, onConfirm, initialLocation }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(
    initialLocation ? [initialLocation.lat, initialLocation.lng] : null,
  );
  const [selectedName, setSelectedName] = useState(initialLocation ? initialLocation.name : "");

  const debouncedQuery = useDebounce(searchQuery, 600);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSearchQuery("");
      setSearchResults([]);
      setSelectedPosition(initialLocation ? [initialLocation.lat, initialLocation.lng] : null);
      setSelectedName(initialLocation ? initialLocation.name : "");
    }
  }, [isOpen, initialLocation]);

  // Perform Nominatim search when debounced query changes
  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setSearchResults([]);
      return;
    }
    let cancelled = false;
    setSearching(true);
    searchNominatim(debouncedQuery)
      .then((results) => {
        if (!cancelled) setSearchResults(results);
      })
      .catch(() => {
        if (!cancelled) setSearchResults([]);
      })
      .finally(() => {
        if (!cancelled) setSearching(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  // Handle selecting a search result
  function handleSelectResult(result) {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    setSelectedPosition([lat, lng]);
    setSelectedName(result.display_name);
    setSearchResults([]);
    setSearchQuery("");
  }

  // Handle clicking the map to place a pin
  const handleMapClick = useCallback(async (latlng) => {
    const { lat, lng } = latlng;
    setSelectedPosition([lat, lng]);
    const name = await reverseGeocode(lat, lng);
    setSelectedName(name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`);
  }, []);

  function handleConfirm() {
    if (selectedPosition && selectedName) {
      onConfirm({
        name: selectedName,
        lat: selectedPosition[0],
        lng: selectedPosition[1],
      });
    }
  }

  if (!isOpen) return null;

  const mapCenter = selectedPosition || [20, 0];
  const mapZoom = selectedPosition ? 12 : 2;

  return (
    <div
      data-location-picker
      onClick={onClose}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1100,
        padding: 16,
      }}
    >
      <div
        className="modal-floral-bg"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--color-bg-card, #fff)",
          borderRadius: 12,
          padding: 24,
          maxWidth: 600,
          width: "100%",
          maxHeight: "90vh",
          overflow: "auto",
          boxShadow: "var(--shadow-lg)",
        }}
      >
        <h3 style={{ marginBottom: 16 }}>Set Book Location</h3>

        {/* Search input */}
        <div style={{ position: "relative", marginBottom: 16 }}>
          <input
            className="form-input"
            type="text"
            placeholder="Search for a place..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: "100%" }}
          />
          {/* Search results dropdown */}
          {searchResults.length > 0 && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                background: "var(--color-bg-card, #fff)",
                border: "1px solid var(--color-border, #e0e0e0)",
                borderRadius: "0 0 8px 8px",
                boxShadow: "var(--shadow-md)",
                zIndex: 10,
                maxHeight: 200,
                overflowY: "auto",
              }}
            >
              {searchResults.map((result) => (
                <button
                  key={result.place_id}
                  onClick={() => handleSelectResult(result)}
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    padding: "8px 12px",
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    fontSize: "var(--font-size-sm)",
                    borderBottom: "1px solid var(--color-border, #e0e0e0)",
                  }}
                  onMouseEnter={(e) => (e.target.style.background = "var(--color-surface, #f5f5f5)")}
                  onMouseLeave={(e) => (e.target.style.background = "none")}
                >
                  {result.display_name}
                </button>
              ))}
            </div>
          )}
          {searching && (
            <span
              style={{
                position: "absolute",
                right: 12,
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: "var(--font-size-sm)",
                color: "var(--color-text-muted)",
              }}
            >
              Searching...
            </span>
          )}
        </div>

        <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)", marginBottom: 8 }}>
          Search above or click the map to place a pin.
        </p>

        {/* Interactive map */}
        <div
          style={{
            borderRadius: 8,
            overflow: "hidden",
            border: "1px solid var(--color-border, #e0e0e0)",
            marginBottom: 16,
          }}
        >
          <MapContainer center={mapCenter} zoom={mapZoom} style={{ height: 350, width: "100%" }} scrollWheelZoom={true}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapClickHandler onMapClick={handleMapClick} />
            {selectedPosition && <FlyToPosition position={selectedPosition} />}
            {selectedPosition && <Marker position={selectedPosition} />}
          </MapContainer>
        </div>

        {/* Selected location display */}
        {selectedName && (
          <p
            style={{
              fontSize: "var(--font-size-sm)",
              color: "var(--color-text-light)",
              marginBottom: 16,
              lineHeight: 1.4,
            }}
          >
            <strong>Selected:</strong> {selectedName}
          </p>
        )}

        {/* Action buttons */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button className="btn btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleConfirm} disabled={!selectedPosition || !selectedName}>
            Confirm Location
          </button>
        </div>
      </div>
    </div>
  );
}
