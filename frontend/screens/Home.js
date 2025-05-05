import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
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
    { id: '3', title: 'Notifications', screen: 'Notifications' },
  ];

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome, {userName}!</Text>
        <Avatar.Icon
          size={40}
          icon="account"
          style={styles.avatar}
          onPress={() => navigation.navigate('Profile')}
        />
      </View>

      {/* Cards Section */}
      <FlatList
        data={cards}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation.navigate(item.screen)}>
            <Card style={styles.card}>
              <Card.Title
                title={item.title}
                titleStyle={styles.cardTitle}
                left={(props) => <Avatar.Icon {...props} icon="folder" />}
              />
            </Card>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa', // Light background color
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333', // Dark text color
  },
  avatar: {
    backgroundColor: '#6200ee', // Purple color for the avatar
  },
  card: {
    marginBottom: 15,
    borderRadius: 10,
    elevation: 3, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6200ee', // Purple color for the card title
  },
});