import React, { useEffect, useState } from "react";
import { View, StyleSheet, SafeAreaView, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { MapComponent } from "@/components/map/MapComponent";
import { useSocket } from "@/context/socket-context";
import { useShipmentQuery } from "@/query/shipments";

export default function TrackShipmentPage() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const shipmentId = Array.isArray(id) ? id[0] : id;
  const { socket, joinShipmentRoom, leaveShipmentRoom } = useSocket();
  const [driverLocation, setDriverLocation] = useState<[number, number] | null>(null);

  // Fetch initial shipment data to get the latest known location
  const { data: shipment, isLoading: isShipmentLoading } = useShipmentQuery(shipmentId);

  useEffect(() => {
    if (shipment?.locationUpdates && shipment.locationUpdates.length > 0) {
      const latestLocation = shipment.locationUpdates[0];
      console.log(`[Track] Setting initial location from DB:`, [latestLocation.longitude, latestLocation.latitude]);
      setDriverLocation([latestLocation.longitude, latestLocation.latitude]);
    }
  }, [shipment]);

  const handleBack = () => {
    router.back();
  };

  useEffect(() => {
    if (shipmentId) {
      console.log(`[Truck-owner Track] Joining shipment room: ${shipmentId}, socket:`, socket?.id);
      joinShipmentRoom(shipmentId);

      const handleLocationUpdate = (data: { shipmentId: string; latitude: number; longitude: number }) => {
        console.log(`[Truck-owner Track] Received location update for shipment ${data.shipmentId}:`, data);
        if (data.shipmentId === shipmentId) {
          console.log(`[Truck-owner Track] Setting driver location:`, [data.longitude, data.latitude]);
          setDriverLocation([data.longitude, data.latitude]);
        }
      };

      socket?.on('location_update', handleLocationUpdate);
      console.log(`[Truck-owner Track] Listening for location_update events`);

      return () => {
        console.log(`[Truck-owner Track] Leaving shipment room: ${shipmentId}`);
        leaveShipmentRoom(shipmentId);
        socket?.off('location_update', handleLocationUpdate);
      };
    }
  }, [shipmentId, socket]);

  const markers = driverLocation ? [{
    id: 'driver',
    coordinate: driverLocation,
    title: 'Driver Location',
    description: 'Current position of the truck'
  }] : [];

  if (isShipmentLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Track Shipment</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={{ marginTop: 12, color: "#6B7280" }}>Loading shipment data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!shipment && !isShipmentLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Track Shipment</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={{ color: "#EF4444" }}>Shipment not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Simple header with back button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Track Shipment</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Map takes full screen */}
      <MapComponent
        center={driverLocation || [38.7578, 9.0320]} // Center on driver if available
        zoom={driverLocation ? 15 : 12}
        markers={markers}
        style={styles.map}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  headerRight: {
    width: 32,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

});