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
import { useLocalSocket } from '@/hooks/use-local-socket';
import { useShipmentQuery } from '@/query/shipments';

const SOCKET_STALE_MS = 20000;
const SERVER_FALLBACK_INTERVAL_MS = 10000;

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
  const { socket, isConnected } = useLocalSocket();
  const { data: shipment, isLoading, error, refetch } = useShipmentQuery(id);
  const [driverLocation, setDriverLocation] = useState<[number, number] | null>(null);
  const [lastSocketUpdateAt, setLastSocketUpdateAt] = useState<number | null>(null);

  useEffect(() => {
    if (!isConnected && shipment?.locationUpdates?.length) {
      const latest = shipment.locationUpdates[0];
      setDriverLocation([latest.longitude, latest.latitude]);
    }
  }, [shipment, isConnected]);

  useEffect(() => {
    if (!id || !socket) {
      return;
    }

    socket.emit('join_shipment_room', { shipmentId: id });

    const handleLocationUpdate = (data: LocationUpdate) => {
      setDriverLocation([data.longitude, data.latitude]);
      setLastSocketUpdateAt(Date.now());
    };

    socket.on('location_update', handleLocationUpdate);

    return () => {
      socket.off('location_update', handleLocationUpdate);
      socket.emit('leave_shipment_room', { shipmentId: id });
    };
  }, [id, socket]);

  useEffect(() => {
    if (!id) {
      return;
    }

    const fetchLatestLocationFromServer = async () => {
      const now = Date.now();
      const isSocketStale = !lastSocketUpdateAt || now - lastSocketUpdateAt > SOCKET_STALE_MS;
      const shouldFallbackToServer = !isConnected || isSocketStale;

      if (!shouldFallbackToServer) {
        return;
      }

      try {
        const result = await refetch();
        const latest = result.data?.locationUpdates?.[0];

        if (!latest) {
          return;
        }

        setDriverLocation((current) => {
          const hasFreshSocketData =
            !!lastSocketUpdateAt && Date.now() - lastSocketUpdateAt <= SOCKET_STALE_MS;

          if (hasFreshSocketData) {
            return current;
          }

          return [latest.longitude, latest.latitude];
        });
      } catch (fetchError) {
        console.log('[ShipmentDetail] Failed to fetch fallback location:', fetchError);
      }
    };

    fetchLatestLocationFromServer();
    const fallbackInterval = setInterval(fetchLatestLocationFromServer, SERVER_FALLBACK_INTERVAL_MS);

    return () => {
      clearInterval(fallbackInterval);
    };
  }, [id, isConnected, lastSocketUpdateAt, refetch]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" color="#ff642f" />
      </View>
    );
  }

  if (error || !shipment) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style="light" />
        <Text style={styles.errorText}>
          {error instanceof Error ? error.message : 'Shipment not found'}
        </Text>
        <Pressable onPress={() => router.back()} style={styles.errorBackButton}>
          <Text style={styles.errorBackLabel}>Go Back</Text>
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
    <View style={styles.container}>
      <StatusBar style="light" />
      <MapComponent
        followCenter={Boolean(driverLocation)}
        markers={markers}
        showCompass
        compassMargins={{ x: 16, y: insets.top + 10 }}
      />

      <View style={[styles.overlayRow, { top: insets.top + 10 }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={20} color="#fff" />
        </Pressable>

        <View style={styles.titleWrap}>
          <Text style={styles.identifierText}>Shipment #{shipment.id.slice(-6)}</Text>
        </View>

        <View style={styles.rightSpacer} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#161412',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#161412',
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
    backgroundColor: 'rgba(28, 24, 21, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  backButtonLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
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
    color: '#000',
  },
  errorText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  errorBackButton: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: '#ff642f',
  },
  errorBackLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
});
