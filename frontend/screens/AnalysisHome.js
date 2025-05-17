import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const AnalysisHome = () => {
  const navigation = useNavigation();

  const Analysis = [
    { 
      title: 'Dyscalculia Analysis', 
      screen: 'DyscalAnalytics', 
      icon: 'calculator-variant',
      color: '#4CAF50' // Green
    },
    { 
      title: 'ADHD Analytics', 
      screen: 'ADHDAnalytics', 
      icon: 'brain',
      color: '#FF9800' // Orange
    },
  ];

  const renderCards = (title, data) => (
    <View style={{ marginBottom: 20 }}>
      <Text style={{ 
        fontSize: 20, 
        fontWeight: 'bold', 
        marginBottom: 10,
        color: '#333'
      }}>
        {title}
      </Text>
      <View style={{ 
        flexDirection: 'row', 
        flexWrap: 'wrap', 
        justifyContent: 'space-between'
      }}>
        {data.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={{
              backgroundColor: item.color,
              padding: 20,
              borderRadius: 12,
              width: '48%',
              marginBottom: 15,
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 5,
            }}
            onPress={() => navigation.navigate(item.screen)}
          >
            <Icon 
              name={item.icon} 
              size={40} 
              color="#fff" 
              style={{ marginBottom: 15 }} 
            />
            <Text style={{ 
              color: '#fff', 
              fontSize: 16, 
              fontWeight: 'bold', 
              textAlign: 'center'
            }}>
              {item.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={{ 
      padding: 20, 
      backgroundColor: '#f5f5f5',
      paddingTop: 40
    }}>
      <View style={{
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 12,
        marginBottom: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}>
        <Text style={{ 
          fontSize: 24, 
          fontWeight: 'bold', 
          marginBottom: 10, 
          textAlign: 'center',
          color: '#007AFF'
        }}>
          Analyze Your Results
        </Text>
        <Text style={{
          fontSize: 16,
          color: '#666',
          textAlign: 'center'
        }}>
          Track your progress and get detailed insights
        </Text>
      </View>
      
      {renderCards('Analysis Tools', Analysis)}
    </ScrollView>
  );
};

export default AnalysisHome;