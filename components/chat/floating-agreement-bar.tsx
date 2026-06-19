import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/context/theme-context";
import { Colors } from "@/constants/theme";

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

function getStatusMeta(status: AgreementStatus, colors: typeof Colors.light) {
  switch (status) {
    case "PENDING":    return { icon: "time-outline", color: colors.statusPending, label: "Pending" };
    case "AGREED":     return { icon: "checkmark-circle", color: colors.statusDelivered, label: "Agreed" };
    case "NOT_AGREED": return { icon: "close-circle", color: colors.statusCancelled, label: "Rejected" };
  }
}

function StatusBadge({ status, colors }: { status: AgreementStatus; colors: typeof Colors.light }) {
  const m = getStatusMeta(status, colors);
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
  const { isDarkMode } = useAppTheme();
  const colors = isDarkMode ? Colors.dark : Colors.light;

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.overlay, borderColor: colors.border }]}>
        <Text style={[styles.loadingText, { color: colors.subtext }]}>Loading agreement...</Text>
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
    <View style={[styles.container, { backgroundColor: colors.overlay, borderColor: colors.border }]}>
      <View style={styles.topRow}>
        <View style={styles.parties}>
          <View style={styles.party}>
            <Text style={[styles.partyLabel, { color: colors.subtext }]}>You</Text>
            <StatusBadge status={myStatus} colors={colors} />
          </View>
          <View style={styles.party}>
            <Text style={[styles.partyLabel, { color: colors.subtext }]}>{theirLabel}</Text>
            <StatusBadge status={theirStatus} colors={colors} />
          </View>
        </View>
        {agreement.vehicle && (
          <View style={[styles.vehicleChip, { backgroundColor: isDarkMode ? "rgba(255,255,255,0.06)" : colors.inputBackground }]}>
            <Ionicons name="car-outline" size={13} color={colors.subtext} />
            <Text style={[styles.vehicleChipText, { color: colors.subtext }]}>{agreement.vehicle.licensePlate}</Text>
          </View>
        )}
      </View>

      {!bothAgreed && (
        <View style={styles.actionRow}>
          {canAct ? (
            <>
              <Pressable onPress={onAgree} style={[styles.btn, { backgroundColor: colors.statusDelivered }]}>
                <Ionicons name="checkmark" size={15} color="#fff" />
                <Text style={styles.btnText}>Agree</Text>
              </Pressable>
              <Pressable onPress={onReject} style={[styles.btn, { backgroundColor: isDarkMode ? "rgba(239, 68, 68, 0.7)" : colors.error }]}>
                <Ionicons name="close" size={15} color="#fff" />
                <Text style={styles.btnText}>Reject</Text>
              </Pressable>
            </>
          ) : (
            <Pressable
              onPress={onAgree}
              style={[styles.btn, {
                backgroundColor: "transparent",
                borderWidth: 1,
                borderColor: myStatus === "AGREED" ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.3)",
              }]}
            >
              <Ionicons
                name="swap-horizontal"
                size={14}
                color={myStatus === "AGREED" ? colors.statusDelivered : colors.statusCancelled}
              />
              <Text style={[styles.btnText, { color: myStatus === "AGREED" ? colors.statusDelivered : colors.statusCancelled }]}>
                Change
              </Text>
            </Pressable>
          )}
          {isVehicleOwner && myStatus === "AGREED" && onChangeVehicle && (
            <Pressable onPress={onChangeVehicle} style={[styles.btn, { backgroundColor: isDarkMode ? "rgba(255,255,255,0.06)" : colors.inputBackground }]}>
              <Ionicons name="car-outline" size={14} color={colors.subtext} />
              <Text style={[styles.btnText, { color: colors.subtext }]}>Vehicle</Text>
            </Pressable>
          )}
        </View>
      )}

      {bothAgreed && (
        <View style={[styles.shippedBanner, { backgroundColor: colors.statusDeliveredBg }]}>
          <Ionicons name="checkmark-done-circle" size={16} color={colors.statusDelivered} />
          <Text style={[styles.shippedBannerText, { color: colors.statusDelivered }]}>Shipment created!</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 14,
    marginHorizontal: 12,
    marginBottom: 8,
    padding: 12,
    borderWidth: 1,
  },
  loadingText: {
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
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  vehicleChipText: {
    fontSize: 11,
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
  btnText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  shippedBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: "flex-start",
  },
  shippedBannerText: {
    fontSize: 12,
    fontWeight: "700",
  },
});
