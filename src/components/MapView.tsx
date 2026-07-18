"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { FullScreen } from "leaflet.fullscreen";
import L from "leaflet";
import { useEffect } from "react";
import type { ReactNode } from "react";
import type { CollectionStatus } from "@/lib/collectionStatus";

export type MapPin = {
  key: string;
  lat: number;
  lng: number;
  status: CollectionStatus;
  popup: ReactNode;
};

interface MapViewProps {
  pins: MapPin[];
  center?: [number, number];
  zoom?: number;
  height?: string;
}

const STATUS_COLOURS: Record<CollectionStatus, string> = {
  none: "#228cc5",
  partial: "#f59e0b",
  complete: "#22c55e",
};

function statusIcon(status: CollectionStatus) {
  return L.divIcon({
    className: "",
    // The status is carried as a data attribute so tests can target meaning
    // rather than the colours, which are expected to be revised.
    html: `<div data-pin-status="${status}" style="background-color:${STATUS_COLOURS[status]};width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 0 4px rgba(0,0,0,0.4)"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -7],
  });
}

const statusIcons: Record<CollectionStatus, ReturnType<typeof statusIcon>> = {
  none: statusIcon("none"),
  partial: statusIcon("partial"),
  complete: statusIcon("complete"),
};

function FitBounds({ pins }: { pins: MapPin[] }) {
  const map = useMap();

  useEffect(() => {
    if (pins.length === 0) return;

    const bounds = L.latLngBounds(pins.map((p) => [p.lat, p.lng]));

    map.fitBounds(bounds, { padding: [5, 5] });
  }, [pins, map]);

  return null;
}

function FullscreenControl() {
  const map = useMap();

  useEffect(() => {
    if (map.fullscreenControl) {
      return;
    }

    const control = new FullScreen();

    map.addControl(control);

    return () => {
      map.removeControl(control);
    };
  }, [map]);

  return null;
}

export default function MapView({
  pins,
  center = [42.7, 25.5],
  zoom = 7,
  height = "600px",
}: MapViewProps) {
  return (
    <MapContainer center={center} zoom={zoom} style={{ height, width: "100%" }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FullscreenControl />
      <FitBounds pins={pins} />
      {pins.map((pin) => (
        <Marker
          key={pin.key}
          position={[pin.lat, pin.lng]}
          icon={statusIcons[pin.status]}
        >
          <Popup>{pin.popup}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
