import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Alert } from 'react-native';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { Text, TextInput, Button, Card } from 'react-native-paper';

export default function Profile() {
  const [userData, setUserData] = useState(null);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserData(docSnap.data());
          setFullName(docSnap.data().fullName);
          setPhone(docSnap.data().phone);
        }
      }
      setLoading(false);
    };
    
    fetchUserData();
  }, []);

  const handleUpdate = async () => {
    if (!fullName || !phone) {
      Alert.alert('Error', 'Fields cannot be empty');
      return;
    }

    try {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        await updateDoc(docRef, {
          fullName,
          phone
        });
        Alert.alert('Success', 'Profile updated successfully');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  if (loading) return <ActivityIndicator size="large" color="#6200ea" />;

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#f5f5f5', marginBottom:140 }}>
      <Card style={{ width: '100%', padding: 20, borderRadius: 10 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' }}>Profile</Text>
        {userData && (
          <>
            <Text style={{ fontSize: 16, marginBottom: 5 }}>Email: {userData.email}</Text>
            <Text style={{ fontSize: 16, marginBottom: 10 }}>Age: {userData.age}</Text>

            <TextInput
              mode="outlined"
              label="Full Name"
              value={fullName}
              onChangeText={setFullName}
              style={{ marginBottom: 10 }}
            />

            <TextInput
              mode="outlined"
              label="Phone"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              style={{ marginBottom: 10 }}
            />

            <Button mode="contained" onPress={handleUpdate} style={{ marginTop: 10 }}>
              Update Profile
            </Button>
          </>
        )}
      </Card>
    </View>
  );
}