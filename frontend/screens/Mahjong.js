import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { auth, db } from '../firebaseConfig'; // Firebase config
import { collection, query, where, getDocs, doc, setDoc, addDoc } from 'firebase/firestore';

// Emojis for the cards
const emojis = ['🍎', '🌳', '🚩', '🐶', '🍕', '🎈', '🚗', '📚', '⚽', '🍦'];

const MahjongGame = () => {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [age, setAge] = useState(null); // Age fetched from Firebase

  // Fetch user's age from Firebase
  useEffect(() => {
    const fetchAge = async () => {
      const user = auth.currentUser;
      if (user) {
        // Query the users collection to find the document with the matching email
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('email', '==', user.email));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          // Assuming there's only one document with the user's email
          const userDoc = querySnapshot.docs[0];
          setAge(userDoc.data().age); // Set age from profile
        } else {
          Alert.alert('Error', 'User profile not found.');
        }
      }
    };

    fetchAge();
  }, []);

  // Generate cards based on age
const generateCards = () => {
  if (!age) {
    Alert.alert('Error', 'Age not found in profile.');
    return;
  }

  // Convert age to a number (if it's a string)
  const userAge = Number(age);

  // Set numMatches based on age
  const numMatches = userAge === 8 ? 4 : 7; // Number of matches based on age
  console.log(`Age: ${userAge}, numMatches: ${numMatches}`); // Debugging

  const selectedEmojis = emojis.slice(0, numMatches); // Select emojis
  console.log('Selected Emojis:', selectedEmojis); // Debugging

  const doubledEmojis = [...selectedEmojis, ...selectedEmojis]; // Double for matching pairs
  console.log('Doubled Emojis:', doubledEmojis); // Debugging

  const shuffledEmojis = doubledEmojis.sort(() => Math.random() - 0.5); // Shuffle
  console.log('Shuffled Emojis:', shuffledEmojis); // Debugging

  setCards(shuffledEmojis.map((emoji, index) => ({ id: index, emoji, flipped: false })));
  setFlipped([]);
  setMatched([]);
  setScore(0);
  setTime(0);
  setGameStarted(true);
  setGameOver(false);
};

  // Handle card flip
  const handleFlip = (index) => {
    if (flipped.length === 2 || matched.includes(index)) return; // Allow only 2 flips at a time

    const newCards = [...cards];
    newCards[index].flipped = true;
    setCards(newCards);

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      const [firstIndex, secondIndex] = newFlipped;
      if (cards[firstIndex].emoji === cards[secondIndex].emoji) {
        setMatched([...matched, firstIndex, secondIndex]);
        setScore((prevScore) => prevScore + 10); // Increase score for a match
        if (matched.length + 2 === cards.length) {
          setGameOver(true); // End game if all matches are found
        }
      } else {
        setTimeout(() => {
          const resetCards = [...cards];
          resetCards[firstIndex].flipped = false;
          resetCards[secondIndex].flipped = false;
          setCards(resetCards);
        }, 1000); // Flip back after 1 second if no match
      }
      setFlipped([]);
    }
  };

  // Timer
  useEffect(() => {
    let timerInterval;
    if (gameStarted && !gameOver) {
      timerInterval = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    }
    return () => clearInterval(timerInterval);
  }, [gameStarted, gameOver]);

  // Save score to Firebase
  const saveScore = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        await addDoc(collection(db, 'adhd_mitigation'), {
          userEmail: user.email, // Store user email
          score: score,
          time: time,
          gameName: 'Mahjong Matching Game',
          timestamp: new Date(),
        });
        Alert.alert('Game Over!', `Your score: ${score}`, [
          { text: 'OK', onPress: () => setGameStarted(false) },
        ]);
      } catch (error) {
        console.error('Error saving score:', error);
      }
    }
  };

  // Reset game
  const resetGame = () => {
    setCards([]);
    setFlipped([]);
    setMatched([]);
    setScore(0);
    setTime(0);
    setGameStarted(false);
    setGameOver(false);
  };

  return (
    <View style={styles.container}>
      {!gameStarted ? (
        <View style={styles.startContainer}>
          <Text style={styles.title}>Mahjong Matching Game</Text>
          <Text style={styles.instruction}>Your age: {age}</Text>
          <TouchableOpacity style={styles.button} onPress={generateCards}>
            <Text style={styles.buttonText}>Start Game</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.gameContainer}>
          <Text style={styles.timer}>Time: {time}s</Text>
          <Text style={styles.score}>Score: {score}</Text>
          <View style={styles.grid}>
            {cards.map((card, index) => (
              <TouchableOpacity
                key={card.id}
                style={[styles.card, card.flipped && styles.cardFlipped]}
                onPress={() => handleFlip(index)}
                disabled={card.flipped || matched.includes(index)}
              >
                <Text style={styles.cardText}>
                  {card.flipped || matched.includes(index) ? card.emoji : '❓'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {gameOver && (
            <TouchableOpacity style={styles.button} onPress={saveScore}>
              <Text style={styles.buttonText}>Save Score</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.button} onPress={resetGame}>
            <Text style={styles.buttonText}>Reset Game</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  startContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  instruction: {
    fontSize: 18,
    marginBottom: 20,
  },
  gameContainer: {
    alignItems: 'center',
  },
  timer: {
    fontSize: 18,
    marginBottom: 10,
  },
  score: {
    fontSize: 18,
    marginBottom: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
  },
  card: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#007BFF',
    margin: 5,
    borderRadius: 10,
  },
  cardFlipped: {
    backgroundColor: '#fff',
  },
  cardText: {
    fontSize: 30,
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default MahjongGame;