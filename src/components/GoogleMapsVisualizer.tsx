import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  APIProvider,
  Map,
  useMap,
  AdvancedMarker,
  Pin,
  InfoWindow
} from '@vis.gl/react-google-maps';
import {
  Building2,
  Truck,
  AlertTriangle,
  Layers,
  Compass,
  Navigation,
  Sparkles,
  MapPin,
  ShieldCheck,
  RefreshCw,
  Zap,
  Phone
} from 'lucide-react';
import { GraphNode, IncidentReport, AmbulanceUnit } from '../types';
import { runDijkstra, PathResult } from '../utils/graphAlgorithms';

interface GoogleMapsVisualizerProps {
  nodes: Record<string, GraphNode>;
  ambulances: AmbulanceUnit[];
  activeIncident: IncidentReport;
  onRelocateAmbulance?: (ambulanceId: string, newNodeId: string) => void;
  onSelectIncident?: (id: string) => void;
}

// Polyline component using Google Maps JS API with React lifecycle
function RoutePolyline({
  path,
  strokeColor,
  strokeWeight = 5,
  strokeOpacity = 0.9,
  dashed = false
}: {
  path: { lat: number; lng: number }[];
  strokeColor: string;
  strokeWeight?: number;
  strokeOpacity?: number;
  dashed?: boolean;
}) {
  const map = useMap();
  const polylineRef = useRef<google.maps.Polyline | null>(null);

  useEffect(() => {
    if (!map || path.length < 2) return;

    const lineSymbol = {
      path: 'M 0,-1 0,1',
      strokeOpacity: 1,
      scale: 3
    };

    const options: google.maps.PolylineOptions = {
      path,
      strokeColor,
      strokeOpacity: dashed ? 0 : strokeOpacity,
      strokeWeight,
      geodesic: true,
      icons: dashed
        ? [
            {
              icon: lineSymbol,
              offset: '0',
              repeat: '16px'
            }
          ]
        : undefined
    };

    if (!polylineRef.current) {
      polylineRef.current = new google.maps.Polyline({
        map,
        ...options
      });
    } else {
      polylineRef.current.setMap(map);
      polylineRef.current.setOptions(options);
    }

    return () => {
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
      }
    };
  }, [map, path, strokeColor, strokeWeight, strokeOpacity, dashed]);

  return null;
}

// Live Google Maps Traffic Layer
function TrafficLayerToggle({ enabled }: { enabled: boolean }) {
  const map = useMap();
  const trafficLayerRef = useRef<google.maps.TrafficLayer | null>(null);

  useEffect(() => {
    if (!map) return;
    if (!trafficLayerRef.current) {
      trafficLayerRef.current = new google.maps.TrafficLayer();
    }
    if (enabled) {
      trafficLayerRef.current.setMap(map);
    } else {
      trafficLayerRef.current.setMap(null);
    }

    return () => {
      if (trafficLayerRef.current) {
        trafficLayerRef.current.setMap(null);
      }
    };
  }, [map, enabled]);

  return null;
}

// Auto-Pan and Center controller for selected incident
function MapCenterController({ incidentNode }: { incidentNode?: GraphNode }) {
  const map = useMap();
  useEffect(() => {
    if (map && incidentNode && incidentNode.lat && incidentNode.lng) {
      map.panTo({ lat: incidentNode.lat, lng: incidentNode.lng });
      map.setZoom(13);
    }
  }, [map, incidentNode]);

  return null;
}

export const GoogleMapsVisualizer: React.FC<GoogleMapsVisualizerProps> = ({
  nodes,
  ambulances,
  activeIncident,
  onRelocateAmbulance,
  onSelectIncident
}) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  const [mapTypeId, setMapTypeId] = useState<string>('roadmap');
  const [showTraffic, setShowTraffic] = useState<boolean>(true);
  const [selectedHospital, setSelectedHospital] = useState<GraphNode | null>(null);
  const [selectedAmbulance, setSelectedAmbulance] = useState<AmbulanceUnit | null>(null);

  const hospitals = useMemo(
    () => Object.values(nodes).filter((n) => n.type === 'hospital'),
    [nodes]
  );

  const assignedAmb = useMemo(() => {
    return (
      ambulances.find((a) => a.id === activeIncident.assignedAmbulanceId) ||
      ambulances[0]
    );
  }, [ambulances, activeIncident.assignedAmbulanceId]);

  const assignedHospital = useMemo(() => {
    return nodes[activeIncident.targetHospitalId] || hospitals[0];
  }, [nodes, activeIncident.targetHospitalId, hospitals]);

  const incidentNode = nodes[activeIncident.nodeId];
  const ambulanceStartNode = assignedAmb
    ? nodes[assignedAmb.currentLocationNodeId]
    : nodes['station_vytilla'];

  // Calculate route coordinates for Ambulance -> Incident
  const ambulanceRoutePath = useMemo(() => {
    if (!ambulanceStartNode || !incidentNode) return [];
    return [
      { lat: ambulanceStartNode.lat, lng: ambulanceStartNode.lng },
      { lat: incidentNode.lat, lng: incidentNode.lng }
    ];
  }, [ambulanceStartNode, incidentNode]);

  // Calculate route coordinates for Incident -> Hospital
  const hospitalRoutePath = useMemo(() => {
    if (!incidentNode || !assignedHospital) return [];
    return [
      { lat: incidentNode.lat, lng: incidentNode.lng },
      { lat: assignedHospital.lat, lng: assignedHospital.lng }
    ];
  }, [incidentNode, assignedHospital]);

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-[#070c18] shadow-2xl flex flex-col h-[640px] sm:h-[680px]">
      {/* Google Maps Sub-header Bar */}
      <div className="bg-[#0b1324] border-b border-slate-800/80 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs z-10">
        <div className="flex items-center gap-2 text-slate-200">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold uppercase tracking-wider text-white">
            Google Maps™ Real-Time Tactical Feed
          </span>
          <span className="text-slate-500">·</span>
          <span className="text-cyan-400 font-mono">Ernakulam Live Grid</span>
        </div>

        {/* Tactical Map Controls */}
        <div className="flex items-center gap-2">
          {/* Map Type Selector */}
          <div className="flex items-center bg-[#070d18] border border-slate-700 rounded-lg p-0.5 text-[11px]">
            <button
              onClick={() => setMapTypeId('roadmap')}
              className={`px-2 py-0.5 rounded font-semibold transition ${
                mapTypeId === 'roadmap' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Roadmap
            </button>
            <button
              onClick={() => setMapTypeId('satellite')}
              className={`px-2 py-0.5 rounded font-semibold transition ${
                mapTypeId === 'satellite' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Satellite
            </button>
            <button
              onClick={() => setMapTypeId('hybrid')}
              className={`px-2 py-0.5 rounded font-semibold transition ${
                mapTypeId === 'hybrid' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Hybrid
            </button>
            <button
              onClick={() => setMapTypeId('terrain')}
              className={`px-2 py-0.5 rounded font-semibold transition ${
                mapTypeId === 'terrain' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Terrain
            </button>
          </div>

          {/* Traffic Layer Toggle */}
          <button
            onClick={() => setShowTraffic(!showTraffic)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition ${
              showTraffic
                ? 'bg-amber-950/80 text-amber-300 border-amber-600'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Traffic {showTraffic ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>

      {/* Main Map Canvas */}
      <div className="relative flex-1 w-full h-full">
        <APIProvider apiKey={apiKey}>
          <Map
            defaultCenter={{ lat: 9.9816, lng: 76.2999 }}
            defaultZoom={12}
            mapId="DEMO_MAP_ID"
            mapTypeId={mapTypeId}
            gestureHandling="greedy"
            disableDefaultUI={false}
            className="w-full h-full"
          >
            {/* Live Traffic Overlay */}
            <TrafficLayerToggle enabled={showTraffic} />

            {/* Auto-Center on active incident */}
            <MapCenterController incidentNode={incidentNode} />

            {/* Dijkstra Route 1: Ambulance -> Crash Site */}
            {ambulanceRoutePath.length === 2 && (
              <RoutePolyline
                path={ambulanceRoutePath}
                strokeColor="#f59e0b"
                strokeWeight={5}
                strokeOpacity={0.9}
              />
            )}

            {/* Dijkstra Route 2: Crash Site -> Receiving Hospital */}
            {hospitalRoutePath.length === 2 && (
              <RoutePolyline
                path={hospitalRoutePath}
                strokeColor="#10b981"
                strokeWeight={5}
                strokeOpacity={0.9}
              />
            )}

            {/* 1. HOSPITALS MARKERS */}
            {hospitals.map((hosp) => {
              const isAssigned = hosp.id === activeIncident.targetHospitalId;
              const isFull = hosp.diversionStatus === 'divert';

              return (
                <AdvancedMarker
                  key={hosp.id}
                  position={{ lat: hosp.lat, lng: hosp.lng }}
                  onClick={() => setSelectedHospital(hosp)}
                  title={hosp.name}
                >
                  <div
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-xl shadow-lg border text-xs font-bold transition transform hover:scale-110 cursor-pointer ${
                      isAssigned
                        ? 'bg-emerald-600 text-white border-emerald-300 ring-4 ring-emerald-500/40 animate-bounce'
                        : isFull
                        ? 'bg-rose-950/90 text-rose-300 border-rose-700'
                        : 'bg-slate-900/90 text-slate-100 border-slate-700'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate max-w-[120px]">{hosp.name.split(',')[0]}</span>
                    {isAssigned && (
                      <span className="px-1 py-0.2 rounded text-[9px] bg-emerald-800 text-white">
                        DEST
                      </span>
                    )}
                  </div>
                </AdvancedMarker>
              );
            })}

            {/* 2. FLEET AMBULANCE MARKERS */}
            {ambulances.map((amb) => {
              const locNode = nodes[amb.currentLocationNodeId];
              if (!locNode) return null;
              const isAssigned = amb.id === activeIncident.assignedAmbulanceId;

              return (
                <AdvancedMarker
                  key={amb.id}
                  position={{ lat: locNode.lat, lng: locNode.lng }}
                  onClick={() => setSelectedAmbulance(amb)}
                  title={`${amb.name} (${amb.code})`}
                >
                  <div
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl shadow-xl border text-xs font-bold transition transform hover:scale-110 cursor-pointer ${
                      isAssigned
                        ? 'bg-amber-500 text-slate-950 border-white ring-4 ring-amber-400/50 animate-pulse'
                        : amb.status === 'IDLE'
                        ? 'bg-cyan-900/90 text-cyan-200 border-cyan-600'
                        : 'bg-amber-900/90 text-amber-200 border-amber-600'
                    }`}
                  >
                    <Truck className="w-4 h-4 shrink-0" />
                    <span className="font-mono text-[11px]">{amb.code}</span>
                    {isAssigned && (
                      <span className="px-1 py-0.2 rounded text-[9px] bg-slate-950 text-amber-300">
                        DISPATCHED
                      </span>
                    )}
                  </div>
                </AdvancedMarker>
              );
            })}

            {/* 3. ACTIVE CRASH INCIDENT MARKER */}
            {incidentNode && (
              <AdvancedMarker
                position={{ lat: incidentNode.lat, lng: incidentNode.lng }}
                title={`Accident: ${activeIncident.code}`}
              >
                <div className="relative flex items-center justify-center cursor-pointer group">
                  <span className="absolute w-12 h-12 rounded-full bg-red-600/40 animate-ping" />
                  <div className="relative px-3 py-1.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-700 text-white font-black text-xs shadow-2xl border-2 border-white flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-300 animate-bounce" />
                    <span>CRASH: {activeIncident.code}</span>
                  </div>
                </div>
              </AdvancedMarker>
            )}

            {/* InfoWindow for Selected Hospital */}
            {selectedHospital && (
              <InfoWindow
                position={{ lat: selectedHospital.lat, lng: selectedHospital.lng }}
                onCloseClick={() => setSelectedHospital(null)}
              >
                <div className="p-1 text-slate-900 max-w-xs font-sans">
                  <div className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-emerald-600" />
                    <span>{selectedHospital.name}</span>
                  </div>
                  <div className="text-xs text-slate-600 mt-1">
                    {selectedHospital.traumaLevel || 'Level 1 Trauma Center'}
                  </div>
                  <div className="mt-2 text-xs font-mono bg-slate-100 p-2 rounded-lg space-y-1">
                    <div>
                      ICU Availability: <strong className="text-emerald-700">{selectedHospital.icuAvailable} Beds</strong>
                    </div>
                    <div>
                      Free Beds: {selectedHospital.beds?.free} / {selectedHospital.beds?.total}
                    </div>
                    <div>
                      Diversion: <strong>{selectedHospital.diversionStatus?.toUpperCase()}</strong>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <a
                      href={`tel:${selectedHospital.emergencyPhone}`}
                      className="text-emerald-700 font-bold flex items-center gap-1 hover:underline"
                    >
                      <Phone className="w-3 h-3" />
                      {selectedHospital.emergencyPhone}
                    </a>
                  </div>
                </div>
              </InfoWindow>
            )}

            {/* InfoWindow for Selected Ambulance */}
            {selectedAmbulance && (
              <InfoWindow
                position={{
                  lat: nodes[selectedAmbulance.currentLocationNodeId]?.lat || 9.9816,
                  lng: nodes[selectedAmbulance.currentLocationNodeId]?.lng || 76.2999
                }}
                onCloseClick={() => setSelectedAmbulance(null)}
              >
                <div className="p-1 text-slate-900 max-w-xs font-sans">
                  <div className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-amber-600" />
                    <span>{selectedAmbulance.name}</span>
                  </div>
                  <div className="text-xs text-slate-600 mt-1 font-mono">
                    Code: {selectedAmbulance.code} · Status: <strong>{selectedAmbulance.status}</strong>
                  </div>
                  <div className="mt-2 text-xs bg-slate-100 p-2 rounded-lg space-y-1 font-mono">
                    <div>Stationed: {nodes[selectedAmbulance.currentLocationNodeId]?.name}</div>
                    <div>Lead: {selectedAmbulance.lead}</div>
                    <div>Driver: {selectedAmbulance.driver}</div>
                    <div>Tier: {selectedAmbulance.level}</div>
                  </div>
                </div>
              </InfoWindow>
            )}
          </Map>
        </APIProvider>
      </div>

      {/* Map Legend Overlay in Bottom Left */}
      <div className="absolute bottom-4 left-4 z-10 bg-[#070c18]/90 backdrop-blur-md border border-slate-800 rounded-xl p-3 text-[11px] text-slate-300 shadow-2xl space-y-2 pointer-events-auto">
        <div className="font-bold text-white uppercase tracking-wider text-[10px] flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span>Active Dijkstra Emergency Vector</span>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-1 bg-amber-400 rounded-full" />
            <span>
              Ambulance <strong className="text-amber-300">({assignedAmb?.code})</strong> → Crash Site
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-1 bg-emerald-400 rounded-full" />
            <span>
              Crash Site → Hospital <strong className="text-emerald-300">({assignedHospital?.name.split(',')[0]})</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
