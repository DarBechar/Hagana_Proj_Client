import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
} from "react-native";
import {
  Ionicons,
  MaterialIcons,
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";
import StatusIndicator from "../Components/StatusIndicatorComp";
import EmergencyAlertModal from "../Components/EmergencyAlertModal";
import { useNavigation } from "@react-navigation/native";

import User from "../Constants/Utils";
import { fetchActiveReportsCount } from "../Constants/MockReportsData";

const HomeScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [openReportsCount, setOpenReportsCount] = useState(0);
  const [isLoadingReports, setIsLoadingReports] = useState(true);
  const navigation = useNavigation();

  // Mock data for open reports count
  useEffect(() => {
    fetchOpenReportsCount();

    // Optional: Set up interval to refresh count every 10 seconds (for demo)
    const interval = setInterval(fetchOpenReportsCount, 10000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  const fetchOpenReportsCount = async () => {
    try {
      setIsLoadingReports(true);

      // Use shared mock data
      const count = await fetchActiveReportsCount();
      setOpenReportsCount(count);

      console.log(`Loaded: ${count} דיווחים פעילים`);
    } catch (error) {
      console.error("Error fetching reports count:", error);
      setOpenReportsCount(0);
    } finally {
      setIsLoadingReports(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header with Logo */}
      <View style={styles.header}>
        <Image
          source={require("../../assets/images/Hagana_Logo.png")}
          style={styles.logo}
        />
      </View>

      {/* Status Bar */}
      <StatusIndicator status="normal" />

      {/* Reports Indicator - Above Menu */}
      <TouchableOpacity
        style={styles.reportsIndicator}
        onPress={() => navigation.navigate("דיווחים")}
        activeOpacity={0.7}
      >
        <View style={styles.reportsContent}>
          <View style={styles.reportsTextContainer}>
            <Text style={styles.reportsTitle}>דיווחים פעילים</Text>
            {isLoadingReports ? (
              <Text style={styles.loadingText}>טוען...</Text>
            ) : (
              <Text style={styles.reportsCount}>
                {openReportsCount === 0
                  ? "אין דיווחים פעילים"
                  : `${openReportsCount} דיווחים פתוחים`}
              </Text>
            )}
          </View>
          <View style={styles.reportsIconContainer}>
            {openReportsCount > 0 && (
              <View style={styles.alertBadge}>
                <Text style={styles.alertBadgeText}>
                  {openReportsCount > 99 ? "99+" : openReportsCount}
                </Text>
              </View>
            )}
            <MaterialCommunityIcons
              name="file-document-outline"
              size={28}
              color={openReportsCount > 0 ? "#ff4444" : "#666"}
            />
          </View>
        </View>
      </TouchableOpacity>

      {/* Menu Items */}
      <View style={styles.menuContainer}>
        {/* First Menu Item - User Profile */}
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate("הגדרות")}
        >
          <View style={styles.menuContent}>
            <Text style={styles.menuText}>
              {User.FirstName + " " + User.LastName}
            </Text>
            <View
              style={[styles.iconContainer, { backgroundColor: "#f4d7ff" }]}
            >
              <MaterialIcons name="person" size={24} color="#884ed6" />
            </View>
          </View>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Inventory Menu Item */}
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate("משאבים")}
        >
          <View style={styles.menuContent}>
            <Text style={styles.menuText}>מלאי</Text>
            <View
              style={[styles.iconContainer, { backgroundColor: "#ebf9f1" }]}
            >
              <MaterialIcons name="grid-view" size={24} color="#4e9d6d" />
            </View>
          </View>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Event Log Menu Item */}
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate("EventLogScreen")}
        >
          <View style={styles.menuContent}>
            <Text style={styles.menuText}>לוג אירועים</Text>
            <View
              style={[styles.iconContainer, { backgroundColor: "#f9ebeb" }]}
            >
              <MaterialCommunityIcons
                name="folder-open-outline"
                size={24}
                color="#d64e4e"
              />
            </View>
          </View>
        </TouchableOpacity>
      </View>

      <View>
        <EmergencyAlertModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onSlide={() => {
            // Handle successful slide action here
            console.log("User accepted the emergency call");
            setModalVisible(false);
          }}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  logo: {
    width: 40,
    height: 40,
    resizeMode: "contain",
  },
  searchSection: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  searchTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    direction: "rtl",
  },
  searchBar: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#ddd",
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingRight: 10,
  },
  menuContainer: {
    marginTop: 20,
    backgroundColor: "#fff",
    borderRadius: 15,
    marginHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuItem: {
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  menuContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  menuText: {
    fontSize: 16,
    marginRight: 15,
    textAlign: "right",
  },
  reportsIndicator: {
    marginHorizontal: 20,
    marginTop: 15,
    marginBottom: 10,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: "#3d8bcd",
  },
  reportsContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  reportsTextContainer: {
    flex: 1,
  },
  reportsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    textAlign: "right",
    marginBottom: 4,
  },
  reportsCount: {
    fontSize: 14,
    color: "#666",
    textAlign: "right",
  },
  loadingText: {
    fontSize: 14,
    color: "#3d8bcd",
    textAlign: "right",
  },
  reportsIconContainer: {
    position: "relative",
    marginLeft: 12,
  },
  alertBadge: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#ff4444",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
    zIndex: 1,
  },
  alertBadgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginHorizontal: 20,
  },
  tabNavigator: {
    flexDirection: "row",
    height: 60,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
  },
  tabItem: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 2,
    color: "#888",
  },
  addButton: {
    backgroundColor: "#9610FF",
    width: 30,
    height: 30,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
});

export default HomeScreen;
