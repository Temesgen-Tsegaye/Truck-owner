import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useAppTheme } from "@/context/theme-context";
import { Colors } from "@/constants/theme";

type Props = {
  agreement: {
    merchantAgreed: boolean;
    vehicleOwnerAgreed: boolean;
  } | null;
  userType: "merchant" | "vehicleOwner";
};

export function AgreementStatus({ agreement, userType }: Props) {
  const { isDarkMode } = useAppTheme();
  const theme = Colors[isDarkMode ? "dark" : "light"];

  if (!agreement) {
    return null;
  }

  const isMerchant = userType === "merchant";
  const otherPartyAgreed = isMerchant
    ? agreement.vehicleOwnerAgreed
    : agreement.merchantAgreed;
  const otherPartyLabel = isMerchant ? "Vehicle Owner" : "Merchant";

  const agreedColor = theme.statusDelivered;
  const notAgreedColor = theme.subtext;

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.subtext }]}>{otherPartyLabel}: </Text>
      <Text
        style={[
          styles.status,
          { color: otherPartyAgreed ? agreedColor : notAgreedColor },
        ]}
      >
        {otherPartyAgreed ? "Agreed" : "Not Agreed"}
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
    fontWeight: "500",
  },
  status: {
    fontSize: 12,
    fontWeight: "600",
  },
});
