import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, ExternalLink, Route, ZoomIn, ZoomOut, Maximize2, Sparkles, Layers } from 'lucide-react';
import type { AIItineraryPlan } from '../types/planner';
import { Destination } from '../types';

interface ItineraryRouteMapProps {
  plan: AIItineraryPlan;
  destinations: Destination[];
  onSelectDestination?: (dest: Destination) => void;
}

export const ItineraryRouteMap: React.FC<ItineraryRouteMapProps> = ({
  plan,
  destinations,
  onSelectDestination,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [activeLayer, setActiveLayer] = useState<'streets' | 'satellite'>('streets');
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const [selectedStopOrder, setSelectedStopOrder] = useState<number | null>(null);

  // Extract stops with coordinates from plan
  const routeStops = React.useMemo(() => {
    const stops: {
      order: number;
      day: number;
      timeSlot: string;
      title: string;
      locationName: string;
      destinationId?: string;
      lat: number;
      lng: number;
      cost: number;
      matchedDest?: Destination;
    }[] = [];

    let count = 1;
    plan.days.forEach((day) => {
      day.activities.forEach((act) => {
        let lat = act.latitude;
        let lng = act.longitude;
        let matchedDest = destinations.find((d) => d.id === act.destinationId);

        if ((!lat || !lng) && matchedDest) {
          lat = matchedDest.latitude;
          lng = matchedDest.longitude;
        }

        if (
          typeof lat === 'number' &&
          typeof lng === 'number' &&
          !isNaN(lat) &&
          !isNaN(lng) &&
          lat >= -90 &&
          lat <= 90 &&
          lng >= -180 &&
          lng <= 180
        ) {
          stops.push({
            order: count++,
            day: day.dayNumber,
            timeSlot: act.timeSlot,
            title: act.title,
            locationName: act.locationName,
            destinationId: act.destinationId,
            lat,
            lng,
            cost: act.estimatedCostVND,
            matchedDest,
          });
        }
      });
    });

    return stops;
  }, [plan, destinations]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    try {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const map = L.map(mapContainerRef.current, {
        center: routeStops.length > 0 ? [routeStops[0].lat, routeStops[0].lng] : [21.32, 105.32],
        zoom: 11,
        zoomControl: false,
        attributionControl: true,
      });

      // Tile Layer
      const tileUrl =
        activeLayer === 'satellite'
          ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
          : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

      const tileLayer = L.tileLayer(tileUrl, {
        attribution: activeLayer === 'satellite' ? '&copy; Esri World Imagery' : '&copy; OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map);

      tileLayerRef.current = tileLayer;

      // Add Markers and Connecting Polyline
      const bounds = L.latLngBounds([]);
      const polylineCoords: L.LatLngExpression[] = [];

      routeStops.forEach((stop) => {
        polylineCoords.push([stop.lat, stop.lng]);
        bounds.extend([stop.lat, stop.lng]);

        // Sequential Number Pin
        const pinIcon = L.divIcon({
          className: 'itinerary-step-pin',
          html: `
            <div class="relative flex flex-col items-center transform -translate-x-1/2 -translate-y-full cursor-pointer transition-transform duration-200 hover:scale-125">
              <div class="w-8 h-8 rounded-full bg-emerald-950 border-2 border-amber-400 text-amber-300 font-extrabold text-xs flex items-center justify-center shadow-lg">
                ${stop.order}
              </div>
              <div class="w-0 h-0 border-x-4 border-x-transparent border-t-6 border-t-emerald-950 -mt-0.5"></div>
              <div class="mt-0.5 px-2 py-0.5 bg-stone-900/90 text-white text-[10px] font-bold rounded-md whitespace-nowrap shadow-md border border-white/20">
                ${stop.locationName.split('(')[0].trim()}
              </div>
            </div>
          `,
          iconSize: [32, 44],
          iconAnchor: [16, 44],
          popupAnchor: [0, -44],
        });

        const marker = L.marker([stop.lat, stop.lng], { icon: pinIcon }).addTo(map);

        marker.bindPopup(`
          <div class="p-2.5 text-stone-900 font-sans min-w-[210px] space-y-1.5">
            <div class="flex items-center justify-between text-[10px] uppercase font-bold text-emerald-800">
              <span>Chặng ${stop.order} · Ngày ${stop.day}</span>
              <span>${stop.timeSlot}</span>
            </div>
            <div class="font-bold text-xs text-stone-950">${stop.title}</div>
            <div class="text-[11px] text-stone-600 flex items-center gap-1">
              <span>📍 ${stop.locationName}</span>
            </div>
            <div class="text-[10px] text-stone-500 font-mono">
              GPS: ${stop.lat.toFixed(4)}, ${stop.lng.toFixed(4)}
            </div>
            ${
              stop.matchedDest
                ? `<button id="btn-modal-${stop.order}" class="mt-2 w-full py-1 bg-emerald-900 text-white text-[11px] font-bold rounded-lg cursor-pointer hover:bg-emerald-800 transition-colors">Xem thông tin điểm đến</button>`
                : ''
            }
          </div>
        `);

        marker.on('click', () => {
          setSelectedStopOrder(stop.order);
        });

        marker.on('popupopen', () => {
          if (stop.matchedDest && onSelectDestination) {
            const btn = document.getElementById(`btn-modal-${stop.order}`);
            if (btn) {
              btn.onclick = () => onSelectDestination(stop.matchedDest!);
            }
          }
        });
      });

      // Draw dashed connecting path
      if (polylineCoords.length > 1) {
        L.polyline(polylineCoords, {
          color: '#059669',
          weight: 4,
          opacity: 0.85,
          dashArray: '8, 8',
          lineCap: 'round',
        }).addTo(map);
      }

      if (bounds.isValid() && routeStops.length > 0) {
        map.fitBounds(bounds, { padding: [45, 45], maxZoom: 14 });
      }

      mapInstanceRef.current = map;

      // Invalidate size to guarantee sharp render
      const timer = setTimeout(() => {
        map.invalidateSize();
      }, 250);

      return () => {
        clearTimeout(timer);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }
      };
    } catch (e) {
      console.error('Error in ItineraryRouteMap:', e);
    }
  }, [plan, routeStops, destinations, onSelectDestination]);

  // Update tile layer if changed
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    try {
      if (tileLayerRef.current) {
        mapInstanceRef.current.removeLayer(tileLayerRef.current);
      }
      const tileUrl =
        activeLayer === 'satellite'
          ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
          : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

      const tileLayer = L.tileLayer(tileUrl, {
        attribution: activeLayer === 'satellite' ? '&copy; Esri World Imagery' : '&copy; OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(mapInstanceRef.current);

      tileLayerRef.current = tileLayer;
    } catch (e) {
      console.warn('Error updating tile in ItineraryRouteMap:', e);
    }
  }, [activeLayer]);

  if (routeStops.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-3xl border border-stone-200 shadow-md p-6 sm:p-8 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-stone-100 gap-2">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 uppercase tracking-wider">
            <Route className="w-4 h-4 text-emerald-700" />
            <span>Sơ đồ cung đường số hóa trên bản đồ</span>
          </div>
          <h3 className="text-xl font-serif font-bold text-stone-900">
            Tuyến di chuyển {routeStops.length} chặng theo lịch trình
          </h3>
        </div>

        {/* Tile toggle */}
        <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl text-xs font-semibold self-start sm:self-auto">
          <button
            onClick={() => setActiveLayer('streets')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              activeLayer === 'streets' ? 'bg-white text-stone-900 shadow-2xs font-bold' : 'text-stone-600'
            }`}
          >
            Đường phố
          </button>
          <button
            onClick={() => setActiveLayer('satellite')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              activeLayer === 'satellite' ? 'bg-white text-stone-900 shadow-2xs font-bold' : 'text-stone-600'
            }`}
          >
            Ảnh vệ tinh
          </button>
        </div>
      </div>

      {/* Map Canvas */}
      <div className="relative w-full h-[360px] sm:h-[420px] rounded-2xl overflow-hidden border border-stone-200 shadow-2xs">
        <div ref={mapContainerRef} className="w-full h-full" style={{ outline: 'none' }} />

        {/* Floating Controls */}
        <div className="absolute top-3 left-3 z-[400] flex flex-col bg-white/95 backdrop-blur-md rounded-xl border border-stone-200 shadow-sm overflow-hidden">
          <button
            onClick={() => mapInstanceRef.current?.zoomIn()}
            className="p-1.5 hover:bg-stone-100 text-stone-700 transition-colors border-b border-stone-200 cursor-pointer"
            title="Phóng to"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => mapInstanceRef.current?.zoomOut()}
            className="p-1.5 hover:bg-stone-100 text-stone-700 transition-colors cursor-pointer"
            title="Thu nhỏ"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={() => {
            if (mapInstanceRef.current && routeStops.length > 0) {
              const bounds = L.latLngBounds(routeStops.map((s) => [s.lat, s.lng]));
              mapInstanceRef.current.fitBounds(bounds, { padding: [45, 45] });
            }
          }}
          className="absolute top-3 right-3 z-[400] p-1.5 bg-white/95 backdrop-blur-md hover:bg-stone-100 text-stone-700 rounded-xl border border-stone-200 shadow-sm transition-colors cursor-pointer"
          title="Toàn cảnh lộ trình"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        {/* Map Legend */}
        <div className="absolute bottom-3 left-3 z-[400] bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-stone-200/90 text-[11px] font-medium text-stone-700 shadow-sm flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-950 border border-amber-300" />
          <span>Điểm dừng theo số thứ tự (1, 2, 3...)</span>
          <span className="text-stone-300">|</span>
          <span className="w-4 h-0.5 bg-emerald-700 border-dashed" />
          <span>Tuyến kết nối</span>
        </div>
      </div>

      {/* Horizontal Stop Selector Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1">
        <span className="text-xs font-bold text-stone-500 whitespace-nowrap">Chặng dừng:</span>
        {routeStops.map((stop) => (
          <button
            key={stop.order}
            onClick={() => {
              setSelectedStopOrder(stop.order);
              if (mapInstanceRef.current) {
                mapInstanceRef.current.flyTo([stop.lat, stop.lng], 14, { duration: 0.8 });
              }
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedStopOrder === stop.order
                ? 'bg-emerald-900 text-white shadow-xs font-bold ring-1 ring-emerald-800'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-amber-400 text-stone-950 text-[10px] font-bold flex items-center justify-center">
              {stop.order}
            </span>
            <span>{stop.locationName.split('(')[0].trim()}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
