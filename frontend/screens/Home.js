// Home.js
import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { Avatar, Card, Button } from 'react-native-paper';

export default function Home({ navigation }) {
  const [userName, setUserName] = useState('');
  
  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserName(userDoc.data().fullName);
        }
      }
    };
    fetchUserData();
  }, []);

  const cards = [
    { id: '1', title: 'Profile', screen: 'Profile' },
    { id: '2', title: 'Settings', screen: 'Settings' },
    { id: '3', title: 'Notifications', screen: 'Notifications' }
  ];

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Welcome, {userName}!</Text>
        <Avatar.Icon size={40} icon='account' onPress={() => navigation.navigate('Profile')} />
      </View>
      <FlatList
        data={cards}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation.navigate(item.screen)}>
            <Card style={{ marginBottom: 10 }}>
              <Card.Title title={item.title} />
            </Card>
          </TouchableOpacity>
        )}
      />
    
    </View>
  );
}