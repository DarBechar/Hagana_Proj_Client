import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ContactComp from "../Components/ContactComp";
import { API_URL } from "../Constants/Utils";

export default function ContactsScreen({ navigation }) {
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Mock data for testing - will be replaced with API data
  const mockContacts = [
    {
      id: "1",
      name: "דוד כהן",
      role: "אחראי אבטחה",
      phone: "050-1234567",
      image: "https://randomuser.me/api/portraits/men/1.jpg",
      category: "emergency",
    },
    {
      id: "2",
      name: "שרה לוי",
      role: "רכזת מתנדבים",
      phone: "052-7654321",
      image: "https://randomuser.me/api/portraits/women/2.jpg",
      category: "admin",
    },
    {
      id: "3",
      name: "יוסי אברהם",
      role: "רופא",
      phone: "054-9876543",
      image: "https://randomuser.me/api/portraits/men/3.jpg",
      category: "emergency",
    },
    {
      id: "4",
      name: "מיכל גולן",
      role: "מתנדבת",
      phone: "053-1472583",
      image: "https://randomuser.me/api/portraits/women/4.jpg",
      category: "volunteer",
    },
    {
      id: "5",
      name: "רועי שמואלי",
      role: "אחראי לוגיסטיקה",
      phone: "058-3692581",
      image: "https://randomuser.me/api/portraits/men/5.jpg",
      category: "admin",
    },
  ];

  useEffect(() => {
    fetchContacts();
  }, []);

  // Use memoized filter function to prevent unnecessary re-renders
  const filterContacts = useCallback(() => {
    let result = [...contacts];

    // Filter by category if not "all"
    if (selectedCategory !== "all") {
      result = result.filter(
        (contact) => contact.category === selectedCategory
      );
    }

    // Filter by search query if not empty
    if (searchQuery.trim() !== "") {
      result = result.filter(
        (contact) =>
          contact.name.includes(searchQuery) ||
          (contact.role && contact.role.includes(searchQuery)) ||
          contact.phone.includes(searchQuery)
      );
    }

    return result;
  }, [contacts, searchQuery, selectedCategory]);

  // Update filtered contacts when dependencies change
  useEffect(() => {
    setFilteredContacts(filterContacts());
  }, [filterContacts]);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      // Try to fetch contacts from API
      const response = await fetch(`${API_URL}Contacts`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Network response error: ${response.status}`);
      }

      const text = await response.text();

      // Check if response is empty or null
      if (!text || text === "null" || text === "") {
        console.log("No contacts found in API, using mock data");
        setContacts(mockContacts);
      } else {
        // Try to parse the response as JSON
        try {
          const data = JSON.parse(text);
          console.log("Contacts fetched:", data);

          if (Array.isArray(data) && data.length > 0) {
            setContacts(data);
          } else {
            console.log("Invalid contacts data, using mock data");
            setContacts(mockContacts);
          }
        } catch (parseError) {
          console.error("Error parsing contacts JSON:", parseError);
          // If parsing fails, use mock data
          setContacts(mockContacts);
        }
      }
      setError(null);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      setError("לא ניתן לטעון את אנשי הקשר כרגע");
      // Use mock data as fallback
      setContacts(mockContacts);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (text) => {
    setSearchQuery(text);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const handleContactPress = (contact) => {
    console.log("Contact pressed:", contact);
    // Here you can add navigation to a contact details screen if needed
  };

  const handleRefresh = () => {
    fetchContacts();
  };

  const renderContactItem = ({ item }) => (
    <ContactComp contact={item} onPress={handleContactPress} />
  );

  // Extracted Header Component to prevent re-renders on search text change
  const ListHeader = React.memo(() => (
    <View style={styles.headerContainer}>
      <Text style={styles.headerTitle}>אנשי קשר</Text>

      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="#666"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="חיפוש אנשי קשר..."
          value={searchQuery}
          onChangeText={handleSearchChange}
          placeholderTextColor="#999"
          textAlign="right"
        />
      </View>

      <View style={styles.categoriesContainer}>
        <TouchableOpacity
          style={[
            styles.categoryButton,
            selectedCategory === "all" && styles.activeCategory,
          ]}
          onPress={() => handleCategoryChange("all")}
        >
          <Text
            style={
              selectedCategory === "all"
                ? styles.activeCategoryText
                : styles.categoryText
            }
          >
            הכל
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.categoryButton,
            selectedCategory === "emergency" && styles.activeCategory,
          ]}
          onPress={() => handleCategoryChange("emergency")}
        >
          <Text
            style={
              selectedCategory === "emergency"
                ? styles.activeCategoryText
                : styles.categoryText
            }
          >
            צוות חירום
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.categoryButton,
            selectedCategory === "volunteer" && styles.activeCategory,
          ]}
          onPress={() => handleCategoryChange("volunteer")}
        >
          <Text
            style={
              selectedCategory === "volunteer"
                ? styles.activeCategoryText
                : styles.categoryText
            }
          >
            מתנדבים
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  ));

  if (loading && contacts.length === 0) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#9610FF" />
        <Text style={styles.loadingText}>טוען אנשי קשר...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={filteredContacts}
        renderItem={renderContactItem}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={<ListHeader />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{error || "לא נמצאו אנשי קשר"}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={handleRefresh}
            >
              <Text style={styles.retryText}>נסה שנית</Text>
            </TouchableOpacity>
          </View>
        }
        refreshing={loading}
        onRefresh={handleRefresh}
        contentContainerStyle={
          filteredContacts.length === 0 ? { flex: 1 } : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  headerContainer: {
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  searchContainer: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 16,
    alignItems: "center",
  },
  searchIcon: {
    marginLeft: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  categoriesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    marginHorizontal: 4,
  },
  activeCategory: {
    backgroundColor: "#9610FF",
  },
  categoryText: {
    color: "#666",
    fontSize: 14,
    fontWeight: "500",
  },
  activeCategoryText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#9610FF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  retryText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
});
