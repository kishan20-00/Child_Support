import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, FlatList } from 'react-native';
import { auth, db } from '../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

const ADHDAnalytics = () => {
  const [gameData, setGameData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Game configuration with field mappings for each game
  const gameConfig = {
    'adhd_scores': {
      name: 'Find the Difference',
      scoreField: 'score',
      timeField: 'timestamp',
      maxScore: 10,
      isBoolean: false
    },
    'focus': {
      name: 'Find the Object',
      scoreField: 'result',
      timeField: 'timeTaken',
      maxScore: 1,
      isBoolean: true
    },
    'ADHD_quiz': {
      name: 'ADHD Quiz',
      scoreField: 'tIndex',
      timeField: 'timestamp',
      maxScore: 12,
      isBoolean: false
    },
    'mahjong_game': {
      name: 'Mahjong Game',
      scoreField: 'score',
      timeField: 'timestamp',
      maxScore: 10,
      isBoolean: false
    },
    'focus_timer_game': {
      name: 'Focus Timer',
      scoreField: 'score',
      timeField: 'timestamp',
      maxScore: 8,
      isBoolean: false
    },
  };

  const fetchGameData = async () => {
    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user?.email) throw new Error('User not logged in');

      const userEmail = user.email;
      const scoresData = [];

      for (const [gameId, config] of Object.entries(gameConfig)) {
        const collectionRef = collection(db, gameId);
        const querySnapshot = await getDocs(collectionRef);

        querySnapshot.forEach((docSnap) => {
          if (docSnap.id === userEmail) {
            const attempts = docSnap.data().attempts || [];
            // Get last 3 attempts (most recent first)
            const recentAttempts = attempts.slice(-3).reverse();
            
            // Calculate success rate for boolean games, average for others
            let performanceMetric;
            let bestScore;
            
            if (config.isBoolean) {
              const successCount = attempts.filter(a => a[config.scoreField] === 'Yes').length;
              performanceMetric = attempts.length > 0 
                ? (successCount / attempts.length * 100).toFixed(0) + '%' 
                : '0%';
              bestScore = attempts.some(a => a[config.scoreField] === 'Yes') ? 'Yes' : 'No';
            } else {
              performanceMetric = attempts.length > 0 
                ? (attempts.reduce((sum, attempt) => sum + (attempt[config.scoreField] || 0), 0) / attempts.length)
                : 0;
              bestScore = attempts.length > 0 
                ? Math.max(...attempts.map(a => a[config.scoreField] || 0))
                : 0;
            }

            scoresData.push({
              id: gameId,
              name: config.name,
              attempts: recentAttempts.map(attempt => ({
                score: config.isBoolean 
                  ? attempt[config.scoreField] === 'Yes' ? '✔️ Yes' : '❌ No'
                  : attempt[config.scoreField] || 0,
                date: attempt[config.timeField] 
                  ? new Date(attempt[config.timeField]).toLocaleDateString() 
                  : 'No date',
                rawData: attempt
              })),
              maxScore: config.isBoolean ? '' : config.maxScore,
              average: config.isBoolean ? performanceMetric : parseFloat(performanceMetric).toFixed(1),
              bestScore: config.isBoolean ? bestScore : bestScore,
              totalAttempts: attempts.length,
              isBoolean: config.isBoolean
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
    fetchGameData();
  };

  useEffect(() => {
    fetchGameData();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.row}>
      <Text style={[styles.cell, styles.gameName]}>{item.name}</Text>
      
      {/* Recent Attempts */}
      <View style={styles.attemptCell}>
        {item.attempts.length > 0 ? (
          item.attempts.map((attempt, index) => (
            <Text key={index} style={styles.attemptText}>
              {item.isBoolean ? attempt.score : `${attempt.score} (${attempt.date})`}
            </Text>
          ))
        ) : (
          <Text style={styles.attemptText}>No attempts</Text>
        )}
      </View>
      
      {/* Stats */}
      <View style={styles.statsCell}>
        <Text style={styles.statText}>
          {item.isBoolean ? 'Success Rate:' : 'Avg:'} {item.average}
        </Text>
        <Text style={styles.statText}>
          {item.isBoolean ? 'Best:' : 'Best:'} {item.bestScore}
        </Text>
        <Text style={styles.statText}>Total: {item.totalAttempts}</Text>
      </View>
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
      <View style={styles.tableContainer}>
        <View style={[styles.row, styles.headerRow]}>
          <Text style={[styles.cell, styles.headerCell, styles.gameName]}>Game</Text>
          <Text style={[styles.cell, styles.headerCell, styles.attemptCell]}>Recent Attempts</Text>
          <Text style={[styles.cell, styles.headerCell, styles.statsCell]}>Statistics</Text>
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
    flexGrow: 1,
    backgroundColor: '#f5f5f5',
  },
  tableContainer: {
    flex: 1,
    minWidth: 600,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
    paddingVertical: 12,
    minWidth: '100%',
  },
  headerRow: {
    backgroundColor: '#007AFF',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  cell: {
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
    width: 150,
    textAlign: 'left',
    fontWeight: '600',
  },
  attemptCell: {
    width: 250,
    paddingHorizontal: 8,
  },
  statsCell: {
    width: 150,
    paddingHorizontal: 8,
  },
  attemptText: {
    fontSize: 13,
    marginVertical: 2,
  },
  statText: {
    fontSize: 13,
    marginVertical: 2,
    fontWeight: '500',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    width: '100%',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  noDataContainer: {
    padding: 20,
    alignItems: 'center',
    width: '100%',
  },
  noDataText: {
    fontSize: 16,
    color: '#999',
  },
});

export default ADHDAnalytics;