"use client";

import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { AirStation, NoiseStation, SoilStation } from "../v3-types";

// Pseudo-random generator to keep pins stable within Amaravati bounds
function getStationCoords(
  id: string | undefined,
  index: number,
  type: string,
): [number, number] {
  // Better pseudo-random for natural scattering
  const seed1 = (id ? id.charCodeAt(0) : 0) + index * 13.5;
  const seed2 = (id ? id.charCodeAt(id.length - 1) : 0) + index * 21.3;
  
  const randLat = Math.sin(seed1 * 12.9898) * 43758.5453;
  const randLng = Math.cos(seed2 * 78.233) * 43758.5453;

  // Spread across the full Amaravati boundary oval
  // Lat offset: +/- 0.025
  // Lng offset: +/- 0.050
  const latOffset = (randLat - Math.floor(randLat)) * 0.05 - 0.025;
  const lngOffset = (randLng - Math.floor(randLng)) * 0.10 - 0.050;
  
  return [16.512 + latOffset, 80.522 + lngOffset];
}

interface EVMMapProps {
  airStations: AirStation[];
  noiseStations: NoiseStation[];
  soilStations: SoilStation[];
  selectedStation: any;
  setSelectedStation: (station: any | null) => void;
}

// Center of Amaravati
const CENTER: [number, number] = [16.5131, 80.5165];

export default function EVMMap({
  airStations,
  noiseStations,
  soilStations,
  selectedStation,
  setSelectedStation,
}: EVMMapProps) {
  return (
    <div className="w-full h-[600px] z-0 rounded-b-xl overflow-hidden relative">
      <MapContainer
        center={CENTER}
        zoom={12}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
        />

        {/* Air Quality Stations */}
        {airStations.map((stn, i) => {
          const isSelected = selectedStation?.code === stn.code;
          return (
            <CircleMarker
              key={`air-${stn.code || i}`}
              center={[stn.lat || 16.512, stn.lng || 80.524]}
              radius={isSelected ? 10 : 7}
              fillOpacity={0.8}
              color="#ffffff"
              weight={2}
              fillColor={stn.exceedance ? "#f43f5e" : "#10b981"} // rose-500 or emerald-500
              eventHandlers={{
                click: () =>
                  setSelectedStation({ ...stn, type: "Air Quality" }),
              }}
            >
              <Tooltip>{stn.name}</Tooltip>
            </CircleMarker>
          );
        })}

        {/* Noise Stations */}
        {noiseStations.map((stn, i) => {
          const isSelected = selectedStation?.code === stn.code;
          return (
            <CircleMarker
              key={`noise-${stn.code || i}`}
              center={[stn.lat || 16.535, stn.lng || 80.548]}
              radius={isSelected ? 10 : 7}
              fillOpacity={0.8}
              color="#ffffff"
              weight={2}
              fillColor="#3b82f6" // blue-500
              eventHandlers={{
                click: () =>
                  setSelectedStation({ ...stn, type: "Noise Monitoring" }),
              }}
            >
              <Tooltip>{stn.name}</Tooltip>
            </CircleMarker>
          );
        })}

        {/* Soil Stations */}
        {soilStations.map((stn, i) => {
          const isSelected = selectedStation?.code === stn.code;
          return (
            <CircleMarker
              key={`soil-${stn.code || i}`}
              center={[stn.lat || 16.558, stn.lng || 80.572]}
              radius={isSelected ? 10 : 7}
              fillOpacity={0.8}
              color="#ffffff"
              weight={2}
              fillColor="#eab308" // yellow-500
              eventHandlers={{
                click: () =>
                  setSelectedStation({ ...stn, type: "Soil Sampling" }),
              }}
            >
              <Tooltip>{stn.name}</Tooltip>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
