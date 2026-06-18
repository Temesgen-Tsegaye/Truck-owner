import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type AgreementStatus = "PENDING" | "AGREED" | "NOT_AGREED";

type Props = {
  agreement: {
    merchantStatus: AgreementStatus;
    vehicleOwnerStatus: AgreementStatus;
    vehicle?: {
      licensePlate: string;
      vehicleType: string;
    };
  } | null;
  userType: "merchant" | "vehicleOwner";
  onAgree: () => void;
  onReject: () => void;
  onChangeVehicle?: () => void;
  isVehicleOwner?: boolean;
  isLoading?: boolean;
};

const statusMeta: Record<AgreementStatus, { icon: any; color: string; label: string }> = {
  PENDING:     { icon: "time-outline", color: "#F59E0B", label: "Pending" },
  AGREED:      { icon: "checkmark-circle", color: "#10B981", label: "Agreed" },
  NOT_AGREED:  { icon: "close-circle", color: "#EF4444", label: "Rejected" },
};

function StatusBadge({ status }: { status: AgreementStatus }) {
  const m = statusMeta[status];
  return (
    <View style={[styles.statusBadge, { borderColor: m.color }]}>
      <Ionicons name={m.icon} size={14} color={m.color} />
      <Text style={[styles.statusBadgeText, { color: m.color }]}>{m.label}</Text>
    </View>
  );
}

export function FloatingAgreementBar({
  agreement,
  userType,
  onAgree,
  onReject,
  onChangeVehicle,
  isVehicleOwner = false,
  isLoading = false,
}: Props) {
  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading agreement...</Text>
      </View>
    );
  }

  if (!agreement) return null;

  const isMerchant = userType === "merchant";
  const myStatus = isMerchant ? agreement.merchantStatus : agreement.vehicleOwnerStatus;
  const theirStatus = isMerchant ? agreement.vehicleOwnerStatus : agreement.merchantStatus;
  const theirLabel = isMerchant ? "Truck Owner" : "Merchant";
  const bothAgreed = agreement.merchantStatus === "AGREED" && agreement.vehicleOwnerStatus === "AGREED";
  const canAct = myStatus === "PENDING";

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.parties}>
          <View style={styles.party}>
            <Text style={styles.partyLabel}>You</Text>
            <StatusBadge status={myStatus} />
          </View>
          <View style={styles.party}>
            <Text style={styles.partyLabel}>{theirLabel}</Text>
            <StatusBadge status={theirStatus} />
          </View>
        </View>
        {agreement.vehicle && (
          <View style={styles.vehicleChip}>
            <Ionicons name="car-outline" size={13} color="#8c8c8c" />
            <Text style={styles.vehicleChipText}>{agreement.vehicle.licensePlate}</Text>
          </View>
        )}
      </View>

      {!bothAgreed && (
        <View style={styles.actionRow}>
          {canAct ? (
            <>
              <Pressable onPress={onAgree} style={[styles.btn, styles.agreeBtn]}>
                <Ionicons name="checkmark" size={15} color="#fff" />
                <Text style={styles.btnText}>Agree</Text>
              </Pressable>
              <Pressable onPress={onReject} style={[styles.btn, styles.rejectBtn]}>
                <Ionicons name="close" size={15} color="#fff" />
                <Text style={styles.btnText}>Reject</Text>
              </Pressable>
            </>
          ) : (
            <Pressable
              onPress={onAgree}
              style={[styles.btn, myStatus === "AGREED" ? styles.agreedOutlineBtn : styles.rejectedOutlineBtn]}
            >
              <Ionicons
                name="swap-horizontal"
                size={14}
                color={myStatus === "AGREED" ? "#10B981" : "#EF4444"}
              />
              <Text style={[styles.btnText, { color: myStatus === "AGREED" ? "#10B981" : "#EF4444" }]}>
                Change
              </Text>
            </Pressable>
          )}
          {isVehicleOwner && myStatus === "AGREED" && onChangeVehicle && (
            <Pressable onPress={onChangeVehicle} style={[styles.btn, styles.vehicleBtn]}>
              <Ionicons name="car-outline" size={14} color="#8c8c8c" />
              <Text style={[styles.btnText, { color: "#8c8c8c" }]}>Vehicle</Text>
            </Pressable>
          )}
        </View>
      )}

      {bothAgreed && (
        <View style={styles.shippedBanner}>
          <Ionicons name="checkmark-done-circle" size={16} color="#10B981" />
          <Text style={styles.shippedBannerText}>Shipment created!</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 14,
    marginHorizontal: 12,
    marginBottom: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
  },
  loadingText: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 13,
    textAlign: "center",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  parties: {
    flexDirection: "row",
    gap: 16,
  },
  party: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  partyLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.5)",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  vehicleChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.06)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  vehicleChipText: {
    fontSize: 11,
    color: "rgba(255,255,255,0.6)",
  },
  actionRow: {
    flexDirection: "row",
    gap: 8,
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  agreeBtn: {
    backgroundColor: "#10B981",
  },
  rejectBtn: {
    backgroundColor: "rgba(239, 68, 68, 0.7)",
  },
  agreedOutlineBtn: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.3)",
  },
  rejectedOutlineBtn: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
  },
  vehicleBtn: {
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  btnText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  shippedBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: "flex-start",
  },
  shippedBannerText: {
    color: "#10B981",
    fontSize: 12,
    fontWeight: "700",
  },
});
