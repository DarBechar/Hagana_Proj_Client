import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import {
  Ionicons,
  MaterialIcons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import MapView, { Marker } from "react-native-maps";

export default function EventLogDetailsScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const event = route.params?.event || {};

  // Function to format date and time
  const formatDateTime = (dateString) => {
    if (!dateString) return "תאריך לא ידוע";

    const date = new Date(dateString);

    // Format date as DD/MM/YYYY
    const formattedDate = date.toLocaleDateString("he-IL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    // Format time as HH:MM
    const formattedTime = date.toLocaleTimeString("he-IL", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return `${formattedDate} ${formattedTime}`;
  };

  // Function to determine event status color
  const getStatusColor = () => {
    if (!event.eventStatusCode) return "#888"; // Default gray

    switch (event.eventStatusCode) {
      case 1: // Open
        return "#4CAF50"; // Green
      case 2: // In Progress
        return "#2196F3"; // Blue
      case 3: // Closed
        return "#888888"; // Gray
      case 4: // Critical
        return "#F44336"; // Red
      case 5: // Emergency
        return "#F89300"; // Orange
      default:
        return "#888"; // Default gray
    }
  };

  // Function to get event type color
  const getTypeColor = () => {
    if (!event.eventTypeCode) return "#888";

    switch (event.eventTypeCode) {
      case 1:
        return "#F44336"; // שריפה
      case 2:
        return "#FF9800"; // בטחוני
      case 3:
        return "#4CAF50"; // רפואי
      case 4:
        return "#2196F3"; // תשתיות
      case 5:
        return "#9E9E9E"; // אחר
      default:
        return "#888";
    }
  };

  // Function to get status text based on status code
  const getStatusText = () => {
    if (!event.eventStatusCode) return "לא ידוע";

    switch (event.eventStatusCode) {
      case 1:
        return "פתוח";
      case 2:
        return "בטיפול";
      case 3:
        return "סגור";
      case 4:
        return "קריטי";
      case 5:
        return "חירום";
      default:
        return "לא ידוע";
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>פרטי אירוע</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.eventHeader}>
          <View style={styles.eventTitleContainer}>
            <Text style={styles.eventCode}>#{event.eventCode}</Text>
            <Text style={styles.eventName}>
              {event.eventName || "אירוע ללא שם"}
            </Text>
          </View>

          <View style={styles.badgesContainer}>
            <View style={[styles.badge, { backgroundColor: getTypeColor() }]}>
              <Text style={styles.badgeText}>
                {event.eventTypeName || "ללא סוג"}
              </Text>
            </View>
            <View style={[styles.badge, { backgroundColor: getStatusColor() }]}>
              <Text style={styles.badgeText}>{getStatusText()}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>פרטי זמן ומיקום</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoValue}>
              {formatDateTime(event.openingDate)}
            </Text>
            <View style={styles.infoLabelContainer}>
              <Text style={styles.infoLabel}>זמן פתיחה</Text>
              <MaterialIcons
                name="access-time"
                size={20}
                color="#666"
                style={styles.infoIcon}
              />
            </View>
          </View>

          {event.deactivatedAt && (
            <View style={styles.infoRow}>
              <Text style={styles.infoValue}>
                {formatDateTime(event.deactivatedAt)}
              </Text>
              <View style={styles.infoLabelContainer}>
                <Text style={styles.infoLabel}>זמן סגירה</Text>
                <MaterialIcons
                  name="event-busy"
                  size={20}
                  color="#666"
                  style={styles.infoIcon}
                />
              </View>
            </View>
          )}

          <View style={styles.infoRow}>
            <Text style={styles.infoValue}>
              {event.locationName || "לא צוין"}
            </Text>
            <View style={styles.infoLabelContainer}>
              <Text style={styles.infoLabel}>מיקום</Text>
              <MaterialIcons
                name="location-on"
                size={20}
                color="#666"
                style={styles.infoIcon}
              />
            </View>
          </View>
        </View>

        {/* Map section */}
        {event.locationLatitude && event.locationLongitude && (
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: event.locationLatitude,
                longitude: event.locationLongitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              scrollEnabled={false}
              zoomEnabled={false}
              rotateEnabled={false}
            >
              <Marker
                coordinate={{
                  latitude: event.locationLatitude,
                  longitude: event.locationLongitude,
                }}
                title={event.locationName || "מיקום האירוע"}
              />
            </MapView>
            <TouchableOpacity style={styles.mapButton}>
              <Text style={styles.mapButtonText}>צפה במפה מלאה</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Description section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>תיאור האירוע</Text>
          </View>

          <Text style={styles.description}>
            {event.description || "אין תיאור לאירוע זה"}
          </Text>
        </View>

        {/* Creator info section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>פרטים נוספים</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoValue}>
              {event.creatorUserID || "לא ידוע"}
            </Text>
            <View style={styles.infoLabelContainer}>
              <Text style={styles.infoLabel}>נוצר על ידי</Text>
              <MaterialIcons
                name="person"
                size={20}
                color="#666"
                style={styles.infoIcon}
              />
            </View>
          </View>

          {event.attachedReports && (
            <View style={styles.infoRow}>
              <Text style={styles.infoValue}>{event.attachedReports}</Text>
              <View style={styles.infoLabelContainer}>
                <Text style={styles.infoLabel}>דוחות מקושרים</Text>
                <MaterialCommunityIcons
                  name="file-document-outline"
                  size={20}
                  color="#666"
                  style={styles.infoIcon}
                />
              </View>
            </View>
          )}

          {event.affectedAreaRadius > 0 && (
            <View style={styles.infoRow}>
              <Text style={styles.infoValue}>
                {event.affectedAreaRadius} מטר
              </Text>
              <View style={styles.infoLabelContainer}>
                <Text style={styles.infoLabel}>רדיוס השפעה</Text>
                <MaterialIcons
                  name="radar"
                  size={20}
                  color="#666"
                  style={styles.infoIcon}
                />
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  headerRight: {
    width: 28, // Balance the back button width
  },
  scrollView: {
    flex: 1,
  },
  eventHeader: {
    backgroundColor: "#fff",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  eventTitleContainer: {
    marginBottom: 12,
  },
  eventCode: {
    fontSize: 14,
    color: "#666",
    textAlign: "right",
  },
  eventName: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "right",
  },
  badgesContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginLeft: 8,
  },
  badgeText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
  section: {
    backgroundColor: "#fff",
    marginTop: 10,
    padding: 16,
  },
  sectionHeader: {
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "right",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  infoLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginRight: 8,
  },
  infoValue: {
    fontSize: 16,
    color: "#333",
  },
  infoIcon: {
    marginRight: 4,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: "#333",
    textAlign: "right",
  },
  mapContainer: {
    marginTop: 10,
    backgroundColor: "#fff",
  },
  map: {
    width: "100%",
    height: 200,
  },
  mapButton: {
    alignItems: "center",
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  mapButtonText: {
    color: "#9610FF",
    fontWeight: "500",
  },
});
