import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const DyscalHome = () => {
  const navigation = useNavigation();

  const identification = [
    { title: 'Quick Dot Recognition', screen: 'DotCount', icon: 'circle-multiple' },
    { title: 'Addition', screen: 'NumberLinePlacement', icon: 'plus' },
    { title: 'Subtraction', screen: 'SubsctractionStory', icon: 'minus' },
    { title: 'Object Division', screen: 'ObjectDivision', icon: 'division' },
    { title: 'Count the Apples', screen: 'CountApple', icon: 'apple' },
    { title: 'Number Line Addition', screen: 'AdditionCounter', icon: 'chart-line' },
    { title: 'Pattern Recognition', screen: 'PatternReco', icon: 'chart-bell-curve' },
    { title: 'Count the Objects', screen: 'CountOb', icon: 'counter' },
    { title: 'Number Pattern', screen: 'NumberPat', icon: 'numeric' },
    { title: 'Money Game', screen: 'MoneyGame', icon: 'cash' },
    { title: 'Object Values', screen: 'MatchEquation', icon: 'equal' },
    { title: 'Ascending Order Sorting', screen: 'NumberSortAsc', icon: 'sort-ascending' },
    { title: 'Descending Order Sorting', screen: 'NumberSortDesc', icon: 'sort-descending' },
    { title: 'Length Calculation', screen: 'MeasureUnits', icon: 'ruler' },
  ];

  const mitigation = [
    { title: 'Addition Collection', screen: 'AdditionCol', icon: 'plus-box-multiple' },
    { title: 'Subtraction Collection', screen: 'SubsCol', icon: 'minus-box-multiple' },
    { title: 'Ascending Descending Collection', screen: 'OrdCol', icon: 'sort-variant' },
    { title: 'Pattern Collection', screen: 'PatternColl', icon: 'chart-areaspline' },
    { title: 'Length Collection', screen: 'LengthColl', icon: 'ruler-square' },
    { title: 'Money Collection', screen: 'MoneyColl', icon: 'wallet' },
    { title: 'Object Collection', screen: 'ObjectColl', icon: 'shape' },
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

export default DyscalHome;