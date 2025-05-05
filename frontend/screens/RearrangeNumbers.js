import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import DraggableFlatList from 'react-native-draggable-flatlist';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';

// Generate random numbers
const generateNumbers = () => {
  let numbers = Array.from({ length: 5 }, () => Math.floor(Math.random() * 50) + 1);
  return numbers;
};

function RearrangeNumbersGame() {
  const [numbers, setNumbers] = useState(generateNumbers().map((num, index) => ({ key: index.toString(), value: num })));
  const [user, setUser] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) setUser(currentUser);
  }, []);

  const checkOrder = async () => {
    const sortedNumbers = [...numbers].map(item => item.value).sort((a, b) => a - b);
    const userNumbers = numbers.map(item => item.value);
    const isCorrect = JSON.stringify(userNumbers) === JSON.stringify(sortedNumbers);
    const score = isCorrect ? 1 : 0;

    if (user) {
      const userRef = doc(db, 'rearrange_numbers_game', user.email);
      const userDoc = await getDoc(userRef);
      let newData = { email: user.email, attempts: [] };

      if (userDoc.exists()) {
        newData = userDoc.data();
      }

      newData.attempts.push({ attempt: newData.attempts.length + 1, score });

      await setDoc(userRef, newData);
      Alert.alert(isCorrect ? '✅ Correct!' : '❌ Wrong!', `Your score: ${score}`);

      if (isCorrect) {
        navigation.navigate('Main');
      } else {
        resetGame();
      }
    }
  };

  const resetGame = () => {
    setNumbers(generateNumbers().map((num, index) => ({ key: index.toString(), value: num })));
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <Text style={styles.title}>Drag and Arrange in Ascending Order</Text>
      
      {/* Draggable List */}
      <View style={styles.listContainer}>
        <DraggableFlatList
          data={numbers}
          renderItem={({ item, drag, isActive }) => (
            <TouchableOpacity
              style={[styles.numberBox, isActive && styles.activeNumber]}
              onLongPress={drag}
            >
              <Text style={styles.numberText}>{item.value}</Text>
            </TouchableOpacity>
          )}
          keyExtractor={item => item.key}
          onDragEnd={({ data }) => setNumbers(data)}
          contentContainerStyle={{ paddingBottom: 100 }} // Pushes button into view
        />
      </View>

      {/* Submit Button */}
      <TouchableOpacity style={styles.button} onPress={checkOrder}>
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

// 🎨 Styles
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: '#f5f5f5', 
    paddingVertical: 20 
  },
  title: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    marginBottom: 20, 
    textAlign: 'center' 
  },
  listContainer: { 
    flex: 1, 
    width: '90%', 
    alignItems: 'center' 
  },
  numberBox: { 
    backgroundColor: '#4CAF50', 
    padding: 15, 
    marginVertical: 5, 
    borderRadius: 10, 
    width: 80, 
    alignItems: 'center' 
  },
  activeNumber: { 
    backgroundColor: '#2E7D32' 
  },
  numberText: { 
    fontSize: 24, 
    color: '#fff', 
    fontWeight: 'bold' 
  },
  button: { 
    backgroundColor: '#2196F3', 
    padding: 15, 
    borderRadius: 8, 
    marginBottom: 20, 
    width: '80%', 
    alignItems: 'center' 
  },
  buttonText: { 
    color: '#fff', 
    fontSize: 20, 
    fontWeight: 'bold', 
    textAlign: 'center' 
  },
});

export default RearrangeNumbersGame;
