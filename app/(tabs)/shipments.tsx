import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
} from "react-native";
import { useShipmentsQuery, ShipmentItem } from "@/query/shipments";
import { useRouter } from "expo-router";
import { useAppTheme } from "@/context/theme-context";
import { Colors } from "@/constants/theme";
import { Skeleton } from "@/components/global/skeleton";
import { ShipmentCard } from "@/components/shipments/shipment-card";

export default function Shipments() {
  const { data: shipments, isLoading, error } = useShipmentsQuery();
  const router = useRouter();
  const { isDarkMode } = useAppTheme();
  const theme = Colors[isDarkMode ? "dark" : "light"];

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <FlatList
          data={[1, 2, 3, 4]}
          keyExtractor={(item) => item.toString()}
          contentContainerStyle={{ padding: 15 }}
          renderItem={() => (
            <View style={[styles.card, { backgroundColor: isDarkMode ? "#1e1e1e" : "#fff", height: 120 }]}>
              <Skeleton width="60%" height={20} style={{ marginBottom: 10 }} />
              <Skeleton width="40%" height={15} style={{ marginBottom: 10 }} />
              <Skeleton width="30%" height={15} />
            </View>
          )}
        />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.emptyContainer}>
          <Text style={[styles.subtitle, { color: theme.text }]}>
            Failed to load shipments. Please try again.
          </Text>
        </View>
      </View>
    );
  }

  const shipmentList = shipments || [];

  const renderShipmentItem = ({ item }: { item: ShipmentItem }) => {
    return (
      <ShipmentCard
        shipment={item}
        onPress={() => router.push(`/shipment/${item.id}`)}
        onTrack={() => router.push(`/shipment/track/${item.id}`)}
      />
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        data={shipmentList}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 15, paddingBottom: 100 }}
        renderItem={renderShipmentItem}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.subtitle, { color: theme.text }]}>
              No shipments found.
            </Text>
          </View>
        }
      />
    </View>
  );
}

function getStatusColor(status: string, isDarkMode: boolean): string {
  switch (status.toLowerCase()) {
    case "pending":
    case "created":
      return "#F59E0B"; // Amber
    case "accepted":
    case "in_progress":
    case "in transit":
      return "#3B82F6"; // Blue
    case "completed":
    case "delivered":
      return "#10B981"; // Green
    case "cancelled":
    case "rejected":
      return "#EF4444"; // Red
    default:
      return isDarkMode ? "#9CA3AF" : "#6B7280";
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 50,
    padding: 20,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
  },
  card: {
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  status: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 2,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  infoText: {
    fontSize: 14,
    marginLeft: 8,
  },
});