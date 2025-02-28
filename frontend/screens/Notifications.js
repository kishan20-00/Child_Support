import React, { useEffect, useState } from 'react';
import { View, FlatList, ActivityIndicator, Alert } from 'react-native';
import { List, Button } from 'react-native-paper';
import { auth, db } from '../firebaseConfig';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const querySnapshot = await getDocs(collection(db, 'users', user.uid, 'notifications'));
        const fetchedNotifications = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        setNotifications(fetchedNotifications);
      } catch (error) {
        Alert.alert('Error', 'Failed to load notifications');
      }
      setLoading(false);
    };

    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const notificationRef = doc(db, 'users', user.uid, 'notifications', id);
      await updateDoc(notificationRef, { read: true });

      setNotifications(notifications.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      ));
    } catch (error) {
      Alert.alert('Error', 'Failed to mark as read');
    }
  };

  if (loading) return <ActivityIndicator size="large" color="#0000ff" />;

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <List.Item
            title={item.title}
            description={item.message}
            left={(props) => <List.Icon {...props} icon={item.read ? 'check-circle' : 'bell'} />}
            right={(props) =>
              !item.read ? (
                <Button mode="contained" onPress={() => markAsRead(item.id)}>
                  Mark as Read
                </Button>
              ) : null
            }
          />
        )}
      />
    </View>
  );
}
