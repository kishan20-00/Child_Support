import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { auth, db } from '../firebaseConfig';
import { collection, query, where, getDocs, doc, getDoc, setDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';

const emojis = ['🍎', '🌳', '🚩', '🐶', '🍕', '🎈', '🚗', '📚', '⚽', '🍦'];

const MahjongGame = () => {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [age, setAge] = useState(null);
  const [user, setUser] = useState(null);
  const navigation = useNavigation();

  // Fetch user data from Firebase
  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUser(currentUser);
      fetchUserAge(currentUser);
    }
  }, []);

  const fetchUserAge = async (user) => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', user.email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        setAge(userDoc.data().age);
      } else {
        Alert.alert('Error', 'User profile not found.');
      }
    } catch (error) {
      console.error("Error fetching user age:", error);
    }
  };

  // Generate cards based on age
  const generateCards = () => {
    if (!age) {
      Alert.alert('Error', 'Age not found in profile.');
      return;
    }

    const userAge = Number(age);
    const numMatches = userAge === 8 ? 4 : 7;
    const selectedEmojis = emojis.slice(0, numMatches);
    const doubledEmojis = [...selectedEmojis, ...selectedEmojis];
    const shuffledEmojis = doubledEmojis.sort(() => Math.random() - 0.5);

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
    if (flipped.length === 2 || matched.includes(index)) return;

    const newCards = [...cards];
    newCards[index].flipped = true;
    setCards(newCards);

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      const [firstIndex, secondIndex] = newFlipped;
      if (cards[firstIndex].emoji === cards[secondIndex].emoji) {
        setMatched([...matched, firstIndex, secondIndex]);
        setScore((prevScore) => prevScore + 10);
        if (matched.length + 2 === cards.length) {
          setGameOver(true);
          handleGameEnd(true);
        }
      } else {
        setTimeout(() => {
          const resetCards = [...cards];
          resetCards[firstIndex].flipped = false;
          resetCards[secondIndex].flipped = false;
          setCards(resetCards);
        }, 1000);
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

  // Handle game end
  const handleGameEnd = async (won) => {
    if (!user.email) {
      console.log("User not found, cannot save result!");
      return;
    }

    const userRef = doc(db, "mahjong_game", user.email);

    try {
      const userDoc = await getDoc(userRef);
      const attempts = userDoc.exists() ? userDoc.data().attempts || [] : [];
      
      const newAttempt = {
        attempt: attempts.length + 1,
        score: score,
        timeTaken: time,
        matchedPairs: matched.length / 2,
        totalPairs: cards.length / 2,
        age: age,
        won: won,
        timestamp: new Date().toISOString()
      };

      await setDoc(userRef, {
        email: user.email,
        attempts: [...attempts, newAttempt],
      }, { merge: true });

      Alert.alert(
        won ? "Congratulations!" : "Game Over",
        `You matched ${matched.length / 2} pairs in ${time} seconds!`,
        [{ text: "OK" }]
      );
      navigation.goBack();
    } catch (error) {
      console.error("Error saving game result:", error);
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
          <Text style={styles.pairs}>
            Pairs: {matched.length / 2}/{cards.length / 2}
          </Text>
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
    padding: 20
  },
  startContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333'
  },
  instruction: {
    fontSize: 18,
    marginBottom: 20,
    color: '#666'
  },
  gameContainer: {
    alignItems: 'center',
    width: '100%'
  },
  timer: {
    fontSize: 18,
    marginBottom: 5,
    color: '#333'
  },
  score: {
    fontSize: 18,
    marginBottom: 5,
    color: '#333'
  },
  pairs: {
    fontSize: 18,
    marginBottom: 20,
    color: '#333'
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
    width: '100%'
  },
  card: {
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#007BFF',
    margin: 5,
    borderRadius: 10,
    elevation: 3
  },
  cardFlipped: {
    backgroundColor: '#fff',
  },
  cardText: {
    fontSize: 30,
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    minWidth: 150,
    alignItems: 'center'
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default MahjongGame;