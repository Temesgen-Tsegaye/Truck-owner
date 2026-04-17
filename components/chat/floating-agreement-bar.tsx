import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from 'expo-blur';

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
      <BlurView intensity={20} tint="dark" style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading agreement status...</Text>
        </View>
      </BlurView>
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
    <BlurView intensity={25} tint="dark" style={styles.container}>
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
              color={otherPartyAgreed ? "#10B981" : "rgba(255,255,255,0.4)"} 
            />
            <Text style={[
              styles.statusText,
              { color: otherPartyAgreed ? "#10B981" : "rgba(255,255,255,0.4)" }
            ]}>
              {otherPartyAgreed ? "Agreed" : "Not Agreed"}
            </Text>
          </View>
        </View>

        {/* Vehicle Info (for Truck Owner) */}
        {isVehicleOwner && agreement.vehicle && (
          <View style={styles.vehicleInfo}>
            <Ionicons name="car-outline" size={14} color="rgba(255,255,255,0.8)" />
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
    </BlurView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 20,
    margin: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    overflow: 'hidden',
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 16,
  },
  loadingText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.6)",
    fontWeight: "500",
  },
  statusBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    flexWrap: "wrap",
    gap: 8,
  },
  statusItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusLabel: {
    fontSize: 13,
    color: "rgba(255,255,255,0.6)",
    fontWeight: "500",
  },
  statusIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusText: {
    fontSize: 13,
    fontWeight: "600",
  },
  vehicleInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.06)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 50,
  },
  vehicleText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "600",
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
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 50,
    minWidth: 90,
    justifyContent: "center",
  },
  notAgreedButton: {
    backgroundColor: "#10B981",
  },
  agreedButton: {
    backgroundColor: "rgba(16, 185, 129, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.4)",
  },
  changeVehicleButton: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  bothAgreedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(139, 92, 246, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(139, 92, 246, 0.4)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 50,
    marginLeft: "auto",
  },
  bothAgreedText: {
    color: "#A78BFA",
    fontSize: 13,
    fontWeight: "600",
  },
});
