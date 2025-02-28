import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';

export default function Diagnosis() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Run Tests!!</Text>
      <View style={styles.cardContainer}>
        <TouchableOpacity style={styles.card} onPress={() => alert('Card 1 Selected')}>
          <MaterialIcons name="medical-services" size={40} color="#4CAF50" />
          <Text style={styles.cardText}>General Checkup</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => alert('Card 2 Selected')}>
          <MaterialIcons name="healing" size={40} color="#FF9800" />
          <Text style={styles.cardText}>Skin Analysis</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => alert('Card 3 Selected')}>
          <MaterialIcons name="visibility" size={40} color="#03A9F4" />
          <Text style={styles.cardText}>Vision Test</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => alert('Card 4 Selected')}>
          <MaterialIcons name="favorite" size={40} color="#E91E63" />
          <Text style={styles.cardText}>Heart Check</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    marginBottom: 140
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  cardContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  card: {
    width: 150,
    height: 150,
    backgroundColor: 'white',
    margin: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  cardText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
});