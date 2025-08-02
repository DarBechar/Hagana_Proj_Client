import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  Linking,
  Dimensions,
} from "react-native";
import {
  Ionicons,
  MaterialIcons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { mockReports } from "../Constants/MockReportsData";

const { width } = Dimensions.get("window");

const ReportDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { reportId } = route.params;

  const [report, setReport] = useState(null);
  const [isClosingReport, setIsClosingReport] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    // Find the specific report
    const foundReport = mockReports.find((r) => r.id === reportId);
    setReport(foundReport);
  }, [reportId]);

  // Mock coordinates for demo - in real app this would come from the report data
  const getReportLocation = () => {
    // Default location - can be customized based on report
    const defaultLocation = {
      latitude: 32.0853,
      longitude: 34.7818,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };

    // You can add logic here to return different coordinates based on the report
    // For now, we'll use slightly different coordinates for each report for demo
    const locationOffsets = {
      1: { lat: 32.0853, lng: 34.7818 }, // Tel Aviv
      2: { lat: 32.084, lng: 34.782 },
      3: { lat: 32.086, lng: 34.7815 },
      4: { lat: 32.0845, lng: 34.7825 },
      5: { lat: 32.0855, lng: 34.781 },
    };

    const offset = locationOffsets[reportId] || locationOffsets[1];

    return {
      latitude: offset.lat,
      longitude: offset.lng,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "#ff4444";
      case "medium":
        return "#ff9800";
      case "low":
        return "#4caf50";
      default:
        return "#666";
    }
  };

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case "high":
        return "דחוף";
      case "medium":
        return "בינוני";
      case "low":
        return "נמוך";
      default:
        return "לא ידוע";
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case "high":
        return "warning";
      case "medium":
        return "alert-circle";
      case "low":
        return "info";
      default:
        return "circle";
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("he-IL", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 60) {
      return `לפני ${diffInMinutes} דקות`;
    } else if (diffInHours < 24) {
      return `לפני ${diffInHours} שעות`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `לפני ${diffInDays} ימים`;
    }
  };

  const handleCall = (phoneNumber) => {
    Alert.alert("התקשרות", `האם ברצונך להתקשר ל-${phoneNumber}?`, [
      { text: "ביטול", style: "cancel" },
      {
        text: "התקשר",
        onPress: () => {
          Linking.openURL(`tel:${phoneNumber}`);
        },
      },
    ]);
  };

  const openLocation = () => {
    // In a real app, this would open maps with the coordinates
    Alert.alert("פתיחת מפה מלאה", "האם ברצונך לפתוח את המיקום במפה מלאה?", [
      { text: "ביטול", style: "cancel" },
      {
        text: "פתח במפות",
        onPress: () => {
          // This would typically open Google Maps or Apple Maps
          console.log("Opening location in full map");
        },
      },
    ]);
  };

  const handleCreateEvent = () => {
    Alert.alert(
      "יצירת אירוע חירום",
      `האם ברצונך ליצור אירוע חירום על בסיס דיווח #${report.reportCode}?\n\nפעולה זו תיצור אירוע פעיל חדש ותתחיל הפעלת פרוטוקולי חירום.`,
      [
        { text: "ביטול", style: "cancel" },
        {
          text: "צור אירוע",
          style: "default",
          onPress: () => {
            // Simulate event creation
            Alert.alert(
              "אירוע נוצר בהצלחה",
              `אירוע חירום #${
                1000 + report.id
              } נוצר על בסיס הדיווח.\n\nהאירוע הועבר לטיפול הרשויות והופעל פרוטוקול החירום המתאים.`,
              [
                {
                  text: "צפה באירוע",
                  onPress: () => {
                    // Navigate to event details or events list
                    navigation.navigate("בית");
                  },
                },
                {
                  text: "המשך",
                  style: "cancel",
                },
              ]
            );
          },
        },
      ]
    );
  };

  const handleCloseReport = () => {
    Alert.alert(
      "סגירת דיווח",
      "האם אתה בטוח שברצונך לסגור את הדיווח?\n\nפעולה זו תסמן את הדיווח כמטופל ולא ניתן יהיה לבטל אותה.",
      [
        { text: "ביטול", style: "cancel" },
        {
          text: "סגור דיווח",
          style: "destructive",
          onPress: () => {
            setIsClosingReport(true);

            // Simulate API call to close report
            setTimeout(() => {
              Alert.alert("דיווח נסגר", "הדיווח נסגר בהצלחה ועבר למצב מטופל.", [
                {
                  text: "אישור",
                  onPress: () => {
                    // Navigate back and refresh the reports list
                    navigation.goBack();
                  },
                },
              ]);
              setIsClosingReport(false);
            }, 1500);
          },
        },
      ]
    );
  };

  if (!report) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={28} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>פרטי דיווח</Text>
        </View>
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons
            name="alert-circle"
            size={80}
            color="#ff4444"
          />
          <Text style={styles.errorText}>דיווח לא נמצא</Text>
          <TouchableOpacity
            style={styles.backToListButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backToListText}>חזרה לרשימת הדיווחים</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>דיווח #{report.reportCode}</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status and Priority Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View style={styles.statusInfo}>
              <View
                style={[
                  styles.priorityBadge,
                  { backgroundColor: getPriorityColor(report.priority) },
                ]}
              >
                <Ionicons
                  name={getPriorityIcon(report.priority)}
                  size={16}
                  color="white"
                />
                <Text style={styles.priorityText}>
                  {getPriorityLabel(report.priority)}
                </Text>
              </View>
              <View style={styles.statusBadge}>
                <Ionicons name="checkmark-circle" size={16} color="#4caf50" />
                <Text style={styles.statusText}>פעיל</Text>
              </View>
            </View>
            <Text style={styles.timeAgo}>{formatTime(report.reportDate)}</Text>
          </View>
        </View>

        {/* Event Type Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>סוג האירוע</Text>
            <MaterialCommunityIcons name="alert" size={24} color="#ff6b35" />
          </View>
          <Text style={styles.eventType}>{report.eventTypeName}</Text>
        </View>

        {/* Description Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>תיאור האירוע</Text>
            <MaterialCommunityIcons name="text-box" size={24} color="#3d8bcd" />
          </View>
          <Text style={styles.description}>{report.reportDescription}</Text>
        </View>

        {/* Location Card with Map */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>מיקום האירוע</Text>
            <MaterialIcons name="location-on" size={24} color="#4caf50" />
          </View>
          <Text style={styles.locationText}>{report.locationDescription}</Text>

          {/* Map section */}
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: getReportLocation().latitude,
                longitude: getReportLocation().longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              scrollEnabled={false}
              zoomEnabled={false}
              rotateEnabled={false}
            >
              <Marker
                coordinate={{
                  latitude: getReportLocation().latitude,
                  longitude: getReportLocation().longitude,
                }}
                title={report.locationDescription || "מיקום האירוע"}
              />
            </MapView>
            <TouchableOpacity style={styles.mapButton} onPress={openLocation}>
              <Text style={styles.mapButtonText}>צפה במפה מלאה</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Reporter Info Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>פרטי המדווח</Text>
            <MaterialIcons name="person" size={24} color="#9c27b0" />
          </View>
          <View style={styles.reporterInfo}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>שם:</Text>
              <Text style={styles.infoValue}>{report.reporterName}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>טלפון:</Text>
              <TouchableOpacity
                onPress={() => handleCall(report.reporterPhoneNumber)}
              >
                <Text style={[styles.infoValue, styles.phoneLink]}>
                  {report.reporterPhoneNumber}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Authority Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>רשות מטפלת</Text>
            <MaterialIcons name="business" size={24} color="#ff9800" />
          </View>
          <Text style={styles.authorityText}>{report.authorityName}</Text>
        </View>

        {/* Date and Time Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>תאריך ושעה</Text>
            <MaterialIcons name="schedule" size={24} color="#607d8b" />
          </View>
          <Text style={styles.dateText}>{formatDate(report.reportDate)}</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.btnSection}>
          <TouchableOpacity
            style={[
              styles.secondaryBtn,
              isClosingReport && styles.closeButtonDisabled,
            ]}
            onPress={handleCloseReport}
            disabled={isClosingReport}
          >
            {isClosingReport ? (
              <Text style={styles.secondaryBtnText}>סוגר דיווח...</Text>
            ) : (
              <Text style={styles.secondaryBtnText}>סגור דיווח</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={handleCreateEvent}
          >
            <Text style={styles.primaryBtnText}>צור אירוע חירום</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.warningText}>
          💡 ניתן ליצור אירוע חירום מהדיווח או לסגור אותו כמטופל
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    marginLeft: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
    marginRight: 34,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statusCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  priorityBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 15,
    marginLeft: 8,
  },
  priorityText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 4,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 15,
    backgroundColor: "#e8f5e8",
  },
  statusText: {
    color: "#4caf50",
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 4,
  },
  timeAgo: {
    fontSize: 14,
    color: "#666",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginRight: 8,
    textAlign: "right",
  },
  eventType: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ff6b35",
    textAlign: "right",
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: "#333",
    textAlign: "right",
  },
  locationText: {
    fontSize: 16,
    color: "#333",
    textAlign: "right",
    marginBottom: 16,
  },
  // Map styles
  mapContainer: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
    marginBottom: 12,
  },
  map: {
    width: "100%",
    height: "100%",
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
  reporterInfo: {
    gap: 8,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  infoLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  phoneLink: {
    color: "#3d8bcd",
    textDecorationLine: "underline",
  },
  authorityText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ff9800",
    textAlign: "right",
  },
  dateText: {
    fontSize: 16,
    color: "#333",
    textAlign: "right",
  },
  // Button styles to match EventDetailsScreen
  btnSection: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 15,
    marginBottom: 15,
  },
  primaryBtn: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 30,
    marginLeft: 8,
    marginBottom: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#9610FF",
    minWidth: 150,
  },
  primaryBtnText: {
    color: "white",
    fontSize: 16,
    fontWeight: "regular",
  },
  secondaryBtn: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 30,
    marginRight: 8,
    marginBottom: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#9610FF",
    minWidth: 150,
  },
  secondaryBtnText: {
    color: "#9610FF",
    fontSize: 16,
    fontWeight: "regular",
  },
  closeButtonDisabled: {
    backgroundColor: "#f0f0f0",
    borderColor: "#ccc",
  },
  warningText: {
    fontSize: 12,
    color: "#ff6b35",
    textAlign: "center",
    marginTop: 12,
    marginBottom: 32,
    paddingHorizontal: 16,
    lineHeight: 16,
  },
  closeButtonDisabled: {
    backgroundColor: "#ccc",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  closeButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 8,
  },
  warningText: {
    fontSize: 12,
    color: "#ff6b35",
    textAlign: "center",
    marginTop: 12,
    paddingHorizontal: 16,
    lineHeight: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  errorText: {
    fontSize: 18,
    color: "#666",
    marginTop: 16,
    marginBottom: 24,
  },
  backToListButton: {
    backgroundColor: "#3d8bcd",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  backToListText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ReportDetailsScreen;
