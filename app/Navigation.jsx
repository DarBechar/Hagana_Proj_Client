import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomePage from "./Screens/HomePage";
import ContactsScreen from "./Screens/ContactsScreen";
import ChatScreen from "./Screens/ChatScreen";
import Map from "./Screens/Map";
import {
  Ionicons,
  MaterialIcons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import EventComp from "./Screens/EventComp";

const Tab = createBottomTabNavigator();

function TabGroup() {
  return (
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
            return (
              <MaterialIcons
                name="add-circle-outline"
                size={size}
                color={color}
              />
            );
          }
        },
        tabBarActiveTintColor: "#9610FF",
        tabBarInactiveTintColor: "#888",
        headerShown: false,
      })}
    >
      <Tab.Screen name="בית" component={HomePage} />
      <Tab.Screen name="אנשי קשר" component={ContactsScreen} />
      <Tab.Screen name="הוספה" component={EventComp} />

      <Tab.Screen name="מפה" component={Map} />
      <Tab.Screen name="צ׳אט" component={ChatScreen} />
    </Tab.Navigator>
  );
}
// <Ionicons name="add" size={30} color="#fff" />

export default function Navigation() {
  return <TabGroup />;
}
