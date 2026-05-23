import { StyleSheet, Text, View, Image, Platform, TouchableOpacity, TextInput, Alert } from 'react-native';
import React, { useState } from 'react';
import { responsiveHeight, responsiveFontSize } from 'react-native-responsive-dimensions';
import { LOGIN_TITLE, THEME_COLOR } from '../strings';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import OTPVerification from './OTPVerification';
import Clipboard from '@react-native-clipboard/clipboard';




const Login = () => {
  const [mobile, setMobile] = useState<string>('');
  const [confirm, setConfirm] = useState<FirebaseAuthTypes.ConfirmationResult | null>(null);

  const signInWithPhoneNumber = async () => {
    const trimmed = mobile.trim();
    if (trimmed.length !== 10) {
      Alert.alert('Invalid number', 'Please enter a valid 10-digit mobile number.');
      return;
    }

    const confirmation = await auth().signInWithPhoneNumber(`+91${trimmed}`);
    setConfirm(confirmation);
    console.log(confirmation);
  };

 
  return (
    <View style={styles.container}>
      <View style={styles.topView}>
        <Image source={require('../assets/images/banner.png')} style={styles.banner} />
      </View>

      <Text style={styles.loginTitle}>{LOGIN_TITLE}</Text>

      <View style={styles.divider}>
        <View style={styles.dividerView} />
        <Text style={styles.dividerText}>Login or Sign up</Text>
        <View style={styles.dividerView} />
      </View>

      
      {confirm ? (
        <OTPVerification
          confirmation={confirm}
          phoneNumber={mobile}
          onRequestNewConfirmation={async (phoneNumber) => {
            const trimmed = phoneNumber.trim();
            const newConfirmation = await auth().signInWithPhoneNumber(`+91${trimmed}`);
            setConfirm(newConfirmation);
            return newConfirmation;
          }}
          onSuccess={(user) => {
            console.log('OTP verified user:', user);
          }}
          onCancel={() => {
            setConfirm(null);
          }}
        />
      ) : (
        <View>
          <TextInput
            placeholder="mobile number"
            value={mobile}
            onChangeText={(txt) => setMobile(txt)}
            style={styles.mobileInput}
            keyboardType="number-pad"
            maxLength={10}
          />

          <TouchableOpacity style={[styles.loginBtn]} onPress={signInWithPhoneNumber}>
            <Text style={styles.LoginBtnText}>Login</Text>
          </TouchableOpacity>
        </View>
      )}

      <View>

      </View>
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
    borderBottomLeftRadius: Platform.OS === 'ios' ? 50 : 0,
    borderBottomRightRadius: Platform.OS === 'ios' ? 50 : 0,
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

  borderStyleBase: {
    width: 30,
    height: 45
  },

  borderStyleHighLighted: {
    borderColor: "#03DAC6",
  },

  underlineStyleBase: {
    width: 30,
    height: 45,
    borderWidth: 0,
    borderBottomWidth: 1,
  },

  underlineStyleHighLighted: {
    borderColor: "#03DAC6",
  },
  
});

