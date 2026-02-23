import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { LoadItem } from "@/lib/load-schemas";
import { useRouter } from "expo-router";
import { api } from "@/lib/api";

type Props = {
  load: LoadItem;
};

export function LoadCard({ load }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleStartChat = async () => {
    if (loading) return;

    setLoading(true);
    try {
      const response = await api.post("/chat/room", {
        loadId: load.id,
        merchantId: load.merchantId,
      });
      const room = response.data;
      router.push(`/(tabs)/chat/${room.id}`);
    } catch (error) {
      console.error("Failed to start chat", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{load.location}</Text>
        <Text style={styles.badge}>{load.loadType}</Text>
      </View>

      <Text style={styles.subtitle}>
        {load.loadCategory.replace(/_/g, " ")}
      </Text>

      <View style={styles.row}>
        <Text style={styles.label}>Weight</Text>
        <Text style={styles.value}>{load.weight} kg</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Route</Text>
        <Text style={styles.value}>
          {load.startingPlace} → {load.destinationPlace}
        </Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Delivery</Text>
        <Text style={styles.value}>
          {new Date(load.deliveryDate).toLocaleDateString()}
        </Text>
      </View>

      <View style={styles.footerRow}>
        <Text style={styles.statusText}>
          {load.isApproved ? "Approved" : "Pending"}
        </Text>
        <Text style={styles.mutedText}>
          {new Date(load.createdAt).toLocaleDateString()}
        </Text>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.chatButton,
          {
            backgroundColor: loading
              ? "#9CA3AF"
              : pressed
                ? "#4338CA"
                : "#4F46E5",
            flexDirection: "row",
            gap: 8,
          },
        ]}
        onPress={handleStartChat}
        disabled={loading}
      >
        {loading && <ActivityIndicator size="small" color="#FFFFFF" />}
        <Text style={styles.chatButtonText}>
          {loading ? "Creating Chat..." : "Start Negotiation"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  chatButton: {
    marginTop: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  chatButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
  },
  subtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 12,
  },
  badge: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4C1D95",
    backgroundColor: "#EDE9FE",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  label: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  value: {
    fontSize: 13,
    color: "#111827",
    fontWeight: "500",
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#047857",
  },
  mutedText: {
    fontSize: 12,
    color: "#9CA3AF",
  },
});
