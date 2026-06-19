import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Colors, Fonts } from '@/constants/theme';
import { useAppTheme } from '@/context/theme-context';
import { vehicleTypeValues, type VehicleItem, type CreateVehicleInput } from '@/lib/vehicle-schemas';
import {
  useVehiclesQuery,
  useCreateVehicleMutation,
  useUpdateVehicleMutation,
  useDeleteVehicleMutation,
} from '@/query/vehicles';
import { useSearchDriversQuery, type Driver } from '@/query/driver-assignment';

const API_URL = process.env.EXPO_PUBLIC_API_URL || process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:3000';

export default function VehiclesScreen() {
  const router = useRouter();
  const { data: vehicles, isLoading } = useVehiclesQuery();
  const { mutate: createVehicle, isPending: isCreating } = useCreateVehicleMutation();
  const { mutate: updateVehicle, isPending: isUpdating } = useUpdateVehicleMutation();
  const { mutate: deleteVehicle } = useDeleteVehicleMutation();
  const { isDarkMode } = useAppTheme();
  const theme = Colors[isDarkMode ? 'dark' : 'light'];

  const [modalVisible, setModalVisible] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<VehicleItem | null>(null);
  const [vehicleType, setVehicleType] = useState<string>('TRUCK');
  const [licensePlate, setLicensePlate] = useState('');
  const [capacity, setCapacity] = useState('');
  const [carImage, setCarImage] = useState<string | null>(null);
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [driverSearch, setDriverSearch] = useState('');
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
  const [selectedDriverName, setSelectedDriverName] = useState<string | null>(null);
  const [showDriverPicker, setShowDriverPicker] = useState(false);

  const { data: driverSearchResults } = useSearchDriversQuery(
    { search: driverSearch },
  );

  const resetForm = () => {
    setVehicleType('TRUCK');
    setLicensePlate('');
    setCapacity('');
    setCarImage(null);
    setErrors({});
    setEditingVehicle(null);
    setDriverSearch('');
    setSelectedDriverId(null);
    setSelectedDriverName(null);
    setShowDriverPicker(false);
  };

  const openAddModal = () => {
    resetForm();
    setModalVisible(true);
  };

  const openEditModal = (vehicle: VehicleItem) => {
    setEditingVehicle(vehicle);
    setVehicleType(vehicle.vehicleType);
    setLicensePlate(vehicle.licensePlate);
    setCapacity(String(vehicle.capacity));
    setCarImage(getImageUri(vehicle) || null);
    setSelectedDriverId(vehicle.driverId || null);
    setSelectedDriverName(vehicle.driver ? `${vehicle.driver.user.firstName} ${vehicle.driver.user.lastName}` : null);
    setDriverSearch('');
    setShowDriverPicker(false);
    setErrors({});
    setModalVisible(true);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setCarImage(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!licensePlate.trim()) errs.licensePlate = 'License plate is required';
    if (!capacity.trim()) errs.capacity = 'Capacity is required';
    else if (isNaN(Number(capacity)) || Number(capacity) <= 0) errs.capacity = 'Must be a positive number';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const isNewImage = carImage && carImage.startsWith('data:');

    const payload: any = {
      vehicleType: vehicleType as CreateVehicleInput['vehicleType'],
      licensePlate: licensePlate.trim(),
      capacity: Number(capacity),
      ...(isNewImage ? { carImage } : {}),
    };

    if (editingVehicle) {
      if (selectedDriverId !== editingVehicle.driverId) {
        payload.driverId = selectedDriverId;
      }
      updateVehicle({ id: editingVehicle.id, data: payload }, {
        onSuccess: () => {
          setModalVisible(false);
          resetForm();
        },
      });
    } else {
      createVehicle(payload, {
        onSuccess: () => {
          setModalVisible(false);
          resetForm();
        },
      });
    }
  };

  const handleDelete = (vehicle: VehicleItem) => {
    Alert.alert(
      'Delete Vehicle',
      `Are you sure you want to remove ${vehicle.licensePlate}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteVehicle(vehicle.id),
        },
      ],
    );
  };

  const getImageUri = (vehicle: VehicleItem) => {
    if (!vehicle.carImage) return null;
    if (vehicle.carImage.startsWith('http') || vehicle.carImage.startsWith('data:')) return vehicle.carImage;
    return `${API_URL}${vehicle.carImage}`;
  };

  const renderVehicle = ({ item }: { item: VehicleItem }) => (
    <View style={styles.vehicleCard}>
      <TouchableOpacity onPress={() => openEditModal(item)} style={styles.vehicleCardTouchable}>
        {item.carImage ? (
          <Image source={{ uri: getImageUri(item) }} style={styles.vehicleImage} />
        ) : (
          <View style={[styles.vehicleImage, styles.vehicleImagePlaceholder]}>
            <Ionicons name="car" size={32} color={theme.icon} />
          </View>
        )}
        <View style={styles.vehicleInfo}>
          <Text style={styles.vehicleType}>{item.vehicleType.replace('_', ' ')}</Text>
          <Text style={styles.vehiclePlate}>{item.licensePlate}</Text>
          <Text style={styles.vehicleCapacity}>{item.capacity} ton(s)</Text>
          {item.driver && (
            <Text style={styles.vehicleDriver}>
              Driver: {item.driver.user.firstName} {item.driver.user.lastName}
            </Text>
          )}
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleDelete(item)} style={styles.deleteBtn}>
        <Ionicons name="trash-outline" size={18} color="#ff4444" />
      </TouchableOpacity>
    </View>
  );

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 24,
      paddingTop: 20,
      paddingBottom: 16,
    },
    title: {
      fontFamily: Fonts.bold,
      fontSize: 24,
      color: theme.text,
    },
    addBtn: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    listContent: {
      paddingHorizontal: 24,
      paddingBottom: 120,
    },
    vehicleCard: {
      flexDirection: 'row',
      backgroundColor: theme.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.border,
      marginBottom: 12,
      overflow: 'hidden',
      alignItems: 'center',
    },
    vehicleCardTouchable: {
      flex: 1,
      flexDirection: 'row',
      padding: 12,
    },
    vehicleImage: {
      width: 80,
      height: 80,
      borderRadius: 12,
    },
    vehicleImagePlaceholder: {
      backgroundColor: theme.overlay,
      justifyContent: 'center',
      alignItems: 'center',
    },
    vehicleInfo: {
      flex: 1,
      marginLeft: 12,
      justifyContent: 'center',
    },
    vehicleType: {
      fontFamily: Fonts.bold,
      fontSize: 16,
      color: theme.text,
      textTransform: 'capitalize',
    },
    vehiclePlate: {
      fontFamily: Fonts.medium,
      fontSize: 13,
      color: theme.primary,
      marginTop: 4,
    },
    vehicleCapacity: {
      fontFamily: Fonts.regular,
      fontSize: 12,
      color: theme.subtext,
      marginTop: 2,
    },
    vehicleDriver: {
      fontFamily: Fonts.regular,
      fontSize: 12,
      color: theme.subtext,
      marginTop: 2,
    },
    deleteBtn: {
      padding: 16,
    },
    emptyState: {
      alignItems: 'center',
      paddingTop: 80,
    },
    emptyTitle: {
      fontFamily: Fonts.bold,
      fontSize: 18,
      color: theme.text,
      marginTop: 16,
    },
    emptySubtitle: {
      fontFamily: Fonts.regular,
      fontSize: 14,
      color: theme.subtext,
      marginTop: 8,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.7)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: theme.card,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: 24,
      maxHeight: '90%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    modalTitle: {
      fontFamily: Fonts.bold,
      fontSize: 20,
      color: theme.text,
    },
    imagePicker: {
      alignSelf: 'center',
      marginBottom: 20,
    },
    pickedImage: {
      width: 200,
      height: 150,
      borderRadius: 12,
    },
    imagePickerPlaceholder: {
      width: 200,
      height: 150,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: theme.border,
      borderStyle: 'dashed',
      justifyContent: 'center',
      alignItems: 'center',
    },
    imagePickerText: {
      fontFamily: Fonts.regular,
      fontSize: 13,
      color: theme.subtext,
      marginTop: 8,
    },
    label: {
      fontFamily: Fonts.medium,
      fontSize: 13,
      color: theme.text,
      marginBottom: 8,
      marginTop: 8,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.border,
      padding: 14,
      borderRadius: 12,
      backgroundColor: theme.overlay,
      color: theme.text,
      fontFamily: Fonts.regular,
      fontSize: 15,
    },
    inputError: {
      borderColor: '#E74C3C',
    },
    errorText: {
      color: '#E74C3C',
      fontSize: 12,
      marginTop: 4,
      fontFamily: Fonts.regular,
    },
    pickerButton: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.border,
      padding: 14,
      borderRadius: 12,
      backgroundColor: theme.overlay,
    },
    pickerButtonText: {
      color: theme.text,
      fontFamily: Fonts.regular,
      fontSize: 15,
      textTransform: 'capitalize',
    },
    typePickerList: {
      backgroundColor: theme.card,
      borderRadius: 12,
      marginTop: 4,
      overflow: 'hidden',
    },
    typeOption: {
      padding: 14,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    typeOptionSelected: {
      backgroundColor: theme.overlay,
    },
    typeOptionText: {
      color: theme.text,
      fontFamily: Fonts.regular,
      fontSize: 14,
      textTransform: 'capitalize',
    },
    typeOptionTextSelected: {
      color: theme.primary,
      fontFamily: Fonts.bold,
    },
    submitBtn: {
      backgroundColor: theme.primary,
      padding: 16,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: 24,
      marginBottom: 20,
    },
    submitBtnDisabled: {
      opacity: 0.6,
    },
    submitBtnText: {
      color: theme.textOnPrimary,
      fontFamily: Fonts.bold,
      fontSize: 16,
    },
    driverSelected: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: 'rgba(255,100,47,0.1)',
      borderRadius: 12,
      padding: 12,
      borderWidth: 1,
      borderColor: 'rgba(255,100,47,0.2)',
    },
    driverInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    driverName: {
      color: theme.text,
      fontFamily: Fonts.medium,
      fontSize: 14,
    },
    driverRemoveBtn: {
      padding: 4,
    },
    driverUnassigned: {
      color: theme.subtext,
      fontFamily: Fonts.regular,
      fontSize: 14,
      paddingVertical: 4,
    },
    driverChangeBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginTop: 8,
    },
    driverChangeText: {
      color: theme.primary,
      fontFamily: Fonts.medium,
      fontSize: 13,
    },
    driverPickerContainer: {
      marginTop: 4,
    },
    driverOption: {
      padding: 12,
      borderRadius: 10,
      marginTop: 4,
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
    },
    driverOptionSelected: {
      borderColor: theme.primary,
      backgroundColor: 'rgba(255,100,47,0.08)',
    },
    driverOptionName: {
      color: theme.text,
      fontFamily: Fonts.medium,
      fontSize: 14,
    },
    driverOptionAssigned: {
      color: theme.subtext,
      fontFamily: Fonts.regular,
      fontSize: 12,
      marginTop: 2,
    },
    driverOptionFree: {
      color: theme.statusDelivered,
      fontFamily: Fonts.regular,
      fontSize: 12,
      marginTop: 2,
    },
    driverSearchEmpty: {
      color: theme.subtext,
      fontFamily: Fonts.regular,
      fontSize: 13,
      textAlign: 'center',
      marginTop: 12,
    },
  }), [theme]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={theme.background} />
      <View style={styles.header}>
        <Text style={styles.title}>My Vehicles</Text>
        <TouchableOpacity onPress={openAddModal} style={styles.addBtn}>
          <Ionicons name="add" size={24} color={theme.text} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={vehicles ?? []}
        keyExtractor={(item) => item.id}
        renderItem={renderVehicle}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="car-outline" size={64} color={theme.icon} />
            <Text style={styles.emptyTitle}>No vehicles yet</Text>
            <Text style={styles.emptySubtitle}>Tap the + button to add your first truck</Text>
          </View>
        }
      />

      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{editingVehicle ? 'Edit Vehicle' : 'Add Vehicle'}</Text>
                <TouchableOpacity onPress={() => { setModalVisible(false); resetForm(); }}>
                  <Ionicons name="close" size={24} color={theme.text} />
                </TouchableOpacity>
              </View>

              {/* Car Image */}
              <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
                {carImage ? (
                  <Image source={{ uri: carImage }} style={styles.pickedImage} />
                ) : (
                  <View style={styles.imagePickerPlaceholder}>
                    <Ionicons name="camera-outline" size={32} color={theme.icon} />
                    <Text style={styles.imagePickerText}>Add Car Photo</Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Vehicle Type */}
              <Text style={styles.label}>Vehicle Type</Text>
              <TouchableOpacity onPress={() => setShowTypePicker(!showTypePicker)} style={styles.pickerButton}>
                <Text style={styles.pickerButtonText}>{vehicleType.replace('_', ' ')}</Text>
                <Feather name={showTypePicker ? "chevron-up" : "chevron-down"} size={18} color={theme.icon} />
              </TouchableOpacity>
              {showTypePicker && (
                <View style={styles.typePickerList}>
                  {vehicleTypeValues.map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[styles.typeOption, vehicleType === type && styles.typeOptionSelected]}
                      onPress={() => { setVehicleType(type); setShowTypePicker(false); }}
                    >
                      <Text style={[styles.typeOptionText, vehicleType === type && styles.typeOptionTextSelected]}>
                        {type.replace('_', ' ')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* License Plate */}
              <Text style={styles.label}>License Plate</Text>
              <TextInput
                value={licensePlate}
                onChangeText={setLicensePlate}
                placeholder="e.g. AA-12345"
                placeholderTextColor={theme.subtext}
                style={[styles.input, errors.licensePlate && styles.inputError]}
                autoCapitalize="characters"
              />
              {errors.licensePlate && <Text style={styles.errorText}>{errors.licensePlate}</Text>}

              {/* Capacity */}
              <Text style={styles.label}>Capacity (tons)</Text>
              <TextInput
                value={capacity}
                onChangeText={setCapacity}
                placeholder="e.g. 10"
                placeholderTextColor={theme.subtext}
                style={[styles.input, errors.capacity && styles.inputError]}
                keyboardType="numeric"
              />
              {errors.capacity && <Text style={styles.errorText}>{errors.capacity}</Text>}

              {/* Driver Selection (edit mode only) */}
              {editingVehicle && (
                <View style={{ marginTop: 8 }}>
                  <Text style={styles.label}>Assigned Driver</Text>

                  {selectedDriverId ? (
                    <View style={styles.driverSelected}>
                      <View style={styles.driverInfo}>
                        <Ionicons name="person" size={16} color="#ff642f" />
                        <Text style={styles.driverName}>{selectedDriverName || 'Driver'}</Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => {
                          setSelectedDriverId(null);
                          setSelectedDriverName(null);
                        }}
                        style={styles.driverRemoveBtn}
                      >
                        <Ionicons name="close" size={16} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <Text style={styles.driverUnassigned}>No driver assigned</Text>
                  )}

                  <TouchableOpacity
                    onPress={() => setShowDriverPicker(!showDriverPicker)}
                    style={styles.driverChangeBtn}
                  >
                    <Text style={styles.driverChangeText}>
                      {selectedDriverId ? 'Change Driver' : 'Assign Driver'}
                    </Text>
                    <Feather name={showDriverPicker ? 'chevron-up' : 'chevron-down'} size={14} color="#ff642f" />
                  </TouchableOpacity>

                  {showDriverPicker && (
                    <View style={styles.driverPickerContainer}>
                      <TextInput
                        value={driverSearch}
                        onChangeText={setDriverSearch}
                        placeholder="Search drivers by name..."
                        placeholderTextColor={theme.subtext}
                        style={[styles.input, { marginTop: 8 }]}
                      />
                      {(driverSearchResults?.data?.length ?? 0) > 0 ? (
                        driverSearchResults?.data?.map((d: Driver) => (
                          <TouchableOpacity
                            key={d.id}
                            style={[styles.driverOption, selectedDriverId === d.id && styles.driverOptionSelected]}
                            onPress={() => {
                              setSelectedDriverId(d.id);
                              setSelectedDriverName(`${d.user.firstName} ${d.user.lastName}`);
                              setShowDriverPicker(false);
                              setDriverSearch('');
                            }}
                          >
                            <Text style={styles.driverOptionName}>
                              {d.user.firstName} {d.user.lastName}
                            </Text>
                            {d.vehicle ? (
                              <Text style={styles.driverOptionAssigned}>Assigned to {d.vehicle.licensePlate}</Text>
                            ) : (
                              <Text style={styles.driverOptionFree}>Available</Text>
                            )}
                          </TouchableOpacity>
                        ))
                      ) : driverSearch.length >= 2 ? (
                        <Text style={styles.driverSearchEmpty}>No drivers found</Text>
                      ) : null}
                    </View>
                  )}
                </View>
              )}

              <TouchableOpacity
                onPress={handleSubmit}
                style={[styles.submitBtn, (isCreating || isUpdating) && styles.submitBtnDisabled]}
                disabled={isCreating || isUpdating}
              >
                <Text style={styles.submitBtnText}>
                  {isCreating || isUpdating ? 'Saving...' : editingVehicle ? 'Update Vehicle' : 'Add Vehicle'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
