import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "../../utils/leafletSetup.js";

// Fit the map viewport to every pin whenever the set of pins changes.
function FitBounds({ locations }) {
  const map = useMap();
  const key = locations.map((l) => `${l.lat},${l.lng}`).join("|");
  useEffect(() => {
    const positions = locations.map((l) => [l.lat, l.lng]);
    if (positions.length === 0) return;
    if (positions.length === 1) {
      map.setView(positions[0], 10);
    } else {
      map.fitBounds(positions, { padding: [40, 40] });
    }
    // key captures the pin positions; locations identity changes every render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, key]);
  return null;
}

export default function LocationDisplay({ locations, onEditClick, onRemoveClick }) {
  if (!locations || locations.length === 0) return null;

  return (
    <div>
      <div
        style={{
          borderRadius: 8,
          overflow: "hidden",
          border: "1px solid var(--color-border, #e0e0e0)",
          marginBottom: 12,
        }}
      >
        <MapContainer
          center={[locations[0].lat, locations[0].lng]}
          zoom={10}
          style={{ height: 280, width: "100%" }}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FitBounds locations={locations} />
          {locations.map((loc) => (
            <Marker key={loc.id} position={[loc.lat, loc.lng]}>
              <Popup>
                <strong>{loc.name}</strong>
                {loc.note && <p style={{ margin: "6px 0 0", whiteSpace: "pre-wrap" }}>{loc.note}</p>}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* List of pins with their notes */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {locations.map((loc) => (
          <div
            key={loc.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 8,
              padding: "8px 10px",
              borderRadius: 8,
              border: "1px solid var(--color-border, #e0e0e0)",
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-light)" }}>{loc.name}</div>
              {loc.note && (
                <div
                  style={{
                    fontSize: "var(--font-size-sm)",
                    color: "var(--color-text-muted)",
                    marginTop: 2,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {loc.note}
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
              <button className="btn btn-outline btn-sm" onClick={() => onEditClick(loc)}>
                Edit
              </button>
              <button
                className="btn btn-sm"
                style={{ color: "var(--color-danger)", borderColor: "var(--color-danger)" }}
                onClick={() => onRemoveClick(loc.id)}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
