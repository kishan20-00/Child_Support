// Register.js
import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, Switch } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { auth, db } from '../firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

export default function Register({ navigation }) {
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleRegister = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, 'users', user.uid), {
        fullName,
        age,
        phone,
        email,
      });
      navigation.navigate('Login');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F9FAFC', padding: 20 }}>

      {/* Title */}
      <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 }}>
        Register
      </Text>
      <Text style={{ fontSize: 16, color: '#6B7280', textAlign: 'center', marginBottom: 20 }}>
        Please register to login.
      </Text>

      {/* Inputs */}
      <TextInput
        label="Full Name"
        value={fullName}
        onChangeText={setFullName}
        mode="outlined"
        style={{ marginBottom: 15 }}
      />
      <TextInput
        label="Age"
        value={age}
        onChangeText={setAge}
        keyboardType="numeric"
        mode="outlined"
        style={{ marginBottom: 15 }}
      />
      <TextInput
        label="Mobile Number"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        mode="outlined"
        style={{ marginBottom: 15 }}
      />
      <TextInput
        label="Email"
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
        onPress={handleRegister}
        style={{ marginBottom: 20, backgroundColor: '#2563EB' }}
        contentStyle={{ paddingVertical: 10 }}
      >
        Sign Up
      </Button>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={{ textAlign: 'center', color: '#2563EB', fontSize: 16 }}>
          Already have an account? <Text style={{ fontWeight: 'bold' }}>Sign In</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}
