import React, { useState } from 'react';
import { View, Image, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth, db } from '../firebaseConfig'; // Firebase config
import { doc, setDoc } from 'firebase/firestore';

// Define the differences for each image
const imagesData = [
  { image: require('../assets/Difference1.jpg'), differences: [{ x: 374, y: 523, radius: 500 }] },
  { image: require('../assets/Difference2.jpg'), differences: [{ x: 867, y: 281, radius: 600 }] },
  { image: require('../assets/Difference3.jpg'), differences: [{ x: 893, y: 128, radius: 600 }] },
  { image: require('../assets/Difference4.jpg'), differences: [{ x: 991, y: 324, radius: 700 }] },
  { image: require('../assets/Difference5.jpeg'), differences: [{ x: 698, y: 303, radius: 500 }] },
];

const FindTheDifferenceGame = () => {
  const [foundDifferences, setFoundDifferences] = useState(
    imagesData.map(() => new Array(imagesData[0].differences.length).fill(false))
  ); // Track differences for each image
  const [currentImageIndex, setCurrentImageIndex] = useState(0); // Current image being displayed
  const [score, setScore] = useState(0);
  const navigation = useNavigation();

  const handleTap = (event) => {
    const { locationX, locationY } = event.nativeEvent;

    // Loop over differences for the current image
    imagesData[currentImageIndex].differences.forEach((diff, index) => {
      const { x, y, radius } = diff;
      const distance = Math.sqrt((locationX - x) ** 2 + (locationY - y) ** 2);

      // Check if the tap is inside the difference area and hasn't been found yet
      if (distance <= radius && !foundDifferences[currentImageIndex][index]) {
        // Mark the difference as found
        const newFoundDifferences = [...foundDifferences];
        newFoundDifferences[currentImageIndex][index] = true;
        setFoundDifferences(newFoundDifferences);

        // Update score
        setScore((prevScore) => prevScore + 2); // Increase score by 2
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
    const user = auth.currentUser;
    if (user) {
      try {
        const gameName = "Find The Difference";
        await setDoc(doc(db, "adhd_scores", user.email), {
          score: score,
          gameName: gameName,
          timestamp: new Date()
        });
        Alert.alert("Game Over!", `Your score: ${score}`, [
          { text: "OK", onPress: () => navigation.navigate("ADHD") } // Navigate to Home
        ]);
      } catch (error) {
        console.error("Error saving score:", error);
      }
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

      {/* Previous Image Button */}
      {currentImageIndex > 0 && (
        <TouchableOpacity style={styles.button} onPress={handlePreviousImage}>
          <Text style={styles.buttonText}>Previous Image</Text>
        </TouchableOpacity>
      )}

      {/* Next Image Button */}
      {currentImageIndex < imagesData.length - 1 && (
        <TouchableOpacity style={styles.button} onPress={handleNextImage}>
          <Text style={styles.buttonText}>Next Image</Text>
        </TouchableOpacity>
      )}

      {/* Submit Button */}
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
  image: { width: 400, height: 240, borderRadius: 10 },
  score: { fontSize: 20, marginTop: 20, fontWeight: 'bold' },
  instruction: { fontSize: 18, marginTop: 20, marginBottom: 10 },
  button: { marginTop: 20, backgroundColor: '#007BFF', padding: 10, borderRadius: 10 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});

export default FindTheDifferenceGame;