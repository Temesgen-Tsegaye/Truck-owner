import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import * as MapLibreGL from '@maplibre/maplibre-react-native';

// @ts-ignore
MapLibreGL.setAccessToken(null);

MapLibreGL.Logger.setLogCallback((log) => {
  return (
    log.tag === 'Mbgl-HttpRequest' &&
    log.message.startsWith('Request failed due to a permanent error: Canceled')
  );
});

export interface MapComponentProps {
  followCenter?: boolean;
  markers?: {
    id: string;
    coordinate: [number, number];
    title?: string;
    description?: string;
  }[];
  showCompass?: boolean;
  compassMargins?: {
    x: number;
    y: number;
  };
}

const DEFAULT_CENTER: [number, number] = [38.7578, 9.0320];
const DEFAULT_ZOOM = 10;
const LIGHT_STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty';

const MapComponent: React.FC<MapComponentProps> = ({
  followCenter = false,
  markers = [],
  showCompass = false,
  compassMargins,
}) => {
  const mapRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const [isFollowingCenter, setIsFollowingCenter] = useState(followCenter);
  const currentZoomRef = useRef<number>(DEFAULT_ZOOM);

  useEffect(() => {
    if (followCenter) {
      setIsFollowingCenter(true);
    }
  }, [followCenter]);

  useEffect(() => {
    if (isFollowingCenter && markers.length > 0 && cameraRef.current) {
      cameraRef.current.setCamera({
        centerCoordinate: markers[0].coordinate,
        zoomLevel: currentZoomRef.current,
        animationDuration: 1000,
      });
    }
  }, [markers, isFollowingCenter]);

  const handleRegionChange = (event: any) => {
    const nextZoom = event?.properties?.zoomLevel;
    if (typeof nextZoom === 'number') {
      currentZoomRef.current = nextZoom;
    }

    if (event?.properties?.isUserInteraction && followCenter) {
      setIsFollowingCenter(false);
    }
  };

  return (
    <View style={styles.container}>
      <MapLibreGL.MapView
        ref={mapRef}
        style={styles.map}
        mapStyle={LIGHT_STYLE_URL}
        onRegionWillChange={handleRegionChange}
        onRegionIsChanging={handleRegionChange}
        onRegionDidChange={handleRegionChange}
        compassEnabled={showCompass}
        compassViewPosition={1}
        compassViewMargins={compassMargins}
        logoEnabled={false}
        attributionEnabled={true}
      >
        <MapLibreGL.Camera
          ref={cameraRef}
          defaultSettings={{
            centerCoordinate: DEFAULT_CENTER,
            zoomLevel: DEFAULT_ZOOM,
          }}
          maxZoomLevel={18}
        />
        {markers.map((marker) => (
          <MapLibreGL.PointAnnotation
            key={marker.id}
            id={marker.id}
            coordinate={marker.coordinate}
          >
            <View style={styles.markerContainer}>
              <View style={styles.markerInner} />
            </View>
          </MapLibreGL.PointAnnotation>
        ))}
      </MapLibreGL.MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
});

export default MapComponent;
