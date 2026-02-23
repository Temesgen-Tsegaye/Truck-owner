import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
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

  useEffect(() => {
    fetchShipmentDetails();

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
        console.log('Received location update from driver:', data);
        setDriverLocation([data.longitude, data.latitude]);
        setLocationUpdates(prev => [...prev, data]);
      };
      
      socket.on('location_update', handleLocationUpdate);
      
      return () => {
        socket.off('location_update', handleLocationUpdate);
      };
    }
  }, [id, socket]);

  const fetchShipmentDetails = async () => {
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
  };

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

  const mapCenter = driverLocation || [9.145, 40.4897]; // Default to Ethiopia center
  const markers = driverLocation ? [{
    id: 'driver',
    coordinate: driverLocation,
    title: 'Driver Location',
    description: 'Real-time tracking',
  }] : [];

  const latestUpdate = locationUpdates[locationUpdates.length - 1];

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
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
          initialCenter={mapCenter}
          initialZoom={driverLocation ? 14 : 10}
          markers={markers}
          style={styles.map}
        />
        
        {/* Tracking Status */}
        <View style={styles.trackingStatus}>
          {driverLocation ? (
            <View style={[styles.statusIndicator, { backgroundColor: theme.tint + '20' }]}>
              <Ionicons name="radio-button-on" size={16} color={theme.tint} />
              <Text style={[styles.statusText, { color: theme.tint, marginLeft: 8 }]}>
                Driver location: {latestUpdate ? new Date(latestUpdate.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Live'}
              </Text>
            </View>
          ) : (
            <View style={[styles.statusIndicator, { backgroundColor: theme.icon + '20' }]}>
              <Ionicons name="radio-button-off" size={16} color={theme.icon} />
              <Text style={[styles.statusText, { color: theme.icon, marginLeft: 8 }]}>
                Waiting for driver location
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Shipment Details */}
      <View style={[styles.detailsCard, { backgroundColor: isDarkMode ? '#1e1e1e' : '#fff' }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Load Details</Text>
        
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: theme.icon }]}>Product</Text>
          <Text style={[styles.detailValue, { color: theme.text }]}>{shipment.load.productType}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: theme.icon }]}>Quantity</Text>
          <Text style={[styles.detailValue, { color: theme.text }]}>{shipment.load.quantity} units</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: theme.icon }]}>Route</Text>
          <Text style={[styles.detailValue, { color: theme.text }]}>{shipment.load.origin} → {shipment.load.destination}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: theme.icon }]}>Delivery Date</Text>
          <Text style={[styles.detailValue, { color: theme.text }]}>
            {new Date(shipment.load.deliveryDate).toLocaleDateString()}
          </Text>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 20 }]}>Vehicle Details</Text>
        
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: theme.icon }]}>License Plate</Text>
          <Text style={[styles.detailValue, { color: theme.text }]}>{shipment.vehicle.licensePlate}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: theme.icon }]}>Vehicle Type</Text>
          <Text style={[styles.detailValue, { color: theme.text }]}>{shipment.vehicle.vehicleType}</Text>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 20 }]}>Driver Information</Text>
        
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: theme.icon }]}>Driver Status</Text>
          <Text style={[styles.detailValue, { color: theme.text }]}>
            {shipment.assignedDriverId ? 'Assigned' : 'Not Assigned'}
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: theme.icon }]}>Tracking Status</Text>
          <Text style={[styles.detailValue, { color: theme.text }]}>
            {driverLocation ? 'Active' : 'Inactive'}
          </Text>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 20 }]}>Consignor Information</Text>
        
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: theme.icon }]}>Name</Text>
          <Text style={[styles.detailValue, { color: theme.text }]}>
            {shipment.load.merchant.user.firstName} {shipment.load.merchant.user.lastName}
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: theme.icon }]}>Phone</Text>
          <Text style={[styles.detailValue, { color: theme.text }]}>
            {shipment.load.merchant.user.phoneNumber || 'N/A'}
          </Text>
        </View>
      </View>

      {/* Location Updates History */}
      {locationUpdates.length > 0 && (
        <View style={[styles.historyCard, { backgroundColor: isDarkMode ? '#1e1e1e' : '#fff' }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Location History ({locationUpdates.length} updates)
          </Text>
          {locationUpdates.slice(-5).reverse().map((update, index) => (
            <View key={index} style={styles.historyItem}>
              <Ionicons name="location" size={16} color={theme.tint} />
              <Text style={[styles.historyText, { color: theme.text }]}>
                {update.latitude.toFixed(5)}, {update.longitude.toFixed(5)}
              </Text>
              <Text style={[styles.historyTime, { color: theme.icon }]}>
                {new Date(update.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
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
    height: 300,
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