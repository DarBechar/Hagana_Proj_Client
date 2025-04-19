import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import HomePage from '../Screens/HomePage';
import Report from '../Screens/Report'; 
import FilledReport from '../Screens/FilledReport'

const Stack = createStackNavigator();

export default function Navigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator name="NavStack" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="HomePage" component={HomePage} />
        <Stack.Screen name="Report" component={Report} />
        <Stack.Screen name="FilledReport" component={FilledReport} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

