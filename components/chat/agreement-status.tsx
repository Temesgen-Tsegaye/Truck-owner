import React from "react";
import { View, Text, StyleSheet } from "react-native";

type Props = {
  agreement: {
    merchantAgreed: boolean;
    vehicleOwnerAgreed: boolean;
  } | null;
  userType: "merchant" | "vehicleOwner";
};

export function AgreementStatus({ agreement, userType }: Props) {
  if (!agreement) {
    return null;
  }

  // Determine which status to show based on user type
  const isMerchant = userType === "merchant";
  const otherPartyAgreed = isMerchant
    ? agreement.vehicleOwnerAgreed
    : agreement.merchantAgreed;
  const otherPartyLabel = isMerchant ? "Vehicle Owner" : "Merchant";

  const agreedColor = "#047857"; // Green
  const notAgreedColor = "#6B7280"; // Gray

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{otherPartyLabel}: </Text>
      <Text
        style={[
          styles.status,
          { color: otherPartyAgreed ? agreedColor : notAgreedColor },
        ]}
      >
        {otherPartyAgreed ? "✅ Agreed" : "❌ Not Agreed"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  label: {
    fontSize: 12,
    color: "#4B5563",
    fontWeight: "500",
  },
  status: {
    fontSize: 12,
    fontWeight: "600",
  },
});
