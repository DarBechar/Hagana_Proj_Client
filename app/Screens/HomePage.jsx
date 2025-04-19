import { useState } from "react";
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
import Report from "../Screens/Report";
import { useNavigation } from '@react-navigation/native';


import User from "../Constants/Utils";

const HomeScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation(); // השתמש ב-hook כדי לקבל גישה לאובייקט הניווט
  


  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header with Logo */}
      <View style={styles.header}>
        <Image
          source={require("../../assets/images/Hagana_Logo.png")} // Replace with your logo path
          style={styles.logo}
        />
      </View>

      {/* Status Bar */}

      <StatusIndicator status="normal" />

      {/* Menu Items */}
      <View style={styles.menuContainer}>
        {/* First Menu Item */}
        <TouchableOpacity style={styles.menuItem}>
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


         {/* דיווח */}
      <View style={styles.divider} />
          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Report')}>
          <View style={styles.menuContent}>
          <Text style={styles.menuText}>יצירת דיווח חדש</Text>
         <View style={[styles.iconContainer, { backgroundColor: "#f9ebeb" }]}>
         <MaterialCommunityIcons name="egg" size={24} color="#d64e4e" />
    </View>
  </View>
          </TouchableOpacity>
         

        {/* Divider */}
        <View style={styles.divider} />
        {/* Second Menu Item */}
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('FilledReport')}>
        <View style={styles.menuContent}>
            <Text style={styles.menuText}>דוחות</Text>
            <View
              style={[styles.iconContainer, { backgroundColor: "#e3f1fa" }]}
            >
              <MaterialCommunityIcons
                name="file-document-outline"
                size={24}
                color="#3d8bcd"
              />
            </View>
          </View>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Third Menu Item */}
        <TouchableOpacity style={styles.menuItem}>
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

        {/* Fourth Menu Item */}
        <TouchableOpacity style={styles.menuItem}>
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
        <View style={styles.divider} />

        {/* Fourth Menu Item */}
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => setModalVisible(true)}
        >
          <View style={styles.menuContent}>
            <Text style={styles.menuText}>Show Alert</Text>
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
  


      {/* Bottom Tab Navigator */}
      {/* <View style={styles.tabNavigator}>
        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="home-outline" size={24} color="#888" />
          <Text style={styles.tabLabel}>בית</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="call-outline" size={24} color="#888" />
          <Text style={styles.tabLabel}>איש קשר</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem}>
          <View style={styles.addButton}>
            <Ionicons name="add" size={30} color="#fff" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem}>
          <MaterialCommunityIcons
            name="view-grid-outline"
            size={24}
            color="#888"
          />
          <Text style={styles.tabLabel}>דשבורד</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="chatbubble-outline" size={24} color="#888" />
          <Text style={styles.tabLabel}>צ'אט</Text>
        </TouchableOpacity>
      </View> */}
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
