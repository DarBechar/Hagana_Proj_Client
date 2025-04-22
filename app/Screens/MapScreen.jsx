import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Dimensions,
  Image,
  Platform,
  StatusBar,
  Animated,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import MapView, { Marker, Callout } from "react-native-maps";
import * as Location from "expo-location";
import { MaterialIcons, FontAwesome5, Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";

const { width, height } = Dimensions.get("window");
const CARD_HEIGHT = 300; // Increased height to show more content
const CARD_WIDTH = width * 0.8;

const MapScreen = () => {
  // Refs
  const mapRef = useRef(null);
  const markerRefs = useRef({});

  // States
  const [region, setRegion] = useState({
    latitude: 32.3015,
    longitude: 34.851,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [currentLocation, setCurrentLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [markers, setMarkers] = useState([]);

  // Animation values
  const modalTranslateY = useRef(new Animated.Value(CARD_HEIGHT)).current;

  // Get user's location and load markers when component mounts
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission to access location was denied");
        setIsLoading(false);
        return;
      }

      try {
        // Get current location
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        const { latitude, longitude } = location.coords;

        setCurrentLocation({
          latitude,
          longitude,
        });

        setRegion({
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });

        // Load mock data
        loadMockMarkers(latitude, longitude);
      } catch (error) {
        console.error("Error getting location:", error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // Load mock markers around the user's location
  const loadMockMarkers = (centerLat, centerLng) => {
    // Example marker data (would come from your API)
    const mockMarkers = [
      // {
      //   id: "event1",
      //   type: "event",
      //   coordinate: {
      //     latitude: centerLat + 0.002,
      //     longitude: centerLng + 0.003,
      //   },
      //   title: "אירוע שריפה",
      //   label: "שריפה",
      //   description: "שריפה פעילה באזור בית העם",
      //   priority: "high",
      //   timestamp: new Date().toISOString(),
      //   status: "active",
      //   image: require("../../assets/images/Hagana_Logo.png"), // Replace with actual image
      // },
      {
        id: "person1",
        type: "person",
        coordinate: {
          latitude: centerLat - 0.001,
          longitude: centerLng + 0.002,
        },
        title: "יוסי כהן",
        label: "יוסי כהן",
        description: "ראש צוות כיבוי",
        role: "ראש צוות",
        specialty: "כיבוי אש",
        phoneNumber: "050-1234567",
        status: "responding",
        lastUpdate: new Date().toISOString(),
      },
      {
        id: "person2",
        type: "person",
        coordinate: {
          latitude: centerLat + 0.001,
          longitude: centerLng - 0.001,
        },
        title: "רונן אביב",
        label: "רונן אביב",
        description: "חבר צוות חילוץ",
        role: "חובש",
        specialty: "חילוץ",
        phoneNumber: "050-7654321",
        status: "standby",
        lastUpdate: new Date().toISOString(),
      },
      {
        id: "eq1",
        type: "equipment",
        coordinate: {
          latitude: centerLat - 0.002,
          longitude: centerLng - 0.002,
        },
        title: "ציוד חירום",
        label: "אלונקות",
        description: "מחסן ציוד חירום יישובי",
        inventory: ["אלונקות", "ערכות עזרה ראשונה", "גנרטור"],
        lastChecked: new Date().toISOString(),
        status: "available",
      },
      {
        id: "person3",
        type: "person",
        coordinate: {
          latitude: centerLat - 0.001,
          longitude: centerLng - 0.0015,
        },
        title: "שירה גולן",
        label: "שירה גולן",
        description: "חובשת מוסמכת",
        role: "חובשת",
        specialty: "רפואת חירום",
        phoneNumber: "050-9876543",
        status: "active",
        lastUpdate: new Date().toISOString(),
      },
      {
        id: "eq2",
        type: "equipment",
        coordinate: {
          latitude: centerLat - 0.0015,
          longitude: centerLng + 0.001,
        },
        title: "ציוד כיבוי",
        label: "מטף כיבוי",
        description: "ציוד כיבוי אש",
        inventory: ["מטף כיבוי", "צינור כיבוי", "גלגלון"],
        lastChecked: new Date().toISOString(),
        status: "available",
      },
    ];

    setMarkers(mockMarkers);
  };

  // Handle marker press to show details
  const onMarkerPress = (markerData) => {
    setSelectedMarker(markerData);
    showDetailModal();

    // Provide haptic feedback when marker is pressed
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  // Show detail modal animation
  const showDetailModal = () => {
    setDetailModalVisible(true);
    Animated.spring(modalTranslateY, {
      toValue: 0,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  };

  // Hide detail modal animation
  const hideDetailModal = () => {
    Animated.timing(modalTranslateY, {
      toValue: CARD_HEIGHT,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setDetailModalVisible(false);
      setSelectedMarker(null);
    });
  };

  // Search for location by address
  const searchLocation = async () => {
    if (searchQuery.trim() === "") return;

    setSearchLoading(true);
    try {
      let results = await Location.geocodeAsync(searchQuery);

      if (results.length > 0) {
        const { latitude, longitude } = results[0];

        // Animate to the new region
        mapRef.current?.animateToRegion(
          {
            latitude,
            longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          },
          1000
        );
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setSearchLoading(false);
    }
  };

  // Get marker icon based on marker type
  const getMarkerIcon = (type) => {
    switch (type) {
      case "event":
        return (
          <MaterialIcons name="local-fire-department" size={24} color="red" />
        );
      case "person":
        return <FontAwesome5 name="user" size={20} color="#0066ff" />;
      case "equipment":
        return (
          <MaterialIcons name="medical-services" size={22} color="green" />
        );
      default:
        return <Ionicons name="location" size={24} color="#777" />;
    }
  };

  // Return to user's current location
  const goToCurrentLocation = () => {
    if (currentLocation) {
      mapRef.current?.animateToRegion(
        {
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        1000
      );
    }
  };

  // Format a timestamp to a readable format
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return (
      date.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" }) +
      " " +
      date.toLocaleDateString("he-IL", { day: "2-digit", month: "2-digit" })
    );
  };

  // Render marker detail modal content based on marker type
  const renderMarkerDetailContent = () => {
    if (!selectedMarker) return null;

    const { type, title, description } = selectedMarker;

    // Common header section for all marker types
    const renderHeader = () => (
      <View style={styles.detailHeader}>
        <View style={styles.markerIconContainer}>{getMarkerIcon(type)}</View>
        <View style={styles.detailTitleContainer}>
          <Text style={styles.detailTitle}>{title}</Text>
          <Text style={styles.detailDescription}>{description}</Text>
        </View>
      </View>
    );

    switch (type) {
      case "event":
        return (
          <>
            {renderHeader()}
            <View style={styles.detailContent}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>סטטוס:</Text>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        selectedMarker.status === "active"
                          ? "#ffebee"
                          : "#e0f2f1",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      {
                        color:
                          selectedMarker.status === "active"
                            ? "#c62828"
                            : "#00796b",
                      },
                    ]}
                  >
                    {selectedMarker.status === "active" ? "פעיל" : "הסתיים"}
                  </Text>
                </View>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>עדיפות:</Text>
                <Text
                  style={[
                    styles.priorityText,
                    {
                      color:
                        selectedMarker.priority === "high"
                          ? "#c62828"
                          : selectedMarker.priority === "medium"
                          ? "#ef6c00"
                          : "#2e7d32",
                    },
                  ]}
                >
                  {selectedMarker.priority === "high"
                    ? "גבוהה"
                    : selectedMarker.priority === "medium"
                    ? "בינונית"
                    : "נמוכה"}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>עדכון אחרון:</Text>
                <Text style={styles.detailValue}>
                  {formatTime(selectedMarker.timestamp)}
                </Text>
              </View>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionButtonText}>פתח דיווח</Text>
              </TouchableOpacity>
            </View>
          </>
        );

      case "person":
        return (
          <>
            {renderHeader()}
            <View style={styles.detailContent}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>סטטוס:</Text>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        selectedMarker.status === "responding"
                          ? "#e3f2fd"
                          : selectedMarker.status === "standby"
                          ? "#f9fbe7"
                          : selectedMarker.status === "active"
                          ? "#e8f5e9"
                          : "#e0f2f1",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      {
                        color:
                          selectedMarker.status === "responding"
                            ? "#0d47a1"
                            : selectedMarker.status === "standby"
                            ? "#827717"
                            : selectedMarker.status === "active"
                            ? "#2e7d32"
                            : "#00796b",
                      },
                    ]}
                  >
                    {selectedMarker.status === "responding"
                      ? "בדרך לאירוע"
                      : selectedMarker.status === "standby"
                      ? "בכוננות"
                      : selectedMarker.status === "active"
                      ? "פעיל באירוע"
                      : "זמין"}
                  </Text>
                </View>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>תפקיד:</Text>
                <Text style={styles.detailValue}>{selectedMarker.role}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>התמחות:</Text>
                <Text style={styles.detailValue}>
                  {selectedMarker.specialty}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>טלפון:</Text>
                <Text style={styles.detailValue}>
                  {selectedMarker.phoneNumber}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>עדכון אחרון:</Text>
                <Text style={styles.detailValue}>
                  {formatTime(selectedMarker.lastUpdate)}
                </Text>
              </View>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionButtonText}>התקשר</Text>
              </TouchableOpacity>
            </View>
          </>
        );

      case "equipment":
        return (
          <>
            {renderHeader()}
            <View style={styles.detailContent}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>סטטוס:</Text>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        selectedMarker.status === "available"
                          ? "#e8f5e9"
                          : "#ffebee",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      {
                        color:
                          selectedMarker.status === "available"
                            ? "#2e7d32"
                            : "#c62828",
                      },
                    ]}
                  >
                    {selectedMarker.status === "available" ? "זמין" : "לא זמין"}
                  </Text>
                </View>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>פריטים:</Text>
                <View style={styles.inventoryList}>
                  {selectedMarker.inventory.map((item, index) => (
                    <Text key={index} style={styles.inventoryItemText}>
                      • {item}
                    </Text>
                  ))}
                </View>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>בדיקה אחרונה:</Text>
                <Text style={styles.detailValue}>
                  {formatTime(selectedMarker.lastChecked)}
                </Text>
              </View>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionButtonText}>דווח על חוסר ציוד</Text>
              </TouchableOpacity>
            </View>
          </>
        );

      default:
        return <Text style={styles.detailText}>אין מידע זמין</Text>;
    }
  };

  // Loading screen
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#9610FF" />
        <Text style={styles.loadingText}>טוען מפה...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <BlurView intensity={80} tint="light" style={styles.blurView}>
          <TextInput
            placeholder="חפש מיקום..."
            style={styles.searchInput}
            placeholderTextColor="rgba(27, 26, 26, 0.84)"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={searchLocation}
            returnKeyType="search"
          />
          {searchLoading ? (
            <ActivityIndicator
              size="small"
              color="#9610FF"
              style={styles.searchIcon}
            />
          ) : (
            <TouchableOpacity
              onPress={searchLocation}
              style={styles.searchIcon}
            >
              <Ionicons
                name="search"
                size={22}
                color="rgba(27, 26, 26, 0.84)"
              />
            </TouchableOpacity>
          )}
        </BlurView>
      </View>

      {/* Map View */}
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={region}
        showsUserLocation={true}
        showsMyLocationButton={false}
        onRegionChangeComplete={setRegion}
        showsCompass={true}
        compassOffset={{ x: 0, y: 50 }}
      >
        {/* Current User Location Marker */}
        {currentLocation && (
          <Marker coordinate={currentLocation} title="המיקום שלי">
            <View style={styles.currentLocationMarker}>
              <View style={styles.currentLocationDot} />
            </View>
          </Marker>
        )}

        {/* Render all other markers */}
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            ref={(ref) => {
              if (ref) {
                markerRefs.current[marker.id] = ref;
              }
            }}
            coordinate={marker.coordinate}
            title={marker.title}
            description={marker.description}
            onPress={() => onMarkerPress(marker)}
          >
            <View style={styles.markerWrapper}>
              <View
                style={[
                  styles.markerContainer,
                  marker.type === "event"
                    ? styles.eventMarker
                    : marker.type === "person"
                    ? styles.personMarker
                    : styles.equipmentMarker,
                ]}
              >
                {getMarkerIcon(marker.type)}
              </View>
              <View style={styles.markerLabelContainer}>
                <Text style={styles.markerLabel}>{marker.label}</Text>
              </View>
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Current Location Button */}
      <TouchableOpacity
        style={styles.currentLocationButton}
        onPress={goToCurrentLocation}
      >
        <MaterialIcons name="my-location" size={24} color="#333" />
      </TouchableOpacity>

      {/* Detail Modal */}
      {detailModalVisible && (
        <Animated.View
          style={[
            styles.detailModal,
            { transform: [{ translateY: modalTranslateY }] },
          ]}
        >
          <View style={styles.detailModalContent}>
            <View style={styles.detailModalHandle} />
            {renderMarkerDetailContent()}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={hideDetailModal}
            >
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  map: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
  searchBar: {
    position: "absolute",
    top: Platform.OS === "ios" ? 80 : 40,
    width: "90%",
    alignSelf: "center",
    zIndex: 99,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 5, // For Android shadow
  },
  blurView: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 40, // More oval shape
    paddingHorizontal: 15,
    paddingVertical: 10,
    overflow: "hidden",
    backgroundColor: "rgba(255, 255, 255, 0.82)",
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    textAlign: "right",
    color: "rgba(27, 26, 26, 0.84)",
    writingDirection: "rtl",
  },
  searchIcon: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  currentLocationButton: {
    position: "absolute",
    right: 16,
    bottom: 600,
    backgroundColor: "white",
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  markerWrapper: {
    alignItems: "center",
  },
  markerContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  markerLabelContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 3,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  markerLabel: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  eventMarker: {
    backgroundColor: "#ffcdd2",
    borderWidth: 2,
    borderColor: "#e53935",
  },
  personMarker: {
    backgroundColor: "#bbdefb",
    borderWidth: 2,
    borderColor: "#1976d2",
  },
  equipmentMarker: {
    backgroundColor: "#c8e6c9",
    borderWidth: 2,
    borderColor: "#388e3c",
  },
  currentLocationMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(33, 150, 243, 0.3)",
    borderWidth: 1,
    borderColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  currentLocationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#2196F3",
  },
  detailModal: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: CARD_HEIGHT,
    backgroundColor: "transparent",
    zIndex: 1000,
  },
  detailModalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    height: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 10,
  },
  detailModalHandle: {
    width: 40,
    height: 5,
    backgroundColor: "#e0e0e0",
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 10,
  },
  closeButton: {
    position: "absolute",
    top: 10,
    left: 16,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  detailHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    paddingRight: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  markerIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 16,
    backgroundColor: "#f5f5f5",
  },
  detailTitleContainer: {
    flex: 1,
    alignItems: "flex-end",
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    textAlign: "right",
  },
  detailDescription: {
    fontSize: 14,
    color: "#666",
    textAlign: "right",
  },
  detailContent: {
    flex: 1,
    paddingHorizontal: 10,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#555",
    marginLeft: 8,
    textAlign: "right",
  },
  detailValue: {
    fontSize: 15,
    color: "#333",
    textAlign: "right",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  statusText: {
    fontSize: 14,
    fontWeight: "500",
  },
  priorityText: {
    fontSize: 15,
    fontWeight: "bold",
  },
  teamMembersList: {
    alignItems: "flex-end",
  },
  teamMemberText: {
    fontSize: 14,
    color: "#333",
    textAlign: "right",
    marginBottom: 2,
  },
  inventoryList: {
    alignItems: "flex-end",
  },
  inventoryItemText: {
    fontSize: 14,
    color: "#333",
    textAlign: "right",
    marginBottom: 2,
  },
  actionButton: {
    backgroundColor: "#9610FF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignSelf: "center",
    marginTop: 10,
  },
  actionButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#333",
  },
});

export default MapScreen;
