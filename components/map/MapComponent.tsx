import React, { useRef, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import '@maplibre/maplibre-react-native';
import { Camera, MapView, UserLocation, PointAnnotation, type CameraRef } from '@maplibre/maplibre-react-native';
import { useAppTheme } from '@/context/theme-context';
import { Colors } from '@/constants/theme';

interface MapComponentProps {
  initialCenter?: [number, number];
  initialZoom?: number;
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

const DEFAULT_CENTER: [number, number] = [9.145, 40.4897]; // Ethiopia center
const DEFAULT_ZOOM = 10;

export const MapComponent: React.FC<MapComponentProps> = ({
  initialCenter = DEFAULT_CENTER,
  initialZoom = DEFAULT_ZOOM,
  showUserLocation = false,
  markers = [],
  onMapPress,
  style,
}) => {
  const { isDarkMode } = useAppTheme();
  const theme = Colors[isDarkMode ? 'dark' : 'light'];
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const cameraRef = useRef<CameraRef>(null);

  const handleMapPress = (event: any) => {
    if (onMapPress) {
      const { geometry } = event;
      onMapPress([geometry.coordinates[0], geometry.coordinates[1]]);
    }
  };

  const openFreeMapStyle = {
    version: 8,
    sources: {
      'openfreemap-tiles': {
        type: 'raster',
        tiles: ['https://openfreemap.org/{z}/{x}/{y}.png'],
        tileSize: 256,
        attribution: '© OpenStreetMap contributors',
      },
    },
    layers: [
      {
        id: 'openfreemap-tiles',
        type: 'raster',
        source: 'openfreemap-tiles',
        minzoom: 0,
        maxzoom: 19,
      },
    ],
  };

  return (
    <View style={[styles.container, style]}>
       <MapView
        style={styles.map}
        mapStyle={openFreeMapStyle}
        onPress={handleMapPress}
        onDidFinishLoadingMap={() => setIsMapLoaded(true)}
        logoEnabled={false}
        attributionEnabled={true}
        attributionPosition={{ bottom: 8, right: 8 }}
      >
        <Camera
          ref={cameraRef}
          centerCoordinate={initialCenter}
          zoomLevel={initialZoom}
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

      {!isMapLoaded && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={theme.tint} />
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
  },
});

export default MapComponent;