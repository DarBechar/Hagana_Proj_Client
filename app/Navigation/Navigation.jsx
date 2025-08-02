import React, { useState, useEffect, createContext, useContext } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, StyleSheet } from "react-native";
import HomePage from "../Screens/HomePage";
import ContactsScreen from "../Screens/ContactsScreen";
import ChatScreen from "../Screens/ChatScreen";
import MapScreen from "../Screens/MapScreen";
import CustomTabsContainer from "./CustomTabsContainer";
import { createStackNavigator } from "@react-navigation/stack";
import EventLogScreen from "../Screens/EventLogScreen";
import { EmergencyContext, useEmergency } from "../Context/EmergencyContext";
import EventDetailsScreen from "../Screens/EventDetailsScreen";
import EventLogDetailsScreen from "../Screens/EventLogDetailsScreen";
import {
  Ionicons,
  MaterialIcons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { API_URL } from "../Constants/Utils";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stack navigator for Home and its related screens
function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeScreen" component={HomePage} />
      <Stack.Screen name="EventLogScreen" component={EventLogScreen} />
      <Stack.Screen
        name="EventLogDetailsScreen"
        component={EventLogDetailsScreen}
      />
      <Stack.Screen name="EventDetailsScreen" component={EventDetailsScreen} />
    </Stack.Navigator>
  );
}

//Tab navigation
function TabGroup() {
  const [hasActiveEmergency, setHasActiveEmergency] = useState(false);
  const [activeEvent, setActiveEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Function to fetch active emergency events
  const fetchEmergencyStatus = async () => {
    setIsLoading(true);
    try {
      console.log(`Checking for active events: ${API_URL}Event/active`);

      const response = await fetch(`${API_URL}Event/active`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (response.ok) {
        // We have an active event (200 status)
        const text = await response.text();
        console.log("Active event response:", text);

        if (text && text !== "null" && text !== "") {
          try {
            const event = JSON.parse(text);
            console.log("✅ Active event found:", event);
            setActiveEvent(event);
            setHasActiveEmergency(true);
          } catch (parseError) {
            console.error("Error parsing active event JSON:", parseError);
            setActiveEvent(null);
            setHasActiveEmergency(false);
          }
        } else {
          console.log("Empty response - no active events");
          setActiveEvent(null);
          setHasActiveEmergency(false);
        }
      } else if (response.status === 404) {
        // 404 means no active events (this is normal)
        try {
          const errorText = await response.text();
          const errorData = JSON.parse(errorText);
          console.log(
            "ℹ️ No active events:",
            errorData.message || "לא נמצא אירוע פעיל"
          );
        } catch (e) {
          console.log("ℹ️ No active events (404)");
        }

        setActiveEvent(null);
        setHasActiveEmergency(false);
      } else {
        // Other errors (500, 403, etc.)
        throw new Error(`Server error: ${response.status}`);
      }
    } catch (error) {
      console.error("Error fetching emergency status:", error);
      setHasActiveEmergency(false);
      setActiveEvent(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch emergency status when component mounts
  useEffect(() => {
    fetchEmergencyStatus();

    // Set up interval to check for updates
    const intervalId = setInterval(() => {
      fetchEmergencyStatus();
    }, 30000); // Check every 30 seconds

    return () => clearInterval(intervalId);
  }, []);

  // Custom button component for the middle tab
  const EmergencyButton = ({ activeEvent }) => {
    return (
      <View
        style={
          hasActiveEmergency ? styles.emergencyContainer : styles.addContainer
        }
      >
        {hasActiveEmergency ? (
          <MaterialIcons name="warning-amber" size={24} color="#fff" />
        ) : (
          <Ionicons name="add" size={30} color="#fff" />
        )}
      </View>
    );
  };

  return (
    <EmergencyContext.Provider
      value={{
        hasActiveEmergency,
        activeEvent,
        setHasActiveEmergency,
        setActiveEvent,
        refreshEmergencyStatus: fetchEmergencyStatus,
      }}
    >
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            if (route.name === "בית") {
              return (
                <Ionicons
                  name={focused ? "home" : "home-outline"}
                  size={size}
                  color={color}
                />
              );
            } else if (route.name === "אנשי קשר") {
              return (
                <Ionicons
                  name={focused ? "call" : "call-outline"}
                  size={size}
                  color={color}
                />
              );
            } else if (route.name === "מפה") {
              return (
                <MaterialCommunityIcons
                  name="map-marker-radius"
                  size={size}
                  color={color}
                />
              );
            } else if (route.name === "צ׳אט") {
              return (
                <Ionicons
                  name={focused ? "chatbubble" : "chatbubble-outline"}
                  size={size}
                  color={color}
                />
              );
            } else if (route.name === "הוספה") {
              return <EmergencyButton activeEvent={activeEvent} />;
            } else if (route.name === "אירוע חירום") {
              return <EmergencyButton activeEvent={activeEvent} />;
            }
          },
          tabBarActiveTintColor: "#9610FF",
          tabBarInactiveTintColor: "#888",
          headerShown: false,
        })}
      >
        <Tab.Screen name="בית" component={HomeStack} />
        <Tab.Screen name="אנשי קשר" component={ContactsScreen} />

        {/* Conditionally render emergency event screen or add event screen */}
        {hasActiveEmergency ? (
          <Tab.Screen
            name="אירוע חירום"
            component={EventDetailsScreen}
            initialParams={{ event: activeEvent }}
            options={{
              tabBarLabel: "אירוע חירום",
              tabBarLabelStyle: { color: "#F89300" },
            }}
          />
        ) : (
          <Tab.Screen name="הוספה" component={CustomTabsContainer} />
        )}

        <Tab.Screen name="מפה" component={MapScreen} />
        <Tab.Screen name="צ׳אט" component={ChatScreen} />
      </Tab.Navigator>
    </EmergencyContext.Provider>
  );
}

export default function Navigation() {
  return <TabGroup />;
}

const styles = StyleSheet.create({
  addContainer: {
    backgroundColor: "#9610FF",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  emergencyContainer: {
    backgroundColor: "#F89300",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
});
