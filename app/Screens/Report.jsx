import React, { useState, useEffect, useRef } from "react";
import {
  SafeAreaView,
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
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

export default function Report() {
  // Navigation
  const navigation = useNavigation();

  // Refs
  const mapRef = useRef(null);
  const dropdownRef = useRef(null);

  // State variables
  const [reportForm, setReportForm] = useState({
    reportDate: new Date(),
    ReporterName: "",
    ReporterPhoneNumber: "",
    ReportDescription: "",
    ReportNotes: "",
    Longtitude: null,
    Latitude: null,
    LocationDescription: "",
    AuthorityCode: null,
    userID: User.id,
    eventTypeCode: null,
    ReporterType: "תושב",
  });

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedTagIds, setSelectedTagIds] = useState([]);
  const [tagData, setTagData] = useState([
    { id: "1", label: "כוחות בדרך", initialSelected: false },
    { id: "2", label: "אין נפגעים", initialSelected: false },
    { id: "3", label: "יש נפגעים", initialSelected: false },
    { id: "4", label: "אירוע משוכב", initialSelected: false },
    { id: "5", label: "פינוי מהנדס", initialSelected: false },
    { id: "6", label: "צווי הדס", initialSelected: false },
    { id: "7", label: "הכלילה", initialSelected: false },
    { id: "8", label: "הסרימת אתר הדיעה", initialSelected: false },
    {
      id: "9",
      label: "תחילת איטרטיבים מסביכם גדר שלי",
      initialSelected: false,
    },
    { id: "10", label: "עדיפות תנועה", initialSelected: false },
    { id: "11", label: "משאבים חסרים", initialSelected: false },
  ]);
  const [selectedReporter, setSelectedReporter] = useState("תושב");
  const [athorityData, setAuthorityData] = useState([]);
  const [selectedAuthority, setSelectedAuthority] = useState(null);
  const [isAuthorityDataLoading, setIsAuthorityDataLoading] = useState(true);
  const [errors, setErrors] = useState({
    eventTypeCode: false,
    ReportDescription: false,
  });

  const reporterTypes = ["כיבוי והצלה", 'מד"א', 'יו"ר צוות', "משטרה", "תושב"];

  // Fetch data
  useEffect(() => {
    fetchAthorities();
  }, []);

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
        console.log("First authority item:", JSON.stringify(result[0]));
      }

      const formattedAthority = result.map((item) => ({
        id: String(item.authorityCode),
        label: item.authorityName,
        initialSelected: false,
      }));

      setAuthorityData(formattedAthority);
      console.log("Authority data loaded:", formattedAthority);
    } catch (error) {
      console.error("Error fetching authorities:", error);

      Alert.alert("שגיאת התחברות", "לא ניתן לטעון את רשימת הרשויות.", [
        { text: "הבנתי", style: "default" },
      ]);
    } finally {
      setIsAuthorityDataLoading(false);
    }
  };

  // Handlers
  const handleDropdownToggle = (isOpen) => {
    setIsDropdownOpen(isOpen);
  };

  const handleSelectionChange = (selectedIds) => {
    setSelectedTagIds(selectedIds);
    console.log("Selected tags:", selectedIds);
  };

  const handleAuthorityChange = (selectedIds) => {
    setReportForm((prevState) => ({
      ...prevState,
      AuthorityCode: selectedIds,
    }));
    setSelectedAuthority(selectedIds);
    console.log("Selected authority:", selectedIds);
  };

  const handleInputChange = (field, value) => {
    setReportForm((prevState) => ({
      ...prevState,
      [field]: value,
    }));

    // Clear error when field is filled
    if (
      field === "ReportDescription" &&
      value.trim() !== "" &&
      errors.ReportDescription
    ) {
      setErrors((prev) => ({
        ...prev,
        ReportDescription: false,
      }));
    }
  };

  const handleLocationChange = (location) => {
    setReportForm((prevState) => ({
      ...prevState,
      Longtitude: location.longitude,
      Latitude: location.latitude,
    }));
  };

  const handleReporterTypeChange = (type) => {
    setSelectedReporter(type);
    handleInputChange("ReporterType", type);
  };

  const handleEventTypeChange = (selectedEventType) => {
    setReportForm((prevState) => ({
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
      ReportDescription: false,
    });

    // Check for required fields
    let hasErrors = false;
    const newErrors = {
      eventTypeCode: false,
      ReportDescription: false,
    };

    if (!reportForm.eventTypeCode) {
      newErrors.eventTypeCode = true;
      hasErrors = true;
    }

    if (
      !reportForm.ReportDescription ||
      reportForm.ReportDescription.trim() === ""
    ) {
      newErrors.ReportDescription = true;
      hasErrors = true;
    }

    setErrors(newErrors);

    // If no errors, proceed with submission
    if (!hasErrors) {
      const apiUrl = `${API_URL}Report`; // Adjust endpoint as needed

      const reportPayload = {
        reportCode: 0,
        reportDate: new Date().toISOString(),
        reporterName: reportForm.ReporterName || "Anonymous",
        reporterPhoneNumber: reportForm.ReporterPhoneNumber || "Unknown",
        reportDescription: reportForm.ReportDescription,
        reportNotes: reportForm.ReportNotes || "",
        locationLongitude: reportForm.Longtitude,
        locationLatitude: reportForm.Latitude,
        locationDescription: reportForm.LocationDescription || "Unknown",
        authorityCode: reportForm.AuthorityCode,
        userID: parseInt(User.id),
        eventTypeCode: reportForm.eventTypeCode,
        reporterType: reportForm.ReporterType,
        tags: selectedTagIds,
      };

      console.log("Submitting report:", reportPayload);

      // Uncomment when API is ready
      /* 
      fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(reportPayload),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Network response error: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          console.log("Report created successfully:", data);
          resetForm();
          Alert.alert("הדיווח נוצר בהצלחה", "הדיווח שלך נוצר בהצלחה", [
            {
              text: "אוקי",
              onPress: () => navigation.navigate("בית"),
            },
          ]);
        })
        .catch((error) => {
          console.error("Error creating report:", error);
          Alert.alert(
            "שגיאה",
            "לא ניתן ליצור את הדיווח. אנא נסה שוב מאוחר יותר.",
            [{ text: "אוקי", style: "default" }]
          );
        });
      */

      // For testing without API
      Alert.alert("הדיווח נוצר בהצלחה", "הדיווח שלך נוצר בהצלחה", [
        {
          text: "אוקי",
          onPress: () => {
            resetForm();
            navigation.navigate("בית");
          },
        },
      ]);
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
    setSelectedTagIds([]);
    setSelectedAuthority(null);
    setSelectedReporter("תושב");

    // Reset the form state
    setReportForm({
      reportDate: new Date(),
      ReporterName: "",
      ReporterPhoneNumber: "",
      ReportDescription: "",
      ReportNotes: "",
      Longtitude: null,
      Latitude: null,
      LocationDescription: "",
      AuthorityCode: null,
      userID: User.id,
      eventTypeCode: null,
      ReporterType: "תושב",
    });

    // Reset errors
    setErrors({
      eventTypeCode: false,
      ReportDescription: false,
    });

    // Reset components with refs
    if (mapRef.current) {
      mapRef.current.resetMap && mapRef.current.resetMap();
    }
    if (dropdownRef.current) {
      dropdownRef.current.resetDropdown && dropdownRef.current.resetDropdown();
    }

    // Reset TagListComp components
    const resetTags = tagData.map((tag) => ({
      ...tag,
      initialSelected: false,
    }));
    setTagData(resetTags);

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
          <Text style={styles.headerTitle}>יצירת דיווח חדש</Text>
          <View style={{ marginTop: 10 }}></View>
          <Text style={styles.title}>
            סוג דיווח
            {errors.eventTypeCode && <Text style={styles.errorText}> *</Text>}
          </Text>
          <Dropdown
            ref={dropdownRef}
            onToggle={handleDropdownToggle}
            onChangeValue={handleEventTypeChange}
            hasError={errors.eventTypeCode}
          />
          {errors.eventTypeCode && (
            <Text style={styles.errorMessage}>נא לבחור סוג דיווח</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.title}>
            פרטי הדיווח
            {errors.ReportDescription && (
              <Text style={styles.errorText}> *</Text>
            )}
          </Text>
          <FormInputComp
            text={""}
            type={"multiLine"}
            textAlign={"right"}
            placeholder={"תאר את הדיווח בפירוט"}
            inputChange={(value) =>
              handleInputChange("ReportDescription", value)
            }
            value={reportForm.ReportDescription}
            hasError={errors.ReportDescription}
          />
          {errors.ReportDescription && (
            <Text style={styles.errorMessage}>נא להזין תיאור דיווח</Text>
          )}
        </View>
        <View style={styles.section}>
          <Text style={styles.title}>מיקום האירוע</Text>
          <View style={styles.mapContainer}>
            <MapComp ref={mapRef} setLocation={handleLocationChange}></MapComp>
          </View>
        </View>
        <View style={{ marginBottom: 80 }}></View>

        <View style={styles.section}>
          <Text style={styles.title}>תאר את מיקום האירוע</Text>
          <FormInputComp
            text={""}
            type={"singleLine"}
            textAlign={"right"}
            placeholder={"למשל: בית העם, כיכר המושב"}
            inputChange={(value) =>
              handleInputChange("LocationDescription", value)
            }
            value={reportForm.LocationDescription}
          />
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
              onSelectionChange={handleAuthorityChange}
              containerStyle={styles.tagContainer}
              activeColor="#8e44ad"
              inactiveColor="white"
            />
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.title}>מי מדווח</Text>
          <View style={styles.radioContainer}>
            {reporterTypes.map((type) => (
              <TouchableOpacity
                key={type}
                style={styles.radioOption}
                onPress={() => handleReporterTypeChange(type)}
              >
                <View style={styles.radioButtonOutline}>
                  {selectedReporter === type && (
                    <View style={styles.radioButtonInner} />
                  )}
                </View>
                <Text style={styles.radioText}>{type}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.title}>שם המדווח</Text>
          <FormInputComp
            text={""}
            type={"singleLine"}
            textAlign={"right"}
            placeholder={"שם מלא"}
            value={reportForm.ReporterName}
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
            value={reportForm.ReporterPhoneNumber}
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
            placeholder={"האם יש משהו נוסף שצריך לדעת על הדיווח הזה?"}
            value={reportForm.ReportNotes}
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
    marginBottom: 20,
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
  radioContainer: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    alignItems: "center",
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  radioOption: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginLeft: 15,
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  radioButtonOutline: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#9610FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    margin: 5,
  },
  radioButtonInner: {
    height: 12,
    width: 12,
    borderRadius: 6,
    backgroundColor: "#9610FF",
  },
  radioText: {
    fontSize: 16,
    color: "#333",
  },
  tagContainer: {
    marginVertical: 10,
  },
});
