import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import '@maplibre/maplibre-react-native';
import { Camera, MapView, UserLocation, PointAnnotation, type CameraRef, setAccessToken } from '@maplibre/maplibre-react-native';
import { useAppTheme } from '@/context/theme-context';
import { Colors } from '@/constants/theme';

interface MapComponentProps {
  initialCenter?: [number, number];
  initialZoom?: number;
  center?: [number, number];
  zoom?: number;
  showUserLocation?: boolean;
  markers?: {
    id: string;
    coordinate: [number, number];
    title?: string;
    description?: string;
  }[];
  onMapPress?: (coordinate: [number, number]) => void;
  style?: any;
}

const DEFAULT_CENTER: [number, number] = [38.7578, 9.0320]; // Addis Ababa
const DEFAULT_ZOOM = 10;

export const MapComponent: React.FC<MapComponentProps> = ({
  initialCenter = DEFAULT_CENTER,
  initialZoom = DEFAULT_ZOOM,
  center,
  zoom,
  showUserLocation = false,
  markers = [],
  onMapPress,
  style,
}) => {
  const { isDarkMode } = useAppTheme();
  const theme = Colors[isDarkMode ? 'dark' : 'light'];
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const cameraRef = useRef<CameraRef>(null);

  useEffect(() => {
    // Set empty access token for MapLibre (required for some features)
    setAccessToken('');
  }, []);

  const prevCenterRef = useRef<[number, number] | undefined>(center);
  const prevZoomRef = useRef<number | undefined>(zoom);

  useEffect(() => {
    const isValidCenter = Array.isArray(center) &&
      center.length === 2 &&
      typeof center[0] === 'number' &&
      typeof center[1] === 'number' &&
      !isNaN(center[0]) && !isNaN(center[1]);

    if (isValidCenter && cameraRef.current &&
      (center[0] !== prevCenterRef.current?.[0] || center[1] !== prevCenterRef.current?.[1] || zoom !== prevZoomRef.current)) {

      cameraRef.current.setCamera({
        centerCoordinate: center,
        zoomLevel: zoom,
        animationDuration: 500,
        animationMode: 'flyTo',
      });

      prevCenterRef.current = center;
      prevZoomRef.current = zoom;
    }
  }, [center, zoom]);

  const handleMapPress = (event: any) => {
    if (onMapPress) {
      const { geometry } = event;
      onMapPress([geometry.coordinates[0], geometry.coordinates[1]]);
    }
  };

  const openFreeMapStyle = {
    version: 8,
    sources: {
      'osm-tiles': {
        type: 'raster',
        tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
        tileSize: 256,
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      },
    },
    layers: [
      {
        id: 'osm-tiles',
        type: 'raster',
        source: 'osm-tiles',
        minzoom: 0,
        maxzoom: 19,
      },
    ],
  };

  const targetCenter = center ?? initialCenter;
  const targetZoom = zoom ?? initialZoom;

  return (
    <View style={[styles.container, style]}>
      <MapView
        style={styles.map}
        mapStyle={openFreeMapStyle}
        onPress={handleMapPress}
        onDidFinishLoadingMap={() => {
          console.log('Map loaded successfully');
          setIsMapLoaded(true);
        }}
        onDidFailLoadingMap={((error: any) => {
          console.error('Map loading failed:', error);
          setMapError(error.message);
        }) as () => void}
        logoEnabled={false}
        attributionEnabled={true}
        attributionPosition={{ bottom: 8, right: 8 }}
      >
        <Camera
          ref={cameraRef}
          centerCoordinate={targetCenter}
          zoomLevel={targetZoom}
          animationMode="flyTo"
          animationDuration={0}
        />

        {showUserLocation && (
          <UserLocation
            animated={true}
            showsUserHeadingIndicator={true}
            visible={true}
          />
        )}

        {markers.map((marker) => (
          <PointAnnotation
            key={marker.id}
            id={marker.id}
            coordinate={marker.coordinate}
            title={marker.title}
            snippet={marker.description}
          >
            <View style={styles.markerContainer}>
              <View style={[styles.marker, { backgroundColor: theme.tint }]} />
            </View>
          </PointAnnotation>
        ))}
      </MapView>

      {!isMapLoaded && !mapError && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={theme.tint} />
        </View>
      )}
      {mapError && (
        <View style={styles.errorOverlay}>
          <Text style={styles.errorText}>Map failed to load: {mapError}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 200, 200, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#d00',
    textAlign: 'center',
    fontSize: 14,
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  marker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
    zIndex: 2,
  },
  markerHalo: {
    position: 'absolute',
    width: 34,
    height: 34,
    borderRadius: 17,
    zIndex: 1,
  },
});

export default MapComponent;