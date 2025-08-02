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

  // Mock data for fallback
  const mockContacts = [
    {
      UserId: "1",
      FirstName: "יוסי",
      LastName: "כהן",
      phoneNumber: "050-1234567",
      Email: "yossi@example.com",
      Role: "emergency",
      specialty: "כיבוי אש",
    },
    {
      UserId: "2",
      FirstName: "רחל",
      LastName: "לוי",
      phoneNumber: "050-2345678",
      Email: "rachel@example.com",
      Role: "volunteer",
      specialty: "עזרה ראשונה",
    },
    {
      UserId: "3",
      FirstName: "דוד",
      LastName: "אברהם",
      phoneNumber: "050-3456789",
      Email: "david@example.com",
      Role: "emergency",
      specialty: "חילוץ",
    },
  ];

  useEffect(() => {
    fetchContacts();
  }, []);

  // Use memoized filter function to prevent unnecessary re-renders
  const filterContacts = useCallback(() => {
    let result = [...contacts];

    console.log("Filtering contacts:", {
      totalContacts: contacts.length,
      selectedCategory,
      searchQuery,
      sampleContact: contacts[0],
    });

    // Filter by category if not "all"
    if (selectedCategory !== "all") {
      result = result.filter((contact) => {
        // Check both possible field names for role
        const contactRole = contact.Role || contact.role || "";
        const matches = contactRole === selectedCategory;
        console.log(
          `Contact ${contact.FirstName} ${contact.LastName} role: "${contactRole}", matches ${selectedCategory}: ${matches}`
        );
        return matches;
      });
    }

    // Filter by search query if not empty
    if (searchQuery.trim() !== "") {
      result = result.filter((contact) => {
        const fullName = `${contact.FirstName || ""} ${
          contact.LastName || ""
        }`.toLowerCase();
        const phone = (contact.phoneNumber || "").toLowerCase();
        const role = (contact.Role || contact.role || "").toLowerCase();
        const query = searchQuery.toLowerCase();

        return (
          fullName.includes(query) ||
          phone.includes(query) ||
          role.includes(query)
        );
      });
    }

    console.log("Filtered result:", result.length, "contacts");
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
      const response = await fetch(`${API_URL}User`, {
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
          console.log("Contacts fetched from server:", data);

          if (Array.isArray(data) && data.length > 0) {
            // Transform the data to ensure consistent format
            const transformedContacts = data.map((contact) => ({
              ...contact,
              // Ensure we have a role field - map from common server field names
              Role:
                contact.Role || contact.role || contact.userRole || "volunteer",
              // Ensure we have a full name display
              displayName: `${contact.FirstName || ""} ${
                contact.LastName || ""
              }`.trim(),
            }));

            console.log("Transformed contacts:", transformedContacts);
            setContacts(transformedContacts);
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
    console.log("Category changed to:", category);
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

  // Get unique roles from contacts for dynamic category buttons
  const getAvailableRoles = () => {
    const roles = new Set();
    contacts.forEach((contact) => {
      const role = contact.Role || contact.role;
      if (role) {
        roles.add(role);
      }
    });
    return Array.from(roles);
  };

  // Extracted Header Component to prevent re-renders on search text change
  const ListHeader = React.memo(() => {
    const availableRoles = getAvailableRoles();

    return (
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
              הכל ({contacts.length})
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
              צוות חירום (
              {
                contacts.filter((c) => (c.Role || c.role) === "emergency")
                  .length
              }
              )
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
              מתנדבים (
              {
                contacts.filter((c) => (c.Role || c.role) === "volunteer")
                  .length
              }
              )
            </Text>
          </TouchableOpacity>

          {/* Dynamic buttons for other roles found in data */}
          {availableRoles
            .filter((role) => !["emergency", "volunteer"].includes(role))
            .map((role) => (
              <TouchableOpacity
                key={role}
                style={[
                  styles.categoryButton,
                  selectedCategory === role && styles.activeCategory,
                ]}
                onPress={() => handleCategoryChange(role)}
              >
                <Text
                  style={
                    selectedCategory === role
                      ? styles.activeCategoryText
                      : styles.categoryText
                  }
                >
                  {role} (
                  {contacts.filter((c) => (c.Role || c.role) === role).length})
                </Text>
              </TouchableOpacity>
            ))}
        </View>
      </View>
    );
  });

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
        keyExtractor={(item) =>
          item.UserId?.toString() ||
          item.id?.toString() ||
          Math.random().toString()
        }
        ListHeaderComponent={<ListHeader />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {error ||
                (searchQuery
                  ? `לא נמצאו תוצאות עבור "${searchQuery}"`
                  : "לא נמצאו אנשי קשר")}
            </Text>
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
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    marginHorizontal: 2,
    marginVertical: 2,
  },
  activeCategory: {
    backgroundColor: "#9610FF",
  },
  categoryText: {
    color: "#666",
    fontSize: 12,
    fontWeight: "500",
  },
  activeCategoryText: {
    color: "#fff",
    fontSize: 12,
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
  debugContainer: {
    backgroundColor: "#f0f0f0",
    padding: 8,
    borderRadius: 5,
    marginTop: 8,
  },
  debugText: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
});
