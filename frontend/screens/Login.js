// Login.js
import { useState } from 'react';
import { View, Text } from 'react-native';
import { auth } from '../firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { TextInput, Button } from 'react-native-paper';

export default function Login({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigation.navigate('Main');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
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
      <Button mode='contained' onPress={handleLogin} style={{ marginBottom: 10 }}>Login</Button>
      <Text style={{ textAlign: 'center', marginBottom: 10 }}>Don't have an account?</Text>
      <Button mode='outlined' onPress={() => navigation.navigate('Register')}>Register</Button>
    </View>
  );
}