
import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  Text,
  View,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

import Dropdown from "../Components/DropDownPickerComp";
import MapComp from "../Components/MapComp";
import FormInputComp from "../Components/FormInputComp";
import TagListComp from "../Components/TagListComp";
import PrimaryBtnComp from "../Components/PrimaryBtnComp";
import SecondaryBtnComp from "../Components/SecondaryBtnComp";
import User from "../Constants/Utils";

export default function EventComp() {

  const navigation = useNavigation();

  const [eventType, setEventType] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedEventStatus, setSelectedEventStatus] = useState(null);
  const [eventStatusTags, setEventStatusTags] = useState([]);
  const [athorityData, setAuthorityData] = useState([]);
  const [selectedAuthority, setSelectedAuthority] = useState(null);
  const [isEventStatusDataLoading, setIsEventStatusDataLoading] =
    useState(true);
  const [isAuthorityDataLoading, setIsAuthorityDataLoading] = useState(true);
  const [eventName, setEventName] = useState("");

  // Track validation errors
  const [errors, setErrors] = useState({
    eventTypeCode: false,
    description: false,
  });

  const [eventForm, setEventForm] = useState({
    eventName: "",
    openingDate: new Date(),
    description: "",
    attachedReports: [],
    creatorUserID: User.id,
    eventStatusCode: null,
    isActive: true,
    activatedAt: new Date(),
    deactivatedAt: null,
    locationLatitude: null,
    locationLongitude: null,
    locationName: "",
    affectedAreaRadius: 0,
  });

  // Fetch tag data from the server when component mounts
  useEffect(() => {
    fetchEventStatus();
    fetchAthorities();
  }, []);

  const fetchEventStatus = async () => {
    setIsEventStatusDataLoading(true);
    try {
      const response = await fetch(`${API_URL}EventStatus`, {
        method: "GET",
        headers: new Headers({
          "Content-Type": "application/json; charset=UTF-8",
          Accept: "application/json; charset=UTF-8",
        }),
      });

      if (!response.ok) {
        throw new Error(`Network response error: ${response.status}`);
      }

      const result = await response.json();

      if (result && result.length > 0) {
        console.log("First event status item:", JSON.stringify(result[0]));
      }

      const formattedTags = result.map((item) => ({
        id: String(item.statusCode),
        label: item.statusName,
        initialSelected: false,
      }));

      setEventStatusTags(formattedTags);
      console.log("Tag data loaded:", formattedTags);
    } catch (error) {
      console.error("Error fetching event status tags:", error);

      Alert.alert(
        "שגיאת התחברות",
        "לא ניתן לטעון את רשימת הסטטוסים. משתמש בערכים מקומיים.",
        [{ text: "הבנתי", style: "default" }]
      );
    } finally {
      setIsEventStatusDataLoading(false);
    }

  };
  const [reportForm, setReportForm] = useState(report);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleDropdownToggle = (isOpen) => {
    setIsDropdownOpen(isOpen);
  };

  const handleSelectionChange = (selectedIds) => {
    setSelectedTags(selectedIds);
    console.log("Selected tags:", selectedIds);


  const handleEventStatusChange = (selectedIds) => {
    setEventForm((prevState) => ({
      ...prevState,
      eventStatusCode: selectedIds,
    }));
    setSelectedEventStatus(selectedIds);
    console.log("Selected status:", selectedIds);
  };

  const handleAthorityChange = (selectedIds) => {
    setEventForm((prevState) => ({
      ...prevState,
      authorityCode: selectedIds,
    }));
    setSelectedAuthority(selectedIds);
    console.log("Selected authority:", selectedIds);

  };

  const handleInputChange = (field, value) => {
    setReportForm((prevState) => ({
      ...prevState,
      [field]: value,
    }));

  };

  const handleSubmit = () => {
    console.log("Form submitted with data:", reportForm);


    // Clear error when field is filled
    if (field === "description" && value.trim() !== "" && errors.description) {
      setErrors((prev) => ({
        ...prev,
        description: false,
      }));
    }
  };

  const fetchAthorities = async () => {
    setIsAuthorityDataLoading(true);
    try {
      const response = await fetch(`${API_URL}Authority`, {
        method: "GET",
        headers: new Headers({
          "Content-Type": "application/json; charset=UTF-8",
          Accept: "application/json; charset=UTF-8",
        }),
      });

      if (!response.ok) {
        throw new Error(`Network response error: ${response.status}`);
      }

      const result = await response.json();

      if (result && result.length > 0) {
        console.log("First event status item:", JSON.stringify(result[0]));
      }

      const formattedAthority = result.map((item) => ({
        id: String(item.authorityCode),
        label: item.authorityName,
        initialSelected: false,
      }));

      setAuthorityData(formattedAthority);
      console.log("Tag data loaded:", formattedAthority);
    } catch (error) {
      console.error("Error fetching event status tags:", error);

      Alert.alert("שגיאת התחברות", "לא ניתן לטעון את רשימת הרשויות .", [
        { text: "הבנתי", style: "default" },
      ]);
    } finally {
      setIsAuthorityDataLoading(false);
    }
  };

  const handleLocationChange = (location) => {
    setEventForm((prevState) => ({
      ...prevState,
      locationLongitude: location.longitude,
      locationLatitude: location.latitude,
      // Keep these for backward compatibility
      Longtitude: location.longitude,
      Latitude: location.latitude,
    }));
  };

  const handleEventTypeChange = (selectedEventType, selectedLabel) => {
    let NewEventName = `${selectedLabel} | ${Date.now()}`;
    setEventName(NewEventName);
    setEventType(selectedEventType);
    setEventForm((prevState) => ({
      ...prevState,
      eventTypeCode: selectedEventType,
      eventName: NewEventName, // Also set this on the form
    }));

    // If there was an error before, clear it when user selects a value
    if (errors.eventTypeCode) {
      setErrors((prev) => ({
        ...prev,
        eventTypeCode: false,
      }));
    }

    console.log(
      "Selected event type:",
      selectedEventType,
      "Label:",
      selectedLabel
    );
  };

  // Function to test server connection - useful for debugging
  const testServerConnection = async () => {
    try {
      // Adjust the URL based on platform
      let url = "https://localhost:7036/api/Event";
      if (Platform.OS === "android") {
        url = "https://10.0.2.2:7036/api/Event";
      }

      console.log("Testing connection to:", url);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        console.log("Successfully connected to the server!");
        Alert.alert(
          "Connection Success",
          "Successfully connected to the server"
        );
      } else {
        console.error("Server returned an error:", response.status);
        Alert.alert(
          "Connection Error",
          `Server returned status: ${response.status}`
        );
      }
    } catch (error) {
      console.error("Failed to connect to the server:", error);
      Alert.alert(
        "Connection Failed",
        `Could not connect to the server.\nError: ${error.message}\n\nMake sure your server is running and accessible.`
      );
    }
  };

  const handleSubmit = () => {
    // Reset previous errors
    setErrors({
      eventTypeCode: false,
      description: false,
    });

    // Check for required fields
    let hasErrors = false;
    const newErrors = {
      eventTypeCode: false,
      description: false,
    };

    if (!eventForm.eventTypeCode) {
      newErrors.eventTypeCode = true;
      hasErrors = true;
    }

    // This check now looks at the description field directly
    if (!eventForm.description || eventForm.description.trim() === "") {
      newErrors.description = true;
      hasErrors = true;
    }

    // Update error state
    setErrors(newErrors);

    // If no errors, proceed with submission
    if (!hasErrors) {
      // Adjust the URL based on platform
      let apiUrl = "https://localhost:7036/api/Event";
      if (Platform.OS === "android") {
        apiUrl = "https://10.0.2.2:7036/api/Event";
      }

      const eventPayload = {
        eventCode: 0,
        eventName: eventName || "New Event",
        openingDate: new Date().toISOString(),
        description: eventForm.description, // Fixed: Use the correct field name
        attachedReports: [],
        creatorUserID: parseInt(User.id),
        eventStatusCode: eventForm.eventStatusCode,
        isActive: true,
        activatedAt: new Date().toISOString(),
        deactivatedAt: null,
        locationLatitude: eventForm.locationLatitude,
        locationLongitude: eventForm.locationLongitude,
        locationName: eventForm.locationName || "Unknown",
        affectedAreaRadius: 0,
      };

      console.log("Sending event payload:", eventPayload);

      fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(eventPayload),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Network response error: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          console.log("Event created successfully:", data);
          Alert.alert("האירוע נוצר בהצלחה", "האירוע שלך נוצר בהצלחה", [
            {
              text: "אוקי",
              onPress: () => navigation.navigate("בית"),
            },
          ]);
        })
        .catch((error) => {
          console.error("Error creating event:", error);
          Alert.alert(
            "שגיאה",
            "לא ניתן ליצור את האירוע. אנא נסה שוב מאוחר יותר.",
            [{ text: "אוקי", style: "default" }]
          );
        });
    } else {
      // Show alert to user
      Alert.alert("שגיאת טופס", "אנא מלא את כל השדות הנדרשים", [
        { text: "הבנתי", style: "default" },
      ]);
    }

  };

  const handleCancel = () => {
    console.log("Form submission cancelled.");
  };
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        horizontal={false}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}
      >
        <View style={[styles.section, isDropdownOpen && styles.nudgeDown]}>
          <Text style={styles.headerTitle}>יצירת אירוע חדש</Text>
          <Dropdown onToggle={handleDropdownToggle}></Dropdown>
        </View>
        <View style={styles.section}>
          <Text style={styles.title}>מיקום האירוע</Text>
          <View style={styles.container}>
            <MapComp></MapComp>
          </View>
        </View>


        <View style={styles.section}>
          <Text style={styles.title}>
            תיאור האירוע
            {errors.description && <Text style={styles.errorText}> *</Text>}
          </Text>
          <FormInputComp
            text={""}
            type={"multiLine"}
            textAlign={"right"}
            placeholder={"מה קרה? מה המצב? מה קורה עכשיו? מה צריך לעשות?"}
            inputChange={(value) => handleInputChange("description", value)}
            hasError={errors.description}
          />
          {errors.description && (
            <Text style={styles.errorMessage}>נא להזין תיאור אירוע</Text>
          )}
        </View>


        <View style={styles.section}>
          <Text style={styles.title}>סטטוס</Text>
          <TagListComp
            tags={tagData}
            multiSelect={true}
            onSelectionChange={handleSelectionChange}
            containerStyle={styles.tagContainer}
            activeColor="#8e44ad"
            inactiveColor="white"
          />
        </View>
        <FormInputComp
          text={"שם המדווח"}
          type={"singleLine"}
          textAlign={"rtl"}
          placeholder={"אברהם אברהמי"}
          inputChange={(value) => handleInputChange("ReporterName", value)}
        />
        <FormInputComp
          text={"טלפון המדווח"}
          type={"singleLine"}
          textAlign={"rtl"}
          placeholder={"xxx-xxxxxxx"}
          inputChange={(value) =>
            handleInputChange("ReporterPhoneNumber", value)
          }
        />
        <FormInputComp
          text={"הערות"}
          type={"multiLine"}
          textAlign={"rtl"}
          placeholder={"האם יש משהו נוסף שצריך לדעת על האירוע הזה?"}
          inputChange={(value) => handleInputChange("ReportNotes", value)}
        />
        <View style={styles.btnSection}>
          <SecondaryBtnComp
            text={"ביטול"}
            type={"cancel"}
            onPress={handleCancel}
          />
          <PrimaryBtnComp text={"יצירת דיווח"} onPress={handleSubmit} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 20,
    padding: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    borderBottomWidth: 1,
  },
  backButton: {
    marginRight: 10,
  },
  headerTitleContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  logo: {
    width: 24,
    height: 24,
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "semibold",
    marginBottom: 20,
    textAlign: "right",
  },
  selectedText: {
    marginTop: 10,
    fontSize: 16,
    color: "#007BFF",
  },
  scrollView: { flex: 1, width: "100%" },
  section: {
    width: "100%",
    padding: 10,
  },
  scrollViewContent: {
    flexGrow: 1,
    width: "100%",
    alignItems: "stretch",
  },
  nudgeDown: {
    marginTop: 20, // Adjust this value as needed
  },

  mapContainer: {
    height: 400,
    marginBottom: 80,

  },
  btnSection: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
});
