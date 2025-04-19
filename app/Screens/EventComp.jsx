import React, { useState, useEffect, useRef } from "react";
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
import User, { API_URL } from "../Constants/Utils";

export default function EventComp() {
  //navigation
  const navigation = useNavigation();
  //refs
  const mapRef = useRef(null);
  const dropdownRef = useRef(null);

  //state
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

  //fetch data
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

  //handlers
  const handleDropdownToggle = (isOpen) => {
    setIsDropdownOpen(isOpen);
  };

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
    setEventForm((prevState) => ({
      ...prevState,
      [field]: value,
    }));

    // Clear error when field is filled
    if (field === "description" && value.trim() !== "" && errors.description) {
      setErrors((prev) => ({
        ...prev,
        description: false,
      }));
    }
  };

  const handleLocationChange = (location) => {
    setEventForm((prevState) => ({
      ...prevState,
      locationLongitude: location.longitude,
      locationLatitude: location.latitude,
    }));
  };

  const handleEventTypeChange = (selectedEventType, selectedLabel) => {
    let NewEventName = `${selectedLabel} | ${Date.now()}`;
    setEventName(NewEventName);
    setEventType(selectedEventType);
    setEventForm((prevState) => ({
      ...prevState,
      eventTypeCode: selectedEventType,
      eventName: NewEventName,
    }));

    // If there was an error before, clear it when user selects a value
    if (errors.eventTypeCode) {
      setErrors((prev) => ({
        ...prev,
        eventTypeCode: false,
      }));
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

    if (!eventForm.description || eventForm.description.trim() === "") {
      newErrors.description = true;
      hasErrors = true;
    }

    setErrors(newErrors);

    // If no errors, proceed with submission
    if (!hasErrors) {
      const apiUrl = `${API_URL}Event`;

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
          resetForm();
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
    resetForm();
    navigation.navigate("בית");
  };

  const resetForm = () => {
    // Reset all form fields to initial values
    setEventType(null);
    setSelectedEventStatus(null);
    setSelectedAuthority(null);
    setEventName("");

    // Reset the form state
    setEventForm({
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
      ReporterName: "",
      ReporterPhoneNumber: "",
      ReportNotes: "",
    });

    // Reset errors
    setErrors({
      eventTypeCode: false,
      description: false,
    });
    if (mapRef.current) {
      mapRef.current.resetMap();
    }
    if (dropdownRef.current) {
      dropdownRef.current.resetDropdown();
    }
    // Force TagListComp components to reset by updating their data
    if (eventStatusTags.length > 0) {
      const resetStatusTags = eventStatusTags.map((tag) => ({
        ...tag,
        initialSelected: false,
      }));
      setEventStatusTags(resetStatusTags);
    }

    if (athorityData.length > 0) {
      const resetAuthorityData = athorityData.map((tag) => ({
        ...tag,
        initialSelected: false,
      }));
      setAuthorityData(resetAuthorityData);
    }
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
            ref={dropdownRef}
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
            <MapComp ref={mapRef} setLocation={handleLocationChange}></MapComp>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.title}>תאר את מיקום האירוע</Text>
          <FormInputComp
            text={""}
            type={"singleLine"}
            textAlign={"right"}
            placeholder={"בית העם"}
            inputChange={(value) => handleInputChange("locationName", value)}
            value={eventForm.locationName}
          />
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
            value={eventForm.description}
            hasError={errors.description}
          />
          {errors.description && (
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
            value={eventForm.ReporterName}
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
            value={eventForm.ReporterPhoneNumber}
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
            value={eventForm.ReportNotes}
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
    marginRight: 10,
    marginTop: 5,
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
    padding: 5,
    marginVertical: 3,
  },
  scrollViewContent: {
    flexGrow: 1,
    width: "100%",
    alignItems: "stretch",
  },
  nudgeDown: {
    marginTop: 20,
  },
  mapContainer: {
    height: 400,
    marginBottom: 80,
  },
  btnSection: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 15,
    marginBottom: 20,
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
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 5,
    color: "#666",
    fontSize: 14,
  },
});
