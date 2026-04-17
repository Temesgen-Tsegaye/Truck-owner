import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { ShipmentItem } from "@/query/shipments";
import { useAppTheme } from "@/context/theme-context";
import { Colors, Fonts } from "@/constants/theme";

type Props = {
  shipment: ShipmentItem;
  onPress?: () => void;
};

export function ShipmentCard({ shipment, onPress }: Props) {
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768;
  const { isDarkMode } = useAppTheme();
  const theme = Colors[isDarkMode ? "dark" : "light"];

  const getStatusConfig = (status: string) => {
    const lowerStatus = status.toLowerCase();

    if (["pending", "created"].includes(lowerStatus)) {
      return {
        color: "#F59E0B",
        icon: "time-outline",
        label: "Pending",
        bgColor: isDarkMode ? "rgba(245, 158, 11, 0.15)" : "#FEF3C7"
      };
    }
    if (["accepted", "in_progress", "in transit"].includes(lowerStatus)) {
      return {
        color: "#3B82F6",
        icon: "car-outline",
        label: "In Transit",
        bgColor: isDarkMode ? "rgba(59, 130, 246, 0.15)" : "#DBEAFE"
      };
    }
    if (["completed", "delivered"].includes(lowerStatus)) {
      return {
        color: "#10B981",
        icon: "checkmark-circle-outline",
        label: "Delivered",
        bgColor: isDarkMode ? "rgba(16, 185, 129, 0.15)" : "#D1FAE5"
      };
    }
    if (["cancelled", "rejected"].includes(lowerStatus)) {
      return {
        color: "#EF4444",
        icon: "close-circle-outline",
        label: "Cancelled",
        bgColor: isDarkMode ? "rgba(239, 68, 68, 0.15)" : "#FEE2E2"
      };
    }

    return {
      color: theme.subtext,
      icon: "help-circle-outline",
      label: status,
      bgColor: isDarkMode ? "rgba(156, 163, 175, 0.15)" : "#F3F4F6"
    };
  };

  const statusConfig = getStatusConfig(shipment.status);
  const deliveryDate = new Date(shipment.load.deliveryDate);
  const isPastDue = deliveryDate < new Date() && !["completed", "delivered", "cancelled"].includes(shipment.status.toLowerCase());

  return (
    <TouchableOpacity
      style={styles.cardShell}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <BlurView intensity={20} tint="dark" style={styles.card}>
        <LinearGradient
          colors={[
            "rgba(74, 63, 57, 0.92)",
            "rgba(54, 48, 44, 0.88)",
            "rgba(42, 36, 33, 0.84)",
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
        <LinearGradient
          pointerEvents="none"
          colors={["rgba(255,255,255,0.12)", "rgba(255,255,255,0.03)", "rgba(255,255,255,0)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={styles.highlightMask}
        />

        <View style={[styles.content, { padding: isLargeScreen ? 24 : 20 }]}>
          <View style={styles.header}>
            <View style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor }] }>
              <Ionicons name={statusConfig.icon as any} size={14} color={statusConfig.color} />
              <Text style={[styles.statusText, { color: statusConfig.color }] }>
                {statusConfig.label}
              </Text>
            </View>
            <View style={styles.idBadge}>
              <Text style={styles.idText}>
                #{shipment.id.slice(-6)}
              </Text>
            </View>
          </View>

          <View style={styles.routeContainer}>
            <View style={styles.routePoint}>
              <View style={[styles.dot, { backgroundColor: '#6fb0ff' }]} />
              <Text style={styles.placeText} numberOfLines={1}>{shipment.load.origin}</Text>
            </View>
            <Ionicons name="arrow-forward" size={16} color="#b9aba3" style={styles.routeArrow} />
            <View style={styles.routePoint}>
              <View style={[styles.dot, { backgroundColor: '#79c79a' }]} />
              <Text style={styles.placeText} numberOfLines={1}>{shipment.load.destination}</Text>
            </View>
          </View>

          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Ionicons name="calendar-outline" size={16} color="#c7b9b0" />
              <View>
                <Text style={styles.detailLabel}>Delivery</Text>
                <Text style={[styles.detailValue, { color: isPastDue ? '#ff8f7a' : '#fff6f0' }] }>
                  {deliveryDate.toLocaleDateString()}
                  {isPastDue && "  late"}
                </Text>
              </View>
            </View>

            {shipment.vehicle && (
              <View style={styles.detailItem}>
                <Ionicons name="car-outline" size={16} color="#c7b9b0" />
                <View>
                  <Text style={styles.detailLabel}>Vehicle</Text>
                  <Text style={styles.detailValue}>
                    {shipment.vehicle.licensePlate}
                  </Text>
                </View>
              </View>
            )}
          </View>

          <View style={styles.footer}>
            <View style={styles.footerLeft}>
              <Ionicons name="cube-outline" size={14} color="#b9aba3" />
              <Text style={styles.footerText}>
                {shipment.load.weight} kg
              </Text>
            </View>
            {shipment.driver ? (
              <View style={styles.footerRight}>
                <Ionicons name="person-outline" size={14} color="#b9aba3" />
                <Text style={styles.footerText}>
                  {shipment.driver.user.firstName || "Assigned"}
                </Text>
              </View>
            ) : (
              <Text style={styles.footerText}>Unassigned</Text>
            )}
          </View>
        </View>
      </BlurView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardShell: {
    borderRadius: 28,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    backgroundColor: 'rgba(62, 53, 48, 0.18)',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 7,
  },
  card: {
    borderRadius: 28,
    overflow: 'hidden',
  },
  highlightMask: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.9,
  },
  content: {
    gap: 0,
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
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    gap: 6,
  },
  statusText: {
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },
  idBadge: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  idText: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: '#d4c7c0',
    letterSpacing: 0.5,
  },
  routeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    padding: 16,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  routePoint: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  placeText: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
    color: '#fff6f0',
    letterSpacing: -0.3,
  },
  routeArrow: {
    marginHorizontal: 8,
    opacity: 0.75,
  },
  detailsGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  detailItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    gap: 10,
  },
  detailLabel: {
    fontFamily: Fonts.medium,
    fontSize: 11,
    color: '#b4a6a0',
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  detailValue: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: '#fff6f0',
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.07)',
  },
  footerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  footerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  footerText: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: '#b9aba3',
  },
});