import React, { useRef, useEffect, useState, useCallback } from 'react';
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
const USER_PAN_TIMEOUT = 3000;
const LIGHT_STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty';
const LERP_DURATION = 600;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const MapComponent: React.FC<MapComponentProps> = ({
  followCenter = false,
  markers = [],
  showCompass = false,
  compassMargins,
}) => {
  const mapRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const animationFrameRef = useRef<number | null>(null);
  const userPanTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userPannedRef = useRef(false);
  const [animatedCoords, setAnimatedCoords] = useState<Record<string, [number, number]>>({});
  const prevCoordsRef = useRef<Record<string, [number, number]>>({});
  const animStartRef = useRef<number>(0);

  useEffect(() => {
    if (markers.length === 0) return;

    for (const marker of markers) {
      const target = marker.coordinate;
      const prev = prevCoordsRef.current[marker.id];
      if (!prev || prev[0] !== target[0] || prev[1] !== target[1]) {
        if (!prev) {
          prevCoordsRef.current[marker.id] = target;
          setAnimatedCoords((s) => ({ ...s, [marker.id]: target }));
        } else {
          startAnimation(marker.id, prev, target);
        }
        prevCoordsRef.current[marker.id] = target;
      }
    }

    if (markers.length > 0 && cameraRef.current && !userPannedRef.current) {
      cameraRef.current.flyTo(markers[0].coordinate, 1000);
    }
  }, [markers, followCenter]);

  const startAnimation = useCallback(
    (id: string, from: [number, number], to: [number, number]) => {
      animStartRef.current = 0;

      const animate = (timestamp: number) => {
        if (!animStartRef.current) animStartRef.current = timestamp;
        const elapsed = timestamp - animStartRef.current;
        const t = Math.min(elapsed / LERP_DURATION, 1);
        const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

        setAnimatedCoords((s) => ({
          ...s,
          [id]: [lerp(from[0], to[0], eased), lerp(from[1], to[1], eased)],
        }));

        if (t < 1) {
          animationFrameRef.current = requestAnimationFrame(animate);
        } else {
          animStartRef.current = 0;
        }
      };

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      animStartRef.current = 0;
      animationFrameRef.current = requestAnimationFrame(animate);
    },
    [],
  );

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (userPanTimeoutRef.current) clearTimeout(userPanTimeoutRef.current);
    };
  }, []);

  const handleRegionIsChanging = useCallback(
    (event: any) => {
      if (event?.properties?.isUserInteraction) {
        userPannedRef.current = true;

        if (userPanTimeoutRef.current) {
          clearTimeout(userPanTimeoutRef.current);
        }

        userPanTimeoutRef.current = setTimeout(() => {
          userPannedRef.current = false;
          userPanTimeoutRef.current = null;

          if (markers.length > 0 && cameraRef.current) {
            cameraRef.current.flyTo(markers[0].coordinate, 1000);
          }
        }, USER_PAN_TIMEOUT);
      }
    },
    [markers],
  );

  const animatedMarkers = markers.map((marker) => ({
    ...marker,
    coordinate: animatedCoords[marker.id] || marker.coordinate,
  }));

  return (
    <View style={styles.container}>
      <MapLibreGL.MapView
        ref={mapRef}
        style={styles.map}
        mapStyle={LIGHT_STYLE_URL}
        onRegionIsChanging={handleRegionIsChanging}
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
        {animatedMarkers.map((marker) => (
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
