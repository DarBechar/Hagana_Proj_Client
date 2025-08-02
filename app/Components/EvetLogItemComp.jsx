import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

export default function EventLogItem({ event, onPress }) {
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
    const statusCode = event.eventStatusCode || event.EventStatusCode;
    if (!statusCode) return "#888"; // Default gray

    switch (statusCode) {
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
      case 6: // closed
        return "#888888"; // Gray
      default:
        return "#888"; // Default gray
    }
  };

  // Function to get event type color
  const getEventTypeColor = () => {
    const typeCode = event.EventTypeCode || event.eventTypeCode;
    if (!typeCode) return "#9E9E9E";

    // Colors array matching what we use in the main screen
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
    return typeColors[(typeCode - 1) % typeColors.length] || "#9E9E9E";
  };

  // Function to get status text based on status code
  const getStatusText = () => {
    const statusCode = event.eventStatusCode || event.EventStatusCode;
    if (!statusCode) return "לא ידוע";

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

  // Get event type name
  const getEventTypeName = () => {
    return event.EventTypeName || event.eventTypeName || "סוג לא ידוע";
  };

  // Get event details with fallback for different field names
  const getEventCode = () => {
    return event.eventCode || event.EventCode || "לא ידוע";
  };

  const getEventName = () => {
    return event.eventName || event.EventName || "אירוע ללא שם";
  };

  const getLocationName = () => {
    return event.locationName || event.LocationName || "מיקום לא ידוע";
  };

  const getDescription = () => {
    return event.description || event.Description || "";
  };

  const getOpeningDate = () => {
    return event.openingDate || event.OpeningDate;
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress && onPress(event)}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <View style={styles.badgesContainer}>
            <View
              style={[
                styles.typeIndicator,
                { backgroundColor: getEventTypeColor() },
              ]}
            >
              <Text style={styles.typeText}>{getEventTypeName()}</Text>
            </View>
          </View>

          <Text style={styles.eventCode}>#{getEventCode()}</Text>
        </View>

        <Text style={styles.title}>{getEventName()}</Text>

        <View style={styles.detailsRow}>
          <Text style={styles.location}>{getLocationName()}</Text>
          <MaterialIcons
            name="location-on"
            size={16}
            color="#888"
            style={styles.icon}
          />
        </View>

        <View style={styles.detailsRow}>
          <Text style={styles.date}>{formatDateTime(getOpeningDate())}</Text>
          <MaterialIcons
            name="access-time"
            size={16}
            color="#888"
            style={styles.icon}
          />
        </View>

        {getDescription() && (
          <Text style={styles.description} numberOfLines={2}>
            {getDescription()}
          </Text>
        )}
      </View>

      <View style={styles.arrowContainer}>
        <MaterialIcons name="chevron-left" size={24} color="#888" />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    margin: 8,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  content: {
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  badgesContainer: {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 4,
  },
  eventCode: {
    fontSize: 14,
    color: "#888",
    fontWeight: "500",
    marginTop: 2,
  },
  statusIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  statusText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "bold",
  },
  typeIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  typeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "bold",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "right",
  },
  detailsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    color: "#555",
    marginLeft: 4,
  },
  date: {
    fontSize: 14,
    color: "#555",
    marginLeft: 4,
  },
  icon: {
    marginLeft: 4,
  },
  description: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
    textAlign: "right",
  },
  arrowContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
});
