'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapProps {
  incidents: any[];
  vehicles: any[];
  hospitals: any[];
  center?: [number, number];
}

export default function DashboardMapInner({ incidents, vehicles, hospitals, center = [37.7749, -122.4194] }: MapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Fix leaflet marker icon URLs
    // Leaflet's default icons can be broken in build packagers
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });

    // Initialize Map
    const map = L.map(mapContainerRef.current, {
      center: center,
      zoom: 13,
      zoomControl: false,
    });
    
    // Add dark theme maps tiles (CartoDB Voyager or Dark Matter)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update Markers when props change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // Custom Icons using raw SVG path indicators for futuristic look
    const createCustomIcon = (color: string, shadowColor: string) => {
      return L.divIcon({
        className: 'custom-leaflet-icon',
        html: `
          <div style="position: relative; width: 24px; height: 24px;">
            <div style="
              position: absolute; 
              width: 12px; 
              height: 12px; 
              background-color: ${color}; 
              border: 2px solid #ffffff; 
              border-radius: 50%;
              top: 6px; 
              left: 6px;
              box-shadow: 0 0 10px ${shadowColor};
              z-index: 5;
            "></div>
            <div style="
              position: absolute;
              width: 24px;
              height: 24px;
              border-radius: 50%;
              background-color: ${color};
              opacity: 0.3;
              animation: leaflet-ping 1.5s infinite ease-in-out;
              top: 0; left: 0;
            "></div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });
    };

    // Inject css animation
    if (!document.getElementById('leaflet-custom-animations')) {
      const style = document.createElement('style');
      style.id = 'leaflet-custom-animations';
      style.innerHTML = `
        @keyframes leaflet-ping {
          0% { transform: scale(0.5); opacity: 0.8; }
          100% { transform: scale(1.8); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }

    const redIcon = createCustomIcon('#ef4444', 'rgba(239, 68, 68, 0.8)');
    const blueIcon = createCustomIcon('#3b82f6', 'rgba(59, 130, 246, 0.8)');
    const greenIcon = createCustomIcon('#10b981', 'rgba(16, 185, 129, 0.8)');

    // 1. Add Hospital Markers
    hospitals.forEach(h => {
      const marker = L.marker([h.location_lat, h.location_lng], { icon: greenIcon })
        .bindPopup(`
          <div style="color: #1e293b; font-family: Outfit, sans-serif; padding: 4px;">
            <h4 style="margin: 0 0 4px 0; font-weight: bold; font-size: 13px;">🏥 ${h.name}</h4>
            <p style="margin: 0; font-size: 11px;">Beds Space: <b>${h.capacity_available} / ${h.capacity_total}</b></p>
            <p style="margin: 4px 0 0 0; font-size: 10px; color: #64748b;">Specialties: ${h.specialties.join(', ')}</p>
          </div>
        `)
        .addTo(map);
      markersRef.current.push(marker);
    });

    // 2. Add Vehicle Markers
    vehicles.forEach(v => {
      const marker = L.marker([v.current_lat, v.current_lng], { icon: blueIcon })
        .bindPopup(`
          <div style="color: #1e293b; font-family: Outfit, sans-serif; padding: 4px;">
            <h4 style="margin: 0 0 4px 0; font-weight: bold; font-size: 13px;">🚒 ${v.name}</h4>
            <p style="margin: 0; font-size: 11px;">Status: <span style="text-transform: uppercase; font-weight: bold; color: ${v.status === 'active' ? '#ef4444' : '#10b981'}">${v.status}</span></p>
            <p style="margin: 2px 0 0 0; font-size: 10px; color: #64748b;">Type: ${v.type}</p>
          </div>
        `)
        .addTo(map);
      markersRef.current.push(marker);
    });

    // 3. Add Incident Markers
    incidents.forEach(inc => {
      const marker = L.marker([inc.location_lat, inc.location_lng], { icon: redIcon })
        .bindPopup(`
          <div style="color: #1e293b; font-family: Outfit, sans-serif; padding: 4px; width: 180px;">
            <h4 style="margin: 0 0 4px 0; font-weight: bold; font-size: 13px; color: #ef4444;">🚨 ${inc.title}</h4>
            <p style="margin: 0; font-size: 11px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${inc.description}</p>
            <p style="margin: 4px 0 0 0; font-size: 10px;">Status: <b style="text-transform: uppercase;">${inc.status}</b></p>
            <p style="margin: 0; font-size: 10px;">Priority: <b style="text-transform: uppercase; color: #dc2626">${inc.priority}</b></p>
          </div>
        `)
        .addTo(map);
      markersRef.current.push(marker);
    });

  }, [incidents, vehicles, hospitals]);

  return (
    <div 
      ref={mapContainerRef} 
      className="w-full h-full rounded-xl overflow-hidden border border-slate-800"
      style={{ minHeight: '350px' }}
    />
  );
}
