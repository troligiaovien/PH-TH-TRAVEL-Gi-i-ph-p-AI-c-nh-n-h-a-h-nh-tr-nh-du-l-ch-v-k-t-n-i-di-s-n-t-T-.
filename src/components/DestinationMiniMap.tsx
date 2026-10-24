import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, ExternalLink, Globe, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { Destination } from '../types';

interface DestinationMiniMapProps {
  destination: Destination;
}

export const DestinationMiniMap: React.FC<DestinationMiniMapProps> = ({ destination }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);

  const isValidCoord =
    typeof destination.latitude === 'number' &&
    typeof destination.longitude === 'number' &&
    !isNaN(destination.latitude) &&
    !isNaN(destination.longitude) &&
    destination.latitude >= -90 &&
    destination.latitude <= 90 &&
    destination.longitude >= -180 &&
    destination.longitude <= 180;

  useEffect(() => {
    if (!mapContainerRef.current || !isValidCoord) return;

    try {
      // Clean up previous instance
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const map = L.map(mapContainerRef.current, {
        center: [destination.latitude, destination.longitude],
        zoom: 14,
        zoomControl: false,
        attributionControl: true,
      });

      // OpenStreetMap Tile Layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      // Custom Pin Marker
      const customPin = L.divIcon({
        className: 'custom-destination-marker',
        html: `
          <div class="relative flex flex-col items-center transform -translate-x-1/2 -translate-y-full cursor-pointer">
            <div class="absolute -top-1 w-10 h-10 rounded-full bg-emerald-500/30 animate-ping"></div>
            <div class="w-8 h-8 rounded-full bg-emerald-900 border-2 border-amber-300 shadow-md flex items-center justify-center text-xs text-white font-bold">
              📍
            </div>
            <div class="w-0 h-0 border-x-4 border-x-transparent border-t-6 border-t-emerald-950 -mt-0.5"></div>
          </div>
        `,
        iconSize: [32, 40],
        iconAnchor: [16, 40],
        popupAnchor: [0, -40],
      });

      const marker = L.marker([destination.latitude, destination.longitude], { icon: customPin }).addTo(map);

      marker.bindPopup(`
        <div class="p-2 text-stone-900 font-sans min-w-[180px]">
          <div class="font-bold text-xs text-stone-900 mb-0.5">${destination.name}</div>
          <div class="text-[11px] text-stone-600">${destination.verifiedAddress}</div>
          <div class="text-[10px] text-stone-500 font-mono mt-1">GPS: ${destination.latitude.toFixed(4)}, ${destination.longitude.toFixed(4)}</div>
        </div>
      `);

      // Gentle radius circle around site
      L.circle([destination.latitude, destination.longitude], {
        radius: 600,
        color: '#059669',
        fillColor: '#10b981',
        fillOpacity: 0.12,
        weight: 1.5,
      }).addTo(map);

      mapInstanceRef.current = map;
      setMapError(null);

      // Invalidate size to guarantee correct rendering inside modal tabs
      const timer = setTimeout(() => {
        map.invalidateSize();
      }, 200);

      return () => {
        clearTimeout(timer);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }
      };
    } catch (err: any) {
      console.error('Error rendering mini map:', err);
      setMapError('Không thể tải bản đồ trực tuyến');
    }
  }, [destination, isValidCoord]);

  if (!isValidCoord) {
    return (
      <div className="p-6 bg-stone-100 rounded-2xl text-center text-xs text-stone-600">
        <MapPin className="w-6 h-6 text-stone-400 mx-auto mb-1.5" />
        <span className="font-semibold">Chưa có tọa độ xác minh cho địa điểm này.</span>
      </div>
    );
  }

  return (
    <div className="relative rounded-2xl overflow-hidden border border-stone-200 shadow-2xs">
      {/* Map Canvas */}
      <div className="w-full h-[280px] sm:h-[320px] bg-stone-100 relative">
        <div ref={mapContainerRef} className="w-full h-full" style={{ outline: 'none' }} />

        {/* Quick Zoom Controls */}
        <div className="absolute top-3 left-3 z-[400] flex flex-col bg-white/95 backdrop-blur-md rounded-xl border border-stone-200 shadow-sm overflow-hidden">
          <button
            onClick={() => mapInstanceRef.current?.zoomIn()}
            className="p-1.5 hover:bg-stone-100 text-stone-700 transition-colors border-b border-stone-200 cursor-pointer"
            title="Phóng to"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => mapInstanceRef.current?.zoomOut()}
            className="p-1.5 hover:bg-stone-100 text-stone-700 transition-colors cursor-pointer"
            title="Thu nhỏ"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Recenter Button */}
        <button
          onClick={() => {
            if (mapInstanceRef.current) {
              mapInstanceRef.current.flyTo([destination.latitude, destination.longitude], 14);
            }
          }}
          className="absolute top-3 right-3 z-[400] p-1.5 bg-white/95 backdrop-blur-md hover:bg-stone-100 text-stone-700 rounded-xl border border-stone-200 shadow-sm transition-colors cursor-pointer"
          title="Tập trung vào điểm đến"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>

        {mapError && (
          <div className="absolute inset-0 bg-white/90 flex items-center justify-center text-xs text-stone-700">
            {mapError}
          </div>
        )}
      </div>
    </div>
  );
};
