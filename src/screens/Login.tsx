import { StyleSheet, Text, View, Image, Platform, TouchableOpacity, TextInput, Alert, ActivityIndicator, ScrollView, KeyboardAvoidingView, FlatList, AppState, } from 'react-native';
import Modal from 'react-native-modal';
import React, { useState, useEffect } from 'react';
import { responsiveHeight, responsiveFontSize, } from 'react-native-responsive-dimensions';
import { LOGIN_TITLE, THEME_COLOR, } from '../strings';
import auth from '@react-native-firebase/auth';
import { useNavigation, type NavigationProp, type ParamListBase, } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { verifyToken } from '../services/authBackend';


const Login = () => {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();

  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (state) => {
      if (state === 'active') {
        const user = auth().currentUser;
        if (user) {
          try {
            await user.reload();
            if (user.emailVerified) {
              navigation.navigate('MainScreen');
            }
          } catch (e) {
            console.log('Error reloading user on app resume', e);
          }
        }
      }
    });

    return () => {
      subscription.remove();
    };
  }, [navigation]);

  const [visible, setVisible] = useState(false);
  const [input, setInput] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [languages, setLanguages] = useState([
    { name: 'English', selected: true },
    { name: 'हिंदी', selected: false },
    { name: 'తెలుగు', selected: false },
    { name: 'मराठी', selected: false },
    { name: 'தமிழ்', selected: false },
    { name: 'ગુજરાતી', selected: false }
  ]);
  const OnSelect = (index: number) => {
    const updatedLanguages = languages.map((item, ind) => ({
      ...item,
      selected: ind === index
    }));
    setLanguages(updatedLanguages);
    setVisible(false);
  }
  const isEmail = input.includes('@');

  const loginWithEmail = async () => {
    if (!input || !password) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    try {
      setLoading(true);

      const response = await auth().signInWithEmailAndPassword(
        input.trim(),
        password
      );

      await response.user.reload();

      if (!response.user.emailVerified) {
        Alert.alert(
          'Verify Email',
          'Please verify your email first.'
        );

        await auth().signOut();
        return;
      }

      const token = await response.user.getIdToken();

      const data = await verifyToken(token);

      if (!data.success) {
        Alert.alert('Login Failed', data.error || 'Backend verification failed');
        return;
      }

      const appJwt = data.jwt;
      if (appJwt) {
        await AsyncStorage.setItem('auth_jwt', appJwt);
      }

      console.log('Backend verified:', data);

      Alert.alert('Success', 'Login Successful');

      navigation.navigate('MainScreen');
    } catch (e: any) {
      console.log(e);

      Alert.alert(
        'Login Failed',
        e?.message || 'Something went wrong'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.topView}>
          <Image
            source={require('../assets/images/banner.png')}
            style={styles.banner}
          />

          <TouchableOpacity style={styles.changeLangBtn} onPress={() => {
            setVisible(true);
          }}>
            <Image source={require("../assets/images/languages.png")} style={styles.changeLangIcon} />
          </TouchableOpacity>
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

        <TextInput
          placeholder="Email Address"
          placeholderTextColor="#000"
          value={input}
          onChangeText={setInput}
          style={styles.mobileInput}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TextInput
          placeholder="Password"
          placeholderTextColor="#000"
          value={password}
          onChangeText={setPassword}
          style={styles.mobileInput}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TouchableOpacity
          style={styles.loginBtn}
          onPress={() => {

            loginWithEmail();
          }}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.LoginBtnText}>
              Login
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.signupBtn}
          onPress={() =>
            navigation.navigate('SignUpScreen')
          }
        >
          <Text style={styles.signupText}>
            Create New Account
          </Text>
        </TouchableOpacity>

        <Modal
          style={styles.modalStyle}
          isVisible={visible}
          animationIn="slideInUp"

          onBackdropPress={() => {
            setVisible(false);
          }}
        >
          <View style={styles.modalContainer}>
            <FlatList
              data={languages}
              style={{ flex: 1 }}
              keyExtractor={(_, index) => index.toString()}
              contentContainerStyle={{ paddingBottom: 20 }}
              renderItem={({ item, index }) => {
                return (
                  <TouchableOpacity style={[styles.languageItem, { borderColor: item.selected ? THEME_COLOR : '#8e8e8e' }]} onPress={() => {
                    OnSelect(index);
                  }}>
                    <View style={{ width: '100%', height: '100%', borderRadius: 10,flexDirection: 'row', alignItems: 'center', paddingLeft: 20, justifyContent: 'space-between', backgroundColor: item.selected ? '#fff7f7' : '#fff'  }}>
                      <View style={{ flexDirection: 'row' }}>
                        {item.selected == true ? (
                          <Image source={require('../assets/images/selected.png')} style={{ width: 24, height: 24, marginRight: 10, tintColor: THEME_COLOR }} />
                        ) : (<Image source={require('../assets/images/unselected.png')} style={{ width: 24, height: 24, marginRight: 10, }} />)}
                        <Text style={{ fontSize: 18, fontWeight: '700', marginLeft: 10, color: item.selected ? THEME_COLOR : '#8e8e8e' }}>{item.name}</Text>
                      </View>
                      <Image
                        source={
                          item.selected
                            ? require('../assets/images/colorlanguages.png')
                            : require('../assets/images/languages.png')
                        }
                        style={[
                          { width: 50, height: 50, marginRight: 20 },
                          !item.selected && { tintColor: '#8e8e8e', opacity: 0.5 },
                        ]}
                      />

                    </View>
                  </TouchableOpacity>
                )
              }} />
          </View>
        </Modal>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    paddingBottom: 20,
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
    height: 55,
    borderColor: '#8e8e8e',
    marginTop: responsiveHeight(4),
    width: '85%',
    alignSelf: 'center',
    paddingHorizontal: 15,
    color: '#000',
    backgroundColor: '#fff',
  },

  loginBtn: {
    backgroundColor: THEME_COLOR,
    width: '85%',
    height: 55,
    borderRadius: 10,
    marginTop: responsiveHeight(5),
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },

  LoginBtnText: {
    fontSize: responsiveFontSize(2.5),
    fontWeight: '700',
    color: '#fff',
  },

  signupBtn: {
    marginTop: responsiveHeight(3),
    alignSelf: 'center',
  },

  signupText: {
    color: THEME_COLOR,
    fontSize: responsiveFontSize(2),
    fontWeight: '700',
  },

  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    height: 300,
    width: '100%',
    paddingTop: 20

  },

  modalStyle: {
    justifyContent: 'flex-end',
    margin: 0,
  },

  changeLangIcon: {

    width: 25,
    height: 25,


  },
  changeLangBtn: {
    borderWidth: 1,
    borderColor: '#fff',
    padding: 5,
    position: 'absolute',
    top: 50,
    left: 20,
    borderRadius: 10,
    backgroundColor: '#fff'
  },
  languageItem: {
    width: '90%',
    alignSelf: 'center',
    height: 60,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 10
  }
});