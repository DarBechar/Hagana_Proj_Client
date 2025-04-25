import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function ContactComp({ contact, onPress }) {
  // Default placeholder image if no image is provided
  const defaultImage =
    "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";

  const handleCall = () => {
    // Handle phone call action
    const phoneNumber = contact.phone.replace(/-/g, "");
    Linking.openURL(`tel:${phoneNumber}`);
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress && onPress(contact)}
      activeOpacity={0.7}
    >
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionButton} onPress={handleCall}>
          <Ionicons name="call-outline" size={22} color="#f0f0f0" />
        </TouchableOpacity>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.name}>
          {contact.firstName + ` ` + contact.lastName}
        </Text>
        <Text style={styles.role}>{contact.role || "מתנדב"}</Text>
        <Text style={styles.phone}>{contact.phoneNumber}</Text>
      </View>

      <Image
        source={{ uri: contact.picture || defaultImage }}
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
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#d0d0d0", // Light gray background
  },
});
