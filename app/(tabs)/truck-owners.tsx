import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Modal, 
  TextInput, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform 
} from 'react-native';
import { useVehiclesQuery, useDeleteVehicleMutation, useCreateVehicleMutation } from '@/query/vehicles';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useAppTheme } from '@/context/theme-context';
import { Skeleton } from '@/components/global/skeleton';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createVehicleSchema, CreateVehicleInput, vehicleTypeValues, VehicleItem } from '@/lib/vehicle-schemas';
import Toast from 'react-native-toast-message';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CustomButton } from '@/components/global/button';
import {
  useSearchDriversQuery,
  useCreateAssignmentRequestMutation,
  useAssignmentRequestsQuery,
  useCancelAssignmentRequestMutation,
  type Driver,
} from '@/query/driver-assignment';

export default function TruckOwners() {
  const { isDarkMode } = useAppTheme();
  const theme = Colors[isDarkMode ? 'dark' : 'light'];
  const [modalVisible, setModalVisible] = useState(false);
  const [driverModalVisible, setDriverModalVisible] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);

  const { data: vehicles, isLoading, error } = useVehiclesQuery();
  const deleteMutation = useDeleteVehicleMutation();
  const createMutation = useCreateVehicleMutation();
  const createAssignmentMutation = useCreateAssignmentRequestMutation();
  const cancelAssignmentMutation = useCancelAssignmentRequestMutation();
  const { data: assignmentRequests } = useAssignmentRequestsQuery();
  const { data: driversSearchResults, isLoading: searchingDrivers } = useSearchDriversQuery({
    search: searchQuery.trim(),
    limit: 10,
  });

  useEffect(() => {
    console.log('[Driver Search] searchQuery:', searchQuery);
    console.log('[Driver Search] results:', driversSearchResults);
    console.log('[Driver Search] loading:', searchingDrivers);
  }, [searchQuery, driversSearchResults, searchingDrivers]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateVehicleInput>({
    resolver: zodResolver(createVehicleSchema),
    defaultValues: {
      licensePlate: '',
      capacity: 0,
      vehicleType: vehicleTypeValues[0],
    },
  });

  const onSubmit = async (data: CreateVehicleInput) => {
    try {
      await createMutation.mutateAsync(data);
      reset();
      setModalVisible(false);
    } catch (error) {
      // Error is handled by mutation's onError
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <FlatList
          data={[1, 2, 3, 4]}
          keyExtractor={(item) => item.toString()}
          contentContainerStyle={{ padding: 15 }}
          renderItem={() => (
            <View style={[styles.card, { backgroundColor: isDarkMode ? '#1e1e1e' : '#fff', height: 100 }]}>
              <Skeleton width="60%" height={20} style={{ marginBottom: 10 }} />
              <Skeleton width="40%" height={15} style={{ marginBottom: 10 }} />
              <Skeleton width="30%" height={15} />
            </View>
          )}
        />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.subtitle, { color: theme.text }]}>Failed to load trucks. Please try again.</Text>
      </View>
    );
  }

  const vehicleList = vehicles || [];
  console.log('Vehicles:', vehicleList);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        data={vehicleList}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 15, paddingBottom: 100 }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.subtitle, { color: theme.text }]}>No trucks found. Add your first truck!</Text>
          </View>
        }
         renderItem={({ item }) => {
           const pendingRequest = assignmentRequests?.find(
             (req) => req.vehicleId === item.id && req.status === 'PENDING'
           );
           return (
             <View style={[styles.card, { backgroundColor: isDarkMode ? '#1e1e1e' : '#fff' }]}>
               <View style={styles.cardHeader}>
                 <View>
                   <Text style={[styles.licensePlate, { color: theme.text }]}>{item.licensePlate}</Text>
                   <Text style={[styles.vehicleType, { color: theme.icon }]}>{item.vehicleType}</Text>
                 </View>
                 <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                   <TouchableOpacity onPress={() => {
                     setSelectedVehicle(item);
                     setDriverModalVisible(true);
                   }}>
                     <Ionicons name="person-add-outline" size={24} color={theme.tint} />
                   </TouchableOpacity>
                   <TouchableOpacity onPress={() => deleteMutation.mutate(item.id)}>
                     <Ionicons name="trash-outline" size={24} color="#FF3B30" />
                   </TouchableOpacity>
                 </View>
               </View>
               <View style={styles.cardFooter}>
                 <Text style={[styles.capacity, { color: theme.text }]}>Capacity: {item.capacity} Tons</Text>
                 {item.driver ? (
                   <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                     <Ionicons name="person" size={16} color={theme.icon} />
                     <Text style={[styles.driverText, { color: theme.text, marginLeft: 6 }]}>
                       Driver: {item.driver.user.firstName} {item.driver.user.lastName}
                     </Text>
                   </View>
                 ) : pendingRequest ? (
                   <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                     <Ionicons name="time-outline" size={16} color="#FFA500" />
                     <Text style={[styles.driverText, { color: '#FFA500', marginLeft: 6 }]}>
                       Assignment pending
                     </Text>
                   </View>
                 ) : (
                   <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                     <Ionicons name="alert-circle-outline" size={16} color="#FF3B30" />
                     <Text style={[styles.driverText, { color: '#FF3B30', marginLeft: 6 }]}>
                       No driver assigned
                     </Text>
                   </View>
                 )}
               </View>
             </View>
           );
         }}
      />

      <TouchableOpacity 
        style={[styles.fab, { backgroundColor: theme.tint }]} 
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: isDarkMode ? '#121212' : '#fff' }}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Add New Truck</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={28} color={theme.text} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalContent}>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.text }]}>License Plate</Text>
                <Controller
                  control={control}
                  name="licensePlate"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      style={[styles.input, { 
                        backgroundColor: isDarkMode ? '#1e1e1e' : '#f9f9f9',
                        color: theme.text,
                        borderColor: errors.licensePlate ? 'red' : (isDarkMode ? '#333' : '#eee')
                      }]}
                      placeholder="e.g. AA 12345"
                      placeholderTextColor={theme.icon}
                      onChangeText={onChange}
                      value={value}
                    />
                  )}
                />
                {errors.licensePlate && <Text style={styles.errorText}>{errors.licensePlate.message}</Text>}
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.text }]}>Capacity (Tons)</Text>
                <Controller
                  control={control}
                  name="capacity"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      style={[styles.input, { 
                        backgroundColor: isDarkMode ? '#1e1e1e' : '#f9f9f9',
                        color: theme.text,
                        borderColor: errors.capacity ? 'red' : (isDarkMode ? '#333' : '#eee')
                      }]}
                      placeholder="e.g. 20"
                      placeholderTextColor={theme.icon}
                      keyboardType="numeric"
                      onChangeText={(val) => onChange(Number(val))}
                      value={value ? String(value) : ''}
                    />
                  )}
                />
                {errors.capacity && <Text style={styles.errorText}>{errors.capacity.message}</Text>}
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.text }]}>Vehicle Type</Text>
                <View style={styles.typeContainer}>
                  {vehicleTypeValues.map((type) => (
                    <Controller
                      key={type}
                      control={control}
                      name="vehicleType"
                      render={({ field: { onChange, value } }) => (
                        <TouchableOpacity
                          style={[
                            styles.typeChip,
                            { 
                              backgroundColor: value === type ? theme.tint : (isDarkMode ? '#1e1e1e' : '#f0f0f0'),
                            }
                          ]}
                          onPress={() => onChange(type)}
                        >
                          <Text style={{ color: value === type ? '#fff' : theme.text }}>{type}</Text>
                        </TouchableOpacity>
                      )}
                    />
                  ))}
                </View>
              </View>

              <CustomButton
                title="Add Truck"
                onPress={handleSubmit(onSubmit)}
                loading={createMutation.isPending}
                style={{ marginTop: 20 }}
              />
            </ScrollView>
            <Toast />
          </KeyboardAvoidingView>
        </SafeAreaView>
       </Modal>

       <Modal
         visible={driverModalVisible}
         animationType="slide"
         onRequestClose={() => {
           setDriverModalVisible(false);
           setSelectedDriver(null);
           setSearchQuery('');
         }}
       >
         <SafeAreaView style={{ flex: 1, backgroundColor: isDarkMode ? '#121212' : '#fff' }}>
           <KeyboardAvoidingView 
             behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
             style={{ flex: 1 }}
           >
             <View style={styles.modalHeader}>
               <Text style={[styles.modalTitle, { color: theme.text }]}>
                 {selectedVehicle ? `Assign Driver to ${selectedVehicle.licensePlate}` : 'Assign Driver'}
               </Text>
               <TouchableOpacity onPress={() => {
                 setDriverModalVisible(false);
                 setSelectedDriver(null);
                 setSearchQuery('');
               }}>
                 <Ionicons name="close" size={28} color={theme.text} />
               </TouchableOpacity>
             </View>

             <View style={styles.modalContent}>
               <View style={styles.inputGroup}>
                 <Text style={[styles.label, { color: theme.text }]}>Search Drivers</Text>
                 <TextInput
                   style={[styles.input, { 
                     backgroundColor: isDarkMode ? '#1e1e1e' : '#f9f9f9',
                     color: theme.text,
                     borderColor: isDarkMode ? '#333' : '#eee'
                   }]}
                   placeholder="Search by name or phone..."
                   placeholderTextColor={theme.icon}
                   onChangeText={setSearchQuery}
                   value={searchQuery}
                   autoFocus
                 />
               </View>

               {searchingDrivers && (
                 <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                   <Text style={{ color: theme.text }}>Searching...</Text>
                 </View>
               )}

               {driversSearchResults?.data && driversSearchResults.data.length > 0 && (
                 <View style={{ marginTop: 10 }}>
                   <Text style={[styles.label, { color: theme.text, marginBottom: 10 }]}>Select Driver</Text>
                   <FlatList
                     data={driversSearchResults.data}
                     keyExtractor={(driver) => driver.id}
                     renderItem={({ item }) => {
                       const isAssigned = item.vehicle !== null;
                       const isSelected = selectedDriver?.id === item.id;
                       return (
                         <TouchableOpacity
                           style={[
                             styles.driverItem,
                             {
                               backgroundColor: isSelected ? theme.tint : (isDarkMode ? '#1e1e1e' : '#f9f9f9'),
                               borderColor: isSelected ? theme.tint : (isDarkMode ? '#333' : '#eee'),
                             }
                           ]}
                           onPress={() => setSelectedDriver(item)}
                           disabled={isAssigned}
                         >
                           <View style={{ flex: 1 }}>
                             <Text style={[styles.driverName, { color: isSelected ? '#fff' : theme.text }]}>
                               {item.user.firstName} {item.user.lastName}
                             </Text>
                             <Text style={[styles.driverDetail, { color: isSelected ? '#fff' : theme.icon }]}>
                               {item.user.phoneNumber || 'No phone'}
                             </Text>
                             <Text style={[styles.driverDetail, { color: isSelected ? '#fff' : theme.icon }]}>
                               @{item.user.telegramUsername || 'No telegram'}
                             </Text>
                           </View>
                           {isAssigned && (
                             <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                               <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                               <Text style={{ color: '#4CAF50', marginLeft: 5, fontSize: 12 }}>Assigned</Text>
                             </View>
                           )}
                         </TouchableOpacity>
                       );
                     }}
                     ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
                   />
                 </View>
               )}

               {!searchingDrivers && searchQuery.length >= 2 && driversSearchResults?.data?.length === 0 && (
                 <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                   <Text style={{ color: theme.text }}>No drivers found</Text>
                 </View>
               )}

               {selectedDriver && (
                 <View style={{ marginTop: 20 }}>
                   <CustomButton
                     title="Send Assignment Request"
                     onPress={async () => {
                       if (!selectedVehicle || !selectedDriver) return;
                       try {
                         await createAssignmentMutation.mutateAsync({
                           vehicleId: selectedVehicle.id,
                           driverId: selectedDriver.id,
                         });
                         setDriverModalVisible(false);
                         setSelectedDriver(null);
                         setSearchQuery('');
                       } catch (error) {
                         // Error handled by mutation
                       }
                     }}
                     loading={createAssignmentMutation.isPending}
                   />
                 </View>
               )}

               {selectedVehicle && assignmentRequests?.some(
                 (req) => req.vehicleId === selectedVehicle.id && req.status === 'PENDING'
               ) && (
                 <View style={{ marginTop: 20 }}>
                   <Text style={[styles.label, { color: theme.text, marginBottom: 10 }]}>Pending Request</Text>
                   <CustomButton
                     title="Cancel Pending Request"
                     onPress={async () => {
                       const pendingReq = assignmentRequests.find(
                         (req) => req.vehicleId === selectedVehicle.id && req.status === 'PENDING'
                       );
                       if (pendingReq) {
                         try {
                           await cancelAssignmentMutation.mutateAsync(pendingReq.id);
                           setDriverModalVisible(false);
                           setSelectedDriver(null);
                           setSearchQuery('');
                         } catch (error) {
                           // Error handled by mutation
                         }
                       }
                     }}
                     loading={cancelAssignmentMutation.isPending}
                     variant="outline"
                   />
                 </View>
               )}
             </View>
             <Toast />
           </KeyboardAvoidingView>
         </SafeAreaView>
       </Modal>
     </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  card: {
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  licensePlate: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  vehicleType: {
    fontSize: 14,
    marginTop: 2,
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  capacity: {
    fontSize: 14,
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalContent: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderRadius: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 5,
  },
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
   typeChip: {
     paddingHorizontal: 15,
     paddingVertical: 8,
     borderRadius: 20,
     borderWidth: 1,
     borderColor: 'transparent',
   },
    driverText: {
      fontSize: 14,
      fontWeight: '500',
    },
    driverItem: {
      borderRadius: 10,
      padding: 15,
      borderWidth: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    driverName: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 4,
    },
    driverDetail: {
      fontSize: 12,
      marginBottom: 2,
    },
  });
