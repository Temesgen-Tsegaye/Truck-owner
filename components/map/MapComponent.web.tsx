import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
// @ts-ignore
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

export interface MapComponentProps {
  followCenter?: boolean;
  showCompass?: boolean;
}

const DEFAULT_CENTER: [number, number] = [38.7578, 9.0320];
const DEFAULT_ZOOM = 10;
const LIGHT_STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty';

const MapComponent: React.FC<MapComponentProps> = ({
  followCenter = false,
  showCompass = false,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapArr = useRef<maplibregl.Map | null>(null);
  const [isFollowingCenter, setIsFollowingCenter] = useState(followCenter);

  useEffect(() => {
    if (followCenter) {
      setIsFollowingCenter(true);
    }
  }, [followCenter]);

  useEffect(() => {
    if (!mapContainer.current) return;

    mapArr.current = new maplibregl.Map({
      container: mapContainer.current,
      style: LIGHT_STYLE_URL,
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      attributionControl: true,
    });

    if (showCompass) {
      mapArr.current.addControl(
        new maplibregl.NavigationControl({
          showCompass: true,
          showZoom: false,
          visualizePitch: true,
        }),
        'top-right'
      );
    }

    const handleUserInteraction = () => {
      if (followCenter) {
        setIsFollowingCenter(false);
      }
    };

    mapArr.current.on('dragstart', handleUserInteraction);
    mapArr.current.on('zoomstart', handleUserInteraction);

    return () => {
      mapArr.current?.remove();
    };
  }, [showCompass]);

  return (
    <View style={styles.container}>
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default MapComponent;
