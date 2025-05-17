import React, { useState, useEffect } from 'react';
import { View, Image, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const imagesData = [
  { image: require('../assets/image1.png'), differences: [{ x: 1436, y: 866, radius: 1600 }] },
  { image: require('../assets/image2.png'), differences: [{ x: 113, y: 626, radius: 1500 }] },
  { image: require('../assets/image3.png'), differences: [{ x: 404, y: 692, radius: 600 }] },
  { image: require('../assets/image4.png'), differences: [{ x: 620, y: 976, radius: 1000 }] },
  { image: require('../assets/image5.png'), differences: [{ x: 559, y: 459, radius: 800 }] },
];

const FindTheDifferenceGame = () => {
  const [foundDifferences, setFoundDifferences] = useState(
    imagesData.map(() => new Array(imagesData[0].differences.length).fill(false))
  );
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [user, setUser] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  const handleTap = (event) => {
    const { locationX, locationY } = event.nativeEvent;

    imagesData[currentImageIndex].differences.forEach((diff, index) => {
      const { x, y, radius } = diff;
      const distance = Math.sqrt((locationX - x) ** 2 + (locationY - y) ** 2);

      if (distance <= radius && !foundDifferences[currentImageIndex][index]) {
        const newFoundDifferences = [...foundDifferences];
        newFoundDifferences[currentImageIndex][index] = true;
        setFoundDifferences(newFoundDifferences);
        setScore((prevScore) => prevScore + 2);
      }
    });
  };

  const handleNextImage = () => {
    if (currentImageIndex < imagesData.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    } else {
      Alert.alert("This is the last image.");
    }
  };

  const handlePreviousImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    } else {
      Alert.alert("This is the first image.");
    }
  };

  const handleSubmit = async () => {
    if (!user.email) {
      console.log("User not found, cannot save result!");
      return;
    }

    const userRef = doc(db, "adhd_scores", user.email);

    try {
      const userDoc = await getDoc(userRef);
      const attempts = userDoc.exists() ? userDoc.data().attempts || [] : [];
      
      const newAttempt = {
        attempt: attempts.length + 1,
        score: score,
        maxPossibleScore: imagesData.length * 2, // 2 points per image
        differencesFound: foundDifferences.flat().filter(Boolean).length,
        timestamp: new Date().toISOString()
      };

      await setDoc(userRef, {
        email: user.email,
        attempts: [...attempts, newAttempt],
      }, { merge: true });

      Alert.alert("Game Over!", `Your score: ${score}`, [
        { text: "OK", onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error("Error saving score:", error);
      Alert.alert("Error", "Failed to save game results");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Touch on the Differences</Text>

      <TouchableOpacity activeOpacity={1} onPress={handleTap}>
        <Image source={imagesData[currentImageIndex].image} style={styles.image} />
      </TouchableOpacity>

      <Text style={styles.score}>Score: {score}</Text>
      <Text style={styles.instruction}>Find the difference in the image above.</Text>

      {currentImageIndex > 0 && (
        <TouchableOpacity style={styles.button} onPress={handlePreviousImage}>
          <Text style={styles.buttonText}>Previous Image</Text>
        </TouchableOpacity>
      )}

      {currentImageIndex < imagesData.length - 1 && (
        <TouchableOpacity style={styles.button} onPress={handleNextImage}>
          <Text style={styles.buttonText}>Next Image</Text>
        </TouchableOpacity>
      )}

      {currentImageIndex === imagesData.length - 1 && (
        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Submit Score</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  image: { width: 400, height: 280, borderRadius: 10 },
  score: { fontSize: 20, marginTop: 20, fontWeight: 'bold' },
  instruction: { fontSize: 18, marginTop: 20, marginBottom: 10 },
  button: { marginTop: 20, backgroundColor: '#007BFF', padding: 10, borderRadius: 10 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});

export default FindTheDifferenceGame;