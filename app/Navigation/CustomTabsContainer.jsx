import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import EventComp from "../Screens/EventComp";
import Report from "../Screens/Report";

export default function CustomTabsContainer() {
  const [activeTab, setActiveTab] = useState("event"); // Default to event tab

  const renderContent = () => {
    switch (activeTab) {
      case "event":
        return <EventComp />;
      case "report":
        return <Report />;
      default:
        return <EventComp />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "report" ? styles.activeTab : null]}
          onPress={() => setActiveTab("report")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "report" ? styles.activeTabText : null,
            ]}
          >
            דיווח
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "event" ? styles.activeTab : null]}
          onPress={() => setActiveTab("event")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "event" ? styles.activeTabText : null,
            ]}
          >
            אירוע
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content Area - Will display either EventComp or ReportComp */}
      <View style={styles.contentContainer}>{renderContent()}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  tabBar: {
    flexDirection: "row",
    height: 50,
    backgroundColor: "#f5f5f5",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  tab: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: "#9610FF",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#888",
  },
  activeTabText: {
    color: "#9610FF",
  },
  contentContainer: {
    flex: 1,
  },
});
