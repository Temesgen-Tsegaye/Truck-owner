import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Pressable,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/context/theme-context';
import { Colors } from '@/constants/theme';
import { api } from '@/lib/api';
import { useSocket } from '@/context/socket-context';
import { MapComponent } from '@/components/map/MapComponent';

interface ShipmentDetails {
  id: string;
  status: string;
  load: {
    id: string;
    productType: string;
    quantity: number;
    origin: string;
    destination: string;
    deliveryDate: string;
    merchant: {
      id: string;
      user: {
        firstName: string | null;
        lastName: string | null;
        phoneNumber: string | null;
      };
    };
  };
  vehicle: {
    id: string;
    licensePlate: string;
    vehicleType: string;
    vehicleOwner: {
      id: string;
      user: {
        firstName: string | null;
        lastName: string | null;
        phoneNumber: string | null;
      };
    };
  };
  assignedDriverId: string | null;
  locationUpdates?: {
    latitude: number;
    longitude: number;
    timestamp: string;
  }[];
}

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
  const { isDarkMode } = useAppTheme();
  const theme = Colors[isDarkMode ? 'dark' : 'light'];
  const { socket, joinShipmentRoom, leaveShipmentRoom } = useSocket();

  const [shipment, setShipment] = useState<ShipmentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [driverLocation, setDriverLocation] = useState<[number, number] | null>(null);
  const [locationUpdates, setLocationUpdates] = useState<LocationUpdate[]>([]);

  const fetchShipmentDetails = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/shipments/${id}`);
      setShipment(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load shipment details');
      Alert.alert('Error', 'Failed to load shipment details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchShipmentDetails();
  }, [fetchShipmentDetails]);

  useEffect(() => {
    if (shipment?.locationUpdates && shipment.locationUpdates.length > 0) {
      const latest = shipment.locationUpdates[0];
      console.log('[ShipmentDetail] Setting initial location from DB:', latest);
      setDriverLocation([latest.longitude, latest.latitude]);
    }
  }, [shipment]);

  useEffect(() => {
    return () => {
      if (id) {
        leaveShipmentRoom(id);
      }
    };
  }, [id, fetchShipmentDetails, leaveShipmentRoom]);

  useEffect(() => {
    if (id && socket) {
      joinShipmentRoom(id);

      const handleLocationUpdate = (data: LocationUpdate) => {
        console.log('Received location update from driver:', data);
        setDriverLocation([data.longitude, data.latitude]);
        setLocationUpdates(prev => [...prev, data]);
      };

      socket.on('location_update', handleLocationUpdate);

      return () => {
        socket.off('location_update', handleLocationUpdate);
      };
    }
  }, [id, socket, joinShipmentRoom]);



  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.tint} />
      </View>
    );
  }

  if (error || !shipment) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.errorText, { color: theme.text }]}>{error || 'Shipment not found'}</Text>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={{ color: theme.tint }}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const mapCenter = driverLocation || [38.7578, 9.0320]; // Addis Ababa
  const markers = driverLocation ? [{
    id: 'driver',
    coordinate: driverLocation,
    title: 'Driver Location',
    description: 'Real-time tracking',
  }] : [];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </Pressable>
        <Text style={[styles.title, { color: theme.text }]}>Shipment #{shipment.id.slice(-6)}</Text>
        <View style={styles.statusBadge}>
          <Text style={[styles.statusText, { color: theme.tint }]}>{shipment.status}</Text>
        </View>
      </View>

      {/* Map Section */}
      <View style={styles.mapContainer}>
        <MapComponent
          center={mapCenter}
          zoom={driverLocation ? 14 : 10}
          markers={markers}
          style={styles.map}
        />


      </View>


    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  trackingStatus: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  trackingStatusInline: {
    marginBottom: 16,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  detailsCard: {
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  historyCard: {
    margin: 16,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  historyText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
  },
  historyTime: {
    fontSize: 12,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 100,
    marginBottom: 20,
  },
});