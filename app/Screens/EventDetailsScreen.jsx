import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import {
  Ionicons,
  MaterialIcons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import StatusIndicator from "../Components/StatusIndicatorComp";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";

const { width } = Dimensions.get("window");

export default function EventDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { event } = route.params || {};
  const [mapReady, setMapReady] = useState(false);

  if (!event) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Image
            source={require("../../assets/images/Hagana_Logo.png")}
            style={styles.logo}
          />
          <Text style={styles.headerTitle}>פרטי אירוע</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>לא נמצאו פרטי אירוע</Text>
          <TouchableOpacity
            style={styles.backToHomeButton}
            onPress={() => navigation.navigate("בית")}
          >
            <Text style={styles.backToHomeText}>חזרה לדף הבית</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Format date for display
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("he-IL", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return dateString || "לא צוין";
    }
  };

  // Prepare map coordinate
  const hasValidCoordinates =
    event.locationLatitude &&
    event.locationLongitude &&
    !isNaN(event.locationLatitude) &&
    !isNaN(event.locationLongitude);

  const eventLocation = hasValidCoordinates
    ? {
        latitude: parseFloat(event.locationLatitude),
        longitude: parseFloat(event.locationLongitude),
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }
    : {
        // Default coordinates (can be centered on a known location in Israel)
        latitude: 32.0853,
        longitude: 34.7818,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require("../../assets/images/Hagana_Logo.png")}
          style={styles.logo}
        />
      </View>

      {/* Status Indicator */}
      <StatusIndicator status="emergency" />

      <ScrollView style={styles.contentContainer}>
        {/* Event Information */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>מידע כללי</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoValue}>{event.eventName || "לא צוין"}</Text>
            <Text style={styles.infoLabel}>שם האירוע:</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoValue}>
              {formatDate(event.openingDate)}
            </Text>
            <Text style={styles.infoLabel}>זמן פתיחה:</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoValue}>
              {event.locationName || "לא צוין"}
            </Text>
            <Text style={styles.infoLabel}>מיקום:</Text>
          </View>
        </View>

        {/* Description Card */}
        <View style={styles.menuContainer}>
          <View style={styles.menuItem}>
            <View style={styles.menuContent}>
              <Text style={styles.menuText}>תיאור האירוע</Text>
              <View
                style={[styles.iconContainer, { backgroundColor: "#f9ebeb" }]}
              >
                <MaterialCommunityIcons
                  name="information-outline"
                  size={24}
                  color="#d64e4e"
                />
              </View>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionText}>
              {event.description || "אין תיאור זמין לאירוע זה."}
            </Text>
          </View>
        </View>

        {/* Map View */}
        <View style={styles.menuContainer}>
          <View style={styles.menuItem}>
            <View style={styles.menuContent}>
              <Text style={styles.menuText}>מיקום האירוע</Text>
              <View
                style={[styles.iconContainer, { backgroundColor: "#e3f1fa" }]}
              >
                <MaterialIcons name="location-on" size={24} color="#3d8bcd" />
              </View>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.mapContainer}>
            {hasValidCoordinates ? (
              <MapView
                style={styles.map}
                initialRegion={eventLocation}
                onMapReady={() => setMapReady(true)}
              >
                <Marker
                  coordinate={{
                    latitude: parseFloat(event.locationLatitude),
                    longitude: parseFloat(event.locationLongitude),
                  }}
                  title={event.eventName || "מיקום האירוע"}
                  description={event.locationName || ""}
                  pinColor="#d32f2f"
                />
              </MapView>
            ) : (
              <View style={styles.noMapContainer}>
                <MaterialIcons name="location-off" size={40} color="#888" />
                <Text style={styles.noMapText}>אין נתוני מיקום זמינים</Text>
              </View>
            )}
            {hasValidCoordinates && (
              <View style={styles.coordinatesContainer}>
                <Text style={styles.coordinatesText}>
                  קו רוחב: {event.locationLatitude}
                </Text>
                <Text style={styles.coordinatesText}>
                  קו אורך: {event.locationLongitude}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Status Card */}
        <View style={styles.menuContainer}>
          <View style={styles.menuItem}>
            <View style={styles.menuContent}>
              <Text style={styles.menuText}>סטטוס האירוע</Text>
              <View
                style={[styles.iconContainer, { backgroundColor: "#ebf9f1" }]}
              >
                <MaterialIcons name="update" size={24} color="#4e9d6d" />
              </View>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.statusContainer}>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>פעיל</Text>
            </View>
            <Text style={styles.statusUpdated}>
              עודכן ב: {formatDate(event.activatedAt || event.openingDate)}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.btnSection}>
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => navigation.navigate("בית")}
          >
            <Text style={styles.secondaryBtnText}>בחזרה לעמוד הבית</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => navigation.navigate("הוספה")}
          >
            <Text style={styles.primaryBtnText}>כפתור</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  logo: {
    width: 40,
    height: 40,
    resizeMode: "contain",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 10,
  },
  contentContainer: {
    flex: 1,
    padding: 15,
  },
  // Menu style cards (like in your HomePage)
  menuContainer: {
    marginTop: 15,
    marginBottom: 15,
    backgroundColor: "#fff",
    borderRadius: 15,
    marginHorizontal: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuItem: {
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  menuContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  menuText: {
    fontSize: 16,
    marginRight: 15,
    textAlign: "right",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginHorizontal: 20,
  },
  // Info card styling
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    marginVertical: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "right",
    color: "#333",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  infoLabel: {
    fontWeight: "bold",
    fontSize: 15,
    color: "#555",
    marginLeft: 10,
    textAlign: "right",
  },
  infoValue: {
    fontSize: 15,
    color: "#333",
    textAlign: "right",
    flex: 1,
  },
  // Description styles
  descriptionContainer: {
    padding: 15,
  },
  descriptionText: {
    fontSize: 15,
    color: "#333",
    lineHeight: 22,
    textAlign: "right",
  },
  // Map styles
  mapContainer: {
    width: "100%",
    height: 300,
    overflow: "hidden",
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  map: {
    width: "100%",
    height: "100%",
  },
  noMapContainer: {
    width: "100%",
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  noMapText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  coordinatesContainer: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    padding: 8,
    borderRadius: 5,
  },
  coordinatesText: {
    fontSize: 12,
    color: "#333",
    textAlign: "right",
  },
  // Status styles
  statusContainer: {
    padding: 15,
    alignItems: "flex-end",
  },
  statusBadge: {
    backgroundColor: "#d32f2f",
    borderRadius: 30,
    paddingVertical: 5,
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  statusText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  statusUpdated: {
    fontSize: 12,
    color: "#777",
    textAlign: "right",
  },
  // Button styles to match your app
  btnSection: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 15,
    marginBottom: 30,
  },
  primaryBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 30,
    marginLeft: 8,
    marginBottom: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#9610FF",
    width: 150,
  },
  primaryBtnText: {
    color: "white",
    fontSize: 16,
    fontWeight: "regular",
  },
  secondaryBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 30,
    marginRight: 8,
    marginBottom: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#9610FF",
    width: 150,
  },
  secondaryBtnText: {
    color: "#9610FF",
    fontSize: 16,
    fontWeight: "regular",
  },
  // Error container
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: "#555",
    textAlign: "center",
    marginBottom: 20,
  },
  backToHomeButton: {
    backgroundColor: "#9610FF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 30,
  },
  backToHomeText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
});
