import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
} from "react-native";
import { Ionicons, MaterialIcons, FontAwesome } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import EventLogItem from "../Components/EvetLogItemComp";
import { API_URL } from "../Constants/Utils";

// Calendar component to display an interactive calendar
const CalendarPicker = ({ visible, onClose, onSelectRange }) => {
  const [selectedStartDate, setSelectedStartDate] = useState(null);
  const [selectedEndDate, setSelectedEndDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Get current month details
  const getMonthDetails = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);

    // Day of the week for the first day (0 = Sunday, 1 = Monday, etc.)
    const firstDayOfWeek = firstDay.getDay();
    // Total days in the month
    const daysInMonth = lastDay.getDate();

    return { year, month, firstDayOfWeek, daysInMonth };
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const { year, month, firstDayOfWeek, daysInMonth } = getMonthDetails();
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push({ day: null, date: null });
    }

    // Add cells for each day of the month
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      days.push({ day: i, date });
    }

    return days;
  };

  // Function to navigate to previous month
  const goToPreviousMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() - 1);
    setCurrentMonth(newMonth);
  };

  // Function to navigate to next month
  const goToNextMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + 1);
    setCurrentMonth(newMonth);
  };

  // Function to handle day selection
  const handleDaySelect = (date) => {
    if (!date) return;

    if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
      // Start new selection
      setSelectedStartDate(date);
      setSelectedEndDate(null);
    } else {
      // Complete selection range
      if (date < selectedStartDate) {
        setSelectedEndDate(selectedStartDate);
        setSelectedStartDate(date);
      } else {
        setSelectedEndDate(date);
      }
    }
  };

  // Function to apply selected date range
  const applyDateRange = () => {
    if (selectedStartDate) {
      onSelectRange(selectedStartDate, selectedEndDate || selectedStartDate);
    }
    onClose();
  };

  // Function to clear date selection
  const clearSelection = () => {
    setSelectedStartDate(null);
    setSelectedEndDate(null);
  };

  // Check if a date is selected
  const isDateSelected = (date) => {
    if (!date) return false;

    if (selectedStartDate && selectedEndDate) {
      return date >= selectedStartDate && date <= selectedEndDate;
    }

    return (
      selectedStartDate &&
      date.toDateString() === selectedStartDate.toDateString()
    );
  };

  // Check if a date is the start of the range
  const isStartDate = (date) => {
    if (!date || !selectedStartDate) return false;
    return date.toDateString() === selectedStartDate.toDateString();
  };

  // Check if a date is the end of the range
  const isEndDate = (date) => {
    if (!date || !selectedEndDate) return false;
    return date.toDateString() === selectedEndDate.toDateString();
  };

  // Format month and year for header
  const formatMonthYear = () => {
    const months = [
      "ינואר",
      "פברואר",
      "מרץ",
      "אפריל",
      "מאי",
      "יוני",
      "יולי",
      "אוגוסט",
      "ספטמבר",
      "אוקטובר",
      "נובמבר",
      "דצמבר",
    ];
    return `${months[currentMonth.getMonth()]} ${currentMonth.getFullYear()}`;
  };

  // Days of the week
  const weekdays = ["א'", "ב'", "ג'", "ד'", "ה'", "ו'", "ש'"];

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={calendarStyles.overlay}>
        <View style={calendarStyles.container}>
          <View style={calendarStyles.header}>
            <Text style={calendarStyles.title}>בחר טווח תאריכים</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <View style={calendarStyles.calendarHeader}>
            <TouchableOpacity
              onPress={goToNextMonth}
              style={calendarStyles.navButton}
            >
              <Ionicons name="chevron-back" size={24} color="#666" />
            </TouchableOpacity>
            <Text style={calendarStyles.monthYear}>{formatMonthYear()}</Text>
            <TouchableOpacity
              onPress={goToPreviousMonth}
              style={calendarStyles.navButton}
            >
              <Ionicons name="chevron-forward" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={calendarStyles.weekdaysRow}>
            {weekdays.map((day, index) => (
              <Text key={index} style={calendarStyles.weekday}>
                {day}
              </Text>
            ))}
          </View>

          <View style={calendarStyles.daysGrid}>
            {generateCalendarDays().map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  calendarStyles.dayCell,
                  isDateSelected(item.date) && calendarStyles.selectedDay,
                  isStartDate(item.date) && calendarStyles.startDay,
                  isEndDate(item.date) && calendarStyles.endDay,
                ]}
                onPress={() => handleDaySelect(item.date)}
                disabled={!item.day}
              >
                {item.day && (
                  <Text
                    style={[
                      calendarStyles.dayText,
                      isDateSelected(item.date) &&
                        calendarStyles.selectedDayText,
                    ]}
                  >
                    {item.day}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>

          <View style={calendarStyles.selectedDateInfo}>
            {selectedStartDate && (
              <Text style={calendarStyles.dateRangeText}>
                {selectedStartDate.toLocaleDateString("he-IL")}
                {selectedEndDate &&
                  selectedEndDate.toDateString() !==
                    selectedStartDate.toDateString() &&
                  ` - ${selectedEndDate.toLocaleDateString("he-IL")}`}
              </Text>
            )}
          </View>

          <View style={calendarStyles.buttonsRow}>
            <TouchableOpacity
              style={[calendarStyles.button, calendarStyles.applyButton]}
              onPress={applyDateRange}
              disabled={!selectedStartDate}
            >
              <Text style={calendarStyles.applyButtonText}>החל סינון</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[calendarStyles.button, calendarStyles.clearButton]}
              onPress={clearSelection}
            >
              <Text style={calendarStyles.clearButtonText}>נקה בחירה</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default function EventLogScreen() {
  const navigation = useNavigation();
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [showCalendar, setShowCalendar] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // Define event types
  const eventTypes = [
    { id: "all", label: "הכל", color: "#9610FF" },
    { id: "1", label: "שריפה", color: "#F44336" },
    { id: "2", label: "בטחוני", color: "#FF9800" },
    { id: "3", label: "רפואי", color: "#4CAF50" },
    { id: "4", label: "תשתיות", color: "#2196F3" },
    { id: "5", label: "אחר", color: "#9E9E9E" },
  ];

  // Mock data for testing - will be replaced with API data
  const mockEvents = [
    {
      eventCode: 1001,
      eventName: "שריפה בשטח פתוח",
      openingDate: "2025-04-15T14:30:00.000Z",
      description: "שריפה בשטח פתוח ליד שכונת הדקלים",
      eventStatusCode: 3,
      eventTypeCode: 1,
      eventTypeName: "שריפה",
      locationName: "שכונת הדקלים, כביש 5",
      locationLatitude: 32.1234,
      locationLongitude: 34.8765,
    },
    {
      eventCode: 1002,
      eventName: "פגיעה בתשתית חשמל",
      openingDate: "2025-04-17T08:15:00.000Z",
      description: "הפסקת חשמל בעקבות פגיעה בקו מתח גבוה",
      eventStatusCode: 2,
      eventTypeCode: 4,
      eventTypeName: "תשתיות",
      locationName: "רחוב הרצל, ליד בית העם",
      locationLatitude: 32.3215,
      locationLongitude: 34.8543,
    },
    {
      eventCode: 1003,
      eventName: "חפץ חשוד",
      openingDate: "2025-04-18T16:45:00.000Z",
      description: "תיק ללא בעלים בשטח ציבורי",
      eventStatusCode: 1,
      eventTypeCode: 2,
      eventTypeName: "בטחוני",
      locationName: "גן המייסדים",
      locationLatitude: 32.3015,
      locationLongitude: 34.8701,
    },
    {
      eventCode: 1004,
      eventName: "תאונת דרכים",
      openingDate: "2025-04-19T11:20:00.000Z",
      description: "תאונה בין שני רכבים פרטיים, נפגעים במקום",
      eventStatusCode: 4,
      eventTypeCode: 3,
      eventTypeName: "רפואי",
      locationName: "צומת הכפר, כביש 553",
      locationLatitude: 32.2856,
      locationLongitude: 34.9012,
    },
    {
      eventCode: 1005,
      eventName: "אירוע חירום רפואי",
      openingDate: "2025-04-20T20:10:00.000Z",
      description: "קריאה לסיוע רפואי דחוף",
      eventStatusCode: 5,
      eventTypeCode: 3,
      eventTypeName: "רפואי",
      locationName: "מרכז הספורט",
      locationLatitude: 32.3122,
      locationLongitude: 34.8834,
    },
  ];

  useEffect(() => {
    fetchEvents();
  }, []);

  // Filter events based on search query, event type and date range
  useEffect(() => {
    let results = [...events];

    // Apply type filter if not set to 'all'
    if (filterType !== "all") {
      const typeCode = parseInt(filterType);
      results = results.filter((event) => event.eventTypeCode === typeCode);
    }

    // Apply date range filter if set
    if (startDate) {
      // Set time to beginning of day
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);

      // Set time to end of day
      const end = new Date(endDate || startDate);
      end.setHours(23, 59, 59, 999);

      results = results.filter((event) => {
        const eventDate = new Date(event.openingDate);
        return eventDate >= start && eventDate <= end;
      });
    }

    // Apply search filter if query exists
    if (searchQuery.trim() !== "") {
      results = results.filter(
        (event) =>
          (event.eventName && event.eventName.includes(searchQuery)) ||
          (event.description && event.description.includes(searchQuery)) ||
          (event.locationName && event.locationName.includes(searchQuery)) ||
          (event.eventCode && event.eventCode.toString().includes(searchQuery))
      );
    }

    setFilteredEvents(results);
  }, [events, searchQuery, filterType, startDate, endDate]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      // Try to fetch events from API
      const response = await fetch(`${API_URL}EventLog`, {
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
        console.log("No events found in API, using mock data");
        setEvents(mockEvents);
        setFilteredEvents(mockEvents);
      } else {
        // Try to parse the response as JSON
        try {
          const data = JSON.parse(text);
          console.log("Events fetched:", data);

          if (Array.isArray(data) && data.length > 0) {
            setEvents(data);
            setFilteredEvents(data);
          } else {
            console.log("Invalid events data, using mock data");
            setEvents(mockEvents);
            setFilteredEvents(mockEvents);
          }
        } catch (parseError) {
          console.error("Error parsing events JSON:", parseError);
          setEvents(mockEvents);
          setFilteredEvents(mockEvents);
        }
      }
      setError(null);
    } catch (error) {
      console.error("Error fetching events:", error);
      setError("לא ניתן לטעון את יומן האירועים כרגע");
      setEvents(mockEvents);
      setFilteredEvents(mockEvents);
    } finally {
      setLoading(false);
    }
  };

  const handleEventPress = (event) => {
    navigation.navigate("EventLogDetailsScreen", { event });
  };

  const handleSearchChange = (text) => {
    setSearchQuery(text);
  };

  const handleFilterChange = (type) => {
    setFilterType(type);
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleDateRangeSelect = (start, end) => {
    setStartDate(start);
    setEndDate(end);
  };

  const clearDateFilter = () => {
    setStartDate(null);
    setEndDate(null);
  };

  // Format date range for display
  const formatDateRange = () => {
    if (!startDate) return "";

    const formatDate = (date) => {
      return date.toLocaleDateString("he-IL", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    };

    if (!endDate || startDate.toDateString() === endDate.toDateString()) {
      return formatDate(startDate);
    }

    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  };

  // Header component with back button
  const HeaderComponent = React.memo(() => (
    <View style={styles.headerContainer}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Ionicons name="chevron-back" size={28} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerPlaceholder} />
        <Text style={styles.headerTitle}>יומן אירועים</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="חיפוש אירועים..."
          value={searchQuery}
          onChangeText={handleSearchChange}
          placeholderTextColor="#999"
          textAlign="right"
        />
        <Ionicons
          name="search"
          size={20}
          color="#666"
          style={styles.searchIcon}
        />
      </View>

      <View style={styles.filtersRow}>
        <TouchableOpacity
          style={[
            styles.dateFilterButton,
            startDate && styles.activeDateFilterButton,
          ]}
          onPress={() => setShowCalendar(true)}
        >
          <FontAwesome
            name="calendar"
            size={18}
            color={startDate ? "#fff" : "#666"}
          />
        </TouchableOpacity>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersScrollContent}
          // Reverse the scroll direction for RTL
          style={{ transform: [{ scaleX: -1 }] }}
        >
          {eventTypes.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.filterButton,
                filterType === type.id && { backgroundColor: type.color },
                // Reverse the button for RTL
                { transform: [{ scaleX: -1 }] },
              ]}
              onPress={() => handleFilterChange(type.id)}
            >
              <Text
                style={[
                  styles.filterText,
                  filterType === type.id && styles.activeFilterText,
                ]}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {startDate && (
        <View style={styles.dateFilterBadge}>
          <TouchableOpacity
            onPress={clearDateFilter}
            style={{ marginRight: 4 }}
          >
            <Ionicons name="close-circle" size={16} color="#666" />
          </TouchableOpacity>
          <Text style={styles.dateFilterText}>{formatDateRange()}</Text>
        </View>
      )}
    </View>
  ));

  if (loading && events.length === 0) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#9610FF" />
        <Text style={styles.loadingText}>טוען יומן אירועים...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={filteredEvents}
        renderItem={({ item }) => (
          <EventLogItem event={item} onPress={handleEventPress} />
        )}
        keyExtractor={(item) => item.eventCode.toString()}
        ListHeaderComponent={<HeaderComponent />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="event-note" size={60} color="#ccc" />
            <Text style={styles.emptyText}>{error || "לא נמצאו אירועים"}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchEvents}>
              <Text style={styles.retryText}>רענן</Text>
            </TouchableOpacity>
          </View>
        }
        refreshing={loading}
        onRefresh={fetchEvents}
        contentContainerStyle={filteredEvents.length === 0 ? { flex: 1 } : null}
      />

      <CalendarPicker
        visible={showCalendar}
        onClose={() => setShowCalendar(false)}
        onSelectRange={handleDateRangeSelect}
      />
    </SafeAreaView>
  );
}

// Calendar styles
const calendarStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    maxHeight: "80%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  monthYear: {
    fontSize: 16,
    fontWeight: "bold",
  },
  navButton: {
    padding: 5,
  },
  weekdaysRow: {
    flexDirection: "row",
    marginBottom: 10,
  },
  weekday: {
    flex: 1,
    textAlign: "center",
    fontWeight: "bold",
    color: "#666",
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 10,
  },
  dayCell: {
    width: "14.28%", // 7 days per week
    aspectRatio: 1, // Square cells
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    margin: 1,
  },
  dayText: {
    textAlign: "center",
  },
  selectedDay: {
    backgroundColor: "#9610FF33", // Light purple with transparency
  },
  startDay: {
    backgroundColor: "#9610FF",
  },
  endDay: {
    backgroundColor: "#9610FF",
  },
  selectedDayText: {
    color: "#000",
    fontWeight: "bold",
  },
  selectedDateInfo: {
    marginVertical: 10,
    alignItems: "center",
  },
  dateRangeText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#9610FF",
  },
  buttonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    flex: 1,
    margin: 5,
    alignItems: "center",
  },
  applyButton: {
    backgroundColor: "#9610FF",
  },
  clearButton: {
    backgroundColor: "#f0f0f0",
  },
  applyButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  clearButtonText: {
    color: "#666",
  },
});

// Main screen styles
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
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
  },
  headerPlaceholder: {
    width: 28, // Balance with back button
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
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  filtersRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end", // Align from right side
  },
  filtersScrollContent: {
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    marginHorizontal: 4,
  },
  filterText: {
    color: "#666",
    fontSize: 14,
    fontWeight: "500",
  },
  activeFilterText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  dateFilterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  activeDateFilterButton: {
    backgroundColor: "#9610FF",
  },
  dateFilterBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 15,
    alignSelf: "flex-end",
    marginTop: 8,
  },
  dateFilterText: {
    fontSize: 12,
    color: "#333",
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
    marginVertical: 16,
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
