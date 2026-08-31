import React, { useState } from 'react';
import { MapContainer, TileLayer, Polygon, Polyline, Marker, Popup } from 'react-leaflet';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Layers } from 'lucide-react';
import { useTheme } from './ThemeProvider.jsx';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapComponent = ({ farmBoundary, fieldZones, droneFlightPath, stressMarkers, diseaseMarkers }) => {
  const { theme } = useTheme();
  const [showZones, setShowZones] = useState(true);
  const [showDronePath, setShowDronePath] = useState(true);
  const [showMarkers, setShowMarkers] = useState(true);

  const center = [28.6140, 77.2090];

  const stressIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  const diseaseIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  const tileUrl = theme === 'dark' 
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  return (
    <Card className="hover:shadow-lg transition-all duration-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Farm Map</CardTitle>
          <div className="flex gap-2">
            <Button
              variant={showZones ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowZones(!showZones)}
              className="transition-all duration-200"
            >
              <Layers className="w-4 h-4 mr-2" />
              Zones
            </Button>
            <Button
              variant={showDronePath ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowDronePath(!showDronePath)}
              className="transition-all duration-200"
            >
              Drone Path
            </Button>
            <Button
              variant={showMarkers ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowMarkers(!showMarkers)}
              className="transition-all duration-200"
            >
              Markers
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[500px] rounded-xl overflow-hidden border relative z-0">
          <MapContainer
            center={center}
            zoom={15}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              key={theme}
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url={tileUrl}
            />
            
            <Polygon
              positions={farmBoundary.geometry.coordinates[0].map(coord => [coord[1], coord[0]])}
              pathOptions={{ color: '#22c55e', weight: 3, fillOpacity: 0.1 }}
            >
              <Popup>
                <div className="font-semibold text-foreground">{farmBoundary.properties.name}</div>
              </Popup>
            </Polygon>

            {showZones && fieldZones.map(zone => (
              <Polygon
                key={zone.id}
                positions={zone.geometry.coordinates[0].map(coord => [coord[1], coord[0]])}
                pathOptions={{ 
                  color: zone.properties.color, 
                  weight: 2, 
                  fillOpacity: 0.3 
                }}
              >
                <Popup>
                  <div>
                    <div className="font-semibold text-foreground">{zone.name}</div>
                    <div className="text-sm text-muted-foreground">Health: {zone.properties.health}</div>
                  </div>
                </Popup>
              </Polygon>
            ))}

            {showDronePath && (
              <Polyline
                positions={droneFlightPath.geometry.coordinates.map(coord => [coord[1], coord[0]])}
                pathOptions={{ color: '#3b82f6', weight: 3, dashArray: '10, 10' }}
              >
                <Popup>
                  <div className="font-semibold text-foreground">{droneFlightPath.properties.name}</div>
                </Popup>
              </Polyline>
            )}

            {showMarkers && stressMarkers.map(marker => (
              <Marker key={marker.id} position={marker.position} icon={stressIcon}>
                <Popup>
                  <div>
                    <div className="font-semibold text-foreground">Crop Stress Detected</div>
                    <div className="text-sm text-muted-foreground">Severity: {marker.severity}</div>
                  </div>
                </Popup>
              </Marker>
            ))}

            {showMarkers && diseaseMarkers.map(marker => (
              <Marker key={marker.id} position={marker.position} icon={diseaseIcon}>
                <Popup>
                  <div>
                    <div className="font-semibold text-foreground">Disease: {marker.name}</div>
                    <div className="text-sm text-muted-foreground">Requires attention</div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default MapComponent;