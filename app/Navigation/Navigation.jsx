import React, { useState, useEffect, createContext, useContext } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, StyleSheet } from "react-native";
import HomePage from "../Screens/HomePage";
import ContactsScreen from "../Screens/ContactsScreen";
import ChatScreen from "../Screens/ChatScreen";
import Map from "../Screens/Map";
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
      // Fetch active events from the API
      const response = await fetch(`${API_URL}Event`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Network response error: ${response.status}`);
      }

      // Check if the response is empty
      const text = await response.text();
      console.log("Raw response:", text);

      if (text === null || text === "" || text === "null") {
        // Empty response - no active events
        console.log("No active events found");
        setActiveEvent(null);
        setHasActiveEmergency(false);
      } else {
        // Try to parse the response as JSON
        try {
          const event = JSON.parse(text);
          console.log("Parsed event:", event);

          if (event !== null) {
            // We have an active event
            console.log("Active event found");
            setActiveEvent(event);
            setHasActiveEmergency(true);
          } else {
            // No active event
            console.log("Event is null");
            setActiveEvent(null);
            setHasActiveEmergency(false);
          }
        } catch (parseError) {
          console.error("Error parsing JSON:", parseError);
          // Handle the case where the response isn't valid JSON
          setActiveEvent(null);
          setHasActiveEmergency(false);
        }
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

        <Tab.Screen name="מפה" component={Map} />
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
