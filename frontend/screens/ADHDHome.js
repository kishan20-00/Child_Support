import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const HomeScreen = () => {
  const navigation = useNavigation();

  const identification = [
    { title: 'Find the Difference Game', screen: 'Differ', icon: 'image-search-outline' },
    { title: 'Find the Object Game', screen: 'Object', icon: 'magnify' },
    { title: 'ADHD Quiz', screen: 'ADHDQuiz', icon: 'clipboard-text-outline' },
  ];

  const mitigation = [
    { title: 'Mahjong', screen: 'Mahjong', icon: 'cards-playing-outline' },
    { title: 'Focus Timer', screen: 'Focus', icon: 'timer-sand' },
  ];

  const renderCards = (title, data) => (
    <View style={{ marginBottom: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>{title}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        {data.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={{
              backgroundColor: '#007AFF',
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
            <Icon name={item.icon} size={30} color="#fff" style={{ marginBottom: 10 }} />
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold', textAlign: 'center' }}>
              {item.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={{ padding: 20, backgroundColor: '#f5f5f5', marginTop: 40 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' }}>
        Select a Game or Quiz
      </Text>
      {renderCards('Identification', identification)}
      {renderCards('Mitigation', mitigation)}
    </ScrollView>
  );
};

export default HomeScreen;
