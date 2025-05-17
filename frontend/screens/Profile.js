import React, { useEffect, useState } from "react";
import {
  View,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Image,
  Text,
} from "react-native";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { TextInput, Button } from "react-native-paper";
import Icon from "react-native-vector-icons/Ionicons";

export default function Profile({ navigation }) {
  const [userData, setUserData] = useState(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserData(data);
          setFullName(data.fullName || "");
          setPhone(data.phone || "");
          setEmail(data.email || "");
          setAge(data.age || "");
        }
      }
      setLoading(false);
    };

    fetchUserData();
  }, []);

  const handleUpdate = async () => {
    if (!fullName || !age) {
      Alert.alert("Error", "All fields must be filled out");
      return;
    }

    try {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, "users", user.uid);
        await updateDoc(docRef, {
          fullName,
          email,
          age,
          phone,
        });
        Alert.alert("Success", "Profile updated successfully");
      }
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigation.replace("Login");
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  if (loading) return <ActivityIndicator size="large" color="#6200ea" />;

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#F9FAFC",
        padding: 20,
      }}
    >
      {/* Profile Picture */}
      <View style={{ alignItems: "center", marginBottom: 20 }}>
        <Image
          source={require("../assets/Person.jpg")} // Replace with the correct local image
          style={{
            width: 120,
            height: 120,
            borderRadius: 60,
            marginBottom: 10,
          }}
        />
        <TouchableOpacity>
          <Icon name="pencil" size={20} color="#2563EB" />
        </TouchableOpacity>
      </View>

      {/* Editable Fields */}
      <View style={{ marginBottom: 20 }}>
        <TextInput
          label="Name"
          value={fullName}
          onChangeText={setFullName}
          mode="outlined"
          style={{ marginBottom: 10 }}
        />
        <TextInput
          label="Email"
          value={email}
          editable={false} // Makes the email field non-editable
          mode="outlined"
          style={{ marginBottom: 10 }}
        />
        <TextInput
          label="Age"
          value={age}
          onChangeText={setAge}
          mode="outlined"
          keyboardType="numeric"
          style={{ marginBottom: 10 }}
        />
        <TextInput
          label="Phone"
          value={phone}
          onChangeText={setPhone}
          mode="outlined"
          style={{ marginBottom: 10 }}
        />
      </View>

      {/* Buttons */}
      <Button
        mode="contained"
        onPress={handleUpdate}
        style={{
          backgroundColor: "#2563EB",
          marginBottom: 20,
        }}
        icon="lock"
      >
        Update
      </Button>
      <Button
        mode="outlined"
        onPress={handleLogout}
        style={{ borderColor: "#DC2626" }}
        labelStyle={{ color: "#DC2626" }}
        icon="logout"
      >
        Logout
      </Button>
    </View>
  );
}
