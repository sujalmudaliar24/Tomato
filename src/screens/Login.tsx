import {
  StyleSheet,
  Text,
  View,
  Image,
  Platform,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';

import React, { useState } from 'react';

import {
  responsiveHeight,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';

import { LOGIN_TITLE, THEME_COLOR } from '../strings';

import auth, {
  FirebaseAuthTypes,
} from '@react-native-firebase/auth';

import OtpInput from '@twotalltotems/react-native-otp-input';



const Login = () => {

  const [mobile, setMobile] = useState<string>('');

  const [confirm, setConfirm] =
    useState<FirebaseAuthTypes.ConfirmationResult | null>(
      null
    );

  const [otp, setOtp] = useState<string>('');

  const [loadingOtp, setLoadingOtp] =
    useState(false);

  const [otpError, setOtpError] =
    useState<string | null>(null);

  const OTP_LENGTH = 6;

  const RESEND_COOLDOWN_SECONDS = 30;

  const [cooldown, setCooldown] = useState(0);

  const canResend = cooldown === 0;


  React.useEffect(() => {

    if (!confirm) return;

    if (cooldown <= 0) return;

    const id = setInterval(() => {

      setCooldown((s) =>
        Math.max(0, s - 1)
      );

    }, 1000);

    return () => clearInterval(id);

  }, [confirm, cooldown]);


  // VERIFY OTP
  const verifyOtp = async () => {

    if (!confirm) return;

    const code = otp.trim();

    if (code.length !== OTP_LENGTH) {

      setOtpError(
        'Enter the 6-digit OTP.'
      );

      return;
    }

    try {

      setOtpError(null);

      setLoadingOtp(true);

      const res =
        await confirm.confirm(code);

      console.log(
        'OTP verified user:',
        (res as any)?.user ?? res
      );

      Alert.alert(
        'Success',
        'OTP Verified Successfully'
      );

    } catch (e: any) {

      const message =
        typeof e?.message === 'string'
          ? e.message
          : 'OTP verification failed.';

      setOtpError(message);

      Alert.alert(
        'Verification failed',
        message
      );

    } finally {

      setLoadingOtp(false);
    }
  };


  // RESEND OTP
  const resendOtp = async () => {

    if (!canResend || loadingOtp) return;

    try {

      setOtpError(null);

      setLoadingOtp(true);

      const trimmed = mobile.trim();

      const newConfirmation =
        await auth().signInWithPhoneNumber(
          `+91${trimmed}`
        );

      setConfirm(newConfirmation);

      setOtp('');

      setCooldown(
        RESEND_COOLDOWN_SECONDS
      );

    } catch (e: any) {

      const message =
        typeof e?.message === 'string'
          ? e.message
          : 'Could not resend OTP.';

      setOtpError(message);

      Alert.alert(
        'Resend failed',
        message
      );

    } finally {

      setLoadingOtp(false);
    }
  };


  // SEND OTP
  const signInWithPhoneNumber = async () => {

    const trimmed = mobile.trim();

    if (trimmed.length !== 10) {

      Alert.alert(
        'Invalid number',
        'Please enter a valid 10-digit mobile number.'
      );

      return;
    }

    try {

      const confirmation =
        await auth().signInWithPhoneNumber(
          `+91${trimmed}`
        );

      setConfirm(confirmation);

      setCooldown(
        RESEND_COOLDOWN_SECONDS
      );

      console.log(confirmation);

      Alert.alert(
        'OTP Sent',
        'OTP has been sent successfully.'
      );

    } catch (error: any) {

      console.log(error);

      Alert.alert(
        'Error',
        error?.message ||
          'Failed to send OTP.'
      );
    }
  };


  return (

    <View style={styles.container}>

      <View style={styles.topView}>

        <Image
          source={require('../assets/images/banner.png')}
          style={styles.banner}
        />

      </View>


      <Text style={styles.loginTitle}>
        {LOGIN_TITLE}
      </Text>


      <View style={styles.divider}>

        <View style={styles.dividerView} />

        <Text style={styles.dividerText}>
          Login or Sign up
        </Text>

        <View style={styles.dividerView} />

      </View>



      {confirm ? (

        <View>

          <Text style={styles.otpTitle}>
            Verify OTP
          </Text>

          <Text style={styles.otpSubtitle}>
            Enter the 6-digit code sent to
            +91 {mobile}
          </Text>


          {/* OTP INPUT */}
          <View style={styles.otpWrap}>

            <OtpInput
              pinCount={6}
              code={otp}
              onCodeChanged={setOtp}
              autoFocusOnLoad
              keyboardType="number-pad"
              secureTextEntry={false}
              placeholderCharacter="•"
              style={styles.otpInputContainer}
              codeInputFieldStyle={
                styles.otpInput
              }
              codeInputHighlightStyle={
                styles.otpInputHighlight
              }
            />

          </View>


          {otpError ? (

            <Text style={styles.otpError}>
              {otpError}
            </Text>

          ) : null}


          {/* VERIFY BUTTON */}
          <TouchableOpacity
            style={[
              styles.verifyBtn,
              loadingOtp
                ? { opacity: 0.7 }
                : null,
            ]}
            disabled={loadingOtp}
            onPress={verifyOtp}
          >

            {loadingOtp ? (

              <ActivityIndicator
                color="#fff"
              />

            ) : (

              <Text style={styles.verifyText}>
                Verify
              </Text>

            )}

          </TouchableOpacity>


          {/* RESEND OTP */}
          <TouchableOpacity
            style={[
              styles.resendBtn,
              !canResend
                ? { opacity: 0.6 }
                : null,
            ]}
            disabled={
              !canResend || loadingOtp
            }
            onPress={resendOtp}
          >

            <Text style={styles.resendText}>

              {canResend
                ? 'Resend OTP'
                : `Resend OTP (${cooldown}s)`}

            </Text>

          </TouchableOpacity>


          {/* CHANGE NUMBER */}
          <TouchableOpacity
            style={styles.changeBtn}
            onPress={() => setConfirm(null)}
            disabled={loadingOtp}
          >

            <Text style={styles.changeText}>
              Change number
            </Text>

          </TouchableOpacity>

        </View>

      ) : (

        <View>

          <TextInput
            placeholder="mobile number"
            value={mobile}
            onChangeText={(txt) =>
              setMobile(txt)
            }
            style={styles.mobileInput}
            keyboardType="number-pad"
            maxLength={10}
          />


          <TouchableOpacity
            style={styles.loginBtn}
            onPress={signInWithPhoneNumber}
          >

            <Text style={styles.LoginBtnText}>
              Login
            </Text>

          </TouchableOpacity>

        </View>

      )}

    </View>
  );
};

export default Login;



const styles = StyleSheet.create({

  container: {
    flex: 1,
  },

  topView: {
    height: responsiveHeight(35),
  },

  banner: {
    width: '100%',
    height: '100%',
    borderBottomLeftRadius:
      Platform.OS === 'ios' ? 50 : 0,
    borderBottomRightRadius:
      Platform.OS === 'ios' ? 50 : 0,
  },

  loginTitle: {
    fontSize: responsiveFontSize(3.5),
    fontWeight: '800',
    color: '#000',
    alignSelf: 'center',
    width: '85%',
    textAlign: 'center',
    marginTop: responsiveHeight(5),
  },

  divider: {
    flexDirection: 'row',
    width: '100%',
    marginTop: responsiveHeight(4),
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },

  dividerView: {
    height: 1,
    backgroundColor: '#8e8e8e',
    width: '25%',
    opacity: 0.5,
    marginRight: 20,
    marginLeft: 20,
  },

  dividerText: {
    fontSize: responsiveFontSize(2.5),
    color: '#8e8e8e',
  },

  mobileInput: {
    borderWidth: 1,
    borderRadius: 10,
    height: 50,
    borderColor: '#8e8e8e',
    marginTop: responsiveHeight(4),
    width: '85%',
    alignSelf: 'center',
    padding: 10,
  },

  loginBtn: {
    backgroundColor: THEME_COLOR,
    width: '85%',
    height: 50,
    borderRadius: 10,
    marginTop: responsiveHeight(5),
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },

  LoginBtnText: {
    fontSize: responsiveFontSize(2.5),
    fontWeight: '600',
    color: '#fff',
  },

  otpTitle: {
    fontSize: responsiveFontSize(3.2),
    fontWeight: '800',
    color: '#111',
    marginTop: responsiveHeight(2),
    textAlign: 'center',
  },

  otpSubtitle: {
    marginTop: responsiveHeight(0.7),
    fontSize: responsiveFontSize(1.9),
    color: '#666',
    lineHeight: 24,
    marginBottom: responsiveHeight(2),
    textAlign: 'center',
  },

  otpWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: responsiveHeight(1),
  },

  otpInputContainer: {
    width: '90%',
    height: 60,
    alignSelf: 'center',
  },

  otpInput: {
    width: 45,
    height: 55,

    borderWidth: 1,
    borderColor: '#d1d1d1',

    borderRadius: 12,

    backgroundColor: '#fff',

    color: '#111',

    fontSize: responsiveFontSize(2.5),
    fontWeight: '800',

    textAlign: 'center',
  },

  otpInputHighlight: {
    borderColor: THEME_COLOR,
    borderWidth: 2,
    borderRadius: 12,
  },

  otpError: {
    marginTop: responsiveHeight(1),
    color: '#E53935',
    fontSize: responsiveFontSize(1.8),
    fontWeight: '600',
    textAlign: 'center',
  },

  verifyBtn: {
    marginTop: responsiveHeight(2.2),
    backgroundColor: THEME_COLOR,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    width: '85%',
    alignSelf: 'center',
  },

  verifyText: {
    color: '#fff',
    fontSize: responsiveFontSize(2.2),
    fontWeight: '800',
  },

  resendBtn: {
    marginTop: responsiveHeight(2),
    alignItems: 'center',
    justifyContent: 'center',
  },

  resendText: {
    color: THEME_COLOR,
    fontSize: responsiveFontSize(2),
    fontWeight: '700',
  },

  changeBtn: {
    marginTop: responsiveHeight(1.3),
    alignItems: 'center',
    justifyContent: 'center',
  },

  changeText: {
    color: '#666',
    fontSize: responsiveFontSize(1.9),
    fontWeight: '700',
  },

});