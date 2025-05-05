import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const DyslexiaHome = () => {
  const navigation = useNavigation();

  const identification = [
    { title: 'Spell the Object Correct', screen: 'ObjectPronounce', icon: 'alphabetical' }, // Alphabet icon for spelling
    { title: 'Pronounce Syllables', screen: 'SyllableSpeak', icon: 'microphone' }, // Microphone for pronunciation
  ];

  const mitigation = [
    { title: 'Handwriting Detection', screen: 'DyslexIdentify', icon: 'gesture' }, // Hand gesture for handwriting
    { title: 'Reading Tasks', screen: 'PhraseReading', icon: 'book-open-variant' }, // Book icon for reading tasks
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
      {renderCards('Speech', identification)}
      {renderCards('Text', mitigation)}
    </ScrollView>
  );
};

export default DyslexiaHome;
