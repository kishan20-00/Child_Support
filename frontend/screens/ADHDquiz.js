import React, { useState, useEffect } from 'react';
import { View, Text, Alert, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { RadioButton } from 'react-native-paper';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const ADHDQuiz = ({navigation}) => {
  const questions = [
    "Inattentive, easily distracted",
    "Angry and resentful",
    "Difficult doing or completing homework",
    "Is always 'on the go' or acts as if driven by a motor",
    "Short attention span",
    "Argues with adults",
    "Fidgets with hands or feet or squirms in seat",
    "Fails to complete assignments",
    "Hard to control in malls or while grocery shopping",
    "Messy or disorganized at home or school",
    "Loses temper",
    "Needs close supervision to get through assignments",
    "Only attends if it is something he/she is very interested in",
    "Runs about or climbs excessively in situations where it is inappropriate",
    "Distractibility or attention span a problem",
    "Irritable",
    "Avoids, expresses reluctance about, or has difficulties engaging in tasks that require sustained mental effort (such as schoolwork or homework)",
    "Restless in the 'squirmy sense'",
    "Gets distracted when given instructions to do something",
    "Actively defies or refuses to comply with adults' requests",
    "Has trouble concentrating in class",
    "Has difficulty waiting in lines or awaiting turn in games or group situations",
    "Leaves seat in classroom or in other situations in which remaining seated is expected",
    "Deliberately does things that annoy other people",
    "Does not follow through on instructions and fails to finish schoolwork, chores or duties in the workplace (Not due to oppositional behaviour or failure to understand instructions)",
    "Has difficulty playing or engaging in leisure activities quietly",
    "Easily frustrated in efforts"
  ];

  const [answers, setAnswers] = useState(new Array(questions.length).fill(0));
  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  const handleAnswerSelect = (index, value) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const calculateTIndex = (total) => {
    const tIndexMapping = [
      43, 44, 45, 47, 49, 51, 52, 53, 55, 57, 58, 60, 61, 63, 65, 66, 68, 69, 71, 73, 74, 76, 77, 79, 81, 82, 84, 85, 87, 88, 90
    ];
    return tIndexMapping[Math.min(total, 30)];
  };

  const getReview = (tIndex) => {
    if (tIndex >= 30 && tIndex <= 55) return "Average (Typical: should not raise concern)";
    if (tIndex >= 56 && tIndex <= 60) return "Slightly atypical (borderline)";
    if (tIndex >= 61 && tIndex <= 65) return "Mildly atypical (possible problem)";
    if (tIndex >= 66 && tIndex <= 70) return "Moderately atypical (significant problem)";
    return "Markedly atypical (significant problem)";
  };

  const handleSubmit = async () => {
    if (!user.email) {
      Alert.alert("Error", "Please log in to submit the quiz.");
      return;
    }

    const total = answers.reduce((sum, answer) => sum + answer, 0);
    const tIndex = calculateTIndex(total);
    const review = getReview(tIndex);

    const userRef = doc(db, "ADHD_quiz", user.email);

    try {
      const userDoc = await getDoc(userRef);
      const attempts = userDoc.exists() ? userDoc.data().attempts || [] : [];
      
      const newAttempt = {
        attempt: attempts.length + 1,
        tIndex,
        review,
        totalScore: total,
        answers: [...answers],
        timestamp: new Date().toISOString()
      };

      await setDoc(userRef, {
        email: user.email,
        attempts: [...attempts, newAttempt],
      }, { merge: true });

      Alert.alert(
        "Quiz Submitted", 
        `T-Index: ${tIndex}\nReview: ${review}`,
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error("Error saving quiz results:", error);
      Alert.alert("Error", "Failed to save quiz results");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>ADHD Quiz</Text>
      {questions.map((question, index) => (
        <View key={index} style={styles.questionContainer}>
          <Text style={styles.questionText}>{index + 1}. {question}</Text>
          <View style={styles.optionsContainer}>
            {[0, 1, 2, 3].map(value => (
              <View key={value} style={styles.radioOption}>
                <RadioButton
                  value={value.toString()}
                  status={answers[index] === value ? 'checked' : 'unchecked'}
                  onPress={() => handleAnswerSelect(index, value)}
                />
                <Text style={styles.radioText}>{value}</Text>
              </View>
            ))}
          </View>
        </View>
      ))}
      <TouchableOpacity 
        style={styles.submitButton} 
        onPress={handleSubmit}
        disabled={!user}
      >
        <Text style={styles.submitText}>Submit Quiz</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
    marginTop: 50,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  questionContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  questionText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: "#444",
  },
  optionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  radioText: {
    fontSize: 16,
    color: "#444",
  },
  submitButton: {
    backgroundColor: "#007BFF",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 20,
  },
  submitText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: "#fff",
  }
});

export default ADHDQuiz;