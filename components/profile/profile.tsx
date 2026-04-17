import React, { useEffect } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Animated, { ZoomIn, ZoomOut } from 'react-native-reanimated';
import { CustomButton } from '../global/button';
import { useProfile, useUpdateBaseProfile } from '@/query/profile/profile-query';
import { Skeleton } from '../global/skeleton';

// Zod schema for first name and last name
const nameSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
});

type NameFormData = z.infer<typeof nameSchema>;

export  function NameForm() {
  const { data: profile, isLoading } = useProfile();
  const { mutate: updateProfile, isPending } = useUpdateBaseProfile();

  const { control, handleSubmit, reset, formState: { errors } } = useForm<NameFormData>({
    resolver: zodResolver(nameSchema),
    defaultValues: {
      firstName: profile?.firstName || '',
      lastName: profile?.lastName || '',
    },
  });

  useEffect(() => {
    if (profile) {
      reset({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
      });
    }
  }, [profile, reset]);

  const onSubmit = (data: NameFormData) => {
    updateProfile(data);
  };

  if (isLoading) {
    return (
      <View style={{ padding: 20 }}>
        <View style={{ backgroundColor: "rgba(255,255,255,0.03)", padding: 20, borderRadius: 10 }}>
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
    <Animated.View entering={ZoomIn} exiting={ZoomOut} style={styles.wrapper}>
      <View style={styles.container}>
      <Controller
        control={control}
        name="firstName"
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>First Name</Text>
            <TextInput
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="Enter your first name"
              placeholderTextColor="rgba(255,255,255,0.3)"
              style={[styles.input, errors.firstName && styles.errorInput]}
            />
            {errors.firstName && <Text style={styles.errorText}>{errors.firstName.message}</Text>}
          </View>
        )}
      />

      {/* Last Name */}
      <Controller
        control={control}
        name="lastName"
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Last Name</Text>
            <TextInput
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="Enter your last name"
              placeholderTextColor="rgba(255,255,255,0.3)"
              style={[styles.input, errors.lastName && styles.errorInput]}
            />
            {errors.lastName && <Text style={styles.errorText}>{errors.lastName.message}</Text>}
          </View>
        )}
      />

<CustomButton 
  title={isPending ? "Updating..." : "Save Changes"} 
  loading={isPending} 
  onPress={handleSubmit(onSubmit)} 
/>
      {/* <Button  title="Submit" onPress={handleSubmit(onSubmit)}  /> */}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  container: {
    padding: 20,
    justifyContent: 'flex-start',
    backgroundColor: "rgba(255,255,255,0.02)", borderRadius: 20, borderWidth: 1, borderColor: "rgba(255,255,255,0.05)",
  },
  fieldGroup: {
    marginBottom: 4,
  },
  label: {
    // marginBottom: 5,
    fontWeight: "600", fontSize: 13, marginBottom: 8, color: "rgba(255,255,255,0.7)",
    
  },
  input: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    backgroundColor: "rgba(255,255,255,0.03)",
    color: "#FFF",
  },
  errorInput: {
    borderColor: '#E74C3C', // red for errors
  },
  errorText: {
    color: '#E74C3C',
    marginBottom: 16,
  },
});
