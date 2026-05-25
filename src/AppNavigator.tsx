import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import Splash from './screens/Splash';
import Login from './screens/Login';
import SignUpScreen from './screens/SignUpScreen';
import MainScreen from './screens/MainScreen';




const Stack = createStackNavigator();
const AppNavigator = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen component={Splash} name="Splash" options={{ headerShown: false }} />
                <Stack.Screen component={Login} name="Login" options={{ headerShown: false }} />
                <Stack.Screen component={SignUpScreen} name="SignUpScreen" options={{ headerShown: false }} />
                <Stack.Screen component={MainScreen} name="MainScreen" options={{ headerShown: false }} />
            </Stack.Navigator>
        </NavigationContainer>
    )
}

export default AppNavigator


