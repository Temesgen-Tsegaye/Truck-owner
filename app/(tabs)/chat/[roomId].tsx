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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { api } from "@/lib/api";
import { FloatingAgreementBar } from "@/components/chat/floating-agreement-bar";
import { useLocalSocket } from "@/hooks/use-local-socket";
import { useVehiclesQuery } from "@/query/vehicles";
import Toast from "react-native-toast-message";

export default function ChatRoom() {
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const router = useRouter();
  const { socket } = useLocalSocket();
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [agreement, setAgreement] = useState<any>(null);
  const [loadingAgreement, setLoadingAgreement] = useState(true);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [showVehiclePicker, setShowVehiclePicker] = useState(false);

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
        // Keep optimistic messages that aren't already in server messages
        const optimisticMessages = prev.filter((m) => m.isOptimistic);
        const merged = [...serverMessages];

        optimisticMessages.forEach((optimistic) => {
          // Check if this optimistic message already exists in server messages
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

  useEffect(() => {
    if (roomId && socket) {
      socket.emit("join_room", { roomId });
      fetchMessages();
      fetchAgreement();

      const handleNewMessage = (msg: any) => {
        console.log("Received socket message:", msg);
        if (msg.chatRoomId === roomId) {
          setMessages((prev) => {
            // Check for duplicate by id or tempId
            const exists = prev.find(
              (m) => m.id === msg.id || (m.tempId && m.tempId === msg.tempId),
            );
            if (exists) return prev;

            // Try to replace optimistic message by matching content and recent timestamp
            const msgTimestamp = msg.timestamp
              ? new Date(msg.timestamp).getTime()
              : Date.now();
            const optimisticIndex = prev.findIndex(
              (m) =>
                m.isOptimistic &&
                m.content === msg.content &&
                m.chatRoomId === msg.chatRoomId &&
                Math.abs(new Date(m.timestamp).getTime() - msgTimestamp) <
                  30000, // 30 seconds
            );

            if (optimisticIndex !== -1) {
              // Replace optimistic message with real one
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
        socket.emit("leave_room", { roomId });
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
      // Send via socket for real-time
      socket?.emit("send_message", { roomId, content: text });

      // Also send via HTTP POST to ensure persistence
      const response = await api.post(`/chat/room/${roomId}/messages`, {
        content: text,
      });

      // If response contains the saved message, update optimistic message
      if (response.data && response.data.id) {
        setMessages((prev) =>
          prev.map((m) =>
            m.tempId === tempId ? { ...response.data, isOptimistic: false } : m,
          ),
        );
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      // Optionally remove optimistic message on error
      // setMessages(prev => prev.filter(m => m.tempId !== tempId));
    } finally {
      setSending(false);
    }
  };

  const sendAgreementUpdate = async (agreed: boolean, vehicleId?: string) => {
    try {
      const payload: any = {
        chatRoomId: roomId,
        agreed,
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

  const handleToggleAgreement = async () => {
    const currentlyAgreed = agreement?.vehicleOwnerAgreed;
    
    // If toggling off (disagreeing), just send update
    if (currentlyAgreed) {
      await sendAgreementUpdate(false);
      return;
    }
    
    // If agreeing, handle vehicle selection
    if (hasMultipleVehicles) {
      // Show vehicle picker modal
      setShowVehiclePicker(true);
    } else if (hasSingleVehicle) {
      // Auto-select the single vehicle and agree
      const vehicleId = vehicles[0].id;
      await sendAgreementUpdate(true, vehicleId);
    } else {
      // No vehicles - backend will handle error
      await sendAgreementUpdate(true);
    }
  };

  const handleVehicleSelect = async (vehicleId: string) => {
    setSelectedVehicleId(vehicleId);
    setShowVehiclePicker(false);
    await sendAgreementUpdate(true, vehicleId);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={20} color="#fff" />
          </Pressable>
          <Text style={styles.title}>Negotiation</Text>
        </View>

        <FlatList
          data={messages}
          keyExtractor={(item) => item.id || Math.random().toString()}
          renderItem={({ item }) => (
            <View
              style={[
                styles.messageBubble,
                item.vehicleOwnerId || item.tempId
                  ? styles.myMessage
                  : styles.theirMessage,
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  !(item.vehicleOwnerId || item.tempId) && { color: "#FFF" },
                ]}
              >
                {item.content}
              </Text>
            </View>
          )}
          contentContainerStyle={styles.messageList}
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
              onToggleAgreement={handleToggleAgreement}
              onChangeVehicle={() => setShowVehiclePicker(true)}
              isVehicleOwner={true}
              isLoading={loadingAgreement}
            />
          }
        />

        <Modal
          visible={showVehiclePicker}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowVehiclePicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select a Vehicle</Text>
              <ScrollView style={styles.vehicleList}>
                {vehicles.map((vehicle) => (
                  <TouchableOpacity
                    key={vehicle.id}
                    style={[
                      styles.vehicleItem,
                      selectedVehicleId === vehicle.id && styles.vehicleItemSelected,
                    ]}
                    onPress={() => handleVehicleSelect(vehicle.id)}
                  >
                    <Text style={styles.vehicleItemText}>
                      {vehicle.licensePlate} - {vehicle.vehicleType} ({vehicle.capacity} tons)
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <Pressable
                style={styles.modalCancelButton}
                onPress={() => setShowVehiclePicker(false)}
              >
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </Modal>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder="Type a message..."
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
    backgroundColor: "#161412",
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    padding: 16,
    backgroundColor: "#161412",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    height: 40,
    width: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(28, 24, 21, 0.85)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    marginRight: 12,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    color: "#FFF",
  },
  messageList: {
    padding: 16,
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#ff642f",
  },
  theirMessage: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  messageText: {
    color: "#FFF",
    fontSize: 15,
  },
  inputContainer: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#161412",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
    paddingBottom: Platform.OS === "ios" ? 30 : 16,
  },
  input: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.05)",
    color: "#FFF",
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
    color: "#ff642f",
    fontWeight: "600",
  },
  sendTextDisabled: {
    color: "rgba(255,255,255,0.4)",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#161412",
    borderRadius: 12,
    padding: 20,
    width: "80%",
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFF",
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
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  vehicleItemSelected: {
    backgroundColor: "rgba(255, 100, 47, 0.15)",
  },
  vehicleItemText: {
    fontSize: 14,
    color: "#FFF",
  },
  modalCancelButton: {
    marginTop: 16,
    paddingVertical: 12,
    backgroundColor: "#EF4444",
    borderRadius: 8,
    alignItems: "center",
  },
  modalCancelButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
});
