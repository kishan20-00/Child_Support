import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, FlatList } from 'react-native';
import { auth, db } from '../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

const DyscalAnalyts = () => {
  const [gameData, setGameData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const gameCollections = [
    { name: 'Dot Counting', key: 'dot_counting' },
    { name: 'Number Line', key: 'number_line_game' },
    { name: 'Subtraction', key: 'subtraction_story' },
    { name: 'Object Division', key: 'object_division' },
    { name: 'Count Apples', key: 'count_apples' },
    { name: 'Addition', key: 'addition_game' },
    { name: 'Pattern Recognition', key: 'emoji_pattern_game' },
    { name: 'Count Objects', key: 'count_objects_game' },
    { name: 'Number Pattern', key: 'number_comparison' },
    { name: 'Money Game', key: 'money_game' },
    { name: 'Object Values', key: 'match_the_equation' },
    { name: 'Ascending Order', key: 'number_sorting' },
    { name: 'Descending Order', key: 'number_sorting_desc' },
    { name: 'Length Measurement', key: 'measure_objects_game' },
  ];

  const fetchGameScores = async () => {
    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user?.email) {
        throw new Error('User not logged in');
      }

      const userEmail = user.email;
      const scoresData = [];

      for (const game of gameCollections) {
        const collectionRef = collection(db, game.key);
        const querySnapshot = await getDocs(collectionRef);

        querySnapshot.forEach((docSnap) => {
          if (docSnap.id === userEmail) {
            const attempts = docSnap.data().attempts || [];
            // Get last 2 attempts (most recent first)
            const lastTwoAttempts = attempts.slice(-2).reverse();
            
            scoresData.push({
              id: game.key,
              name: game.name,
              attempt1: lastTwoAttempts[0]?.score ?? '-',
              attempt1Date: lastTwoAttempts[0]?.timestamp 
                ? new Date(lastTwoAttempts[0].timestamp).toLocaleDateString() 
                : '-',
              attempt2: lastTwoAttempts[1]?.score ?? '-',
              attempt2Date: lastTwoAttempts[1]?.timestamp 
                ? new Date(lastTwoAttempts[1].timestamp).toLocaleDateString() 
                : '-',
              improvement: lastTwoAttempts.length === 2 
                ? lastTwoAttempts[0].score - lastTwoAttempts[1].score 
                : null
            });
          }
        });
      }

      setGameData(scoresData);
    } catch (error) {
      console.error('Error fetching scores:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchGameScores();
  };

  useEffect(() => {
    fetchGameScores();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.row}>
      <Text style={[styles.cell, styles.gameName]}>{item.name}</Text>
      <Text style={styles.cell}>
        {item.attempt1 !== '-' ? `${item.attempt1}\n${item.attempt1Date}` : '-'}
      </Text>
      <Text style={styles.cell}>
        {item.attempt2 !== '-' ? `${item.attempt2}\n${item.attempt2Date}` : '-'}
      </Text>
      <Text style={[
        styles.cell, 
        styles.improvementCell,
        item.improvement > 0 ? styles.positive : 
        item.improvement < 0 ? styles.negative : null
      ]}>
        {item.improvement !== null ? 
          `${item.improvement >= 0 ? '+' : ''}${item.improvement}` : 
          '-'}
      </Text>
    </View>
  );

  return (
    <ScrollView
      horizontal
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#007BFF']}
          tintColor={'#007BFF'}
        />
      }
    >
      <View>
        <View style={[styles.row, styles.headerRow]}>
          <Text style={[styles.cell, styles.headerCell, styles.gameName]}>Game</Text>
          <Text style={[styles.cell, styles.headerCell]}>Latest Attempt</Text>
          <Text style={[styles.cell, styles.headerCell]}>Previous Attempt</Text>
          <Text style={[styles.cell, styles.headerCell]}>Improvement</Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading game data...</Text>
          </View>
        ) : (
          <FlatList
            data={gameData}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            ListEmptyComponent={
              <View style={styles.noDataContainer}>
                <Text style={styles.noDataText}>No game data available</Text>
              </View>
            }
          />
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: '#f5f5f5',
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
    paddingVertical: 12,
  },
  headerRow: {
    backgroundColor: '#007AFF',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  cell: {
    width: 150,
    paddingHorizontal: 8,
    textAlign: 'center',
    fontSize: 14,
  },
  headerCell: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 15,
  },
  gameName: {
    width: 200,
    textAlign: 'left',
    fontWeight: '600',
  },
  improvementCell: {
    fontWeight: 'bold',
  },
  positive: {
    color: '#2E7D32',
  },
  negative: {
    color: '#C62828',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  noDataContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 16,
    color: '#999',
  },
});

export default DyscalAnalyts;