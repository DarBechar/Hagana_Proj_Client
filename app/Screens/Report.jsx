import React, { useState } from "react";
import { SafeAreaView, Text, View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import Dropdown from "../Components/DropDownPickerComp";
import MapComp from "../Components/MapComp";
import FormInputComp from "../Components/FormInputComp";
import TagListComp from "../Components/TagListComp";
import PrimaryBtnComp from "../Components/PrimaryBtnComp";
import SecondaryBtnComp from "../Components/SecondaryBtnComp";
import User from "../Constants/Utils";
import {
  Ionicons,
  MaterialIcons,
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";
import { useNavigation } from '@react-navigation/native';



export default function Report() {

    
  const tagData = [
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
  ];
  const report = {
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

  };
  const [reportForm, setReportForm] = useState(report);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleDropdownToggle = (isOpen) => {
    setIsDropdownOpen(isOpen);
  };
  const handleSelectionChange = (selectedIds) => {
    setSelectedTags(selectedIds);
    console.log("Selected tags:", selectedIds);
  };

  const handleInputChange = (field, value) => {
    setReportForm((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };

  const handleSubmit = () => {
    console.log("Form submitted with data:", reportForm);
  };

  const handleCancel = () => {
    console.log("Form submission cancelled.");
  };
  // פה
  const [selectedReporter, setSelectedReporter] = useState("תושב");
  const reporterTypes = [
    "כיבוי והצלה",
    "מד\"א",
    "יו\"ר צוות",
    "משטרה",
    "תושב"
  ];

    // פונקציה לבחירת סוג המדווח
    const selectReporterType = (type) => {
      setSelectedReporter(type);
      // עדכון הפורם עם סוג המדווח הנבחר
      handleInputChange("ReporterType", type);
    };

    // חץ
    const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        horizontal={false}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}
      >
        <View style={[styles.section, isDropdownOpen && styles.nudgeDown]}>
          
          {/* חץ */}
          <View style={styles.headerRow}>
  <TouchableOpacity onPress={() => navigation.navigate("HomePage")} style={styles.backButton}>
    <Ionicons name="arrow-back" size={24} color="#000" />
  </TouchableOpacity>
</View>
          
          <Text style={styles.headerTitle}>יצירת דיווח חדש</Text>
          
          <FormInputComp
          text={"פרטי הדיווח"}
          type={"multiLine"}
          textAlign={"rtl"}
          placeholder={"דיווח מתושב על דליקה ועשן שנראה סמוך לבית העם"}
          inputChange={(value) => handleInputChange("ReportDescription", value)}
        />
                  <Text style={styles.title}>סוג דיווח</Text>
          <Dropdown onToggle={handleDropdownToggle}></Dropdown>
        </View>

        <View style={styles.section}>
          <Text style={styles.title}>מיקום הדיווח</Text>
          <View style={styles.container}>
            <MapComp></MapComp>
          </View>
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

          {/* הוספת חלק סוג המדווח */}
        <View style={styles.section}>
          <Text style={styles.title}>מי מדווח</Text>
          <View style={styles.radioContainer}>
            {reporterTypes.map((type) => (
              <TouchableOpacity
                key={type}
                style={styles.radioOption}
                onPress={() => selectReporterType(type)}
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


        </View>
        <FormInputComp
          text={"שם מלא של המדווח"}
          type={"singleLine"}
          textAlign={"rtl"}
          placeholder={"דניאל כהן"}
          inputChange={(value) => handleInputChange("ReporterName", value)}
        />
          <FormInputComp
          text={"מידע על הדיווח"}
          type={"singleLine"}
          textAlign={"rtl"}
          placeholder={"משה ואני נמצאים בזירה, חייבים להשתלט על הפאגו"}
          inputChange={(value) => handleInputChange("ReporterName", value)}
        />
        
        <FormInputComp
          text={"טלפון המדווח"}
          type={"singleLine"}
          textAlign={"rtl"}
          placeholder={"054-559871"}
          inputChange={(value) =>
            handleInputChange("ReporterPhoneNumber", value)
          }
        />
        <FormInputComp
          text={"הערות"}
          type={"multiLine"}
          textAlign={"rtl"}
          placeholder={"שהצוות ישמור על הגעה מסודרת ובטוחה לזירה"}
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
    marginBottom: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "right",
    marginTop: 10,
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
  map: {
    width: "100%",
    height: "100%",
  },
  btnSection: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },

  radioContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 15,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 15,
    marginBottom: 10,
    paddingHorizontal: 5, // ריווח פנימי

  },
  radioButtonOutline: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#9610FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    margin:5,
  },
  radioButtonInner: {
    height: 12,
    width: 12,
    borderRadius: 6,
    backgroundColor: '#9610FF',
  },
  radioText: {
    fontSize: 16,
    color: '#333',
    
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  
  backButton: {
    marginLeft: 10,
  },
  
});
