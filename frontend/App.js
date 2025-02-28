import React from 'react';
import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { auth } from './firebaseConfig'; // Import Firebase auth
import { signOut } from 'firebase/auth';
import Register from './screens/Register';
import Login from './screens/Login';
import Home from './screens/Home';
import Profile from './screens/Profile';
import Settings from './screens/Settings';
import Notifications from './screens/Notifications';
import Diagnosis from './screens/Diagnosis';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

// Custom Drawer Content (Header + Styled Items + Logout)
function CustomDrawerContent(props) {
  const handleLogout = async () => {
    try {
      await signOut(auth);
      props.navigation.replace('Login'); // Redirect to login after logout
    } catch (error) {
      console.error('Logout error:', error.message);
    }
  };

  return (
    <DrawerContentScrollView {...props}>
      {/* Drawer Header */}
      <View style={styles.drawerHeader}>
        <Text style={styles.drawerHeaderText}>Welcome!</Text>
      </View>

      {/* Drawer Items */}
      <DrawerItemList {...props} />

      {/* Logout Button */}
      <DrawerItem
        label="Logout"
        onPress={handleLogout}
        icon={({ color, size }) => <Icon name="exit-to-app" color={color} size={size} />}
      />
    </DrawerContentScrollView>
  );
}

// Drawer Navigator with Icons + Logout
function DrawerNavigator() {
  return (
    <Drawer.Navigator drawerContent={(props) => <CustomDrawerContent {...props} />}>
      <Drawer.Screen
        name="Home"
        component={Home}
        options={{
          drawerIcon: ({ color, size }) => <Icon name="home" color={color} size={size} />,
        }}
      />
      <Drawer.Screen
        name="Profile"
        component={Profile}
        options={{
          drawerIcon: ({ color, size }) => <Icon name="account" color={color} size={size} />,
        }}
      />
      <Drawer.Screen
        name="Diagnosis"
        component={Diagnosis}
        options={{
          drawerIcon: ({ color, size }) => <Icon name="heart-plus" color={color} size={size} />,
        }}
      />
      <Drawer.Screen
        name="Settings"
        component={Settings}
        options={{
          drawerIcon: ({ color, size }) => <Icon name="cog" color={color} size={size} />,
        }}
      />
      <Drawer.Screen
        name="Notifications"
        component={Notifications}
        options={{
          drawerIcon: ({ color, size }) => <Icon name="bell" color={color} size={size} />,
        }}
      />
    </Drawer.Navigator>
  );
}

// Main App
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Register" component={Register} />
        <Stack.Screen name="Main" component={DrawerNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Styles for Drawer Header
const styles = StyleSheet.create({
  drawerHeader: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  drawerHeaderText: {
    color: 'black',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
