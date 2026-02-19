import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "../../utils/leafletSetup.js";

export default function LocationDisplay({ locationName, lat, lng, onChangeClick, onRemoveClick }) {
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
          center={[lat, lng]}
          zoom={10}
          style={{ height: 250, width: "100%" }}
          scrollWheelZoom={false}
          dragging={false}
          touchZoom={false}
          doubleClickZoom={false}
          zoomControl={false}
          attributionControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[lat, lng]} />
        </MapContainer>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-light)" }}>{locationName}</span>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-outline btn-sm" onClick={onChangeClick}>
            Change
          </button>
          <button
            className="btn btn-sm"
            style={{ color: "var(--color-danger)", borderColor: "var(--color-danger)" }}
            onClick={onRemoveClick}
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}
