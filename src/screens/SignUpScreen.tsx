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
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';

import React, { useState } from 'react';

import {
  responsiveHeight,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';

import {
  LOGIN_TITLE,
  THEME_COLOR,
} from '../strings';

import auth from '@react-native-firebase/auth';



const SignUpScreen = ({
  navigation,
}: any) => {

  // STATES
  const [name, setName] =
    useState('');

  const [email, setEmail] =
    useState('');

  const [password, setPassword] =
    useState('');

  const [confirmPassword,
    setConfirmPassword] =
    useState('');

  const [loading, setLoading] =
    useState(false);





  const signupUser = async () => {

    // VALIDATIONS
    if (
      !name ||
      !email ||
      !password ||
      !confirmPassword
    ) {

      Alert.alert(
        'Error',
        'Please fill all fields'
      );

      return;
    }


    // PASSWORD MATCH
    if (
      password !== confirmPassword
    ) {

      Alert.alert(
        'Error',
        'Passwords do not match'
      );

      return;
    }


    // PASSWORD LENGTH
    if (password.length < 6) {

      Alert.alert(
        'Weak Password',
        'Password must be at least 6 characters'
      );

      return;
    }


    try {

      setLoading(true);


      // CREATE USER
      const response =
        await auth()
          .createUserWithEmailAndPassword(
            email.trim(),
            password
          );


      // UPDATE USER NAME
      await response.user.updateProfile({
        displayName: name,
      });


      // SEND EMAIL VERIFICATION
      await response.user
        .sendEmailVerification();


      // GET FIREBASE TOKEN
      const token =
        await response.user
          .getIdToken();


      // SEND TOKEN TO BACKEND
      const backendResponse =
        await fetch(
'http://10.211.48.23:8080/auth/verify-token',
          {

            method: 'POST',

            headers: {
              'Content-Type':
                'application/json',
            },

            body: JSON.stringify({
              token,
            }),

          }
        );


      const data =
        await backendResponse.json();


      console.log(
        'Backend Verified:',
        data
      );


      Alert.alert(

        'Verify Your Email',

        'A verification email has been sent. Please verify your email before logging in.',

        [
          {
            text: 'OK',

            onPress: async () => {

              await auth().signOut();

              navigation.navigate(
                'Login'
              );

            },
          },
        ]

      );


    } catch (e: any) {

      console.log(e);

      Alert.alert(

        'Signup Failed',

        e?.message ||
          'Something went wrong'

      );

    } finally {

      setLoading(false);
    }
  };



  return (

    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >

      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'flex-start',
          paddingBottom: 20,
        }}
        keyboardShouldPersistTaps="handled"
      >

        {/* TOP BANNER */}
        <View style={styles.topView}>

          <Image
            source={require('../assets/images/banner.png')}
            style={styles.banner}
          />

        </View>

        {/* TITLE */}
        <Text style={styles.loginTitle}>
          Create Account
        </Text>

        {/* DIVIDER */}
        <View style={styles.divider}>

          <View
            style={styles.dividerView}
          />

          <Text
            style={styles.dividerText}
          >
            Sign up with Email
          </Text>

          <View
            style={styles.dividerView}
          />

        </View>

        {/* NAME INPUT */}
        <TextInput

          placeholder="Full Name"

          placeholderTextColor="#000"

          value={name}

          onChangeText={setName}

          style={styles.mobileInput}

          autoCapitalize="words"

        />

        {/* EMAIL INPUT */}
        <TextInput

          placeholder="Email Address"

          placeholderTextColor="#000"

          value={email}

          onChangeText={setEmail}

          style={styles.mobileInput}

          keyboardType="email-address"

          autoCapitalize="none"

          autoCorrect={false}

        />

        {/* PASSWORD INPUT */}
        <TextInput

          placeholder="Password"

          placeholderTextColor="#000"

          value={password}

          onChangeText={setPassword}

          style={styles.mobileInput}

          secureTextEntry

          autoCapitalize="none"

        
        />

        {/* CONFIRM PASSWORD */}
        <TextInput

          placeholder="Confirm Password"

          placeholderTextColor="#000"

          value={confirmPassword}

          onChangeText={
            setConfirmPassword
          }

          style={styles.mobileInput}

          secureTextEntry

          autoCapitalize="none"

        />

        {/* SIGNUP BUTTON */}
        <TouchableOpacity

          style={styles.loginBtn}

          onPress={signupUser}

          disabled={loading}

        >

          {loading ? (

            <ActivityIndicator
              color="#fff"
            />

          ) : (

            <Text
              style={styles.LoginBtnText}
            >
              Create Account
            </Text>

          )}

        </TouchableOpacity>

        {/* LOGIN BUTTON */}
        <TouchableOpacity

          style={styles.signupBtn}

          onPress={() =>
            navigation.navigate(
              'Login'
            )
          }

        >

          <Text style={styles.signupText}>

            Already have an account? Login

          </Text>

        </TouchableOpacity>

      </ScrollView>

    </KeyboardAvoidingView>
  );
};

export default SignUpScreen;



const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  topView: {
    height: responsiveHeight(35),
  },

  banner: {

    width: '100%',

    height: '100%',

    borderBottomLeftRadius:
      Platform.OS === 'ios'
        ? 50
        : 0,

    borderBottomRightRadius:
      Platform.OS === 'ios'
        ? 50
        : 0,
  },

  loginTitle: {

    fontSize:
      responsiveFontSize(3.5),

    fontWeight: '800',

    color: '#000',

    alignSelf: 'center',

    width: '85%',

    textAlign: 'center',

    marginTop:
      responsiveHeight(5),
  },

  divider: {

    flexDirection: 'row',

    width: '100%',

    marginTop:
      responsiveHeight(4),

    alignItems: 'center',

    justifyContent:
      'space-evenly',
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

    fontSize:
      responsiveFontSize(2.2),

    color: '#8e8e8e',
  },

  mobileInput: {

    borderWidth: 1,

    borderRadius: 10,

    height: 55,

    borderColor: '#8e8e8e',

    marginTop:
      responsiveHeight(3),

    width: '85%',

    alignSelf: 'center',

    paddingHorizontal: 15,

    color: '#000',

    backgroundColor: '#fff',
  },

  loginBtn: {

    backgroundColor:
      THEME_COLOR,

    width: '85%',

    height: 55,

    borderRadius: 10,

    marginTop:
      responsiveHeight(5),

    justifyContent: 'center',

    alignItems: 'center',

    alignSelf: 'center',
  },

  LoginBtnText: {

    fontSize:
      responsiveFontSize(2.3),

    fontWeight: '700',

    color: '#fff',
  },

  signupBtn: {

    marginTop:
      responsiveHeight(3),

    alignSelf: 'center',
  },

  signupText: {

    color: THEME_COLOR,

    fontSize:
      responsiveFontSize(2),

    fontWeight: '700',
  },

});