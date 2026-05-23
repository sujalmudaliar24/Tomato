import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { responsiveHeight, responsiveWidth, responsiveFontSize } from 'react-native-responsive-dimensions';
import { THEME_COLOR } from '../strings';

interface OTPVerificationProps {
  confirmation: any;
  phoneNumber: string;
  onRequestNewConfirmation: (phoneNumber: string) => Promise<any>;
  onSuccess: (user: any) => void;
  onCancel: () => void;
}

const OTPVerification: React.FC<OTPVerificationProps> = ({
  confirmation,
  phoneNumber,
  onRequestNewConfirmation,
  onSuccess,
  onCancel,
}) => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [currentConfirmation, setCurrentConfirmation] = useState<any>(confirmation);

  useEffect(() => {
    setCurrentConfirmation(confirmation);
  }, [confirmation]);

  useEffect(() => {
    if (timeLeft <= 0) {
      setCanResend(true);
      return;
    }

    setCanResend(false);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const verifyOTP = async () => {
    if (otp.length !== 6) {
      Alert.alert('Invalid OTP', 'Please enter a 6-digit OTP');
      return;
    }

    try {
      setLoading(true);
      const user = await currentConfirmation.confirm(otp);
      onSuccess(user);
    } catch (error: any) {
      const errorMsg = error?.message || 'Invalid OTP';
      Alert.alert('Verification Failed', errorMsg);
      setOtp('');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend || loading) return;

    try {
      setLoading(true);
      const newConfirmation = await onRequestNewConfirmation(phoneNumber);
      setCurrentConfirmation(newConfirmation);
      setOtp('');
      setTimeLeft(30);
      setCanResend(false);
      Alert.alert('Success', 'New OTP sent to your device.');
    } catch (error: any) {
      console.error('Resend OTP error:', error);
      Alert.alert('Error', error?.message || 'Failed to resend OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Enter OTP</Text>
        <Text style={styles.subtitle}>Sent to {phoneNumber}</Text>
      </View>

      <View style={styles.otpContainer}>
        <TextInput
          value={otp}
          onChangeText={setOtp}
          style={styles.otpInput}
          autoFocus
          editable={!loading}
          keyboardType="number-pad"
          maxLength={6}
          placeholder="Enter OTP"
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.timerContainer}>
        {timeLeft > 0 ? (
          <Text style={styles.timerText}>You can resend in {timeLeft}s</Text>
        ) : (
          <Text style={styles.expiredText}>You can resend OTP</Text>
        )}
      </View>

      <View style={styles.resendContainer}>
        {canResend ? (
          <TouchableOpacity onPress={handleResendOTP} disabled={loading}>
            <Text style={styles.resendText}>Resend OTP</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.resendWaitText}>Please wait...</Text>
        )}
      </View>

      <TouchableOpacity
        style={[styles.verifyBtn, (loading || otp.length !== 6) && styles.verifyBtnDisabled]}
        onPress={verifyOTP}
        disabled={loading || otp.length !== 6}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.verifyBtnText}>Verify OTP</Text>}
      </TouchableOpacity>

      <TouchableOpacity style={styles.cancelBtn} onPress={onCancel} disabled={loading}>
        <Text style={styles.cancelBtnText}>Change Number</Text>
      </TouchableOpacity>
    </View>
  );
};

export default OTPVerification;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: responsiveWidth(5),
    justifyContent: 'center',
  },
  header: {
    marginBottom: responsiveHeight(4),
    alignItems: 'center',
  },
  title: {
    fontSize: responsiveFontSize(3),
    fontWeight: 'bold',
    color: THEME_COLOR,
    marginBottom: responsiveHeight(1),
  },
  subtitle: {
    fontSize: responsiveFontSize(1.8),
    color: '#666',
  },
  otpContainer: {
    marginVertical: responsiveHeight(3),
    alignItems: 'center',
  },
  otpInput: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    width: responsiveWidth(12),
    height: responsiveWidth(12),
    fontSize: responsiveFontSize(2.5),
    color: THEME_COLOR,
    backgroundColor: '#f9f9f9',
  },
  otpInputFocus: {
    borderColor: THEME_COLOR,
    backgroundColor: '#fff',
  },
  timerContainer: {
    alignItems: 'center',
    marginVertical: responsiveHeight(2),
  },
  timerText: {
    fontSize: responsiveFontSize(1.6),
    color: '#ff9800',
    fontWeight: '500',
  },
  expiredText: {
    fontSize: responsiveFontSize(1.6),
    color: '#4caf50',
    fontWeight: '500',
  },
  resendContainer: {
    alignItems: 'center',
    marginVertical: responsiveHeight(2),
    minHeight: responsiveHeight(3),
    justifyContent: 'center',
  },
  resendText: {
    fontSize: responsiveFontSize(1.6),
    color: THEME_COLOR,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  resendWaitText: {
    fontSize: responsiveFontSize(1.5),
    color: '#999',
  },
  verifyBtn: {
    backgroundColor: THEME_COLOR,
    paddingVertical: responsiveHeight(1.8),
    borderRadius: 8,
    alignItems: 'center',
    marginTop: responsiveHeight(2),
  },
  verifyBtnDisabled: {
    backgroundColor: '#ccc',
  },
  verifyBtnText: {
    color: '#fff',
    fontSize: responsiveFontSize(2),
    fontWeight: '600',
  },
  cancelBtn: {
    paddingVertical: responsiveHeight(1.5),
    alignItems: 'center',
    marginTop: responsiveHeight(1),
  },
  cancelBtnText: {
    color: '#666',
    fontSize: responsiveFontSize(1.7),
    textDecorationLine: 'underline',
  },
});

