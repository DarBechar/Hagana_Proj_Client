import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Dimensions,
  Platform,
  StatusBar,
  Animated,
  ActivityIndicator,
  SafeAreaView,
  Alert,
  Linking,
  ScrollView,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { useNavigation, useRoute } from "@react-navigation/native";
import { API_URL } from "../Constants/Utils";

const { width, height } = Dimensions.get("window");
const CARD_HEIGHT = 400;

const MapScreen = () => {
  // Navigation and route
  const navigation = useNavigation();
  const route = useRoute();

  // Get resource location from navigation params
  const resourceLocation = route.params?.location;

  // Refs
  const mapRef = useRef(null);
  const markerRefs = useRef({});

  // States
  const [region, setRegion] = useState({
    latitude: resourceLocation?.latitude || 32.3015,
    longitude: resourceLocation?.longitude || 34.851,
    latitudeDelta: resourceLocation ? 0.005 : 0.01,
    longitudeDelta: resourceLocation ? 0.005 : 0.01,
  });
  const [currentLocation, setCurrentLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [markers, setMarkers] = useState([]);
  const [equipmentLoading, setEquipmentLoading] = useState(false);

  // Animation values
  const modalTranslateY = useRef(new Animated.Value(CARD_HEIGHT)).current;

  // Get user's location and load markers when component mounts
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission to access location was denied");
        Alert.alert("הרשאה נדחתה", "לא ניתן להשתמש במיקום הנוכחי שלך");
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

        // If no specific resource location, center on user location
        if (!resourceLocation) {
          setRegion({
            latitude,
            longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
        }

        console.log("Got user location:", latitude, longitude);
      } catch (error) {
        console.error("Error getting location:", error);
        Alert.alert("שגיאה", "לא ניתן לקבל את המיקום הנוכחי");
      } finally {
        setIsLoading(false);
      }
    })();

    // Load equipment data from server
    loadEquipmentFromServer();
  }, []);

  // Focus on specific resource when navigated from resources screen
  useEffect(() => {
    if (
      resourceLocation &&
      mapRef.current &&
      !isLoading &&
      markers.length > 0
    ) {
      const resourceRegion = {
        latitude: resourceLocation.latitude,
        longitude: resourceLocation.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      };

      // Animate to resource location after a short delay
      setTimeout(() => {
        mapRef.current.animateToRegion(resourceRegion, 1000);

        // Auto-select the resource marker if it exists
        setTimeout(() => {
          // Create a marker for the specific resource if it came from ResourcesScreen
          if (resourceLocation.title) {
            const specificResourceMarker = {
              id: "specific_resource",
              type: "equipment",
              coordinate: {
                latitude: resourceLocation.latitude,
                longitude: resourceLocation.longitude,
              },
              title: resourceLocation.title,
              label: resourceLocation.resourceType,
              description: resourceLocation.description,
              resourceType: resourceLocation.resourceType,
              location: resourceLocation.description,
              contactName: resourceLocation.contactName,
              contactPhone: resourceLocation.contactPhone,
              status: "available",
            };

            onMarkerPress(specificResourceMarker);
          }
        }, 1500);
      }, 500);
    }
  }, [resourceLocation, markers, isLoading]);

  // Load equipment data from server
  const loadEquipmentFromServer = async () => {
    setEquipmentLoading(true);
    try {
      const response = await fetch(`${API_URL}Resources`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json; charset=UTF-8",
          Accept: "application/json; charset=UTF-8",
        },
      });

      if (!response.ok) {
        throw new Error(`Network response error: ${response.status}`);
      }

      const equipmentData = await response.json();
      console.log("Equipment data received:", equipmentData);

      // Transform server data to marker format
      const equipmentMarkers = equipmentData.map((item) => ({
        id: `equipment_${item.ResourcCode}`,
        type: "equipment",
        coordinate: {
          latitude: item.Lat,
          longitude: item.Longt,
        },
        title: item.ResourceName,
        label: item.ResourceTypeName,
        description: item.LocationDescription,
        resourceCode: item.ResourcCode,
        resourceType: item.ResourceTypeName,
        location: item.LocationDescription,
        contactName: item.ContactName,
        contactPhone: item.ContactPhoneNumber,
        teamName: item.TeamName,
        cityName: item.CityName,
        categoryName: item.CategoryName,
        expirationDate: item.ExpirationDate,
        status: "available",
      }));

      setMarkers(equipmentMarkers);
      console.log(`Loaded ${equipmentMarkers.length} equipment markers`);
    } catch (error) {
      console.error("Error loading equipment data:", error);
      Alert.alert(
        "שגיאת טעינה",
        "לא ניתן לטעון את נתוני הציוד. נא לנסות שוב מאוחר יותר.",
        [{ text: "הבנתי", style: "default" }]
      );
    } finally {
      setEquipmentLoading(false);
    }
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
      } else {
        Alert.alert("לא נמצא", "לא נמצאה כתובת התואמת לחיפוש");
      }
    } catch (error) {
      console.error("Search error:", error);
      Alert.alert("שגיאה", "אירעה שגיאה בחיפוש הכתובת");
    } finally {
      setSearchLoading(false);
    }
  };

  // Get marker icon for equipment
  const getMarkerIcon = (type) => {
    return <MaterialIcons name="medical-services" size={22} color="green" />;
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

  // Format a date to a readable format
  const formatDate = (dateString) => {
    if (!dateString) return "לא זמין";
    const date = new Date(dateString);
    return date.toLocaleDateString("he-IL", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  // Handle navigation to resource
  const handleNavigateToResource = () => {
    if (!selectedMarker) return;

    const { latitude, longitude } = selectedMarker.coordinate;

    Alert.alert(
      "ניווט למשאב",
      `האם תרצה לפתוח ניווט ל${selectedMarker.title}?`,
      [
        { text: "ביטול", style: "cancel" },
        {
          text: "Google Maps",
          onPress: () => {
            const googleMapsUrl =
              Platform.OS === "ios"
                ? `maps://app?daddr=${latitude},${longitude}`
                : `google.navigation:q=${latitude},${longitude}`;

            Linking.canOpenURL(googleMapsUrl)
              .then((supported) => {
                if (supported) {
                  return Linking.openURL(googleMapsUrl);
                } else {
                  // Fallback to web Google Maps
                  const webUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
                  return Linking.openURL(webUrl);
                }
              })
              .catch((error) => {
                console.error("Error opening navigation:", error);
                Alert.alert("שגיאה", "לא ניתן לפתוח ניווט");
              });
          },
        },
        {
          text: "Waze",
          onPress: () => {
            const wazeUrl = `waze://?ll=${latitude},${longitude}&navigate=yes`;

            Linking.canOpenURL(wazeUrl)
              .then((supported) => {
                if (supported) {
                  return Linking.openURL(wazeUrl);
                } else {
                  Alert.alert("Waze לא זמין", "Waze לא מותקן במכשיר");
                }
              })
              .catch((error) => {
                console.error("Error opening Waze:", error);
                Alert.alert("שגיאה", "לא ניתן לפתוח Waze");
              });
          },
        },
      ]
    );
  };
  const handleCall = (phoneNumber, contactName) => {
    if (!phoneNumber) return;

    Alert.alert("התקשר", `האם ברצונך להתקשר ל${contactName}?\n${phoneNumber}`, [
      { text: "ביטול", style: "cancel" },
      {
        text: "התקשר",
        onPress: () => {
          const phoneUrl = `tel:${phoneNumber.replace(/[^\d+]/g, "")}`;
          Linking.openURL(phoneUrl).catch((error) => {
            console.error("Error making phone call:", error);
            Alert.alert("שגיאה", "אירעה שגיאה בביצוע השיחה");
          });
        },
      },
    ]);
  };

  // Render equipment detail modal content
  const renderEquipmentDetailContent = () => {
    if (!selectedMarker) return null;

    return (
      <>
        <View style={styles.detailHeader}>
          <View style={styles.markerIconContainer}>
            {getMarkerIcon(selectedMarker.type)}
          </View>
          <View style={styles.detailTitleContainer}>
            <Text style={styles.detailTitle}>{selectedMarker.title}</Text>
            <Text style={styles.detailDescription}>
              {selectedMarker.description}
            </Text>
          </View>
        </View>

        <View style={styles.detailContent}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
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
              <Text style={styles.detailLabel}>סוג ציוד:</Text>
              <Text style={styles.detailValue}>
                {selectedMarker.resourceType}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>מיקום:</Text>
              <Text style={styles.detailValue}>{selectedMarker.location}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>איש קשר:</Text>
              <Text style={styles.detailValue}>
                {selectedMarker.contactName}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>טלפון:</Text>
              <Text style={styles.detailValue}>
                {selectedMarker.contactPhone}
              </Text>
            </View>

            {selectedMarker.teamName && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>צוות:</Text>
                <Text style={styles.detailValue}>
                  {selectedMarker.teamName}
                </Text>
              </View>
            )}

            {selectedMarker.cityName && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>עיר:</Text>
                <Text style={styles.detailValue}>
                  {selectedMarker.cityName}
                </Text>
              </View>
            )}

            {selectedMarker.categoryName && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>קטגוריה:</Text>
                <Text style={styles.detailValue}>
                  {selectedMarker.categoryName}
                </Text>
              </View>
            )}

            {selectedMarker.expirationDate && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>תאריך פקיעה:</Text>
                <Text style={styles.detailValue}>
                  {formatDate(selectedMarker.expirationDate)}
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() =>
                handleCall(
                  selectedMarker.contactPhone,
                  selectedMarker.contactName
                )
              }
            >
              <Text style={styles.actionButtonText}>התקשר לאיש קשר</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.navigationButton]}
              onPress={handleNavigateToResource}
            >
              <MaterialIcons
                name="directions"
                size={18}
                color="white"
                style={{ marginLeft: 5 }}
              />
              <Text style={styles.actionButtonText}>נווט למיקום</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </>
    );
  };

  // Refresh equipment data
  const refreshEquipmentData = () => {
    loadEquipmentFromServer();
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

      {/* Back Button (only show when navigated from resource) */}
      {resourceLocation && (
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
      )}

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

      {/* Refresh Button */}
      {/* <TouchableOpacity
        style={styles.refreshButton}
        onPress={refreshEquipmentData}
        disabled={equipmentLoading}
      >
        {equipmentLoading ? (
          <ActivityIndicator size="small" color="#333" />
        ) : (
          <MaterialIcons name="refresh" size={24} color="#333" />
        )}
      </TouchableOpacity> */}

      {/* Map View */}
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={region}
        showsUserLocation={true}
        showsMyLocationButton={false}
        onRegionChangeComplete={setRegion}
        showsCompass={false}
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

        {/* Render equipment markers */}
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
              <View style={[styles.markerContainer, styles.equipmentMarker]}>
                {getMarkerIcon(marker.type)}
              </View>
              <View style={styles.markerLabelContainer}>
                <Text style={styles.markerLabel}>{marker.label}</Text>
              </View>
            </View>
          </Marker>
        ))}

        {/* Special marker for specific resource if navigated from ResourcesScreen */}
        {resourceLocation && resourceLocation.title && (
          <Marker
            coordinate={{
              latitude: resourceLocation.latitude,
              longitude: resourceLocation.longitude,
            }}
            title={resourceLocation.title}
            description={resourceLocation.description}
            pinColor="red"
          >
            <View style={styles.markerWrapper}>
              <View
                style={[styles.markerContainer, styles.selectedResourceMarker]}
              >
                <MaterialIcons name="place" size={24} color="white" />
              </View>
              <View style={styles.markerLabelContainer}>
                <Text style={styles.markerLabel}>
                  {resourceLocation.resourceType}
                </Text>
              </View>
            </View>
          </Marker>
        )}
      </MapView>

      {/* Current Location Button */}
      <TouchableOpacity
        style={styles.currentLocationButton}
        onPress={goToCurrentLocation}
      >
        <MaterialIcons name="my-location" size={24} color="#333" />
      </TouchableOpacity>

      {/* Equipment count indicator */}
      {markers.length > 0 && (
        <View style={styles.countIndicator}>
          <Text style={styles.countText}>{markers.length} פריטי ציוד</Text>
        </View>
      )}

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
            {renderEquipmentDetailContent()}
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
  backButton: {
    position: "absolute",
    left: 16,
    top: Platform.OS === "ios" ? 86 : 40,
    backgroundColor: "white",
    width: 42,
    height: 42,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 98,
  },
  searchBar: {
    position: "absolute",
    top: Platform.OS === "ios" ? 80 : 40,
    width: "65%",
    alignSelf: "center",
    zIndex: 99,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 5,
  },
  blurView: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 40,
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
  refreshButton: {
    position: "absolute",
    right: 16,
    top: Platform.OS === "ios" ? 140 : 100,
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
    zIndex: 98,
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
  countIndicator: {
    position: "absolute",
    bottom: 650,
    alignSelf: "center",
    backgroundColor: "rgba(150, 16, 255, 0.9)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  countText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
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
  equipmentMarker: {
    backgroundColor: "#c8e6c9",
    borderWidth: 2,
    borderColor: "#388e3c",
  },
  selectedResourceMarker: {
    backgroundColor: "#ff5252",
    borderWidth: 2,
    borderColor: "#d32f2f",
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
    paddingBottom: 20,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    paddingHorizontal: 5,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#555",
    textAlign: "right",
    width: 80,
  },
  detailValue: {
    fontSize: 14,
    color: "#333",
    textAlign: "right",
    flex: 1,
    marginRight: 15,
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
  actionButton: {
    backgroundColor: "#9610FF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignSelf: "center",
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  navigationButton: {
    backgroundColor: "#4caf50",
    marginTop: 8,
  },
  actionButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
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
