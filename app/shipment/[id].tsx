import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MapComponent } from '@/components/map';
import { useSocket } from '@/context/socket-context';
import { useAppTheme } from '@/context/theme-context';
import { Colors } from '@/constants/theme';
import { useShipmentQuery } from '@/query/shipments';

interface LocationUpdate {
  shipmentId: string;
  driverId: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: string;
}

export default function ShipmentDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { socket, joinShipmentRoom, leaveShipmentRoom } = useSocket();
  const { data: shipment, isLoading, error } = useShipmentQuery(id);
  const [driverLocation, setDriverLocation] = useState<[number, number] | null>(null);
  const { isDarkMode } = useAppTheme();
  const theme = Colors[isDarkMode ? "dark" : "light"];

  useEffect(() => {
    if (shipment?.locationUpdates && shipment.locationUpdates.length > 0) {
      const latest = shipment.locationUpdates[0];
      setDriverLocation([latest.longitude, latest.latitude]);
    }
  }, [shipment]);

  useEffect(() => {
    return () => {
      if (id) {
        leaveShipmentRoom(id);
      }
    };
  }, [id]);

  useEffect(() => {
    if (id && socket) {
      joinShipmentRoom(id);

      const handleLocationUpdate = (data: LocationUpdate) => {
        setDriverLocation([data.longitude, data.latitude]);
      };

      socket.on('location_update', handleLocationUpdate);

      return () => {
        socket.off('location_update', handleLocationUpdate);
      };
    }
  }, [id, socket]);

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <StatusBar style={isDarkMode ? "light" : "dark"} />
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (error || !shipment) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <StatusBar style={isDarkMode ? "light" : "dark"} />
        <Text style={[styles.errorText, { color: theme.text }]}>
          {error instanceof Error ? error.message : 'Shipment not found'}
        </Text>
        <Pressable onPress={() => router.back()} style={[styles.errorBackButton, { backgroundColor: theme.primary }]}>
          <Text style={[styles.errorBackLabel, { color: theme.textOnPrimary }]}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const markers = driverLocation
    ? [
        {
          id: 'driver',
          coordinate: driverLocation,
          title: 'Driver Location',
          description: 'Real-time tracking',
        },
      ]
    : [];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      <MapComponent
        followCenter={Boolean(driverLocation)}
        markers={markers}
        showCompass
        compassMargins={{ x: 16, y: insets.top + 10 }}
      />

      <View style={[styles.overlayRow, { top: insets.top + 10 }]}>
        <Pressable onPress={() => router.back()} style={[styles.backButton, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', borderColor: theme.border }]}>
          <Ionicons name="chevron-back" size={20} color={theme.text} />
        </Pressable>

        <View style={styles.titleWrap}>
          <Text style={[styles.identifierText, { color: theme.text }]}>Shipment #{shipment.id.slice(-6)}</Text>
        </View>

        <View style={styles.rightSpacer} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  overlayRow: {
    position: 'absolute',
    left: 16,
    right: 16,
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    height: 46,
    width: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  rightSpacer: {
    width: 46,
    height: 46,
  },
  identifierText: {
    fontSize: 15,
    fontWeight: '700',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  errorBackButton: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 999,
  },
  errorBackLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
});
