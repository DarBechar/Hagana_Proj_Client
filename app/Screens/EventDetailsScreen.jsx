import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Linking,
  Alert,
  ActivityIndicator,
} from "react-native";
import {
  Ionicons,
  MaterialIcons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import MapView, { Marker } from "react-native-maps";
import { API_URL } from "../Constants/Utils";

const { width } = Dimensions.get("window");

export default function EventDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { event, eventId } = route.params || {};
  const [eventData, setEventData] = useState(event);
  const [loading, setLoading] = useState(!event);
  const [isClosingEvent, setIsClosingEvent] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // If we have an event passed directly, use it
    if (event) {
      setEventData(event);
      setLoading(false);
    }
    // If we only have an eventId, fetch the event details
    else if (eventId) {
      fetchEventDetails();
    } else {
      setError("לא נמצא מזהה אירוע");
      setLoading(false);
    }
  }, [event, eventId]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}Event/${eventId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (response.ok) {
        const eventDetails = await response.json();
        setEventData(eventDetails);
      } else {
        throw new Error(`שגיאת שרת: ${response.status}`);
      }
    } catch (error) {
      console.error("Error fetching event details:", error);
      setError("לא ניתן לטעון את פרטי האירוע");
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString) => {
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

  const getTypeColor = () => {
    const typeCode = eventData?.eventTypeCode || 0;
    const typeColors = [
      "#F44336",
      "#FF9800",
      "#4CAF50",
      "#2196F3",
      "#9C27B0",
      "#607D8B",
      "#795548",
      "#E91E63",
    ];
    return typeColors[typeCode % typeColors.length] || "#9E9E9E";
  };

  const getStatusColor = () => {
    const statusCode = eventData?.eventStatusCode;
    switch (statusCode) {
      case 1:
        return "#4CAF50"; // פתוח
      case 2:
        return "#FF9800"; // בטיפול
      case 3:
        return "#9E9E9E"; // סגור
      case 4:
        return "#F44336"; // קריטי
      case 5:
        return "#FF1744"; // חירום
      case 6:
        return "#9E9E9E"; // סגור
      default:
        return "#9E9E9E";
    }
  };

  const getStatusText = () => {
    const statusCode = eventData?.eventStatusCode;
    switch (statusCode) {
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
      case 6:
        return "סגור";
      default:
        return "לא ידוע";
    }
  };

  const openLocation = () => {
    if (eventData?.locationLatitude && eventData?.locationLongitude) {
      const url = `https://www.google.com/maps?q=${eventData.locationLatitude},${eventData.locationLongitude}`;
      Linking.openURL(url);
    } else {
      Alert.alert("שגיאה", "מיקום האירוע לא זמין");
    }
  };

  const handleCloseEvent = () => {
    Alert.alert("סגירת אירוע", "האם אתה בטוח שברצונך לסגור את האירוע?", [
      { text: "ביטול", style: "cancel" },
      {
        text: "סגור אירוע",
        style: "destructive",
        onPress: closeEvent,
      },
    ]);
  };

  const closeEvent = async () => {
    try {
      console.log(`Closing event: ${eventData.eventCode}`);

      // יצירת אובייקט מעודכן עם כל הנתונים הקיימים
      const updatedEventData = {
        eventCode: eventData.eventCode,
        eventName: eventData.eventName,
        openingDate: eventData.openingDate,
        description: eventData.description,
        creatorUserID: eventData.creatorUserID,
        eventStatusCode: 3, // סטטוס "סגור"
        isActive: false, // השדה החשוב לסגירה
        activatedAt: eventData.activatedAt,
        deactivatedAt: new Date().toISOString(), // זמן הסגירה
        locationLatitude: eventData.locationLatitude,
        locationLongitude: eventData.locationLongitude,
        locationName: eventData.locationName,
        affectedAreaRadius: eventData.affectedAreaRadius,
        eventTypeCode: eventData.eventTypeCode,
      };

      console.log(
        "Updating event with data:",
        JSON.stringify(updatedEventData, null, 2)
      );

      const response = await fetch(`${API_URL}Event/${eventData.eventCode}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(updatedEventData),
      });

      console.log(`Close event response status: ${response.status}`);

      if (response.ok) {
        const updatedEvent = await response.json();
        console.log("Event closed successfully:", updatedEvent);

        // עדכון הנתונים המקומיים
        setEventData((prev) => ({
          ...prev,
          isActive: false,
          eventStatusCode: 3,
          deactivatedAt: updatedEventData.deactivatedAt,
        }));

        Alert.alert(
          "אירוע נסגר בהצלחה",
          `אירוע #${eventData.eventCode} נסגר בהצלחה.`,
          [
            {
              text: "חזור לבית",
              onPress: () => navigation.navigate("בית"),
            },
            {
              text: "המשך",
              style: "cancel",
            },
          ]
        );
      } else {
        // טיפול בשגיאות שרת
        let errorMessage = "שגיאה לא צפויה";

        try {
          const errorData = await response.text();
          console.error("Server error response:", errorData);

          try {
            const errorJson = JSON.parse(errorData);

            if (errorJson.errors) {
              const validationErrors = [];
              for (const [field, messages] of Object.entries(
                errorJson.errors
              )) {
                validationErrors.push(`${field}: ${messages.join(", ")}`);
              }
              errorMessage = `שגיאות validation:\n${validationErrors.join(
                "\n"
              )}`;
            } else {
              errorMessage =
                errorJson.message ||
                errorJson.title ||
                `שגיאת שרת: ${response.status}`;
            }
          } catch {
            errorMessage = `שגיאת שרת: ${response.status}`;
          }
        } catch (parseError) {
          console.error("Error parsing server response:", parseError);
          errorMessage = `שגיאת שרת: ${response.status}`;
        }

        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error("Error closing event:", error);
      Alert.alert(
        "שגיאה בסגירת אירוע",
        error.message || "לא ניתן לסגור את האירוע כרגע. נסה שוב מאוחר יותר.",
        [
          { text: "נסה שוב", onPress: closeEvent },
          { text: "ביטול", style: "cancel" },
        ]
      );
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={28} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>טוען אירוע...</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.centerContainer}>
          <Text>טוען פרטי אירוע...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !eventData) {
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
        <View style={styles.centerContainer}>
          <MaterialCommunityIcons
            name="alert-circle"
            size={80}
            color="#ff4444"
          />
          <Text style={styles.errorText}>{error || "לא נמצאו פרטי אירוע"}</Text>
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

  const hasValidCoordinates =
    eventData.locationLatitude &&
    eventData.locationLongitude &&
    !isNaN(eventData.locationLatitude) &&
    !isNaN(eventData.locationLongitude);

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
        {/* Event Header */}
        <View style={styles.eventHeader}>
          <View style={styles.eventTitleContainer}>
            <Text style={styles.eventCode}>#{eventData.eventCode}</Text>
            <Text style={styles.eventName}>
              {eventData.eventName || "אירוע ללא שם"}
            </Text>
          </View>

          <View style={styles.badgesContainer}>
            <View style={[styles.badge, { backgroundColor: getTypeColor() }]}>
              <Text style={styles.badgeText}>
                {eventData.eventTypeName ||
                  eventData.EventTypeName ||
                  "ללא סוג"}
              </Text>
            </View>
            <View style={[styles.badge, { backgroundColor: getStatusColor() }]}>
              <Text style={styles.badgeText}>{getStatusText()}</Text>
            </View>
          </View>
        </View>

        {/* Time and Location Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>פרטי זמן ומיקום</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoValue}>
              {formatDateTime(eventData.openingDate)}
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

          {eventData.activatedAt && (
            <View style={styles.infoRow}>
              <Text style={styles.infoValue}>
                {formatDateTime(eventData.activatedAt)}
              </Text>
              <View style={styles.infoLabelContainer}>
                <Text style={styles.infoLabel}>זמן הפעלה</Text>
                <MaterialIcons
                  name="play-circle-filled"
                  size={20}
                  color="#666"
                  style={styles.infoIcon}
                />
              </View>
            </View>
          )}

          {eventData.deactivatedAt && (
            <View style={styles.infoRow}>
              <Text style={styles.infoValue}>
                {formatDateTime(eventData.deactivatedAt)}
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
              {eventData.locationName || "לא צוין"}
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

        {/* Map Section */}
        {hasValidCoordinates && (
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: eventData.locationLatitude,
                longitude: eventData.locationLongitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              scrollEnabled={false}
              zoomEnabled={false}
              rotateEnabled={false}
            >
              <Marker
                coordinate={{
                  latitude: eventData.locationLatitude,
                  longitude: eventData.locationLongitude,
                }}
                title={eventData.locationName || "מיקום האירוע"}
              />
            </MapView>
            <TouchableOpacity style={styles.mapButton} onPress={openLocation}>
              <Text style={styles.mapButtonText}>צפה במפה מלאה</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Description Section */}
        {eventData.description && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>תיאור האירוע</Text>
            </View>
            <Text style={styles.description}>{eventData.description}</Text>
          </View>
        )}

        {/* Creator Info */}
        {eventData.creatorUserID && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>פרטי יוצר האירוע</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoValue}>{eventData.creatorUserID}</Text>
              <View style={styles.infoLabelContainer}>
                <Text style={styles.infoLabel}>מזהה משתמש</Text>
                <MaterialIcons
                  name="person"
                  size={20}
                  color="#666"
                  style={styles.infoIcon}
                />
              </View>
            </View>
          </View>
        )}

        {/* Affected Area */}
        {eventData.affectedAreaRadius && eventData.affectedAreaRadius > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>אזור השפעה</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoValue}>
                {eventData.affectedAreaRadius} מטר
              </Text>
              <View style={styles.infoLabelContainer}>
                <Text style={styles.infoLabel}>רדיוס השפעה</Text>
                <MaterialIcons
                  name="my-location"
                  size={20}
                  color="#666"
                  style={styles.infoIcon}
                />
              </View>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        {eventData.isActive && (
          <View style={styles.actionSection}>
            <TouchableOpacity
              style={[
                styles.closeButton,
                isClosingEvent && styles.closeButtonDisabled,
              ]}
              onPress={handleCloseEvent}
              disabled={isClosingEvent}
            >
              {isClosingEvent ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="white" />
                  <Text style={[styles.closeButtonText, { marginLeft: 8 }]}>
                    סוגר אירוע...
                  </Text>
                </View>
              ) : (
                <>
                  <MaterialIcons name="close" size={20} color="white" />
                  <Text style={styles.closeButtonText}>סגור אירוע</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Event Status Info */}
        {!eventData.isActive && (
          <View style={styles.closedEventSection}>
            <MaterialIcons name="check-circle" size={24} color="#4caf50" />
            <Text style={styles.closedEventText}>אירוע זה נסגר ומטופל</Text>
            {eventData.deactivatedAt && (
              <Text style={styles.closedEventDate}>
                נסגר ב: {formatDateTime(eventData.deactivatedAt)}
              </Text>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e1e5e9",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
    textAlign: "center",
  },
  headerRight: {
    width: 34,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  errorText: {
    fontSize: 16,
    color: "#666",
    marginTop: 16,
    marginBottom: 24,
    textAlign: "center",
  },
  backToHomeButton: {
    backgroundColor: "#3d8bcd",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  backToHomeText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  scrollView: {
    flex: 1,
  },
  eventHeader: {
    backgroundColor: "white",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e1e5e9",
  },
  eventTitleContainer: {
    marginBottom: 15,
  },
  eventCode: {
    fontSize: 14,
    color: "#7f8c8d",
    marginBottom: 5,
    textAlign: "right",
  },
  eventName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2c3e50",
    textAlign: "right",
    lineHeight: 28,
  },
  badgesContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  badgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
  },
  section: {
    backgroundColor: "white",
    marginTop: 10,
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  sectionHeader: {
    borderBottomWidth: 1,
    borderBottomColor: "#e1e5e9",
    paddingBottom: 10,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2c3e50",
    textAlign: "right",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  infoLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoLabel: {
    fontSize: 14,
    color: "#7f8c8d",
    marginRight: 8,
    textAlign: "right",
  },
  infoIcon: {
    marginLeft: 5,
  },
  infoValue: {
    fontSize: 16,
    color: "#2c3e50",
    textAlign: "left",
    fontWeight: "500",
  },
  mapContainer: {
    backgroundColor: "white",
    marginTop: 10,
    overflow: "hidden",
  },
  map: {
    width: "100%",
    height: 200,
  },
  mapButton: {
    position: "absolute",
    bottom: 10,
    left: 10,
    right: 10,
    backgroundColor: "rgba(61, 139, 205, 0.9)",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  mapButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: "#34495e",
    textAlign: "right",
  },
  actionSection: {
    backgroundColor: "white",
    marginTop: 10,
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: "#e74c3c",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
  },
  closeButtonDisabled: {
    backgroundColor: "#bdc3c7",
    opacity: 0.6,
  },
  closeButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 8,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  closedEventSection: {
    backgroundColor: "#e8f5e8",
    marginTop: 10,
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginBottom: 20,
    alignItems: "center",
    borderRadius: 12,
    marginHorizontal: 10,
  },
  closedEventText: {
    color: "#4caf50",
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 8,
    textAlign: "center",
  },
  closedEventDate: {
    color: "#2e7d2e",
    fontSize: 14,
    marginTop: 4,
    textAlign: "center",
  },
});
