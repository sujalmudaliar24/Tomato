import { StyleSheet, Text, View, Image, StatusBar } from 'react-native'
import React from 'react'
import { responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import { useNavigation } from '@react-navigation/native';
import { useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { THEME_COLOR } from '../../src/strings';


const Splash = () => {
    const navigation = useNavigation();

    useEffect(() => {
        setTimeout(() => {
            navigation.navigate('Login' as never);
        }, 3000);
    })
    return (
        <View style={styles.container}>
            <StatusBar backgroundColor={'#E23744 '} barStyle={'light-content'} />
            <Image source={require('../assets/images/splash.png')} style={styles.logo} />
        </View>
    )
}

export default Splash

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: THEME_COLOR,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo: {
        width: responsiveWidth(100),
        height: responsiveHeight(100),
    }
})