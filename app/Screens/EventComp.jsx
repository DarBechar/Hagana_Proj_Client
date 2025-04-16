import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  Text,
  View,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Dropdown from "../Components/DropDownPickerComp";
import MapComp from "../Components/MapComp";
import FormInputComp from "../Components/FormInputComp";
import TagListComp from "../Components/TagListComp";
import PrimaryBtnComp from "../Components/PrimaryBtnComp";
import SecondaryBtnComp from "../Components/SecondaryBtnComp";
import User from "../Constants/Utils";
import { API_URL } from "../Constants/Utils";

export default function EventComp() {
  const navigation = useNavigation();

  // Define states first before using them
  const [eventType, setEventType] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedEventStatus, setSelectedEventStatus] = useState(null);
  const [eventStatusTags, setEventStatusTags] = useState([]);
  const [athorityData, setAuthorityData] = useState([]);
  const [selectedAuthority, setSelectedAuthority] = useState(null);
  const [isEventStatusDataLoading, setIsEventStatusDataLoading] =
    useState(true);
  const [isAuthorityDataLoading, setIsAuthorityDataLoading] = useState(true);

  // Track validation errors
  const [errors, setErrors] = useState({
    eventTypeCode: false,
    EventDescription: false,
  });

  // Define event form with proper initial values
  const [eventForm, setEventForm] = useState({
    eventDate: new Date(),
    ReporterName: "",
    ReporterPhoneNumber: "",
    EventDescription: "",
    eventNotes: "",
    Longtitude: null,
    Latitude: null,
    LocationDescription: "",
    AuthorityCode: null,
    userID: User.id,
    eventTypeCode: null,
    EventStatus: null,
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

  const handleDropdownToggle = (isOpen) => {
    setIsDropdownOpen(isOpen);
  };

  const handleEventStatusChange = (selectedIds) => {
    handleInputChange("EventStatus", selectedIds);
    setSelectedEventStatus(selectedIds);
    console.log("Selected tags:", selectedIds);
  };

  const handleAthorityChange = (selectedIds) => {
    handleInputChange("AuthorityCode", selectedIds);
    setSelectedAuthority(selectedIds);
    console.log("Selected tags:", selectedIds);
  };

  const handleInputChange = (field, value) => {
    setEventForm((prevState) => ({
      ...prevState,
      [field]: value,
    }));

    // Clear error when field is filled
    if (
      field === "EventDescription" &&
      value.trim() !== "" &&
      errors.EventDescription
    ) {
      setErrors((prev) => ({
        ...prev,
        EventDescription: false,
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
      Longtitude: location.longitude,
      Latitude: location.latitude,
    }));
  };

  const handleEventTypeChange = (selectedEventType) => {
    setEventType(selectedEventType);
    setEventForm((prevState) => ({
      ...prevState,
      eventTypeCode: selectedEventType,
    }));

    // If there was an error before, clear it when user selects a value
    if (errors.eventTypeCode) {
      setErrors((prev) => ({
        ...prev,
        eventTypeCode: false,
      }));
    }

    console.log("Selected event type:", selectedEventType);
  };

  const handleSubmit = () => {
    // Reset previous errors
    setErrors({
      eventTypeCode: false,
      EventDescription: false,
    });

    // Check for required fields
    let hasErrors = false;
    const newErrors = {
      eventTypeCode: false,
      EventDescription: false,
    };

    if (!eventForm.eventTypeCode) {
      newErrors.eventTypeCode = true;
      hasErrors = true;
    }

    if (
      !eventForm.EventDescription ||
      eventForm.EventDescription.trim() === ""
    ) {
      newErrors.EventDescription = true;
      hasErrors = true;
    }

    // Update error state
    setErrors(newErrors);

    // If no errors, proceed with submission
    if (!hasErrors) {
      console.log("Form submitted with data:", eventForm);
      navigation.navigate("בית");
    } else {
      // Show alert to user
      Alert.alert("שגיאת טופס", "אנא מלא את כל השדות הנדרשים", [
        { text: "הבנתי", style: "default" },
      ]);
    }
  };

  const handleCancel = () => {
    console.log("Form submission cancelled.");
    navigation.navigate("בית");
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
          <View style={{ marginTop: 10 }}></View>
          <Text style={styles.title}>
            סוג אירוע
            {errors.eventTypeCode && <Text style={styles.errorText}> *</Text>}
          </Text>
          <Dropdown
            onToggle={handleDropdownToggle}
            onChangeValue={handleEventTypeChange}
            hasError={errors.eventTypeCode}
          />
          {errors.eventTypeCode && (
            <Text style={styles.errorMessage}>נא לבחור סוג אירוע</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.title}>מיקום האירוע</Text>
          <View style={styles.mapContainer}>
            <MapComp setLocation={handleLocationChange}></MapComp>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.title}>
            תיאור האירוע
            {errors.EventDescription && (
              <Text style={styles.errorText}> *</Text>
            )}
          </Text>
          <FormInputComp
            text={""}
            type={"multiLine"}
            textAlign={"right"}
            placeholder={"מה קרה? מה המצב? מה קורה עכשיו? מה צריך לעשות?"}
            inputChange={(value) =>
              handleInputChange("EventDescription", value)
            }
            hasError={errors.EventDescription}
          />
          {errors.EventDescription && (
            <Text style={styles.errorMessage}>נא להזין תיאור אירוע</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.title}>סטטוס</Text>
          {isEventStatusDataLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#8e44ad" />
              <Text style={styles.loadingText}>טוען סטטוסים...</Text>
            </View>
          ) : (
            <TagListComp
              tags={eventStatusTags}
              multiSelect={false}
              onSelectionChange={handleEventStatusChange}
              containerStyle={styles.tagContainer}
              activeColor="#8e44ad"
              inactiveColor="white"
            />
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.title}>דיווח לרשות</Text>
          {isAuthorityDataLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#8e44ad" />
              <Text style={styles.loadingText}>טוען רשויות...</Text>
            </View>
          ) : (
            <TagListComp
              tags={athorityData}
              multiSelect={false}
              onSelectionChange={handleAthorityChange}
              containerStyle={styles.tagContainer}
              activeColor="#8e44ad"
              inactiveColor="white"
            />
          )}
        </View>
        <View style={styles.section}>
          <Text style={styles.title}>שם המדווח</Text>
          <FormInputComp
            text={""}
            type={"singleLine"}
            textAlign={"right"}
            placeholder={"אברהם אברהמי"}
            inputChange={(value) => handleInputChange("ReporterName", value)}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.title}>טלפון המדווח</Text>
          <FormInputComp
            text={""}
            type={"singleLine"}
            textAlign={"right"}
            placeholder={"xxx-xxxxxxx"}
            inputChange={(value) =>
              handleInputChange("ReporterPhoneNumber", value)
            }
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.title}>הערות</Text>
          <FormInputComp
            text={""}
            type={"multiLine"}
            textAlign={"right"}
            placeholder={"האם יש משהו נוסף שצריך לדעת על האירוע הזה?"}
            inputChange={(value) => handleInputChange("ReportNotes", value)}
          />
        </View>

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
    backgroundColor: "#FFFFFF",
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
    marginTop: 10,
    fontSize: 18,
    fontWeight: "semibold",
    marginBottom: 10,
    textAlign: "right",
  },
  selectedText: {
    marginTop: 10,
    fontSize: 16,
    color: "#007BFF",
  },
  scrollView: {
    flex: 1,
    width: "100%",
  },
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
    marginTop: 20,
  },
  map: {
    width: "100%",
    height: "100%",
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
    marginBottom: 40,
  },
  errorText: {
    color: "red",
    fontWeight: "bold",
  },
  errorMessage: {
    color: "red",
    textAlign: "right",
    marginTop: 5,
    marginRight: 10,
    fontSize: 12,
  },
  loadingContainer: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#666",
    fontSize: 14,
  },
});
