import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  agreement: {
    merchantAgreed: boolean;
    vehicleOwnerAgreed: boolean;
    vehicleId?: string;
    vehicle?: {
      licensePlate: string;
      vehicleType: string;
    };
  } | null;
  userType: "merchant" | "vehicleOwner";
  onToggleAgreement: () => void;
  onChangeVehicle?: () => void;
  isVehicleOwner?: boolean;
  isLoading?: boolean;
};

export function FloatingAgreementBar({ 
  agreement, 
  userType, 
  onToggleAgreement,
  onChangeVehicle,
  isVehicleOwner = false,
  isLoading = false
}: Props) {
  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading agreement status...</Text>
        </View>
      </View>
    );
  }

  if (!agreement) {
    return null;
  }

  const isMerchant = userType === "merchant";
  const currentUserAgreed = isMerchant ? agreement.merchantAgreed : agreement.vehicleOwnerAgreed;
  const otherPartyAgreed = isMerchant ? agreement.vehicleOwnerAgreed : agreement.merchantAgreed;
  const otherPartyLabel = isMerchant ? "Vehicle Owner" : "Merchant";
  
  // Determine if both parties have agreed
  const bothAgreed = agreement.merchantAgreed && agreement.vehicleOwnerAgreed;

  return (
    <View style={styles.container}>
      {/* Status Bar */}
      <View style={styles.statusBar}>
        {/* Current User Status */}
        <View style={styles.statusItem}>
          <Text style={styles.statusLabel}>You:</Text>
          <View style={styles.statusIndicator}>
            <Ionicons 
              name={currentUserAgreed ? "checkmark-circle" : "close-circle"} 
              size={16} 
              color={currentUserAgreed ? "#10B981" : "#EF4444"} 
            />
            <Text style={[
              styles.statusText,
              { color: currentUserAgreed ? "#10B981" : "#EF4444" }
            ]}>
              {currentUserAgreed ? "Agreed" : "Not Agreed"}
            </Text>
          </View>
        </View>

        {/* Other Party Status */}
        <View style={styles.statusItem}>
          <Text style={styles.statusLabel}>{otherPartyLabel}:</Text>
          <View style={styles.statusIndicator}>
            <Ionicons 
              name={otherPartyAgreed ? "checkmark-circle" : "close-circle"} 
              size={16} 
              color={otherPartyAgreed ? "#10B981" : "#6B7280"} 
            />
            <Text style={[
              styles.statusText,
              { color: otherPartyAgreed ? "#10B981" : "#6B7280" }
            ]}>
              {otherPartyAgreed ? "Agreed" : "Not Agreed"}
            </Text>
          </View>
        </View>

        {/* Vehicle Info (for Truck Owner) */}
        {isVehicleOwner && agreement.vehicle && (
          <View style={styles.vehicleInfo}>
            <Ionicons name="car-outline" size={14} color="#4B5563" />
            <Text style={styles.vehicleText}>
              {agreement.vehicle.licensePlate} • {agreement.vehicle.vehicleType}
            </Text>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionBar}>
        {/* Toggle Agreement Button */}
        <Pressable
          onPress={onToggleAgreement}
          style={[
            styles.actionButton,
            currentUserAgreed ? styles.agreedButton : styles.notAgreedButton
          ]}
        >
          <Ionicons 
            name={currentUserAgreed ? "checkmark" : "hand-right"} 
            size={16} 
            color="#FFFFFF" 
          />
          <Text style={styles.actionButtonText}>
            {currentUserAgreed ? "Agreed" : "Agree"}
          </Text>
        </Pressable>

        {/* Change Vehicle Button (for Truck Owner when agreed) */}
        {isVehicleOwner && currentUserAgreed && onChangeVehicle && (
          <Pressable
            onPress={onChangeVehicle}
            style={[styles.actionButton, styles.changeVehicleButton]}
          >
            <Ionicons name="swap-horizontal" size={16} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Change Vehicle</Text>
          </Pressable>
        )}

        {/* Both Agreed Status */}
        {bothAgreed && (
          <View style={styles.bothAgreedBadge}>
            <Ionicons name="checkmark-done" size={16} color="#FFFFFF" />
            <Text style={styles.bothAgreedText}>Ready to Ship!</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    margin: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 16,
  },
  loadingText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  statusBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    flexWrap: "wrap",
    gap: 8,
  },
  statusItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusLabel: {
    fontSize: 12,
    color: "#4B5563",
    fontWeight: "500",
  },
  statusIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  vehicleInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  vehicleText: {
    fontSize: 11,
    color: "#4B5563",
    fontWeight: "500",
  },
  actionBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 80,
    justifyContent: "center",
  },
  notAgreedButton: {
    backgroundColor: "#10B981",
  },
  agreedButton: {
    backgroundColor: "#059669",
  },
  changeVehicleButton: {
    backgroundColor: "#3B82F6",
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  bothAgreedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#8B5CF6",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: "auto",
  },
  bothAgreedText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
});