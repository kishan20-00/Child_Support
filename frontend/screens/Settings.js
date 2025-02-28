import React, { useState, useEffect } from 'react';
import { View, Text, Switch, Alert, ActivityIndicator } from 'react-native';
import { Button } from 'react-native-paper';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export default function Settings() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setNotificationsEnabled(data.notificationsEnabled || false);
          setDarkMode(data.darkMode || false);
        }
      }
      setLoading(false);
    };

    fetchSettings();
  }, []);

  const handleSaveSettings = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        await updateDoc(docRef, {
          notificationsEnabled,
          darkMode,
        });
        Alert.alert('Success', 'Settings updated successfully');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  if (loading) return <ActivityIndicator size="large" color="#0000ff" />;

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Settings</Text>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 10 }}>
        <Text>Enable Notifications</Text>
        <Switch value={notificationsEnabled} onValueChange={setNotificationsEnabled} />
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 10 }}>
        <Text>Dark Mode</Text>
        <Switch value={darkMode} onValueChange={setDarkMode} />
      </View>

      <Button mode="contained" onPress={handleSaveSettings} style={{ marginTop: 20 }}>
        Save Settings
      </Button>
    </View>
  );
}
