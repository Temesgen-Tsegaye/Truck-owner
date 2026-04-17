import React, { useEffect, useCallback } from 'react';
import { View, Text, TextInput, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Animated, { FadeIn, ZoomIn, ZoomOut } from 'react-native-reanimated';
import { IconSymbol } from '../ui/icon-symbol';
import { useProfile, useUpdatePhoneNumber, useInitiatePhoneVerification } from '@/query/profile/profile-query';
import { CustomButton } from '../global/button';
import { Skeleton } from '../global/skeleton';
import Toast from 'react-native-toast-message';


const phoneSchema = z.object({
  phoneNumber: z
    .string()
    .trim()
    .transform((value) => {
      // remove spaces, dashes, parentheses
      let normalized = value.replace(/[^\d+]/g, '');

      // +251XXXXXXXXX → 251XXXXXXXXX
      if (normalized.startsWith('+251')) {
        normalized = normalized.slice(1);
      }

      // 09XXXXXXXX → 2519XXXXXXXX
      if (normalized.startsWith('09')) {
        normalized = '251' + normalized.slice(1);
      }

      // 07XXXXXXXX → 2517XXXXXXXX
      if (normalized.startsWith('07')) {
        normalized = '251' + normalized.slice(1);
      }

      // 9XXXXXXXX or 7XXXXXXXX
      if (/^[79]\d{8}$/.test(normalized)) {
        normalized = '251' + normalized;
      }

      return normalized;
    })
    .refine(
      (value) => /^251(9\d{8}|7\d{8})$/.test(value),
      {
        message: 'Invalid Ethiopian phone number. Expected Ethio Telecom or Safaricom.',
      },
    ),
});

type PhoneFormData = z.infer<typeof phoneSchema>;

export function PhoneForm() {
  const { data: profile, isLoading: isProfileLoading } = useProfile();
  const { mutate: updatePhone, isPending: isUpdating } = useUpdatePhoneNumber();
  const { mutate: initiateVerify, isPending: isInitiating } = useInitiatePhoneVerification();

  const { control, handleSubmit, reset, formState: { errors } } = useForm<PhoneFormData>({
    resolver: zodResolver(phoneSchema),
    defaultValues: {
      phoneNumber: '',
    },
  });

  useEffect(() => {
    if (profile?.phoneNumber) {
      reset({ phoneNumber: profile.phoneNumber });
    }
  }, [profile, reset]);

  const onUpdate = (data: PhoneFormData) => {
    if (!data.phoneNumber) {
      Toast.show({
        type: 'error',
        text1: 'Phone number required',
        text2: 'Please enter a valid phone number',
      });
      return;
    }

    if (data.phoneNumber === profile?.phoneNumber) {
      Toast.show({
        type: 'info',
        text1: 'No changes detected',
        text2: 'Update the number before saving',
      });
      return;
    }

    updatePhone(data.phoneNumber);
  };

  const onInvalid = useCallback(() => {
    Toast.show({
      type: 'error',
      text1: 'Invalid phone number',
      text2: 'Please check the format and try again',
    });
  }, []);

  if (isProfileLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Skeleton width={100} height={16} style={{ marginBottom: 8 }} />
          <View style={styles.inputContainer}>
            <Skeleton width="100%" height={48} borderRadius={8} style={{ flex: 1 }} />
            <Skeleton width={80} height={48} borderRadius={8} />
          </View>
          <View style={styles.statusSection}>
            <Skeleton width="100%" height={100} borderRadius={12} />
          </View>
        </View>
      </View>
    );
  }

  const isVerified = profile?.phoneVerified;

  return (
    <Animated.View entering={ZoomIn} exiting={ZoomOut} style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.label}>Phone Number</Text>

        {isVerified && profile?.phoneNumber ? (
          <View style={styles.verifiedRow}>
            <Text style={styles.verifiedPhoneText}>{profile.phoneNumber}</Text>
            <Animated.View entering={ZoomIn} style={styles.verifiedBadge}>
              <IconSymbol name="checkmark.seal.fill" size={20} color="#ff642f" />
              <Text style={styles.verifiedText}>Verified</Text>
            </Animated.View>
          </View>
        ) : (
          <>
            <View style={styles.inputContainer}>
              <Controller
                control={control}
                name="phoneNumber"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="09..."
                    keyboardType="phone-pad"
                    style={[styles.input, errors.phoneNumber && styles.errorInput]}
                  />
                )}
              />
              <TouchableOpacity 
                style={[styles.sideButton, (isUpdating) && styles.disabledButton]} 
                onPress={handleSubmit(onUpdate, onInvalid)}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text style={styles.sideButtonText}>Update</Text>
                )}
              </TouchableOpacity>
            </View>
            {errors.phoneNumber && <Text style={styles.errorText}>{errors.phoneNumber.message}</Text>}

            {/* Verification Status */}
            <View style={styles.statusSection}>
              {profile?.phoneNumber ? (
                <Animated.View entering={FadeIn} exiting={ZoomOut} style={styles.unverifiedContainer}>
                  <View style={styles.unverifiedTextContainer}>
                    <Text style={styles.unverifiedTitle}>Your phone is not verified</Text>
                    <Text style={styles.unverifiedSub}>Verify your phone to access all features</Text>
                  </View>
                  <CustomButton
                    title="Verify via Telegram"
                    onPress={() => initiateVerify()}
                    loading={isInitiating}
                    style={styles.verifyButton}
                  />
                </Animated.View>
              ) : null}
            </View>
          </>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  card: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    backgroundColor: "rgba(255,255,255,0.02)",
    marginVertical: 10,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
    color: "rgba(255,255,255,0.7)",
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    height: 54,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 16,
    paddingHorizontal: 16,
    fontSize: 15,
    color: "#FFF",
  },
  errorInput: {
    borderColor: '#E0245E',
  },
  sideButton: {
    backgroundColor: "#ff642f",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
  },
  disabledButton: {
    opacity: 0.6,
  },
  sideButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 14,
  },
  errorText: {
    color: '#E0245E',
    fontSize: 12,
    marginTop: 4,
  },
  statusSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F3F5',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(56, 9, 100, 0.1)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: 'flex-start',
    gap: 6,
  },
  verifiedText: {
    color: '#ff642f',
    fontWeight: '700',
    fontSize: 14,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  verifiedPhoneText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  unverifiedContainer: {
    backgroundColor: '#FFF9F2',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFECCF',
  },
  unverifiedTextContainer: {
    marginBottom: 12,
  },
  unverifiedTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#855D10',
  },
  unverifiedSub: {
    fontSize: 13,
    color: '#B08B45',
    marginTop: 2,
  },
  verifyButton: {
    height: 44,
    backgroundColor: "#ff642f",
  },
});
