import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Modal,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { api } from "@/lib/api";
import { FloatingAgreementBar } from "@/components/chat/floating-agreement-bar";
import { useSocket } from "@/context/socket-context";
import { useVehiclesQuery } from "@/query/vehicles";
import { useAppTheme } from "@/context/theme-context";
import { Colors } from "@/constants/theme";
import Toast from "react-native-toast-message";

export default function ChatRoom() {
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const router = useRouter();
  const { socket, joinRoom, leaveRoom, sendMessage } = useSocket();
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [agreement, setAgreement] = useState<any>(null);
  const [loadingAgreement, setLoadingAgreement] = useState(true);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [showVehiclePicker, setShowVehiclePicker] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { isDarkMode } = useAppTheme();
  const colors = isDarkMode ? Colors.dark : Colors.light;

  const { data: vehicles = [], isLoading: vehiclesLoading } = useVehiclesQuery();
  
  const hasMultipleVehicles = useMemo(() => vehicles.length > 1, [vehicles]);
  const hasSingleVehicle = useMemo(() => vehicles.length === 1, [vehicles]);
  const selectedVehicle = useMemo(() => 
    vehicles.find(v => v.id === selectedVehicleId) || (hasSingleVehicle ? vehicles[0] : null),
  [vehicles, selectedVehicleId, hasSingleVehicle]);

  const fetchAgreement = useCallback(async () => {
    try {
      setLoadingAgreement(true);
      const res = await api.get(`/chat/room/${roomId}/agreement`);
      const agreementData = res.data;
      setAgreement(agreementData);
      if (agreementData?.vehicleId) {
        setSelectedVehicleId(agreementData.vehicleId);
      }
    } catch (e) {
      console.error("Failed to fetch agreement", e);
      Toast.show({
        type: "error",
        text1: "Failed to load agreement",
        text2: "Please try again later.",
      });
    } finally {
      setLoadingAgreement(false);
    }
  }, [roomId]);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await api.get(`/chat/room/${roomId}/messages`);
      const serverMessages = res.data || [];

      setMessages((prev) => {
        const optimisticMessages = prev.filter((m) => m.isOptimistic);
        const merged = [...serverMessages];

        optimisticMessages.forEach((optimistic) => {
          const exists = serverMessages.some(
            (serverMsg: any) =>
              serverMsg.id === optimistic.id ||
              (serverMsg.tempId && serverMsg.tempId === optimistic.tempId) ||
              (serverMsg.content === optimistic.content &&
                Math.abs(
                  new Date(serverMsg.timestamp).getTime() -
                    new Date(optimistic.timestamp).getTime(),
                ) < 30000),
          );
          if (!exists) {
            merged.push(optimistic);
          }
        });

        return merged;
      });
    } catch (e) {
      console.error(e);
    }
  }, [roomId]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([fetchMessages(), fetchAgreement()]);
    } finally {
      setRefreshing(false);
    }
  }, [fetchMessages, fetchAgreement]);

  useEffect(() => {
    if (roomId && socket) {
      joinRoom(roomId);
      fetchMessages();
      fetchAgreement();

      const handleNewMessage = (msg: any) => {
        if (msg.chatRoomId === roomId) {
          setMessages((prev) => {
            const exists = prev.find(
              (m) => m.id === msg.id || (m.tempId && m.tempId === msg.tempId),
            );
            if (exists) return prev;

            const msgTimestamp = msg.timestamp
              ? new Date(msg.timestamp).getTime()
              : Date.now();
            const optimisticIndex = prev.findIndex(
              (m) =>
                m.isOptimistic &&
                m.content === msg.content &&
                m.chatRoomId === msg.chatRoomId &&
                Math.abs(new Date(m.timestamp).getTime() - msgTimestamp) <
                  30000,
            );

            if (optimisticIndex !== -1) {
              const newMessages = [...prev];
              newMessages[optimisticIndex] = {
                ...msg,
                timestamp: msg.timestamp || new Date().toISOString(),
                isOptimistic: false,
              };
              return newMessages;
            }

            return [
              ...prev,
              {
                ...msg,
                timestamp: msg.timestamp || new Date().toISOString(),
                isOptimistic: false,
              },
            ];
          });
        }
      };

      const handleAgreementUpdate = (ag: any) => {
        if (ag.chatRoomId === roomId) {
          setAgreement(ag);
        }
      };

      socket?.on("receive_message", handleNewMessage);
      socket?.on("agreement_updated", handleAgreementUpdate);

      return () => {
        socket.off("receive_message", handleNewMessage);
        socket.off("agreement_updated", handleAgreementUpdate);
        leaveRoom(roomId);
      };
    }
  }, [roomId, socket, fetchAgreement, fetchMessages]);

  const handleSend = async () => {
    if ((!text.trim() && !roomId) || sending) return;

    const tempId = Date.now().toString();
    const newMessage = {
      id: tempId,
      tempId,
      content: text,
      chatRoomId: roomId,
      vehicleOwnerId: "me",
      timestamp: new Date().toISOString(),
      isOptimistic: true,
    };

    setMessages((prev) => [...prev, newMessage]);
    setText("");
    setSending(true);

    try {
      sendMessage(roomId, text);
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setSending(false);
    }
  };

  const sendAgreementUpdate = async (status: string, vehicleId?: string) => {
    try {
      const payload: any = {
        chatRoomId: roomId,
        status,
      };
      if (vehicleId) {
        payload.vehicleId = vehicleId;
      }
      const res = await api.patch("/chat/agreement", payload);
      setAgreement(res.data);
      if (res.data?.vehicleId) {
        setSelectedVehicleId(res.data.vehicleId);
      }
      return res.data;
    } catch (error: any) {
      console.error("Failed to update agreement:", error);
      const message = error.response?.data?.message || error.message || "Failed to update agreement";
      Toast.show({
        type: "error",
        text1: "Agreement Error",
        text2: message,
      });
      throw error;
    }
  };

  const handleAgree = async () => {
    if (hasMultipleVehicles) {
      setShowVehiclePicker(true);
    } else if (hasSingleVehicle) {
      const vehicleId = vehicles[0].id;
      await sendAgreementUpdate("AGREED", vehicleId);
    } else {
      await sendAgreementUpdate("AGREED");
    }
  };

  const handleReject = async () => {
    await sendAgreementUpdate("NOT_AGREED");
  };

  const handleVehicleSelect = async (vehicleId: string) => {
    setSelectedVehicleId(vehicleId);
    setShowVehiclePicker(false);
    await sendAgreementUpdate("AGREED", vehicleId);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      >
        <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
          <Pressable onPress={() => router.back()} style={[styles.backButton, { backgroundColor: colors.overlay, borderColor: colors.border }]}>
            <Ionicons name="chevron-back" size={20} color={colors.text} />
          </Pressable>
          <Text style={[styles.title, { color: colors.text }]}>Negotiation</Text>
        </View>

        <FlatList
          style={{ flex: 1 }}
          data={messages}
          keyExtractor={(item) => item.id || Math.random().toString()}
          renderItem={({ item }) => {
            const isMe = item.vehicleOwnerId || item.tempId;
            return (
              <View
                style={[
                  styles.messageBubble,
                  isMe
                    ? [styles.myMessage, { backgroundColor: colors.messageSelf }]
                    : [styles.theirMessage, { backgroundColor: colors.messageOther }],
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    { color: isMe ? colors.textOnPrimary : colors.text },
                  ]}
                >
                  {item.content}
                </Text>
              </View>
            );
          }}
          contentContainerStyle={styles.messageList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
          ListHeaderComponent={
            <FloatingAgreementBar
              agreement={{
                ...agreement,
                vehicle: selectedVehicle ? {
                  licensePlate: selectedVehicle.licensePlate,
                  vehicleType: selectedVehicle.vehicleType
                } : undefined
              }}
              userType="vehicleOwner"
              onAgree={handleAgree}
              onReject={handleReject}
              onChangeVehicle={() => setShowVehiclePicker(true)}
              isVehicleOwner={true}
              isLoading={loadingAgreement}
            />
        }
        ListFooterComponent={<View style={{ height: 16 }} />}
        contentInset={{ bottom: 16 }}
      />

        <Modal
          visible={showVehiclePicker}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowVehiclePicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Select a Vehicle</Text>
              <ScrollView style={styles.vehicleList}>
                {vehicles.map((vehicle) => (
                  <TouchableOpacity
                    key={vehicle.id}
                    style={[
                      styles.vehicleItem,
                      { borderBottomColor: colors.border },
                      selectedVehicleId === vehicle.id && { backgroundColor: colors.primaryLight },
                    ]}
                    onPress={() => handleVehicleSelect(vehicle.id)}
                  >
                    <Text style={[styles.vehicleItemText, { color: colors.text }]}>
                      {vehicle.licensePlate} - {vehicle.vehicleType} ({vehicle.capacity} tons)
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <Pressable
                style={[styles.modalCancelButton, { backgroundColor: colors.error }]}
                onPress={() => setShowVehiclePicker(false)}
              >
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </Modal>

        <View style={[styles.inputContainer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
          <TextInput
            style={[styles.input, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : colors.inputBackground, color: colors.text }]}
            value={text}
            onChangeText={setText}
            placeholder="Type a message..."
            placeholderTextColor={colors.subtext}
            multiline
          />
          <Pressable
            style={[
              styles.sendButton,
              (sending || !text.trim()) && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={sending || !text.trim()}
          >
            <Text
              style={[
                styles.sendText,
                { color: colors.primary },
                (sending || !text.trim()) && styles.sendTextDisabled,
              ]}
            >
              {sending ? "Sending..." : "Send"}
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    height: 40,
    width: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    marginRight: 12,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
  },
  messageList: {
    padding: 16,
    paddingBottom: 20,
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  myMessage: {
    alignSelf: "flex-end",
  },
  theirMessage: {
    alignSelf: "flex-start",
  },
  messageText: {
    fontSize: 15,
  },
  inputContainer: {
    flexDirection: "row",
    padding: 16,
    borderTopWidth: 1,
    paddingBottom: Platform.OS === "ios" ? 30 : 16,
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
    marginRight: 12,
  },
  sendButton: {
    justifyContent: "center",
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendText: {
    fontWeight: "600",
  },
  sendTextDisabled: {
    opacity: 0.4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    borderRadius: 12,
    padding: 20,
    width: "80%",
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
    textAlign: "center",
  },
  vehicleList: {
    maxHeight: 300,
  },
  vehicleItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  vehicleItemText: {
    fontSize: 14,
  },
  modalCancelButton: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  modalCancelButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
});
