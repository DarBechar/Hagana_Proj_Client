import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Linking,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function ContactComp({ contact, onPress }) {
  // Default placeholder image if no image is provided
  const defaultImage =
    "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";

  const handleCall = () => {
    // Try different possible field names for phone number
    const phoneNumber =
      contact.PhoneNumber ||
      contact.phoneNumber ||
      contact.phone ||
      contact.Phone ||
      contact.mobile ||
      contact.Mobile;

    console.log("ContactComp - attempting call:", phoneNumber);

    if (!phoneNumber) {
      Alert.alert("שגיאה", "מספר טלפון לא זמין");
      return;
    }

    // Clean phone number (remove spaces, dashes, etc.)
    const cleanNumber = String(phoneNumber).replace(/[^\d+]/g, "");

    if (!cleanNumber || cleanNumber.length === 0) {
      Alert.alert("שגיאה", "מספר טלפון לא תקין");
      return;
    }

    const phoneUrl = `tel:${cleanNumber}`;

    Linking.canOpenURL(phoneUrl)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(phoneUrl);
        } else {
          Alert.alert("שגיאה", "לא ניתן לבצע שיחות מהמכשיר הזה");
        }
      })
      .catch((error) => {
        console.error("Error making phone call:", error);
        Alert.alert("שגיאה", "אירעה שגיאה בביצוע השיחה");
      });
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress && onPress(contact)}
      activeOpacity={0.7}
    >
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionButton} onPress={handleCall}>
          <Ionicons name="call" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.name}>
          {contact.FirstName + ` ` + contact.LastName}
        </Text>
        <Text style={styles.role}>{contact.Role || "מתנדב"}</Text>
        <Text style={styles.phone}>
          {contact.PhoneNumber || contact.phoneNumber || "לא זמין"}
        </Text>
      </View>

      <Image
        source={{ uri: contact.Picture || defaultImage }}
        style={styles.image}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#f0f0f0",
  },
  infoContainer: {
    flex: 1,
    marginHorizontal: 16,
    justifyContent: "center",
    alignItems: "flex-end",
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
    textAlign: "right",
  },
  role: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
    textAlign: "right",
  },
  phone: {
    fontSize: 14,
    color: "#666",
    textAlign: "right",
  },
  actionButtons: {
    justifyContent: "center",
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#4caf50", // Beautiful green color
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
});
