import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  TextInput,
  Linking,
} from "react-native";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { API_URL } from "../Constants/Utils";
import User from "../Constants/Utils";

export default function ResourcesScreen() {
  const navigation = useNavigation();
  const [resources, setResources] = useState([]);
  const [filteredResources, setFilteredResources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("הכל");
  const [categories, setCategories] = useState([]);

  // Fetch resources from API
  const fetchResources = async () => {
    try {
      const response = await fetch(
        `${API_URL}resources?cityId=${User.CityID}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json; charset=UTF-8",
            Accept: "application/json; charset=UTF-8",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Network response error: ${response.status}`);
      }

      const result = await response.json();
      setResources(result);
      setFilteredResources(result);

      // Extract unique categories
      const uniqueCategories = [
        ...new Set(result.map((item) => item.CategoryName)),
      ];
      setCategories(["הכל", ...uniqueCategories]);

      console.log("Resources loaded:", result.length);
    } catch (error) {
      console.error("Error fetching resources:", error);
      Alert.alert(
        "שגיאת התחברות",
        "לא ניתן לטעון את רשימת המשאבים. אנא נסה שוב מאוחר יותר.",
        [{ text: "הבנתי", style: "default" }]
      );
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  // Filter resources based on search and category
  const filterResources = () => {
    let filtered = resources;

    // Filter by category
    if (selectedCategory !== "הכל") {
      filtered = filtered.filter(
        (resource) => resource.CategoryName === selectedCategory
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (resource) =>
          resource.ResourceName.toLowerCase().includes(
            searchQuery.toLowerCase()
          ) ||
          resource.ResourceTypeName.toLowerCase().includes(
            searchQuery.toLowerCase()
          ) ||
          resource.LocationDescription.toLowerCase().includes(
            searchQuery.toLowerCase()
          ) ||
          resource.ContactName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredResources(filtered);
  };

  // Handle show location
  const handleShowLocation = (resource) => {
    // Navigate to Map screen with resource location
    navigation.navigate("מפה", {
      location: {
        latitude: resource.Lat,
        longitude: resource.Longt,
        title: resource.ResourceName,
        description: resource.LocationDescription,
        resourceType: resource.ResourceTypeName,
        contactName: resource.ContactName,
        contactPhone: resource.ContactPhoneNumber,
      },
    });
  };
  const handleCall = (phoneNumber, contactName) => {
    // Clean phone number (remove spaces, dashes, etc.)
    const cleanNumber = phoneNumber.replace(/[^\d+]/g, "");

    Alert.alert(
      "התקשר לאחראי",
      `האם תרצה להתקשר ל${contactName}?\n${phoneNumber}`,
      [
        { text: "ביטול", style: "cancel" },
        {
          text: "התקשר",
          onPress: () => {
            const phoneUrl = `tel:${cleanNumber}`;
            Linking.canOpenURL(phoneUrl)
              .then((supported) => {
                if (supported) {
                  return Linking.openURL(phoneUrl);
                } else {
                  Alert.alert("שגיאה", "לא ניתן לבצע שיחות מהמכשיר הזה");
                }
              })
              .catch((error) => {
                console.error("Error making phone call:", error);
                Alert.alert("שגיאה", "אירעה שגיאה בביצוע השיחה");
              });
          },
        },
      ]
    );
  };

  // Check if resource is expired
  const isExpired = (expirationDate) => {
    return new Date(expirationDate) < new Date();
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("he-IL");
  };

  // Get category icon
  const getCategoryIcon = (categoryName) => {
    switch (categoryName) {
      case "רכבים":
        return "directions-car";
      case "ציוד":
        return "build";
      case "ציוד רפואי":
        return "medical-services";
      case "תקשורת":
        return "phone";
      case "אחר":
      default:
        return "category";
    }
  };

  // Get status color
  const getStatusColor = (expirationDate) => {
    const daysUntilExpiration = Math.ceil(
      (new Date(expirationDate) - new Date()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilExpiration < 0) return "#ff5252"; // Expired - Red
    if (daysUntilExpiration <= 30) return "#ff9800"; // Expiring soon - Orange
    return "#4caf50"; // Valid - Green
  };

  // Get status text
  const getStatusText = (expirationDate) => {
    const daysUntilExpiration = Math.ceil(
      (new Date(expirationDate) - new Date()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilExpiration < 0) return "פג תוקף";
    if (daysUntilExpiration <= 30)
      return `פג תוקף בעוד ${daysUntilExpiration} ימים`;
    return "תקף";
  };

  // Handle refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchResources();
  };

  // Handle category selection
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  useEffect(() => {
    fetchResources();
  }, []);

  useEffect(() => {
    filterResources();
  }, [searchQuery, selectedCategory, resources]);

  // Render resource item
  const renderResourceItem = (resource) => (
    <View key={resource.ResourcCode} style={styles.resourceCard}>
      <View style={styles.resourceHeader}>
        <View style={styles.resourceTitleContainer}>
          <MaterialIcons
            name={getCategoryIcon(resource.CategoryName)}
            size={24}
            color="#9610FF"
            style={styles.resourceIcon}
          />
          <View style={styles.resourceTitleInfo}>
            <Text style={styles.resourceName}>{resource.ResourceName}</Text>
            <Text style={styles.resourceType}>{resource.ResourceTypeName}</Text>
          </View>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(resource.ExpirationDate) },
          ]}
        >
          <Text style={styles.statusText}>
            {getStatusText(resource.ExpirationDate)}
          </Text>
        </View>
      </View>

      <View style={styles.resourceDetails}>
        <View style={styles.detailRow}>
          <MaterialIcons name="location-on" size={16} color="#666" />
          <Text style={styles.detailText}>{resource.LocationDescription}</Text>
        </View>

        <View style={styles.detailRow}>
          <MaterialIcons name="person" size={16} color="#666" />
          <Text style={styles.detailText}>
            {resource.ContactName} - {resource.ContactPhoneNumber}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <MaterialIcons name="group" size={16} color="#666" />
          <Text style={styles.detailText}>{resource.TeamName}</Text>
        </View>

        <View style={styles.detailRow}>
          <MaterialIcons name="event" size={16} color="#666" />
          <Text style={styles.detailText}>
            תוקף עד: {formatDate(resource.ExpirationDate)}
          </Text>
        </View>
      </View>

      <View style={styles.resourceActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() =>
            handleCall(resource.ContactPhoneNumber, resource.ContactName)
          }
        >
          <MaterialIcons name="phone" size={20} color="#4caf50" />
          <Text style={[styles.actionText, { color: "#4caf50" }]}>התקשר</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleShowLocation(resource)}
        >
          <MaterialIcons name="map" size={20} color="#2196f3" />
          <Text style={[styles.actionText, { color: "#2196f3" }]}>מיקום</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render category filter
  const renderCategoryFilter = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.categoryFilter}
      contentContainerStyle={styles.categoryFilterContent}
    >
      {categories.map((category) => (
        <TouchableOpacity
          key={category}
          style={[
            styles.categoryButton,
            selectedCategory === category && styles.selectedCategoryButton,
          ]}
          onPress={() => handleCategoryChange(category)}
        >
          <Text
            style={[
              styles.categoryButtonText,
              selectedCategory === category &&
                styles.selectedCategoryButtonText,
            ]}
          >
            {category}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>משאבים</Text>
        {/* <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
          <MaterialIcons name="refresh" size={24} color="#9610FF" />
        </TouchableOpacity> */}
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <MaterialIcons
          name="search"
          size={20}
          color="#666"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="חפש משאב, סוג, מיקום או אחראי..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          textAlign="right"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => setSearchQuery("")}
          >
            <MaterialIcons name="clear" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      {/* Category Filter */}
      {renderCategoryFilter()}

      {/* Stats */}
      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          נמצאו {filteredResources.length} משאבים מתוך {resources.length}
        </Text>
      </View>

      {/* Resources List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#9610FF" />
          <Text style={styles.loadingText}>טוען משאבים...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {filteredResources.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="inventory" size={64} color="#ccc" />
              <Text style={styles.emptyText}>לא נמצאו משאבים</Text>
              <Text style={styles.emptySubText}>
                {searchQuery
                  ? "נסה לשנות את החיפוש"
                  : "אין משאבים רשומים במערכת"}
              </Text>
            </View>
          ) : (
            filteredResources.map(renderResourceItem)
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    flex: 1,
  },
  refreshButton: {
    padding: 5,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    margin: 20,
    backgroundColor: "#f5f5f5",
    borderRadius: 25,
    paddingHorizontal: 15,
  },
  searchIcon: {
    marginLeft: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  clearButton: {
    padding: 5,
  },
  categoryFilter: {
    marginBottom: 15,
    maxHeight: 40,
  },
  categoryFilterContent: {
    paddingHorizontal: 20,
    alignItems: "center",
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 6,
    backgroundColor: "#f8f9fa",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#e9ecef",
    minWidth: 60,
    alignItems: "center",
  },
  selectedCategoryButton: {
    backgroundColor: "#9610FF",
    borderColor: "#9610FF",
  },
  categoryButtonText: {
    fontSize: 12,
    color: "#6c757d",
    fontWeight: "500",
  },
  selectedCategoryButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  statsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: "#f8f9fa",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  statsText: {
    fontSize: 13,
    color: "#6c757d",
    textAlign: "right",
    fontWeight: "500",
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  resourceCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: "#9610FF",
  },
  resourceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  resourceTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  resourceIcon: {
    marginLeft: 12,
  },
  resourceTitleInfo: {
    flex: 1,
  },
  resourceName: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "right",
    marginBottom: 4,
  },
  resourceType: {
    fontSize: 14,
    color: "#666",
    textAlign: "right",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  resourceDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: "#333",
    marginRight: 8,
    flex: 1,
    textAlign: "right",
  },
  resourceActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  actionText: {
    marginRight: 6,
    fontSize: 14,
    fontWeight: "500",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 50,
  },
  loadingText: {
    marginTop: 10,
    color: "#666",
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#666",
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
    textAlign: "center",
  },
});
