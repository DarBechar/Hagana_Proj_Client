import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Alert,
  Button,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";

export default function MapComp() {
  // Ruppin Academic Center coordinates as fallback
  const ruppinCoords = {
    latitude: 32.3015,
    longitude: 34.851,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  const [region, setRegion] = useState(ruppinCoords);
  const [markerPosition, setMarkerPosition] = useState({
    latitude: 32.3015,
    longitude: 34.851,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [locationPermissionGranted, setLocationPermissionGranted] =
    useState(false);
  const mapRef = useRef(null);

  // Request location permissions and get initial user location
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("הרשאה נדחתה", "לא ניתן להשתמש במיקום הנוכחי שלך");
        return;
      }

      setLocationPermissionGranted(true);

      try {
        // Get current position
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        const { latitude, longitude } = location.coords;
        const newRegion = {
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };

        setRegion(newRegion);
        setMarkerPosition({ latitude, longitude });

        console.log("Got user location:", latitude, longitude);
      } catch (error) {
        console.error("Error getting location:", error);
        Alert.alert("שגיאה", "לא ניתן לקבל את המיקום הנוכחי");
      }
    })();
  }, []);

  // Function to handle address search
  const searchAddress = async () => {
    if (!searchQuery.trim()) {
      Alert.alert("שגיאה", "אנא הכנס כתובת לחיפוש");
      return;
    }

    try {
      // Get location from address using Expo's Location module
      let geocodedLocation = await Location.geocodeAsync(searchQuery);

      console.log("Geocode results:", JSON.stringify(geocodedLocation));

      if (geocodedLocation && geocodedLocation.length > 0) {
        const { latitude, longitude } = geocodedLocation[0];

        // Update region and marker position
        const newRegion = {
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };

        setRegion(newRegion);
        setMarkerPosition({ latitude, longitude });

        // Animate to the new region
        mapRef.current?.animateToRegion(newRegion, 1000);
      } else {
        Alert.alert("שגיאה", "לא נמצאה כתובת");
      }
    } catch (error) {
      console.error("Search error:", error);
      Alert.alert("שגיאה", "אירעה שגיאה בחיפוש הכתובת");
    }
  };

  // Function to handle marker drag end
  const onMarkerDragEnd = (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setMarkerPosition({ latitude, longitude });

    // Optional: Get address from coordinates
    (async () => {
      try {
        const reverseGeocode = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });

        if (reverseGeocode && reverseGeocode.length > 0) {
          console.log("Dragged to address:", JSON.stringify(reverseGeocode[0]));
        }
      } catch (error) {
        console.error("Error getting address:", error);
      }
    })();
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="הכנס כתובת לחיפוש"
          style={styles.input}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={searchAddress}
          returnKeyType="search"
        />
        <Button onPress={searchAddress} title="חיפוש"></Button>
      </View>

      <MapView
        ref={mapRef}
        // provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={region}
        onRegionChangeComplete={setRegion}
        showsUserLocation={locationPermissionGranted}
        showsMyLocationButton={true}
      >
        <Marker
          coordinate={markerPosition}
          title="מיקום נבחר"
          description="ניתן לגרור ולמקם מחדש"
          draggable
          onDragEnd={onMarkerDragEnd}
        />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },
  searchContainer: {
    flexDirection: "row",
    width: "100%",
    paddingHorizontal: 10,
    alignItems: "center",
    marginTop: 10,
  },
  map: {
    width: "95%",
    height: 400,
    marginVertical: 10,
    borderRadius: 10,
  },
  input: {
    flex: 1,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    padding: 10,
    textAlignVertical: "center",
    height: 40,
    writingDirection: "rtl",
    textAlign: "right",
  },
  searchButton: {
    backgroundColor: "#2196F3",
    padding: 10,
    borderRadius: 10,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
});
