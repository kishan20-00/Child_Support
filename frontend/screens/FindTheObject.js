import React, { useState, useEffect } from 'react';
import { View, Image, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { auth, db } from '../firebaseConfig'; // Firebase config
import { doc, setDoc } from 'firebase/firestore';

// Define the objects with their names, coordinates, and radius for clickable area
const objects = [
  { name: "Tree", x: 160, y: 179, radius: 400 },
  { name: "Teddy Bear", x: 566, y: 293, radius: 400 },
  { name: "Shirt", x: 299, y: 400, radius: 400 },
  { name: "Fan", x: 41, y: 276, radius: 400 },
  { name: "AeroPlane", x: 439, y: 292, radius: 400 },
];

const FindTheObjectGame = () => {
  const [foundObject, setFoundObject] = useState(false);
  const [timer, setTimer] = useState(60);
  const [gameStarted, setGameStarted] = useState(false);
  const [selectedObject, setSelectedObject] = useState(null);
  const [score, setScore] = useState(0);
  const navigation = useNavigation();

  const imageData = require('../assets/Object.jpg');

  // Randomly select an object when the game starts
  useEffect(() => {
    if (gameStarted) {
      const randomObject = objects[Math.floor(Math.random() * objects.length)];
      setSelectedObject(randomObject);
    }
  }, [gameStarted]);

  // Start countdown timer when game starts
  useEffect(() => {
    let timerInterval;
    if (gameStarted && timer > 0) {
      timerInterval = setInterval(() => {
        setTimer((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timerInterval);
            handleSubmit("No", 60);
          }
          return prevTime - 1;
        });
      }, 1000);

      return () => {
        clearInterval(timerInterval);
      };
    }
  }, [gameStarted, timer]);

  const handleFindObject = (event) => {
    const { locationX, locationY } = event.nativeEvent;
    const distance = Math.sqrt(
      (locationX - selectedObject.x) ** 2 + (locationY - selectedObject.y) ** 2
    );

    if (distance <= selectedObject.radius) {
      setFoundObject(true);
      handleSubmit("Yes", 60 - timer);
      setTimer(0);
    }
  };

  const handleSubmit = async (result, timeTaken) => {
    const user = auth.currentUser;
    if (user) {
      try {
        const gameName = "Find The Object";

        await setDoc(doc(db, "focus", user.email), {
          result: result,
          timeTaken: timeTaken,
          gameName: gameName,
          timestamp: new Date()
        });

        Alert.alert("Game Over!", `Result: ${result}, Time: ${timeTaken}s`, [
          { text: "OK", onPress: () => navigation.navigate("ADHD") }
        ]);
      } catch (error) {
        console.error("Error saving score:", error);
      }
    }
  };

  const startGame = () => {
    setGameStarted(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Find the Object</Text>

      {selectedObject && (
        <View style={styles.smallImageContainer}>
          <Text style={styles.instruction}>
            Find the object shown below in the image above!
          </Text>
          <Text style={styles.objectName}>{selectedObject.name}</Text>
        </View>
      )}

      <TouchableOpacity activeOpacity={1} onPress={handleFindObject}>
        <Image source={imageData} style={styles.image} />
      </TouchableOpacity>

      <Text style={styles.timer}>Time Left: {timer}s</Text>

      {!gameStarted ? (
        <TouchableOpacity style={styles.button} onPress={startGame}>
          <Text style={styles.buttonText}>Start Game</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.button}
          onPress={handleFindObject}
          disabled={foundObject}
        >
          <Text style={styles.buttonText}>I Found the Object!</Text>
        </TouchableOpacity>
      )}

      {foundObject && <Text style={styles.result}>Result: Yes</Text>}
      {!foundObject && gameStarted && timer === 0 && <Text style={styles.result}>Result: No</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  smallImageContainer: { alignItems: 'center', marginBottom: 20 },
  objectName: { fontSize: 18, fontWeight: 'bold' },
  image: { width: 350, height: 240, borderRadius: 10 },
  timer: { fontSize: 18, marginTop: 10 },
  instruction: { fontSize: 18, marginTop: 20, marginBottom: 10 },
  button: { marginTop: 20, backgroundColor: '#007BFF', padding: 10, borderRadius: 10 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  result: { fontSize: 22, marginTop: 20, fontWeight: 'bold' },
});

export default FindTheObjectGame;