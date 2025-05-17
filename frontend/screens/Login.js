// Login.js
import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, Switch } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { auth } from '../firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';

export default function Login({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigation.navigate('Main');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F9FAFC', padding: 20 }}>
      {/* Illustration */}
      <View style={{ alignItems: 'center', marginBottom: 30 }}>
        <Image
          source={require('../assets/Child1.png')} // Replace with your actual image URL
          style={{ width: 300, height: 200, resizeMode: 'contain' }}
        />
      </View>

      {/* Title */}
      <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 }}>
        Login
      </Text>
      <Text style={{ fontSize: 16, color: '#6B7280', textAlign: 'center', marginBottom: 20 }}>
        Please sign in to continue.
      </Text>

      {/* Inputs */}
      <TextInput
        label="Username"
        value={email}
        onChangeText={setEmail}
        mode="outlined"
        style={{ marginBottom: 15 }}
      />
      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        mode="outlined"
        style={{ marginBottom: 15 }}
      />

      {/* Remember Me Toggle */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
        <Switch
          value={rememberMe}
          onValueChange={() => setRememberMe(!rememberMe)}
          thumbColor={rememberMe ? '#2563EB' : '#D1D5DB'}
        />
        <Text style={{ marginLeft: 10, fontSize: 16, color: '#4B5563' }}>
          Remember me next time
        </Text>
      </View>

      {/* Error Message */}
      {error ? <Text style={{ color: 'red', marginBottom: 10 }}>{error}</Text> : null}

      {/* Buttons */}
      <Button
        mode="contained"
        onPress={handleLogin}
        style={{ marginBottom: 20, backgroundColor: '#2563EB' }}
        contentStyle={{ paddingVertical: 10 }}
      >
        Sign In
      </Button>

      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={{ textAlign: 'center', color: '#2563EB', fontSize: 16 }}>
          Don't have an account? <Text style={{ fontWeight: 'bold' }}>Sign Up</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}
