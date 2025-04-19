import React, { useState, useEffect  } from "react";
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



export default function FilledReport() {


  const report = {
    reportDate: new Date(),
    ReporterName: "דניאל כהן",
    ReporterPhoneNumber: "054-559871",
    ReportDescription: "דיווח מתושב על דליקה ועשן שנראה סמוך לבית העם",
    ReportNotes: "שהצוות ישמור על הגעה מסודרת ובטוחה לזירה",
    ReportInfo: "משה ואני נמצאים בזירה, חייבים להשתלט על הפאגו",
    Longtitude: null,
    Latitude: null,
    LocationDescription: "בית העם 5, עולש, ישראל",
    AuthorityCode: null,
    userID: User.id,
    eventTypeCode: null,
    ReporterType: "תושב", 
    ReportStatus: " - יש פצועים",
    ReportType: "שריפה",
    LiveUpdates1: "מכבי אש הגיעו לזירה",
    LiveUpdates2: "נגמרו המזרקים",
  };

  // const ReportStatuses = [
  //   "- יש פצועים",
  //   "- חסימת אזור הדיווח",
  //   "- תמיכה מיישובים סמוכים נדרשת",
  // ]
  
  
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
  const reporterTypes = [
    "כיבוי והצלה",
    "מד\"א",
    "יו\"ר צוות",
    "משטרה",
    "תושב"
  ];

 

    // חץ
    const navigation = useNavigation();

    //שעה
 // הוספת סטייט לשעה הנוכחית
 const [currentTime, setCurrentTime] = useState(new Date());
  
 // עדכון השעה כל דקה
//  useEffect(() => {
//    const timer = setInterval(() => {
//      setCurrentTime(new Date());
//    }, 60000);
   
//    return () => clearInterval(timer);
//  }, []);
 
 // פונקציה לפורמט של השעה
 const formatTime = (date) => {
   let hours = date.getHours();
   const minutes = date.getMinutes().toString().padStart(2, '0');
   const ampm = hours >= 12 ? 'PM' : 'AM';
   return `${ampm} ${hours}:${minutes}`;
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
          
          {/* חץ */}
          <View style={styles.headerRow}>
  <TouchableOpacity onPress={() => navigation.navigate("HomePage")} style={styles.backButton}>
    <Ionicons name="arrow-back" size={24} color="#000" />
  </TouchableOpacity>
</View>

        <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>דיווח #707</Text>

         <MaterialCommunityIcons name="fire" size={28} color="#d64e4e" style={styles.iconStyle} />
          </View>


      <View style={styles.infoContainer}>
      <Text style={styles.infoTitle}>פרטי הדיווח</Text>
       <Text style={styles.infoSubtitle}>{report.ReportDescription}</Text>
       <View style={styles.separator} />
      </View>
      

        <View style={styles.infoContainer}>
      <Text style={styles.infoTitle}>סוג דיווח</Text>
       <Text style={styles.infoSubtitle}>{report.ReportType}</Text>
       <View style={styles.separator} />
      </View>



    <View style={styles.infoContainer}>
  <Text style={styles.infoTitle}>מיקום הדיווח</Text>
  <View style={styles.locationRow}>
    <MaterialCommunityIcons name="waze" size={30} color="black" style={styles.wazeStyle} />
    <Text style={styles.infoSubtitle}>{report.LocationDescription}</Text>
  </View>
  <View style={styles.separator} />
</View>

    
    
        <View style={styles.infoContainer}>
      <Text style={styles.infoTitle}>סטטוס</Text>
       <Text style={styles.infoSubtitle}>{report.ReportStatus}</Text>
       <View style={styles.separator} />
      </View>

<View style={styles.infoContainer}>
  <Text style={styles.infoTitle}>שם המדווח</Text>
  <Text style={styles.infoSubtitle}>{report.ReporterType}</Text>
  <Text style={styles.infoSubtitle}>{report.ReporterName}</Text>
  <View style={styles.locationRow}>
  <MaterialCommunityIcons name="phone" size={30} color="black" style={styles.phoneStyle} />
   <Text style={styles.phoneNumberSub}>{report.ReporterPhoneNumber}</Text>
 </View>
  <View style={styles.separator} />
  
  
         <View style={styles.section}>
          <Text style={styles.infoTitle}>מיקום על גבי מפה</Text>
            <MapComp></MapComp>
        </View>
        <View style={styles.separator} />
        </View>

     <View style={styles.infoContainer}>
      <Text style={styles.infoTitle}>מידע על דיווח</Text>
       <Text style={styles.infoSubtitle}>{report.ReportInfo}</Text>
       <View style={styles.separator} />
      </View>
       

        <View style={styles.infoContainer}>
      <Text style={styles.infoTitle}>הערות</Text>
       <Text style={styles.infoSubtitle}>{report.ReportNotes}</Text>
       <View style={styles.separator} />
      </View>

      
      {/* <View style={styles.infoContainer}>
  <View style={styles.updatesHeaderRow}>
    <View style={styles.timeContainer}>
    </View>
    <Text style={styles.infoTitle}>עדכונים מהשטח</Text>
  </View>
  <View style={styles.updateItem}>
  <Text style={styles.timeLabel}>שעה:</Text>
  <Text style={styles.timeValue}>{formatTime(currentTime)}</Text>
    <Text style={styles.infoSubtitle}>{report.LiveUpdates1}</Text>
  </View>
  <View style={styles.HalfSeparator} />
  <View style={styles.updateItem}>
  <Text style={styles.timeLabel}>שעה:</Text>
  <Text style={styles.timeValue}>{formatTime(currentTime)}</Text>
    <Text style={styles.infoSubtitle}>{report.LiveUpdates2}</Text>
  </View>
  <View style={styles.separator} />
</View> */}


<View style={styles.infoContainer}>
  <Text style={styles.infoTitle}>עדכונים מהשטח</Text>
  
  {/* עדכון ראשון */}
  <View style={styles.updateRow}>
    <View style={styles.updateContent}>
    <View style={styles.timeContainer}>
      <Text style={styles.timeLabel}>שעה:</Text>
      <Text style={styles.timeValue}>{formatTime(currentTime)}</Text>
    </View>
    </View>
    <Text style={styles.infoSubtitle}>{report.LiveUpdates1}</Text>
  </View>
  <View style={styles.HalfSeparator} />
  
  {/* עדכון שני */}
  <View style={styles.updateRow}>
    <View style={styles.updateContent}>
    <View style={styles.timeContainer}>
    <Text style={styles.timeLabel}>שעה:</Text>
    <Text style={styles.timeValue}>{formatTime(currentTime)}</Text>
    </View>
    </View>
    <Text style={styles.infoSubtitle}>{report.LiveUpdates2}</Text>
  </View>
  <View style={styles.separator} />
</View>

       {/* שולט על המיקומים של הטקסטים */}
     </View>
        
       
        <View style={styles.btnSection}>
          <SecondaryBtnComp
            text={"ביטול"}
            type={"cancel"}
            onPress={handleCancel}
          />
          <PrimaryBtnComp text={"יצירת אירוע"} onPress={handleSubmit} />
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

  backButton: {
    marginRight: 10,
  },
 
  headerContainer: {
    flexDirection: 'row-reverse', // משנה את הכיוון לימין לשמאל
    alignItems: 'center',
    paddingHorizontal: 5,
    paddingVertical: 1,
    fontWeight: 'bold',
  },
  
//אייקון אש 
  iconStyle: {
    marginTop: -13,  // מגביה את האייקון
    marginRight: 3,
  },

  //אייקון וויז
  wazeStyle:{
    marginLeft: 25,
    marginBottom: 0,
    marginTop: -10,  // מגביה את האייקון
  },

  //אייקון טלפון
  phoneStyle:{
    marginLeft: 25,
    marginBottom: 0,
    marginTop: -30,  // מגביה את האייקון
  },
 
  logo: {
    width: 24,
    height: 24,
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "right",
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "right",
    marginTop: 10,
  },

//כותרות
  infoContainer: {
    marginVertical: 11,
    alignItems: 'flex-end', // יישור לימין עבור RTL
    marginBottom: 0,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'right',
  marginTop: 2, // מרווח קטן בין הכותרת לטקסט משני
    
  },
  infoSubtitle: {
    fontSize: 14,
    color: '#666', // צבע אפור בהיר לטקסט המשני
    textAlign: 'right',
    marginTop: 5, // מרווח קטן בין הכותרת לטקסט משני
  },

  //שהמספר יהיה ליד האייקון
  phoneNumberSub: {
    fontSize: 14,
    color: '#666', // צבע אפור בהיר לטקסט המשני
    textAlign: 'right',
    marginRight: 225,
    marginBottom: 0,
    marginTop: -20,  // מגביה את האייקון
  },


  //קו מפריד
  separator: {
    height: 1,
    backgroundColor: '#e0e0e0', // צבע אפור בהיר לקו המפריד
    width: '100%',
    marginTop: 10,
  },

  HalfSeparator: {
    height: 1,
    backgroundColor: '#e0e0e0', 
    width: '40%',
    marginTop: 10,
  },

  //מיקום דיווח  
  locationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between', // מרחיק את האייקון לצד שמאל
    width: '100%', // רוחב מלא כדי שהצד השמאלי יהיה באמת בקצה
    marginTop: 0, // מרווח קטן מהכותרת
  },
  
//שעה
updateRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
  marginTop: 5,
  marginBottom: 1,
},
updateContent: {
  flex: 1,
  alignItems: 'flex-start', // יישור טקסט לימין
},
timeContainer: {
  flexDirection: 'row-reverse', // שהטקסט "שעה" יהיה מימין לשעון
  alignItems: 'center',
  marginLeft: 10, // מרווח מהעדכון
},
timeLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
    marginLeft: 5, // מרווח בין הטקסט למספר השעה
  },
  timeValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#000',
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
    marginTop: 20, 
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
 
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  
  backButton: {
    marginLeft: 10,
  },
  
});
