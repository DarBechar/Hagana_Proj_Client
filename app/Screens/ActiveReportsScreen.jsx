const filters = [
  { key: "all", label: "הכל", icon: "list" },
  { key: "high", label: "דחוף", icon: "warning", color: "#ff4444" },
  { key: "medium", label: "בינוני", icon: "alert-circle", color: "#ff9800" },
  { key: "low", label: "נמוך", icon: "info", color: "#4caf50" },
];
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import {
  Ionicons,
  MaterialIcons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { fetchActiveReports, mockReports } from "../Constants/MockReportsData";

const ActiveReportsScreen = () => {
  const navigation = useNavigation();
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    filterReports();
  }, [searchQuery, selectedFilter, reports]);

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      // Use shared mock data
      const activeReports = await fetchActiveReports();
      setReports(activeReports);
    } catch (error) {
      console.error("Error fetching reports:", error);
      Alert.alert("שגיאה", "לא ניתן לטעון את הדיווחים");
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchReports();
    setRefreshing(false);
  };

  const filterReports = () => {
    let filtered = reports;

    // Filter by priority
    if (selectedFilter !== "all") {
      filtered = filtered.filter(
        (report) => report.priority === selectedFilter
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (report) =>
          report.reportDescription
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          report.reporterName
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          report.eventTypeName
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          report.locationDescription
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
      );
    }

    setFilteredReports(filtered);
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
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 60) {
      return `לפני ${diffInMinutes} דקות`;
    } else if (diffInHours < 24) {
      return `לפני ${diffInHours} שעות`;
    } else {
      return date.toLocaleDateString("he-IL", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  const closeReport = (reportId) => {
    Alert.alert("סגירת דיווח", "האם אתה בטוח שברצונך לסגור את הדיווח?", [
      { text: "ביטול", style: "cancel" },
      {
        text: "סגור דיווח",
        style: "destructive",
        onPress: () => {
          // Here you would call the API to close the report
          setReports((prevReports) =>
            prevReports.filter((report) => report.id !== reportId)
          );
        },
      },
    ]);
  };

  const renderReportItem = ({ item }) => (
    <TouchableOpacity
      style={styles.reportCard}
      onPress={() => {
        // Navigate to report details
        navigation.navigate("פרטי דיווח", { reportId: item.id });
      }}
      activeOpacity={0.7}
    >
      <View style={styles.reportHeader}>
        <View style={styles.reportHeaderLeft}>
          <Text style={styles.reportId}>#{item.reportCode}</Text>
          <View
            style={[
              styles.priorityBadge,
              { backgroundColor: getPriorityColor(item.priority) },
            ]}
          >
            <Ionicons
              name={getPriorityIcon(item.priority)}
              size={12}
              color="white"
            />
            <Text style={styles.priorityText}>
              {item.priority === "high"
                ? "דחוף"
                : item.priority === "medium"
                ? "בינוני"
                : "נמוך"}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => closeReport(item.id)}
        >
          <Ionicons name="close-circle" size={24} color="#ff4444" />
        </TouchableOpacity>
      </View>

      <Text style={styles.eventType}>{item.eventTypeName}</Text>
      <Text style={styles.reportDescription} numberOfLines={3}>
        {item.reportDescription}
      </Text>

      <View style={styles.reportInfo}>
        <View style={styles.infoRow}>
          <MaterialIcons name="location-on" size={16} color="#666" />
          <Text style={styles.infoText}>{item.locationDescription}</Text>
        </View>
        <View style={styles.infoRow}>
          <MaterialIcons name="person" size={16} color="#666" />
          <Text style={styles.infoText}>{item.reporterName}</Text>
        </View>
        <View style={styles.infoRow}>
          <MaterialIcons name="business" size={16} color="#666" />
          <Text style={styles.infoText}>{item.authorityName}</Text>
        </View>
      </View>

      <View style={styles.reportFooter}>
        <Text style={styles.timeText}>{formatDate(item.reportDate)}</Text>
        <Ionicons name="chevron-forward" size={20} color="#ccc" />
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
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
          <Text style={styles.headerTitle}>דיווחים פעילים</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3d8bcd" />
          <Text style={styles.loadingText}>טוען דיווחים...</Text>
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
        <Text style={styles.headerTitle}>דיווחים פעילים</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="חיפוש דיווחים..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            textAlign="right"
          />
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterChip,
              selectedFilter === filter.key && styles.filterChipActive,
            ]}
            onPress={() => setSelectedFilter(filter.key)}
          >
            <Ionicons
              name={filter.icon}
              size={16}
              color={
                selectedFilter === filter.key ? "white" : filter.color || "#666"
              }
            />
            <Text
              style={[
                styles.filterText,
                selectedFilter === filter.key && styles.filterTextActive,
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Reports Count */}
      <View style={styles.countContainer}>
        <Text style={styles.countText}>
          {filteredReports.length === 0
            ? "אין דיווחים פעילים"
            : `${filteredReports.length} דיווחים פעילים`}
        </Text>
      </View>

      {/* Reports List */}
      <FlatList
        data={filteredReports}
        renderItem={renderReportItem}
        keyExtractor={(item) => item.id.toString()}
        style={styles.reportsList}
        contentContainerStyle={styles.reportsListContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#3d8bcd"]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="file-document-outline"
              size={80}
              color="#ccc"
            />
            <Text style={styles.emptyText}>
              {searchQuery
                ? "לא נמצאו דיווחים התואמים לחיפוש"
                : "אין דיווחים פעילים"}
            </Text>
          </View>
        }
      />
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
  },
  backButton: {
    marginLeft: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
    marginRight: 34, // Compensate for back button
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "white",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  filtersContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    marginLeft: 8,
  },
  filterChipActive: {
    backgroundColor: "#3d8bcd",
  },
  filterText: {
    marginLeft: 4,
    fontSize: 14,
    color: "#666",
  },
  filterTextActive: {
    color: "white",
  },
  countContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "white",
  },
  countText: {
    fontSize: 14,
    color: "#666",
    textAlign: "right",
  },
  reportsList: {
    flex: 1,
  },
  reportsListContent: {
    padding: 20,
  },
  reportCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reportHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  reportHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  reportId: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#666",
    marginLeft: 8,
  },
  priorityBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 4,
  },
  closeButton: {
    padding: 4,
  },
  eventType: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
    textAlign: "right",
  },
  reportDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 12,
    textAlign: "right",
  },
  reportInfo: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    justifyContent: "flex-end",
  },
  infoText: {
    fontSize: 12,
    color: "#666",
    marginRight: 6,
    textAlign: "right",
  },
  reportFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  timeText: {
    fontSize: 12,
    color: "#999",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
    marginTop: 20,
  },
});

export default ActiveReportsScreen;
