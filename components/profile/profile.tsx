import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import * as ImagePicker from 'expo-image-picker';
import Animated, { ZoomIn, ZoomOut } from 'react-native-reanimated';
import { CustomButton } from '../global/button';
import { useProfile, useUpdateBaseProfile } from '@/query/profile/profile-query';
import { Skeleton } from '../global/skeleton';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/context/theme-context';
import { Colors } from '@/constants/theme';

const API_URL = process.env.EXPO_PUBLIC_API_URL || process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:3000';

const resolveUri = (uri: string | null | undefined): string | undefined => {
  if (!uri) return undefined;
  if (uri.startsWith('http') || uri.startsWith('data:')) return uri;
  return `${API_URL}${uri}`;
};

// Zod schema for first name, last name, and profile picture
const nameSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  profilePicture: z.string().optional(),
});

type NameFormData = z.infer<typeof nameSchema>;

export  function NameForm() {
  const { data: profile, isLoading } = useProfile();
  const { mutate: updateProfile, isPending } = useUpdateBaseProfile();

  const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm<NameFormData>({
    resolver: zodResolver(nameSchema),
    defaultValues: {
      firstName: profile?.firstName || '',
      lastName: profile?.lastName || '',
      profilePicture: profile?.profilePicture || '',
    },
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { isDarkMode } = useAppTheme();
  const theme = Colors[isDarkMode ? "dark" : "light"];

  useEffect(() => {
    if (profile) {
      reset({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        profilePicture: profile.profilePicture || '',
      });
      if (profile.profilePicture) {
        setImagePreview(resolveUri(profile.profilePicture) || null);
      }
    }
  }, [profile, reset]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setImagePreview(base64Image);
      setValue('profilePicture', base64Image, { shouldDirty: true });
    }
  };

  const onSubmit = (data: NameFormData) => {
    updateProfile(data);
  };

  if (isLoading) {
    return (
      <View style={{ padding: 20 }}>
        <View style={{ backgroundColor: theme.overlay, padding: 20, borderRadius: 10 }}>
          <View style={{ alignSelf: 'center', marginBottom: 20 }}>
            <Skeleton width={100} height={100} borderRadius={50} />
          </View>
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
      <View style={[styles.container, { backgroundColor: theme.card, borderColor: theme.border }]}>
      
      {/* Profile Picture */}
      <View style={styles.avatarContainer}>
        <TouchableOpacity onPress={pickImage} style={styles.avatarTouchable}>
          {imagePreview ? (
            <Image source={{ uri: imagePreview }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: theme.overlay }]}>
              <Ionicons name="person" size={40} color={theme.subtext} />
            </View>
          )}
          <View style={styles.editBadge}>
            <Ionicons name="camera" size={16} color="#FFF" />
          </View>
        </TouchableOpacity>
      </View>

      <Controller
        control={control}
        name="firstName"
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: theme.text }]}>First Name</Text>
            <TextInput
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="Enter your first name"
              placeholderTextColor={theme.subtext}
              style={[styles.input, { backgroundColor: theme.overlay, borderColor: theme.border, color: theme.text }, errors.firstName && styles.errorInput]}
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
            <Text style={[styles.label, { color: theme.text }]}>Last Name</Text>
            <TextInput
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="Enter your last name"
              placeholderTextColor={theme.subtext}
              style={[styles.input, { backgroundColor: theme.overlay, borderColor: theme.border, color: theme.text }, errors.lastName && styles.errorInput]}
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
    borderRadius: 20,
    borderWidth: 1,
  },
  fieldGroup: {
    marginBottom: 4,
  },
  label: {
    fontWeight: "600",
    fontSize: 13,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  errorInput: {
    borderColor: '#E74C3C', // red for errors
  },
  errorText: {
    color: '#E74C3C',
    marginBottom: 16,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarTouchable: {
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#3498DB',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000',
  },
});
