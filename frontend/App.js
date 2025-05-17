import React from 'react';
import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { auth } from './firebaseConfig'; // Import Firebase auth
import { signOut } from 'firebase/auth';
import Register from './screens/Register';
import Login from './screens/Login';
import Home from './screens/Home';
import Profile from './screens/Profile';
import Settings from './screens/Settings';
import Notifications from './screens/Notifications';
import Diagnosis from './screens/Diagnosis';
import FindTheDifferenceGame from './screens/FindTheDifference';
import FindTheObjectGame from './screens/FindTheObject';
import ADHDQuiz from './screens/ADHDquiz';
import MahjongGame from './screens/Mahjong';
import FocusTimerGame from './screens/FocusTimer';
import HomeScreen from './screens/ADHDHome';
import DyscalHome from './screens/DyscalculiaHome';
import NumberPatternGame from './screens/NumberComp';
import DotCountingGame from './screens/QuickDotReco';
import NumberSortingGame from './screens/NumberSortAsc';
import SortNumbersDescendingGame from './screens/NumberSortDesc';
import IdentificationHome from './screens/IdentificationHome';
import ADHDIdentity from './screens/ADHDIdentity';
import DyscalculiaIdentify from './screens/DyscalculiaIdentify';
import DyslexiaPrediction from './screens/DyslexiaIdentify';
import AdditionWithCounters from './screens/AdditionwithCounters';
import SubtractionStoryProblem from './screens/SubsWithStory';
import MatchTheEquation from './screens/MatchTheEquation';
import MakeNumberGame from './screens/MakeANumber';
import RollDiceGame from './screens/RollDice';
import CountObjectsGame from './screens/CountObjects';
import PatternRecognitionGame from './screens/PatternRecognition';
import FindBendsGame from './screens/CountTheBends';
import CountLegsGame from './screens/CountTheLegs';
import MeasureObjectsGame from './screens/CountUnits';
import RearrangeNumbersGame from './screens/RearrangeNumbers';
import NumberLineGame from './screens/NumberLinePlacement';
import NumberMatchingGame from './screens/NumberMatching';
import DyslexiaHome from './screens/DyslexiaHome';
import DysgraphiaPredictionPage from './screens/DysgraphiaIdentify';
import SpeechDyslexiaPage from './screens/DyslexiaSpeech';
import DysgraphiaIdentiHome from './screens/DyslexiaIdentiHome';
import DysgraphiasHome from './screens/DysgraphiasHome';
import DysgraphiaUploadScreen from './screens/WritingBox';
import WritingLinesScreen from './screens/WritingLines';
import SyllableSpeakingScreen from './screens/SyllableSpelling';
import ObjectPronunciationScreen from './screens/ObjectRecognition';
import PhraseReadingScreen from './screens/PhraseReading';
import LetterByLetterPage from './screens/LetterByLetterReco';
import ObjectDivisionGame from './screens/ObjectDivision';
import CountApplesGame from './screens/CountApples';
import MoneyGame from './screens/MoneyGame';
import AdditionGame from './screens/AdditionCollection';
import SubsctractionGame from './screens/SubsCollection';
import AscDescCollection from './screens/AscDescCollection';
import PatternCollection from './screens/PatternCollection';
import LengthCollection from './screens/LengthCollection';
import MoneyCollection from './screens/MoneyCollection';
import ObjectCollection from './screens/ObjectCollection';
import DyscalAnalyts from './screens/DyscalculiaAnalysis';
import AnalysisHome from './screens/AnalysisHome';
import ADHDAnalytics from './screens/ADHDAnalysis';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

// Custom Drawer Content (Header + Styled Items + Logout)
function CustomDrawerContent(props) {
  const handleLogout = async () => {
    try {
      await signOut(auth);
      props.navigation.replace('Login'); // Redirect to login after logout
    } catch (error) {
      console.error('Logout error:', error.message);
    }
  };

  return (
    <DrawerContentScrollView {...props}>
      {/* Drawer Header */}
      <View style={styles.drawerHeader}>
        <Text style={styles.drawerHeaderText}>Welcome!</Text>
      </View>

      {/* Drawer Items */}
      <DrawerItemList {...props} />

      {/* Logout Button */}
      <DrawerItem
        label="Logout"
        onPress={handleLogout}
        icon={({ color, size }) => <Icon name="exit-to-app" color={color} size={size} />}
      />
    </DrawerContentScrollView>
  );
}

// Drawer Navigator with Icons + Logout
function DrawerNavigator() {
  return (
    <Drawer.Navigator drawerContent={(props) => <CustomDrawerContent {...props} />}>
      <Drawer.Screen
        name="Home"
        component={Home}
        options={{
          drawerIcon: ({ color, size }) => <Icon name="home" color={color} size={size} />,
        }}
      />
      <Drawer.Screen
        name="Profile"
        component={Profile}
        options={{
          drawerIcon: ({ color, size }) => <Icon name="account" color={color} size={size} />,
        }}
      />
      <Drawer.Screen
        name="Identification"
        component={IdentificationHome}
        options={{
          drawerIcon: ({ color, size }) => <Icon name="doctor" color={color} size={size} />,
        }}
      />
      <Drawer.Screen
        name="Diagnosis"
        component={Diagnosis}
        options={{
          drawerIcon: ({ color, size }) => <Icon name="heart-plus" color={color} size={size} />,
        }}
      />
      <Drawer.Screen
        name="Analysis"
        component={AnalysisHome}
        options={{
          drawerIcon: ({ color, size }) => <Icon name="google-analytics" color={color} size={size} />,
        }}
      />
      <Drawer.Screen
        name="Settings"
        component={Settings}
        options={{
          drawerIcon: ({ color, size }) => <Icon name="cog" color={color} size={size} />,
        }}
      />
      <Drawer.Screen
        name="Notifications"
        component={Notifications}
        options={{
          drawerIcon: ({ color, size }) => <Icon name="bell" color={color} size={size} />,
        }}
      />
    </Drawer.Navigator>
  );
}

// Main App
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen 
          name="Login" 
          component={Login} 
          options={{ title: "Login", headerShown: true }} 
        />
        <Stack.Screen 
          name="Register" 
          component={Register} 
          options={{ title: "Register", headerShown: true }} 
        />
        <Stack.Screen 
          name="Main" 
          component={DrawerNavigator} 
          options={{ title: "Home", headerShown: false }} 
        />
        <Stack.Screen 
          name="Differ" 
          component={FindTheDifferenceGame} 
          options={{ title: "Find the Difference", headerShown: true }} 
        />
        <Stack.Screen 
          name="Object" 
          component={FindTheObjectGame} 
          options={{ title: "Find the Object", headerShown: true }} 
        />
        <Stack.Screen 
          name="ADHDQuiz" 
          component={ADHDQuiz} 
          options={{ title: "ADHD Quiz", headerShown: true }} 
        />
        <Stack.Screen 
          name="Mahjong" 
          component={MahjongGame} 
          options={{ title: "Mahjong", headerShown: true }} 
        />
        <Stack.Screen 
          name="Focus" 
          component={FocusTimerGame} 
          options={{ title: "Focus Timer", headerShown: true }} 
        />
        <Stack.Screen 
          name="ADHD" 
          component={HomeScreen} 
          options={{ title: "ADHD Games & Quizzes", headerShown: true }} 
        />
        <Stack.Screen 
          name="Dyscalculia" 
          component={DyscalHome} 
          options={{ title: "Dyscalculia Games & Quizzes", headerShown: true }} 
        />
        <Stack.Screen 
          name="NumberPat" 
          component={NumberPatternGame} 
          options={{ title: "Number Comparison", headerShown: true }} 
        />
        <Stack.Screen 
          name="DotCount" 
          component={DotCountingGame} 
          options={{ title: "Quick Dot Recognition", headerShown: true }} 
        />
        <Stack.Screen 
          name="NumberSortAsc" 
          component={NumberSortingGame} 
          options={{ title: "Number Sort in Ascending", headerShown: true }} 
        />
        <Stack.Screen 
          name="NumberSortDesc" 
          component={SortNumbersDescendingGame} 
          options={{ title: "Number Sort in Descending", headerShown: true }} 
        />
        <Stack.Screen 
          name="ADHDIdentity" 
          component={ADHDIdentity} 
          options={{ title: "Checking ADHD", headerShown: true }} 
        />
        <Stack.Screen 
          name="DyscalIdentify" 
          component={DyscalculiaIdentify} 
          options={{ title: "Dyscalculia Identification", headerShown: true }} 
        />
        <Stack.Screen 
          name="DyslexIdentify" 
          component={DyslexiaPrediction} 
          options={{ title: "Predicting Dyslexia Possibility", headerShown: true }} 
        />
        <Stack.Screen 
          name="AdditionCounter" 
          component={AdditionWithCounters} 
          options={{ title: "Addition With Counters", headerShown: true }} 
        />
        <Stack.Screen 
          name="SubsctractionStory" 
          component={SubtractionStoryProblem} 
          options={{ title: "Subsctraction with Story", headerShown: true }} 
        />
        <Stack.Screen 
          name="MatchEquation" 
          component={MatchTheEquation} 
          options={{ title: "Match the Equation", headerShown: true }} 
        />
        <Stack.Screen 
          name="MakeNumber" 
          component={MakeNumberGame} 
          options={{ title: "Make a Number", headerShown: true }} 
        />
        <Stack.Screen 
          name="RollDice" 
          component={RollDiceGame} 
          options={{ title: "Roll 2 Dices", headerShown: true }} 
        />
        <Stack.Screen 
          name="CountOb" 
          component={CountObjectsGame} 
          options={{ title: "Count the Objects", headerShown: true }} 
        />
        <Stack.Screen 
          name="PatternReco" 
          component={PatternRecognitionGame} 
          options={{ title: "Pattern Recognition", headerShown: true }} 
        />
        <Stack.Screen 
          name="CountBend" 
          component={FindBendsGame} 
          options={{ title: "Count the Bends", headerShown: true }} 
        />
        <Stack.Screen 
          name="CountLegs" 
          component={CountLegsGame} 
          options={{ title: "Count the Legs of Animals", headerShown: true }} 
        />
        <Stack.Screen 
          name="MeasureUnits" 
          component={MeasureObjectsGame} 
          options={{ title: "Measure the Units", headerShown: true }} 
        />
        <Stack.Screen 
          name="RearrangeNumbers" 
          component={RearrangeNumbersGame} 
          options={{ title: "Rearrange the Numbers", headerShown: true }} 
        />
        <Stack.Screen 
          name="NumberLinePlacement" 
          component={NumberLineGame} 
          options={{ title: "Place the Correct Number", headerShown: true }} 
        />
        <Stack.Screen 
          name="NumberMatching" 
          component={NumberMatchingGame} 
          options={{ title: "Match the Number Correctly", headerShown: true }} 
        />
        <Stack.Screen 
          name="DyslexiaHome" 
          component={DyslexiaHome} 
          options={{ title: "Dyslexia Home", headerShown: true }} 
        />
        <Stack.Screen 
          name="DysgraphiaIdentify" 
          component={DysgraphiaPredictionPage} 
          options={{ title: "Identify Dysgraphia", headerShown: true }} 
        />
        <Stack.Screen 
          name="SpeechDyslexia" 
          component={SpeechDyslexiaPage} 
          options={{ title: "DysLexia Speech Recognition", headerShown: true }} 
        />
        <Stack.Screen 
          name="DyslexiaIdenHome" 
          component={DysgraphiaIdentiHome} 
          options={{ title: "Dyslexia Identification", headerShown: true }} 
        />
        <Stack.Screen 
          name="DysgraHome" 
          component={DysgraphiasHome} 
          options={{ title: "Dysgraphia Home", headerShown: true }} 
        />
        <Stack.Screen 
          name="DysgraBlockLetter" 
          component={DysgraphiaUploadScreen} 
          options={{ title: "Writing inside Box", headerShown: true }} 
        />
        <Stack.Screen 
          name="DysgraLineLetter" 
          component={WritingLinesScreen} 
          options={{ title: "Writing inside 2 Lines", headerShown: true }} 
        />
        <Stack.Screen 
          name="SyllableSpeak" 
          component={SyllableSpeakingScreen} 
          options={{ title: "Syllables Speaking Screen", headerShown: true }} 
        />
        <Stack.Screen 
          name="ObjectPronounce" 
          component={ObjectPronunciationScreen} 
          options={{ title: "Pronounce the Object Names", headerShown: true }} 
        />
        <Stack.Screen 
          name="PhraseReading" 
          component={PhraseReadingScreen} 
          options={{ title: "Read the Phrases", headerShown: true }} 
        />
        <Stack.Screen 
          name="LetterByLetter" 
          component={LetterByLetterPage} 
          options={{ title: "Letter By Recognition", headerShown: true }} 
        />
        <Stack.Screen 
          name="ObjectDivision" 
          component={ObjectDivisionGame} 
          options={{ title: "Object Division", headerShown: true }} 
        />
        <Stack.Screen 
          name="CountApple" 
          component={CountApplesGame} 
          options={{ title: "Count the Apples", headerShown: true }} 
        />
        <Stack.Screen 
          name="MoneyGame" 
          component={MoneyGame} 
          options={{ title: "Money Game", headerShown: true }} 
        />
        <Stack.Screen 
          name="AdditionCol" 
          component={AdditionGame} 
          options={{ title: "Addition Collection", headerShown: true }} 
        />
        <Stack.Screen 
          name="SubsCol" 
          component={SubsctractionGame} 
          options={{ title: "Substraction Collection", headerShown: true }} 
        />
        <Stack.Screen 
          name="OrdCol" 
          component={AscDescCollection} 
          options={{ title: "Ordering Collection", headerShown: true }} 
        />
        <Stack.Screen 
          name="PatternColl" 
          component={PatternCollection} 
          options={{ title: "Pattern Collection", headerShown: true }} 
        />
        <Stack.Screen 
          name="LengthColl" 
          component={LengthCollection} 
          options={{ title: "Length Collection", headerShown: true }} 
        />
        <Stack.Screen 
          name="MoneyColl" 
          component={MoneyCollection} 
          options={{ title: "Money Collection", headerShown: true }} 
        />
        <Stack.Screen 
          name="ObjectColl" 
          component={ObjectCollection} 
          options={{ title: "Object Collection", headerShown: true }} 
        />
        <Stack.Screen 
          name="DyscalAnalytics" 
          component={DyscalAnalyts} 
          options={{ title: "Dyscalculia Comparison", headerShown: true }} 
        />
        <Stack.Screen 
          name="ADHDAnalytics" 
          component={ADHDAnalytics} 
          options={{ title: "ADHD Comparison", headerShown: true }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Styles for Drawer Header
const styles = StyleSheet.create({
  drawerHeader: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  drawerHeaderText: {
    color: 'black',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
