"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import type { ReactNode } from "react";

export type MapPin = {
  key: string;
  lat: number;
  lng: number;
  active: boolean;
  popup: ReactNode;
};

interface MapViewProps {
  pins: MapPin[];
  center?: [number, number];
  zoom?: number;
  height?: string;
}

const activeIcon = L.divIcon({
  className: "",
  html: `<div style="background-color:#22c55e;width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 0 4px rgba(0,0,0,0.4)"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
  popupAnchor: [0, -7],
});

const inactiveIcon = L.divIcon({
  className: "",
  html: `<div style="background-color:#9ca3af;width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 0 4px rgba(0,0,0,0.4)"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
  popupAnchor: [0, -7],
});

export default function MapView({
  pins,
  center = [42.7, 25.5],
  zoom = 7,
  height = "600px",
}: MapViewProps) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height, width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {pins.map((pin) => (
        <Marker
          key={pin.key}
          position={[pin.lat, pin.lng]}
          icon={pin.active ? activeIcon : inactiveIcon}
        >
          <Popup>{pin.popup}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
