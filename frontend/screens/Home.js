import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ImageBackground, ScrollView } from 'react-native';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { Avatar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

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

  const conditions = [
    { 
      id: '1', 
      title: 'ADHD', 
      description: 'Attention Deficit Hyperactivity Disorder',
      icon: 'brain',
      color: '#FF6B6B'
    },
    { 
      id: '2', 
      title: 'Dysgraphia', 
      description: 'Writing difficulty',
      icon: 'pencil',
      color: '#4ECDC4'
    },
    { 
      id: '3', 
      title: 'Dyslexia', 
      description: 'Reading difficulty',
      icon: 'book-open-variant',
      color: '#FFD166'
    },
    { 
      id: '4', 
      title: 'Dyscalculia', 
      description: 'Math difficulty',
      icon: 'calculator-variant',
      color: '#06D6A0'
    },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greetingText}>Welcome back,</Text>
          <Text style={styles.welcomeText}>{userName || 'Parent'}</Text>
        </View>
        <Avatar.Icon
          size={40}
          icon="account"
          style={styles.avatar}
        />
      </View>

      {/* Information Banner */}
      <ImageBackground
        source={require('../assets/kids.jpg')} // Replace with your image
        style={styles.infoBanner}
        imageStyle={{ borderRadius: 10 }}
      >
        <View style={styles.bannerContent}>
          <Text style={styles.bannerTitle}>New Assessment Tool</Text>
          <Text style={styles.bannerText}>Available Now</Text>
          <View style={styles.bannerButton}>
            <Text style={styles.bannerButtonText}>Try It Now</Text>
          </View>
        </View>
      </ImageBackground>

      {/* Conditions Section */}
      <Text style={styles.sectionTitle}>Common Conditions</Text>
      
      <View style={styles.conditionsGrid}>
        {conditions.map((item) => (
          <View 
            key={item.id}
            style={[styles.conditionCard, { backgroundColor: item.color }]}
          >
            <MaterialCommunityIcons 
              name={item.icon} 
              size={40} 
              color="#fff" 
              style={styles.conditionIcon} 
            />
            <Text style={styles.conditionTitle}>{item.title}</Text>
            <Text style={styles.conditionDescription}>{item.description}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F7F9FC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  greetingText: {
    fontSize: 16,
    color: '#6C757D',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#343A40',
  },
  avatar: {
    backgroundColor: '#5E72E4',
  },
  infoBanner: {
    height: 140,
    marginBottom: 25,
    borderRadius: 10,
    overflow: 'hidden',
  },
  bannerContent: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  bannerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginVertical: 5,
  },
  bannerButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginTop: 10,
  },
  bannerButtonText: {
    color: '#5E72E4',
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#343A40',
  },
  conditionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  conditionCard: {
    width: '48%',
    borderRadius: 12,
    padding: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  conditionIcon: {
    marginBottom: 15,
  },
  conditionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 5,
  },
  conditionDescription: {
    fontSize: 12,
    color: '#fff',
    textAlign: 'center',
  },
});