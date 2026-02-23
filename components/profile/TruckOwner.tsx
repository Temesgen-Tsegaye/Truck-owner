import React, { useEffect } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Animated, { ZoomIn, ZoomOut } from 'react-native-reanimated';
import { CustomButton } from '../global/button';
import { useProfile, useUpdateProfileByType } from '@/query/profile/profile-query';
import { UpdateVehicleOwnerInput } from '@/query/profile/types';
import { Skeleton } from '../global/skeleton';
import { useTheme } from 'react-native-paper';

// Zod schema for Truck Owner
const truckOwnerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  contactInfo: z.string().min(1, 'Contact information is required'),
});

type TruckOwnerFormData = z.infer<typeof truckOwnerSchema>;

export function TruckOwnerForm() {
  const { data: profile, isLoading: isProfileLoading } = useProfile();
  const { mutate: updateProfile, isPending } = useUpdateProfileByType();
  const theme = useTheme();

  const { control, handleSubmit, reset, formState: { errors } } = useForm<TruckOwnerFormData>({
    resolver: zodResolver(truckOwnerSchema),
    defaultValues: {
      name: profile?.vehicleOwner?.name || '',
      contactInfo: profile?.vehicleOwner?.contactInfo || '',
    },
  });

  useEffect(() => {
    if (profile?.vehicleOwner) {
      reset({
        name: profile.vehicleOwner.name || '',
        contactInfo: profile.vehicleOwner.contactInfo || '',
      });
    }
  }, [profile, reset]);

  const onSubmit = (data: TruckOwnerFormData) => {
    const payload: UpdateVehicleOwnerInput = {
      name: data.name,
      contactInfo: data.contactInfo,
    };

    updateProfile({
      type: 'vehicleOwner',
      data: payload,
    });
  };

  if (isProfileLoading) {
    return (
      <View style={{ padding: 20 }}>
        <View style={[styles.formCard, { backgroundColor: theme.colors.surface }]}>
          {[1, 2].map((i) => (
            <View key={i} style={{ marginBottom: 15 }}>
              <Skeleton width={100} height={16} style={{ marginBottom: 8 }} />
              <Skeleton width="100%" height={45} borderRadius={6} />
            </View>
          ))}
          <Skeleton width="100%" height={50} borderRadius={8} style={{ marginTop: 10 }} />
        </View>
      </View>
    );
  }

  return (
    <Animated.View entering={ZoomIn} exiting={ZoomOut}>
      <View style={[styles.formCard, { backgroundColor: theme.colors.surface }]}>
        {/* Name */}
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, onBlur, value } }) => (
            <>
              <Text style={[styles.label, { color: theme.colors.onSurface }]}>Company / Owner Name</Text>
              <TextInput
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="Enter your name"
                placeholderTextColor={theme.colors.onSurfaceVariant}
                style={[
                  styles.input, 
                  { 
                    backgroundColor: theme.colors.surface, 
                    color: theme.colors.onSurface,
                    borderColor: theme.colors.outline
                  },
                  errors.name && { borderColor: theme.colors.error }
                ]}
              />
              {errors.name && <Text style={[styles.errorText, { color: theme.colors.error }]}>{errors.name.message}</Text>}
            </>
          )}
        />

        {/* Contact Info */}
        <Controller
          control={control}
          name="contactInfo"
          render={({ field: { onChange, onBlur, value } }) => (
            <>
              <Text style={[styles.label, { color: theme.colors.onSurface }]}>Contact Information</Text>
              <TextInput
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="Enter contact details (email/phone)"
                placeholderTextColor={theme.colors.onSurfaceVariant}
                style={[
                  styles.input, 
                  { 
                    backgroundColor: theme.colors.surface, 
                    color: theme.colors.onSurface,
                    borderColor: theme.colors.outline
                  },
                  errors.contactInfo && { borderColor: theme.colors.error }
                ]}
              />
              {errors.contactInfo && <Text style={[styles.errorText, { color: theme.colors.error }]}>{errors.contactInfo.message}</Text>}
            </>
          )}
        />

        <CustomButton
          title={isPending ? "Updating..." : "Save Changes"}
          onPress={handleSubmit(onSubmit)}
          loading={isPending}
          style={{ marginTop: 10 }}
        />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  formCard: {
    padding: 20,
    borderRadius: 12,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 12,
    fontSize: 16,
  },
  errorText: {
    fontSize: 12,
    marginBottom: 10,
    marginTop: -8,
  },
});
