import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ShipmentItem } from "@/query/shipments";
import { CustomButton } from "@/components/global/button";

type Props = {
  shipment: ShipmentItem;
  onPress?: () => void;
  onTrack?: () => void;
};

export function ShipmentCard({ shipment, onPress, onTrack }: Props) {
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768;
  const lowerStatus = shipment.status.toLowerCase();
  const isActive = ["accepted", "in_progress", "in transit", "in_transit"].includes(lowerStatus);

  const getStatusConfig = (status: string) => {
    const lowerStatus = status.toLowerCase();

    if (["pending", "created"].includes(lowerStatus)) {
      return {
        color: "#F59E0B",
        icon: "time-outline",
        label: "Pending",
        bgColor: "#FEF3C7"
      };
    }
    if (["accepted", "in_progress", "in transit"].includes(lowerStatus)) {
      return {
        color: "#3B82F6",
        icon: "car-outline",
        label: "In Transit",
        bgColor: "#DBEAFE"
      };
    }
    if (["completed", "delivered"].includes(lowerStatus)) {
      return {
        color: "#10B981",
        icon: "checkmark-circle-outline",
        label: "Delivered",
        bgColor: "#D1FAE5"
      };
    }
    if (["cancelled", "rejected"].includes(lowerStatus)) {
      return {
        color: "#EF4444",
        icon: "close-circle-outline",
        label: "Cancelled",
        bgColor: "#FEE2E2"
      };
    }

    return {
      color: "#6B7280",
      icon: "help-circle-outline",
      label: status,
      bgColor: "#F3F4F6"
    };
  };

  const statusConfig = getStatusConfig(shipment.status);
  const deliveryDate = new Date(shipment.load.deliveryDate);
  const isPastDue = deliveryDate < new Date() && !["completed", "delivered", "cancelled"].includes(shipment.status.toLowerCase());

  return (
    <TouchableOpacity
      style={[styles.card, { padding: isLargeScreen ? 24 : 16 }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Status badge */}
      <View style={styles.header}>
        <View style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor }]}>
          <Ionicons name={statusConfig.icon as any} size={12} color={statusConfig.color} />
          <Text style={[styles.statusText, { color: statusConfig.color }]}>
            {statusConfig.label}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      </View>

      {/* Route information */}
      <View style={styles.routeContainer}>
        <Text style={styles.placeText}>{shipment.load.origin}</Text>
        <Text style={styles.routeArrow}>→</Text>
        <Text style={styles.placeText}>{shipment.load.destination}</Text>
      </View>

      {/* Details grid */}
      <View style={styles.detailsGrid}>
        <View style={styles.detailItem}>
          <Ionicons name="calendar-outline" size={16} color="#6B7280" />
          <Text style={styles.detailLabel}>Delivery</Text>
          <Text style={[
            styles.detailValue,
            isPastDue && styles.pastDueText
          ]}>
            {deliveryDate.toLocaleDateString()}
            {isPastDue && " ⚠️"}
          </Text>
        </View>

        {shipment.vehicle && (
          <View style={styles.detailItem}>
            <Ionicons name="car-outline" size={16} color="#6B7280" />
            <Text style={styles.detailLabel}>Vehicle</Text>
            <Text style={styles.detailValue}>
              {shipment.vehicle.licensePlate}
            </Text>
          </View>
        )}

        {shipment.load.weight && (
          <View style={styles.detailItem}>
            <Ionicons name="scale-outline" size={16} color="#6B7280" />
            <Text style={styles.detailLabel}>Weight</Text>
            <Text style={styles.detailValue}>{shipment.load.weight} kg</Text>
          </View>
        )}
      </View>



      {/* Footer with timestamp */}
      <View style={styles.footer}>
        <Text style={styles.timestamp}>
          Created {new Date(shipment.createdAt).toLocaleDateString()}
        </Text>
        {shipment.driver && (
          <Text style={styles.driverText}>
            Driver: {shipment.driver.user.firstName || "Assigned"}
          </Text>
        )}
      </View>

      {isActive && onTrack && (
        <CustomButton
          title="Track Shipment"
          onPress={onTrack}
          style={styles.trackButton}
        />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  routeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    padding: 12,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    gap: 8,
  },
  placeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  routeArrow: {
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "600",
  },
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 16,
  },
  detailItem: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 10,
    gap: 4,
  },
  detailLabel: {
    fontSize: 11,
    color: "#6B7280",
    textTransform: "uppercase",
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  pastDueText: {
    color: "#DC2626",
  },

  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  timestamp: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  driverText: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  trackButton: {
    marginTop: 16,
  },
});