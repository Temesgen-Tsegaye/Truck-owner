import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { LoadItem } from "@/lib/load-schemas";
import { useRouter } from "expo-router";
import { api } from "@/lib/api";
import { Fonts } from "@/constants/theme";

type Props = {
  load: LoadItem;
};

const TEXTURE_DOTS = Array.from({ length: 54 }, (_, index) => ({
  id: index,
  opacity: 0.05 + ((index % 5) * 0.025),
  size: 2 + (index % 2),
}));

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
    <View style={styles.cardShell}>
      <BlurView intensity={24} tint="dark" style={styles.card}>
        <LinearGradient
          colors={[
            "rgba(74, 63, 57, 0.94)",
            "rgba(56, 49, 44, 0.9)",
            "rgba(42, 37, 34, 0.86)",
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
        <View pointerEvents="none" style={styles.textureLayer}>
          {TEXTURE_DOTS.map((dot) => (
            <View
              key={dot.id}
              style={[
                styles.textureDot,
                {
                  opacity: dot.opacity,
                  width: dot.size,
                  height: dot.size,
                },
              ]}
            />
          ))}
        </View>
        <LinearGradient
          pointerEvents="none"
          colors={["rgba(255,255,255,0.14)", "rgba(255,255,255,0.03)", "rgba(255,255,255,0)"]}
          start={{ x: 0.05, y: 0 }}
          end={{ x: 0.95, y: 1 }}
          style={styles.highlightMask}
        />

        <View style={styles.content}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.kicker}>Active Load</Text>
              <Text style={styles.orderId}>ID - {load.id.slice(0, 8).toUpperCase()}</Text>
            </View>
            <TouchableOpacity
              style={styles.trackingPill}
              onPress={handleStartChat}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.trackingPillText}>Negotiate</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.detailsRow}>
            <View style={styles.detailsCol}>
              <Text style={styles.labelSmall}>From</Text>
              <Text style={styles.cityText} numberOfLines={1}>{load.startingPlace}</Text>
              <Text style={styles.dateText}>Ready Now</Text>

              <View style={styles.spacer} />

              <Text style={styles.labelSmall}>Category</Text>
              <Text style={styles.personText}>{load.loadCategory.replace(/_/g, " ")}</Text>

              <View style={styles.contactRow}>
                <View style={styles.actionBtn}>
                  <Ionicons name="cube-outline" size={16} color="#d8cec6" />
                </View>
              </View>
            </View>

            <View style={styles.detailsCol}>
              <Text style={styles.labelSmall}>To</Text>
              <Text style={styles.cityText} numberOfLines={1}>{load.destinationPlace}</Text>
              <Text style={styles.dateText}>{new Date(load.deliveryDate).toLocaleDateString()}</Text>

              <View style={styles.spacer} />

              <Text style={styles.labelSmall}>Specs</Text>
              <Text style={styles.personText}>{load.weight} kg</Text>

              <View style={styles.contactRow}>
                <View
                  style={[
                    styles.actionBtn,
                    load.isApproved ? styles.statusApproved : styles.statusPending,
                  ]}
                >
                  <Ionicons
                    name={load.isApproved ? "checkmark-circle-outline" : "time-outline"}
                    size={16}
                    color={load.isApproved ? "#C8F5DB" : "#FFD89A"}
                  />
                </View>
              </View>
            </View>
          </View>
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  cardShell: {
    marginBottom: 18,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    backgroundColor: "rgba(62, 53, 48, 0.18)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  card: {
    backgroundColor: "rgba(68, 57, 51, 0.34)",
    borderRadius: 28,
    overflow: 'hidden',
  },
  content: {
    paddingHorizontal: 22,
    paddingVertical: 24,
  },
  textureLayer: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignContent: 'space-between',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  textureDot: {
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.7)",
    marginVertical: 5,
  },
  highlightMask: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.85,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  kicker: {
    fontFamily: Fonts.medium,
    fontSize: 11,
    color: '#C9B8AD',
    textTransform: 'uppercase',
    letterSpacing: 1.4,
    marginBottom: 8,
  },
  orderId: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: '#E2D8D2',
  },
  trackingPill: {
    backgroundColor: '#f15a2b',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#f15a2b',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 4,
  },
  trackingPillText: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: '#fff',
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailsCol: {
    flex: 1,
    paddingRight: 10,
  },
  labelSmall: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: '#B4A6A0',
    marginBottom: 6,
  },
  cityText: {
    fontFamily: Fonts.bold,
    fontSize: 18,
    color: '#FFF6F0',
    marginBottom: 4,
  },
  dateText: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: '#D1C4BE',
  },
  spacer: {
    height: 24,
  },
  personText: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: '#F2E8E3',
    marginBottom: 12,
  },
  contactRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusApproved: {
    backgroundColor: 'rgba(91, 175, 127, 0.18)',
    borderColor: 'rgba(165, 232, 192, 0.12)',
  },
  statusPending: {
    backgroundColor: 'rgba(241, 90, 43, 0.15)',
    borderColor: 'rgba(255, 193, 165, 0.12)',
  },
});
