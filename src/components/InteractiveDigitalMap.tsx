import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MapPin,
  ExternalLink,
  Navigation,
  Globe,
  SlidersHorizontal,
  Compass,
  Layers,
  Info,
  Car,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Route,
  Sparkles,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { Destination } from '../types';
import type { AIItineraryPlan } from '../types/planner';

interface InteractiveDigitalMapProps {
  destinations: Destination[];
  onSelectDestination: (dest: Destination) => void;
  onOpenEarth: () => void;
  aiPlan?: AIItineraryPlan | null;
}

// Available Tile Layers with proper attribution
const TILE_LAYERS = {
  streets: {
    name: 'Bản đồ đường phố',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
    maxZoom: 19,
  },
  satellite: {
    name: 'Ảnh vệ tinh thực địa',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    maxZoom: 18,
  },
  topo: {
    name: 'Bản đồ địa hình',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
    maxZoom: 17,
  },
};

type TileLayerKey = keyof typeof TILE_LAYERS;

export const InteractiveDigitalMap: React.FC<InteractiveDigitalMapProps> = ({
  destinations,
  onSelectDestination,
  onOpenEarth,
  aiPlan = null,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);

  const [selectedDestId, setSelectedDestId] = useState<string>(destinations[0]?.id || 'den-hung');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [activeTileLayer, setActiveTileLayer] = useState<TileLayerKey>('streets');
  const [showRouteMode, setShowRouteMode] = useState<boolean>(false);
  const [originCity, setOriginCity] = useState<'hanoi' | 'viettri' | 'noibai'>('hanoi');
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  // Fallback to local plan in localStorage if not passed via props
  const [currentAiPlan, setCurrentAiPlan] = useState<AIItineraryPlan | null>(aiPlan);

  useEffect(() => {
    if (aiPlan) {
      setCurrentAiPlan(aiPlan);
    } else {
      try {
        const saved = localStorage.getItem('phutho_saved_itineraries');
        if (saved) {
          const list = JSON.parse(saved);
          if (list && list.length > 0) {
            setCurrentAiPlan(list[0]);
          }
        }
      } catch (e) {
        console.warn('Could not read saved plans for map:', e);
      }
    }
  }, [aiPlan]);

  const selectedDestination =
    destinations.find((d) => d.id === selectedDestId) || destinations[0];

  // Filter valid coordinates destinations
  const validDestinations = destinations.filter(
    (d) =>
      typeof d.latitude === 'number' &&
      typeof d.longitude === 'number' &&
      d.latitude >= -90 &&
      d.latitude <= 90 &&
      d.longitude >= -180 &&
      d.longitude <= 180 &&
      !isNaN(d.latitude) &&
      !isNaN(d.longitude)
  );

  const filteredDestinations = validDestinations.filter((dest) => {
    if (categoryFilter === 'all') return true;
    return dest.category === categoryFilter;
  });

  // Calculate approximate distance from selected origin
  const getOriginDistanceKm = (dest: Destination) => {
    if (originCity === 'viettri') return dest.distanceFromVietTriKm;
    if (originCity === 'noibai') return Math.round(dest.distanceFromVietTriKm + 55);
    return Math.round(dest.distanceFromVietTriKm + 82);
  };

  // Generate Google Maps Directions URL
  const getDirectionsUrl = (dest: Destination) => {
    const originQuery =
      originCity === 'viettri'
        ? 'Thanh+pho+Viet+Tri+Phu+Tho'
        : originCity === 'noibai'
        ? 'San+bay+Quoc+te+Noi+Bai'
        : 'Ha+Noi+Vietnam';
    return `https://www.google.com/maps/dir/?api=1&origin=${originQuery}&destination=${encodeURIComponent(
      dest.verifiedAddress || dest.name
    )}`;
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    try {
      // Clean up previous instance if any
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Center around Phu Tho province: [21.32, 105.32]
      const map = L.map(mapContainerRef.current, {
        center: [21.32, 105.32],
        zoom: 10,
        minZoom: 7,
        maxZoom: 18,
        zoomControl: false, // We use custom zoom buttons for pristine design
      });

      // Add Tile Layer
      const initialLayerConfig = TILE_LAYERS[activeTileLayer];
      const tileLayer = L.tileLayer(initialLayerConfig.url, {
        attribution: initialLayerConfig.attribution,
        maxZoom: initialLayerConfig.maxZoom,
      }).addTo(map);

      tileLayerRef.current = tileLayer;

      // Create Layer Group for markers
      const markersLayer = L.layerGroup().addTo(map);
      markersLayerRef.current = markersLayer;

      mapInstanceRef.current = map;
      setMapReady(true);
      setMapError(null);

      // Invalidate size after container layout settles
      setTimeout(() => {
        map.invalidateSize();
      }, 250);
    } catch (err: any) {
      console.error('Leaflet initialization error:', err);
      setMapError('Không thể khởi tạo bản đồ. Vui lòng tải lại trang.');
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Tile Layer when user switches layer
  useEffect(() => {
    if (!mapInstanceRef.current || !mapReady) return;

    try {
      if (tileLayerRef.current) {
        mapInstanceRef.current.removeLayer(tileLayerRef.current);
      }

      const layerConfig = TILE_LAYERS[activeTileLayer];
      const newLayer = L.tileLayer(layerConfig.url, {
        attribution: layerConfig.attribution,
        maxZoom: layerConfig.maxZoom,
      }).addTo(mapInstanceRef.current);

      tileLayerRef.current = newLayer;
    } catch (err) {
      console.warn('Error switching tile layer:', err);
    }
  }, [activeTileLayer, mapReady]);

  // Handle window resize and container visibility
  useEffect(() => {
    const handleResize = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    };

    window.addEventListener('resize', handleResize);
    // Also trigger on mount after brief delay
    const timer = setTimeout(handleResize, 350);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, []);

  // Render Markers and Routes whenever destinations, selectedDestId, or showRouteMode changes
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current || !mapReady) return;

    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;

    // Clear existing markers & route
    markersLayer.clearLayers();
    if (routePolylineRef.current) {
      map.removeLayer(routePolylineRef.current);
      routePolylineRef.current = null;
    }

    const bounds = L.latLngBounds([]);

    // Check if showing AI Itinerary Route Mode
    if (showRouteMode && currentAiPlan && currentAiPlan.days) {
      const planPoints: { lat: number; lng: number; title: string; order: number; time: string; day: number }[] = [];
      let globalOrder = 1;

      currentAiPlan.days.forEach((day) => {
        day.activities.forEach((act) => {
          if (act.latitude && act.longitude) {
            planPoints.push({
              lat: act.latitude,
              lng: act.longitude,
              title: act.title,
              order: globalOrder++,
              time: act.timeSlot,
              day: day.dayNumber,
            });
          } else if (act.destinationId) {
            const dest = validDestinations.find((d) => d.id === act.destinationId);
            if (dest) {
              planPoints.push({
                lat: dest.latitude,
                lng: dest.longitude,
                title: act.title || dest.name,
                order: globalOrder++,
                time: act.timeSlot,
                day: day.dayNumber,
              });
            }
          }
        });
      });

      if (planPoints.length > 0) {
        const polylineCoords: L.LatLngExpression[] = [];

        planPoints.forEach((pt) => {
          polylineCoords.push([pt.lat, pt.lng]);
          bounds.extend([pt.lat, pt.lng]);

          // Create Numbered Step Pin for Itinerary
          const stepIcon = L.divIcon({
            className: 'custom-itinerary-pin',
            html: `
              <div class="relative flex items-center justify-center transform -translate-x-1/2 -translate-y-full cursor-pointer transition-transform hover:scale-125">
                <div class="w-8 h-8 rounded-full bg-emerald-950 border-2 border-amber-300 text-amber-300 font-extrabold text-xs flex items-center justify-center shadow-lg">
                  ${pt.order}
                </div>
                <div class="absolute -bottom-1.5 w-0 h-0 border-x-4 border-x-transparent border-t-6 border-t-emerald-950"></div>
              </div>
            `,
            iconSize: [32, 38],
            iconAnchor: [16, 38],
            popupAnchor: [0, -38],
          });

          const marker = L.marker([pt.lat, pt.lng], { icon: stepIcon }).addTo(markersLayer);
          marker.bindPopup(`
            <div class="p-2 text-stone-900 font-sans min-w-[190px]">
              <div class="text-[10px] font-bold uppercase tracking-wider text-emerald-800 mb-0.5">
                Chặng ${pt.order} · Ngày ${pt.day} (${pt.time})
              </div>
              <div class="font-bold text-xs text-stone-900 mb-1">${pt.title}</div>
              <div class="text-[11px] text-stone-600 font-mono">Tọa độ: ${pt.lat.toFixed(4)}, ${pt.lng.toFixed(4)}</div>
            </div>
          `);
        });

        // Draw connecting route polyline
        const routeLine = L.polyline(polylineCoords, {
          color: '#047857',
          weight: 4,
          opacity: 0.85,
          dashArray: '6, 8',
          lineCap: 'round',
        }).addTo(map);

        routePolylineRef.current = routeLine;

        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
        }
        return;
      }
    }

    // Default Destinations Mode
    filteredDestinations.forEach((dest) => {
      const isSelected = dest.id === selectedDestId;
      bounds.extend([dest.latitude, dest.longitude]);

      // Category color styles
      let colorClass = 'bg-amber-600 border-amber-300 text-white';
      let iconSymbol = '⛩️';

      if (dest.category === 'nature_ecology') {
        colorClass = 'bg-emerald-700 border-emerald-300 text-white';
        iconSymbol = '🍃';
      } else if (dest.category === 'resort_wellness') {
        colorClass = 'bg-sky-700 border-sky-300 text-white';
        iconSymbol = '♨️';
      }

      // Create Custom SVG/HTML DivIcon
      const customPin = L.divIcon({
        className: 'custom-destination-marker',
        html: `
          <div class="relative group cursor-pointer flex flex-col items-center transform -translate-x-1/2 -translate-y-full transition-transform duration-200 ${
            isSelected ? 'scale-125 z-30' : 'hover:scale-115 z-20'
          }">
            ${
              isSelected
                ? `<div class="absolute -top-1 w-10 h-10 rounded-full bg-emerald-500/30 animate-ping pointer-events-none"></div>`
                : ''
            }
            <div class="w-8 h-8 rounded-full ${colorClass} border-2 shadow-md flex items-center justify-center text-xs font-bold transition-all">
              <span>${iconSymbol}</span>
            </div>
            <div class="w-0 h-0 border-x-4 border-x-transparent border-t-6 border-t-stone-800 -mt-0.5"></div>
            <div class="mt-1 px-2 py-0.5 rounded-md bg-stone-900/90 text-white text-[11px] font-bold whitespace-nowrap shadow-md pointer-events-none drop-shadow-sm border border-white/20">
              ${dest.name}
            </div>
          </div>
        `,
        iconSize: [36, 48],
        iconAnchor: [18, 48],
        popupAnchor: [0, -48],
      });

      const marker = L.marker([dest.latitude, dest.longitude], { icon: customPin }).addTo(markersLayer);

      // Create rich interactive popup
      const popupHtml = `
        <div class="p-3 text-stone-900 font-sans min-w-[220px] max-w-[260px] space-y-2">
          <div class="flex items-center justify-between text-[10px] text-stone-500 uppercase tracking-wider font-bold">
            <span>${dest.district}</span>
            <span class="text-emerald-800">${dest.categoryLabel}</span>
          </div>
          <div class="font-serif font-bold text-sm text-stone-950">${dest.name}</div>
          <div class="text-[11px] text-stone-600 line-clamp-2 leading-relaxed">${dest.shortDescription}</div>
          <div class="text-[10px] text-stone-500 font-mono pt-1 border-t border-stone-200">
            GPS: ${dest.latitude.toFixed(4)}, ${dest.longitude.toFixed(4)}
          </div>
          <div class="pt-2 flex items-center gap-2">
            <button
              id="popup-btn-detail-${dest.id}"
              class="flex-1 py-1 px-2 bg-emerald-900 text-white text-xs font-bold rounded-lg hover:bg-emerald-800 transition-colors text-center cursor-pointer shadow-xs"
            >
              Chi tiết
            </button>
            <a
              href="${dest.googleMapsUrl}"
              target="_blank"
              rel="noopener noreferrer"
              class="py-1 px-2 bg-stone-100 text-stone-800 text-xs font-semibold rounded-lg hover:bg-stone-200 transition-colors text-center border border-stone-200"
            >
              Maps ↗
            </a>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, { closeButton: true, autoPan: true });

      // Synchronize marker click with parent component
      marker.on('click', () => {
        setSelectedDestId(dest.id);
        map.flyTo([dest.latitude, dest.longitude], Math.max(map.getZoom(), 12), { duration: 0.8 });
      });

      marker.on('popupopen', () => {
        const detailBtn = document.getElementById(`popup-btn-detail-${dest.id}`);
        if (detailBtn) {
          detailBtn.onclick = () => onSelectDestination(dest);
        }
      });
    });

    // Auto-fit bounds if destinations exist
    if (bounds.isValid() && filteredDestinations.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
    }
  }, [filteredDestinations, selectedDestId, showRouteMode, currentAiPlan, mapReady]);

  // Focus on selected destination when changed from sidebar
  const handleSelectFromList = (dest: Destination) => {
    setSelectedDestId(dest.id);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([dest.latitude, dest.longitude], 14, { duration: 1 });
    }
  };

  // Reset to province overview
  const handleResetView = () => {
    if (mapInstanceRef.current && validDestinations.length > 0) {
      const bounds = L.latLngBounds(validDestinations.map((d) => [d.latitude, d.longitude]));
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  };

  // Locate user position
  const handleLocateMe = () => {
    if (!navigator.geolocation || !mapInstanceRef.current) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([latitude, longitude], 13);
          L.circleMarker([latitude, longitude], {
            radius: 8,
            color: '#2563eb',
            fillColor: '#3b82f6',
            fillOpacity: 0.9,
          })
            .addTo(mapInstanceRef.current)
            .bindPopup('Vị trí hiện tại của bạn')
            .openPopup();
        }
      },
      (err) => {
        console.warn('Geolocation warning:', err);
      }
    );
  };

  return (
    <section id="digital-map" className="py-12 bg-stone-100/70 border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-2">
              <Compass className="w-3.5 h-3.5 text-emerald-700" />
              <span>Bản đồ số tương tác</span>
              <span aria-hidden="true">·</span>
              <span>Định vị GPS thực địa 5 điểm đến</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 tracking-tight">
              BẢN ĐỒ SỐ DU LỊCH PHÚ THỌ
            </h2>
            <p className="mt-2 text-sm text-stone-600 leading-relaxed">
              Tích hợp định vị tọa độ GPS xác minh, cho phép thu phóng tự do, chuyển đổi lớp vệ tinh và liên kết trực tiếp với cung đường lịch trình AI.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={onOpenEarth}
              className="px-3.5 py-2 text-xs font-semibold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200 inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <Globe className="w-4 h-4 text-emerald-700" />
              <span>Góc nhìn 3D Earth</span>
            </button>
          </div>
        </div>

        {/* Map Control Toolbar */}
        <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 max-w-full">
            <span className="text-xs font-semibold text-stone-500 flex items-center gap-1 shrink-0 mr-1">
              <SlidersHorizontal className="w-3.5 h-3.5" /> Lọc:
            </span>
            {[
              { id: 'all', label: 'Tất cả 5 điểm đến' },
              { id: 'history_culture', label: 'Lịch sử & Di sản' },
              { id: 'nature_ecology', label: 'Thiên nhiên' },
              { id: 'resort_wellness', label: 'Nghỉ dưỡng & Khám phá' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setCategoryFilter(cat.id);
                  setShowRouteMode(false);
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                  categoryFilter === cat.id && !showRouteMode
                    ? 'bg-emerald-900 text-white shadow-xs font-bold'
                    : 'bg-stone-50 text-stone-700 hover:bg-stone-200/80 border border-stone-200'
                }`}
              >
                {cat.label}
              </button>
            ))}

            {/* AI Itinerary Route Toggle */}
            {currentAiPlan && (
              <button
                onClick={() => setShowRouteMode(!showRouteMode)}
                className={`ml-2 px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 border ${
                  showRouteMode
                    ? 'bg-gradient-to-r from-emerald-900 to-emerald-950 text-amber-300 border-emerald-800 shadow-xs'
                    : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Tuyến Lịch Trình AI</span>
              </button>
            )}
          </div>

          {/* Tile Layer Switcher */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center p-1 bg-stone-100 rounded-xl text-xs font-medium border border-stone-200">
              {(Object.keys(TILE_LAYERS) as TileLayerKey[]).map((layerKey) => (
                <button
                  key={layerKey}
                  onClick={() => setActiveTileLayer(layerKey)}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    activeTileLayer === layerKey
                      ? 'bg-white text-stone-900 font-bold shadow-2xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {TILE_LAYERS[layerKey].name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Map Canvas + Sidebar Details Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Visual Map Area (Col 8) */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-md relative flex flex-col">
            {/* Interactive Leaflet Map Container */}
            <div className="relative w-full h-[540px] sm:h-[580px] bg-stone-200 z-10">
              <div
                ref={mapContainerRef}
                className="w-full h-full"
                style={{ outline: 'none' }}
              />

              {/* Floating Leaflet Navigation Controls */}
              <div className="absolute top-4 left-4 z-[400] flex flex-col gap-2">
                <div className="flex flex-col bg-white/95 backdrop-blur-md rounded-xl border border-stone-200 shadow-md overflow-hidden">
                  <button
                    onClick={() => mapInstanceRef.current?.zoomIn()}
                    className="p-2 hover:bg-stone-100 text-stone-700 hover:text-stone-950 transition-colors border-b border-stone-200 cursor-pointer"
                    title="Phóng to bản đồ"
                    aria-label="Phóng to"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => mapInstanceRef.current?.zoomOut()}
                    className="p-2 hover:bg-stone-100 text-stone-700 hover:text-stone-950 transition-colors cursor-pointer"
                    title="Thu nhỏ bản đồ"
                    aria-label="Thu nhỏ"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={handleResetView}
                  className="p-2 bg-white/95 backdrop-blur-md hover:bg-stone-100 text-stone-700 hover:text-stone-950 rounded-xl border border-stone-200 shadow-md transition-colors cursor-pointer"
                  title="Căn toàn cảnh Phú Thọ"
                  aria-label="Toàn cảnh"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>

                <button
                  onClick={handleLocateMe}
                  className="p-2 bg-white/95 backdrop-blur-md hover:bg-stone-100 text-stone-700 hover:text-stone-950 rounded-xl border border-stone-200 shadow-md transition-colors cursor-pointer"
                  title="Định vị vị trí của tôi"
                  aria-label="Vị trí của tôi"
                >
                  <Navigation className="w-4 h-4 text-blue-600" />
                </button>
              </div>

              {/* Map Legend Overlay */}
              <div className="absolute bottom-4 left-4 z-[400] bg-white/95 backdrop-blur-md p-3 rounded-2xl border border-stone-200/90 text-[11px] text-stone-700 shadow-md flex flex-wrap items-center gap-3 max-w-[90%]">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-amber-600 border border-amber-300" />
                  <span>Di sản & Lịch sử</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-700 border border-emerald-300" />
                  <span>Thiên nhiên sinh thái</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-sky-700 border border-sky-300" />
                  <span>Nghỉ dưỡng & Khám phá</span>
                </div>
                {showRouteMode && (
                  <div className="flex items-center gap-1.5 font-bold text-emerald-900 border-l border-stone-200 pl-3">
                    <span className="w-4 h-0.5 bg-emerald-800 border-dashed" />
                    <span>Lộ trình AI</span>
                  </div>
                )}
              </div>

              {/* Status Hint */}
              <div className="absolute top-4 right-4 z-[400] bg-stone-900/85 text-white text-[11px] font-medium px-3 py-1.5 rounded-full pointer-events-none backdrop-blur-md shadow-md border border-white/20">
                {showRouteMode
                  ? 'Đang hiển thị chặng đường theo lịch trình AI'
                  : 'Nhấp ghim để xem chi tiết & chỉ đường'}
              </div>

              {/* Error fallback banner if any */}
              {mapError && (
                <div className="absolute inset-0 z-[500] bg-white/90 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center">
                  <AlertCircle className="w-8 h-8 text-amber-600 mb-2" />
                  <p className="text-sm font-bold text-stone-900">{mapError}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-4 px-4 py-2 bg-emerald-900 text-white rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Tải lại trang
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel: Selected Destination Detail & Road Guidance (Col 4) */}
          <div className="lg:col-span-4 flex flex-col gap-5">
            {/* Active Destination Card */}
            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-md space-y-4 overflow-hidden">
              {/* Cover Photo Header */}
              {selectedDestination.coverImage && (
                <div className="relative aspect-[16/9] -mx-6 -mt-6 mb-2 bg-stone-900 overflow-hidden">
                  <img
                    src={selectedDestination.coverImage}
                    alt={selectedDestination.name}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/images/den-hung/cover.jpg';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-950/20 to-black/30 pointer-events-none" />
                  <span className="absolute bottom-2.5 left-3 text-[11px] font-bold text-amber-300 px-2.5 py-0.5 rounded-md bg-stone-950/80 border border-amber-400/30 backdrop-blur-xs">
                    {selectedDestination.kicker}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-stone-500">
                <span className="font-semibold text-stone-700">{selectedDestination.district}</span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-bold text-[10px] border border-emerald-200">
                  {selectedDestination.categoryLabel}
                </span>
              </div>

              <div>
                <h3 className="text-xl font-serif font-black text-stone-900 tracking-tight">
                  {selectedDestination.name}
                </h3>
                <p className="text-xs text-stone-600 mt-1.5 leading-relaxed line-clamp-3">
                  {selectedDestination.shortDescription}
                </p>
              </div>

              {/* Verified Address & GPS Coordinates */}
              <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 text-xs space-y-1.5">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-emerald-800 shrink-0 mt-0.5" />
                  <span className="text-stone-800 font-medium leading-snug">
                    {selectedDestination.verifiedAddress}
                  </span>
                </div>
                <div className="text-stone-500 pl-6 font-mono text-[11px]">
                  Tọa độ GPS: {selectedDestination.latitude.toFixed(4)}°B, {selectedDestination.longitude.toFixed(4)}°Đ
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  onClick={() => onSelectDestination(selectedDestination)}
                  className="w-full py-2.5 px-4 text-xs font-bold text-white bg-emerald-900 hover:bg-emerald-800 rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  Xem chi tiết điểm đến & cẩm nang
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={selectedDestination.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2 px-3 text-xs font-semibold text-stone-800 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors inline-flex items-center justify-center gap-1.5 border border-stone-200"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-stone-600" />
                    <span>Google Maps</span>
                  </a>

                  <a
                    href={selectedDestination.googleEarthUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2 px-3 text-xs font-semibold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors inline-flex items-center justify-center gap-1.5"
                  >
                    <Globe className="w-3.5 h-3.5 text-emerald-700" />
                    <span>3D Earth</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Quick Route Distance & Highway Estimator */}
            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-md space-y-3.5">
              <div className="flex items-center gap-2">
                <Car className="w-4 h-4 text-emerald-800" />
                <h4 className="text-sm font-bold text-stone-900">
                  Ước tính khoảng cách & Lộ trình
                </h4>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1.5">
                  Điểm xuất phát:
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'hanoi', label: 'Hà Nội' },
                    { id: 'viettri', label: 'Việt Trì' },
                    { id: 'noibai', label: 'Nội Bài' },
                  ].map((origin) => (
                    <button
                      key={origin.id}
                      onClick={() => setOriginCity(origin.id as any)}
                      className={`py-1.5 px-2 text-xs font-bold rounded-xl transition-all cursor-pointer text-center ${
                        originCity === origin.id
                          ? 'bg-stone-900 text-white shadow-2xs'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                      }`}
                    >
                      {origin.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 text-xs space-y-1.5">
                <div className="flex justify-between text-stone-600">
                  <span>Cự ly di chuyển:</span>
                  <span className="font-bold text-stone-900">
                    ~{getOriginDistanceKm(selectedDestination)} km
                  </span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Thời gian dự kiến:</span>
                  <span className="font-bold text-stone-900">
                    ~{Math.round((getOriginDistanceKm(selectedDestination) / 50) * 60)} phút
                  </span>
                </div>
                <div className="text-[11px] text-stone-500 pt-1.5 border-t border-stone-200 mt-1">
                  <strong>Tuyến đường:</strong>{' '}
                  {selectedDestination.id === 'doi-che-long-coc'
                    ? 'QL32 qua Sơn Tây & Thanh Sơn -> ĐT316'
                    : selectedDestination.id === 'ho-dai-lai'
                    ? 'Cao tốc Thăng Long - Nội Bài rẽ QL2 & ĐT301'
                    : selectedDestination.id === 'tam-dao' || selectedDestination.id === 'tay-thien'
                    ? 'Cao tốc CT05 (IC4) hoặc QL2B vượt đèo Tam Đảo'
                    : 'Cao tốc CT05 Nội Bài - Lào Cai (Nút giao IC7)'}
                </div>
              </div>

              <a
                href={getDirectionsUrl(selectedDestination)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 text-xs font-bold text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Navigation className="w-3.5 h-3.5 text-blue-700" />
                <span>Mở chỉ đường trên Google Maps</span>
              </a>
            </div>

            {/* Destination Quick Selector List */}
            <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-md">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block mb-2">
                Chọn điểm để định vị trên bản đồ:
              </span>
              <div className="space-y-1.5">
                {validDestinations.map((dest) => (
                  <button
                    key={dest.id}
                    onClick={() => handleSelectFromList(dest)}
                    className={`w-full p-2.5 rounded-xl text-left text-xs font-medium transition-all flex items-center justify-between cursor-pointer ${
                      dest.id === selectedDestId
                        ? 'bg-emerald-50 text-emerald-950 font-bold border border-emerald-300 shadow-2xs'
                        : 'hover:bg-stone-50 text-stone-700 border border-transparent'
                    }`}
                  >
                    <span className="truncate pr-2">{dest.name}</span>
                    <span className="text-[10px] text-stone-500 shrink-0 font-mono">
                      {dest.latitude.toFixed(2)}, {dest.longitude.toFixed(2)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
