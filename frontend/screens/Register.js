// Register.js
import { useState } from 'react';
import { View, Text } from 'react-native';
import { auth, db } from '../firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { TextInput, Button } from 'react-native-paper';

export default function Register({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

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
    <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
      <TextInput 
        label='Full Name' 
        value={fullName} 
        onChangeText={setFullName} 
        mode='outlined'
        style={{ marginBottom: 10 }}
      />
      <TextInput 
        label='Age' 
        value={age} 
        onChangeText={setAge} 
        keyboardType='numeric' 
        mode='outlined'
        style={{ marginBottom: 10 }}
      />
      <TextInput 
        label='Phone' 
        value={phone} 
        onChangeText={setPhone} 
        keyboardType='phone-pad' 
        mode='outlined'
        style={{ marginBottom: 10 }}
      />
      <TextInput 
        label='Email' 
        value={email} 
        onChangeText={setEmail} 
        mode='outlined'
        style={{ marginBottom: 10 }}
      />
      <TextInput 
        label='Password' 
        value={password} 
        onChangeText={setPassword} 
        secureTextEntry 
        mode='outlined'
        style={{ marginBottom: 10 }}
      />
      {error ? <Text style={{ color: 'red', marginBottom: 10 }}>{error}</Text> : null}
      <Button mode='contained' onPress={handleRegister} style={{ marginBottom: 10 }}>Register</Button>
      <Text style={{ textAlign: 'center', marginBottom: 10 }}>Already have an account?</Text>
      <Button mode='outlined' onPress={() => navigation.navigate('Login')}>Login</Button>
    </View>
  );
}