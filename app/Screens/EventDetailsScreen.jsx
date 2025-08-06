// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   TouchableOpacity,
//   SafeAreaView,
//   StatusBar,
//   Alert,
//   Linking,
//   Dimensions,
//   ActivityIndicator,
// } from "react-native";
// import {
//   Ionicons,
//   MaterialIcons,
//   MaterialCommunityIcons,
// } from "@expo/vector-icons";
// import { useNavigation, useRoute } from "@react-navigation/native";
// import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
// import { API_URL } from "../Constants/Utils"; // ודא שזה מוגדר בפרויקט שלך

// const { width } = Dimensions.get("window");

// const ReportDetailsScreenn = () => {
//   const navigation = useNavigation();
//   const route = useRoute();
//   const { reportId } = route.params;

//   const [report, setReport] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isClosingReport, setIsClosingReport] = useState(false);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     fetchReportDetails();
//   }, [reportId]);

//   // טעינת פרטי הדיווח מהשרת
//   const fetchReportDetails = async () => {
//     setIsLoading(true);
//     setError(null);

//     try {
//       console.log(`Fetching report details for ID: ${reportId}`);

//       const response = await fetch(`${API_URL}Report/${reportId}`, {
//         method: "GET",
//         headers: {
//           "Content-Type": "application/json",
//           Accept: "application/json",
//         },
//       });

//       if (!response.ok) {
//         if (response.status === 404) {
//           throw new Error("הדיווח לא נמצא");
//         }
//         throw new Error(`שגיאת שרת: ${response.status}`);
//       }

//       const reportData = await response.json();
//       console.log("Report data received:", reportData);

//       setReport(reportData);
//     } catch (error) {
//       console.error("Error fetching report details:", error);
//       setError(error.message);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // קבלת קואורדינטות המיקום מהדיווח
//   const getReportLocation = () => {
//     if (report && report.latitude && report.longitude) {
//       return {
//         latitude: report.latitude,
//         longitude: report.longitude,
//         latitudeDelta: 0.01,
//         longitudeDelta: 0.01,
//       };
//     }

//     // מיקום ברירת מחדל אם אין קואורדינטות
//     return {
//       latitude: 32.0853,
//       longitude: 34.7818,
//       latitudeDelta: 0.01,
//       longitudeDelta: 0.01,
//     };
//   };

//   const getPriorityColor = (priority) => {
//     switch (priority?.toLowerCase()) {
//       case "high":
//       case "גבוה":
//       case "דחוף":
//         return "#ff4444";
//       case "medium":
//       case "בינוני":
//         return "#ff9800";
//       case "low":
//       case "נמוך":
//         return "#4caf50";
//       default:
//         return "#666";
//     }
//   };

//   const getPriorityLabel = (priority) => {
//     switch (priority?.toLowerCase()) {
//       case "high":
//       case "גבוה":
//         return "דחוף";
//       case "medium":
//       case "בינוני":
//         return "בינוני";
//       case "low":
//       case "נמוך":
//         return "נמוך";
//       default:
//         return "לא ידוע";
//     }
//   };

//   const getPriorityIcon = (priority) => {
//     switch (priority?.toLowerCase()) {
//       case "high":
//       case "גבוה":
//         return "warning";
//       case "medium":
//       case "בינוני":
//         return "alert-circle";
//       case "low":
//       case "נמוך":
//         return "info";
//       default:
//         return "circle";
//     }
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return "תאריך לא ידוע";

//     const date = new Date(dateString);
//     if (isNaN(date.getTime())) return "תאריך לא תקין";

//     return date.toLocaleDateString("he-IL", {
//       year: "numeric",
//       month: "long",
//       day: "numeric",
//       hour: "2-digit",
//       minute: "2-digit",
//     });
//   };

//   const formatTime = (dateString) => {
//     if (!dateString) return "זמן לא ידוע";

//     const date = new Date(dateString);
//     if (isNaN(date.getTime())) return "זמן לא תקין";

//     const now = new Date();
//     const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
//     const diffInMinutes = Math.floor((now - date) / (1000 * 60));

//     if (diffInMinutes < 60) {
//       return `לפני ${diffInMinutes} דקות`;
//     } else if (diffInHours < 24) {
//       return `לפני ${diffInHours} שעות`;
//     } else {
//       const diffInDays = Math.floor(diffInHours / 24);
//       return `לפני ${diffInDays} ימים`;
//     }
//   };

//   const handleCall = (phoneNumber) => {
//     if (!phoneNumber) {
//       Alert.alert("שגיאה", "מספר טלפון לא זמין");
//       return;
//     }

//     Alert.alert("התקשרות", `האם ברצונך להתקשר ל-${phoneNumber}?`, [
//       { text: "ביטול", style: "cancel" },
//       {
//         text: "התקשר",
//         onPress: () => {
//           Linking.openURL(`tel:${phoneNumber}`);
//         },
//       },
//     ]);
//   };

//   const openLocation = () => {
//     const location = getReportLocation();
//     const url = `https://maps.google.com/?q=${location.latitude},${location.longitude}`;

//     Alert.alert("פתיחת מפה מלאה", "האם ברצונך לפתוח את המיקום במפה מלאה?", [
//       { text: "ביטול", style: "cancel" },
//       {
//         text: "פתח במפות",
//         onPress: () => {
//           Linking.openURL(url);
//         },
//       },
//     ]);
//   };

//   const handleCreateEvent = () => {
//     Alert.alert(
//       "יצירת אירוע חירום",
//       `האם ברצונך ליצור אירוע חירום על בסיס דיווח #${
//         report.reportCode || report.id
//       }?\n\nפעולה זו תיצור אירוע פעיל חדש ותתחיל הפעלת פרוטוקולי חירום.`,
//       [
//         { text: "ביטול", style: "cancel" },
//         {
//           text: "צור אירוע",
//           style: "default",
//           onPress: () => createEventFromReport(),
//         },
//       ]
//     );
//   };

//   const createEventFromReport = async () => {
//     try {
//       const response = await fetch(`${API_URL}Event/create-from-report`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           reportId: report.id,
//           // הוסף פרמטרים נוספים לפי הצורך
//         }),
//       });

//       if (!response.ok) {
//         throw new Error("שגיאה ביצירת האירוע");
//       }

//       const newEvent = await response.json();

//       Alert.alert(
//         "אירוע נוצר בהצלחה",
//         `אירוע חירום #${newEvent.id} נוצר על בסיס הדיווח.\n\nהאירוع הועבר לטיפול הרשויות והופעל פרוטוקול החירום המתאים.`,
//         [
//           {
//             text: "צפה באירוע",
//             onPress: () => {
//               navigation.navigate("EventDetailsScreen", {
//                 eventId: newEvent.id,
//               });
//             },
//           },
//           {
//             text: "המשך",
//             style: "cancel",
//           },
//         ]
//       );
//     } catch (error) {
//       console.error("Error creating event:", error);
//       Alert.alert(
//         "שגיאה",
//         "לא ניתן ליצור אירוע חירום כעת. נסה שוב מאוחר יותר."
//       );
//     }
//   };

//   const handleCloseReport = () => {
//     Alert.alert(
//       "סגירת דיווח",
//       "האם אתה בטוח שברצונך לסגור את הדיווח?\n\nפעולה זו תסמן את הדיווח כמטופל ולא ניתן יהיה לבטל אותה.",
//       [
//         { text: "ביטול", style: "cancel" },
//         {
//           text: "סגור דיווח",
//           style: "destructive",
//           onPress: () => closeReport(),
//         },
//       ]
//     );
//   };

//   const closeReport = async () => {
//     setIsClosingReport(true);

//     try {
//       const response = await fetch(`${API_URL}Report/${report.id}/close`, {
//         method: "PATCH",
//         headers: {
//           "Content-Type": "application/json",
//         },
//       });

//       if (!response.ok) {
//         throw new Error("שגיאה בסגירת הדיווח");
//       }

//       Alert.alert("דיווח נסגר", "הדיווח נסגר בהצלחה ועבר למצב מטופל.", [
//         {
//           text: "אישור",
//           onPress: () => {
//             navigation.goBack();
//           },
//         },
//       ]);
//     } catch (error) {
//       console.error("Error closing report:", error);
//       Alert.alert("שגיאה", "לא ניתן לסגור את הדיווח כעת. נסה שוב מאוחר יותר.");
//     } finally {
//       setIsClosingReport(false);
//     }
//   };

//   // מסך טעינה
//   if (isLoading) {
//     return (
//       <SafeAreaView style={styles.container}>
//         <StatusBar barStyle="dark-content" />
//         <View style={styles.header}>
//           <TouchableOpacity
//             style={styles.backButton}
//             onPress={() => navigation.goBack()}
//           >
//             <Ionicons name="chevron-back" size={28} color="#333" />
//           </TouchableOpacity>
//           <Text style={styles.headerTitle}>טוען דיווח...</Text>
//         </View>
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color="#3d8bcd" />
//           <Text style={styles.loadingText}>טוען פרטי דיווח...</Text>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   // מסך שגיאה
//   if (error || !report) {
//     return (
//       <SafeAreaView style={styles.container}>
//         <StatusBar barStyle="dark-content" />
//         <View style={styles.header}>
//           <TouchableOpacity
//             style={styles.backButton}
//             onPress={() => navigation.goBack()}
//           >
//             <Ionicons name="chevron-back" size={28} color="#333" />
//           </TouchableOpacity>
//           <Text style={styles.headerTitle}>שגיאה</Text>
//         </View>
//         <View style={styles.errorContainer}>
//           <MaterialCommunityIcons
//             name="alert-circle"
//             size={80}
//             color="#ff4444"
//           />
//           <Text style={styles.errorText}>{error || "דיווח לא נמצא"}</Text>
//           <TouchableOpacity
//             style={styles.retryButton}
//             onPress={fetchReportDetails}
//           >
//             <Text style={styles.retryButtonText}>נסה שוב</Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={styles.backToListButton}
//             onPress={() => navigation.goBack()}
//           >
//             <Text style={styles.backToListText}>חזרה לרשימת הדיווחים</Text>
//           </TouchableOpacity>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="dark-content" />

//       {/* Header */}
//       <View style={styles.header}>
//         <TouchableOpacity
//           style={styles.backButton}
//           onPress={() => navigation.goBack()}
//         >
//           <Ionicons name="chevron-back" size={28} color="#333" />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>
//           דיווח #{report.reportCode || report.id}
//         </Text>
//       </View>

//       <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
//         {/* Status and Priority Card */}
//         <View style={styles.statusCard}>
//           <View style={styles.statusHeader}>
//             <View style={styles.statusInfo}>
//               <View
//                 style={[
//                   styles.priorityBadge,
//                   { backgroundColor: getPriorityColor(report.priority) },
//                 ]}
//               >
//                 <Ionicons
//                   name={getPriorityIcon(report.priority)}
//                   size={16}
//                   color="white"
//                 />
//                 <Text style={styles.priorityText}>
//                   {getPriorityLabel(report.priority)}
//                 </Text>
//               </View>
//               <View style={styles.statusBadge}>
//                 <Ionicons name="checkmark-circle" size={16} color="#4caf50" />
//                 <Text style={styles.statusText}>
//                   {report.isOpen !== false ? "פעיל" : "סגור"}
//                 </Text>
//               </View>
//             </View>
//             <Text style={styles.timeAgo}>
//               {formatTime(report.reportDate || report.createdAt)}
//             </Text>
//           </View>
//         </View>

//         {/* Event Type Card */}
//         <View style={styles.card}>
//           <View style={styles.cardHeader}>
//             <Text style={styles.cardTitle}>סוג האירוע</Text>
//             <MaterialCommunityIcons name="alert" size={24} color="#ff6b35" />
//           </View>
//           <Text style={styles.eventType}>
//             {report.eventTypeName || report.eventType || "לא צוין"}
//           </Text>
//         </View>

//         {/* Description Card */}
//         <View style={styles.card}>
//           <View style={styles.cardHeader}>
//             <Text style={styles.cardTitle}>תיאור האירוע</Text>
//             <MaterialCommunityIcons name="text-box" size={24} color="#3d8bcd" />
//           </View>
//           <Text style={styles.description}>
//             {report.reportDescription || report.description || "אין תיאור"}
//           </Text>
//         </View>

//         {/* Location Card with Map */}
//         <View style={styles.card}>
//           <View style={styles.cardHeader}>
//             <Text style={styles.cardTitle}>מיקום האירוע</Text>
//             <MaterialIcons name="location-on" size={24} color="#4caf50" />
//           </View>
//           <Text style={styles.locationText}>
//             {report.locationDescription || report.location || "מיקום לא צוין"}
//           </Text>

//           {/* Map section */}
//           <View style={styles.mapContainer}>
//             <MapView
//               style={styles.map}
//               initialRegion={getReportLocation()}
//               scrollEnabled={false}
//               zoomEnabled={false}
//               rotateEnabled={false}
//             >
//               <Marker
//                 coordinate={{
//                   latitude: getReportLocation().latitude,
//                   longitude: getReportLocation().longitude,
//                 }}
//                 title={
//                   report.locationDescription ||
//                   report.location ||
//                   "מיקום האירוע"
//                 }
//               />
//             </MapView>
//             <TouchableOpacity style={styles.mapButton} onPress={openLocation}>
//               <Text style={styles.mapButtonText}>צפה במפה מלאה</Text>
//             </TouchableOpacity>
//           </View>
//         </View>

//         {/* Reporter Info Card */}
//         {(report.reporterName || report.reporterPhoneNumber) && (
//           <View style={styles.card}>
//             <View style={styles.cardHeader}>
//               <Text style={styles.cardTitle}>פרטי המדווח</Text>
//               <MaterialIcons name="person" size={24} color="#9c27b0" />
//             </View>
//             <View style={styles.reporterInfo}>
//               {report.reporterName && (
//                 <View style={styles.infoRow}>
//                   <Text style={styles.infoLabel}>שם:</Text>
//                   <Text style={styles.infoValue}>{report.reporterName}</Text>
//                 </View>
//               )}
//               {report.reporterPhoneNumber && (
//                 <View style={styles.infoRow}>
//                   <Text style={styles.infoLabel}>טלפון:</Text>
//                   <TouchableOpacity
//                     onPress={() => handleCall(report.reporterPhoneNumber)}
//                   >
//                     <Text style={[styles.infoValue, styles.phoneLink]}>
//                       {report.reporterPhoneNumber}
//                     </Text>
//                   </TouchableOpacity>
//                 </View>
//               )}
//             </View>
//           </View>
//         )}

//         {/* Authority Card */}
//         {report.authorityName && (
//           <View style={styles.card}>
//             <View style={styles.cardHeader}>
//               <Text style={styles.cardTitle}>רשות מטפלת</Text>
//               <MaterialIcons name="business" size={24} color="#ff9800" />
//             </View>
//             <Text style={styles.authorityText}>{report.authorityName}</Text>
//           </View>
//         )}

//         {/* Date and Time Card */}
//         <View style={styles.card}>
//           <View style={styles.cardHeader}>
//             <Text style={styles.cardTitle}>תאריך ושעה</Text>
//             <MaterialIcons name="schedule" size={24} color="#607d8b" />
//           </View>
//           <Text style={styles.dateText}>
//             {formatDate(report.reportDate || report.createdAt)}
//           </Text>
//         </View>

//         {/* Action Buttons */}
//         <View style={styles.btnSection}>
//           <TouchableOpacity
//             style={styles.secondaryBtn}
//             onPress={() => navigation.goBack()}
//           >
//             <Text style={styles.secondaryBtnText}>חזרה</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={styles.primaryBtn}
//             onPress={handleCreateEvent}
//           >
//             <Text style={styles.primaryBtnText}>צור אירוע חירום</Text>
//           </TouchableOpacity>
//         </View>

//         {/* Close Report Button */}
//         {report.isOpen !== false && (
//           <View style={styles.closeSection}>
//             <TouchableOpacity
//               style={[
//                 styles.closeButton,
//                 isClosingReport && styles.closeButtonDisabled,
//               ]}
//               onPress={handleCloseReport}
//               disabled={isClosingReport}
//             >
//               {isClosingReport ? (
//                 <View style={styles.loadingContainer}>
//                   <ActivityIndicator size="small" color="white" />
//                   <Text style={styles.closeButtonText}>סוגר דיווח...</Text>
//                 </View>
//               ) : (
//                 <View style={styles.buttonContent}>
//                   <MaterialIcons name="check-circle" size={20} color="white" />
//                   <Text style={styles.closeButtonText}>סגור דיווח</Text>
//                 </View>
//               )}
//             </TouchableOpacity>

//             <Text style={styles.warningText}>
//               💡 ניתן ליצור אירוע חירום מהדיווח או לסגור אותו כמטופל
//             </Text>
//           </View>
//         )}
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#f5f5f5",
//   },
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 20,
//     paddingVertical: 15,
//     backgroundColor: "white",
//     borderBottomWidth: 1,
//     borderBottomColor: "#eee",
//     elevation: 2,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//   },
//   backButton: {
//     marginLeft: 10,
//   },
//   headerTitle: {
//     fontSize: 18,
//     fontWeight: "bold",
//     flex: 1,
//     textAlign: "center",
//     marginRight: 34,
//   },
//   content: {
//     flex: 1,
//     padding: 16,
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     padding: 40,
//   },
//   loadingText: {
//     fontSize: 16,
//     color: "#666",
//     marginTop: 16,
//   },
//   statusCard: {
//     backgroundColor: "white",
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 16,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   statusHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   statusInfo: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   priorityBadge: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 10,
//     paddingVertical: 6,
//     borderRadius: 15,
//     marginLeft: 8,
//   },
//   priorityText: {
//     color: "white",
//     fontSize: 14,
//     fontWeight: "bold",
//     marginLeft: 4,
//   },
//   statusBadge: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 10,
//     paddingVertical: 6,
//     borderRadius: 15,
//     backgroundColor: "#e8f5e8",
//   },
//   statusText: {
//     color: "#4caf50",
//     fontSize: 14,
//     fontWeight: "bold",
//     marginLeft: 4,
//   },
//   timeAgo: {
//     fontSize: 14,
//     color: "#666",
//   },
//   card: {
//     backgroundColor: "white",
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 16,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   cardHeader: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "flex-end",
//     marginBottom: 12,
//     paddingBottom: 8,
//     borderBottomWidth: 1,
//     borderBottomColor: "#f0f0f0",
//   },
//   cardTitle: {
//     fontSize: 16,
//     fontWeight: "bold",
//     color: "#333",
//     marginRight: 8,
//     textAlign: "right",
//   },
//   eventType: {
//     fontSize: 20,
//     fontWeight: "bold",
//     color: "#ff6b35",
//     textAlign: "right",
//   },
//   description: {
//     fontSize: 16,
//     lineHeight: 24,
//     color: "#333",
//     textAlign: "right",
//   },
//   locationText: {
//     fontSize: 16,
//     color: "#333",
//     textAlign: "right",
//     marginBottom: 16,
//   },
//   mapContainer: {
//     width: "100%",
//     height: 200,
//     borderRadius: 12,
//     overflow: "hidden",
//     position: "relative",
//     marginBottom: 12,
//   },
//   map: {
//     width: "100%",
//     height: "100%",
//   },
//   mapButton: {
//     position: "absolute",
//     bottom: 10,
//     left: 10,
//     right: 10,
//     backgroundColor: "rgba(61, 139, 205, 0.9)",
//     paddingVertical: 10,
//     paddingHorizontal: 16,
//     borderRadius: 8,
//     alignItems: "center",
//   },
//   mapButtonText: {
//     color: "white",
//     fontSize: 14,
//     fontWeight: "bold",
//   },
//   reporterInfo: {
//     gap: 8,
//   },
//   infoRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingVertical: 4,
//   },
//   infoLabel: {
//     fontSize: 14,
//     color: "#666",
//     fontWeight: "500",
//   },
//   infoValue: {
//     fontSize: 16,
//     color: "#333",
//     fontWeight: "500",
//   },
//   phoneLink: {
//     color: "#3d8bcd",
//     textDecorationLine: "underline",
//   },
//   authorityText: {
//     fontSize: 18,
//     fontWeight: "600",
//     color: "#ff9800",
//     textAlign: "right",
//   },
//   dateText: {
//     fontSize: 16,
//     color: "#333",
//     textAlign: "right",
//   },
//   btnSection: {
//     flexDirection: "row",
//     justifyContent: "center",
//     alignItems: "center",
//     marginTop: 15,
//     marginBottom: 15,
//   },
//   primaryBtn: {
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     borderRadius: 30,
//     marginLeft: 8,
//     marginBottom: 8,
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: "#9610FF",
//     minWidth: 150,
//   },
//   primaryBtnText: {
//     color: "white",
//     fontSize: 16,
//     fontWeight: "regular",
//   },
//   secondaryBtn: {
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     borderRadius: 30,
//     marginRight: 8,
//     marginBottom: 8,
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: "white",
//     borderWidth: 1,
//     borderColor: "#9610FF",
//     minWidth: 150,
//   },
//   secondaryBtnText: {
//     color: "#9610FF",
//     fontSize: 16,
//     fontWeight: "regular",
//   },
//   closeSection: {
//     marginTop: 8,
//     marginBottom: 32,
//   },
//   closeButton: {
//     backgroundColor: "#ff4444",
//     borderRadius: 30,
//     paddingVertical: 12,
//     paddingHorizontal: 24,
//     alignItems: "center",
//     justifyContent: "center",
//     marginHorizontal: 20,
//   },
//   closeButtonDisabled: {
//     backgroundColor: "#ccc",
//   },
//   buttonContent: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   closeButtonText: {
//     color: "white",
//     fontSize: 18,
//     fontWeight: "bold",
//     marginRight: 8,
//   },
//   warningText: {
//     fontSize: 12,
//     color: "#ff6b35",
//     textAlign: "center",
//     marginTop: 12,
//     paddingHorizontal: 16,
//     lineHeight: 16,
//   },
//   errorContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     padding: 40,
//   },
//   errorText: {
//     fontSize: 18,
//     color: "#666",
//     marginTop: 16,
//     marginBottom: 24,
//     textAlign: "center",
//   },
//   retryButton: {
//     backgroundColor: "#ff9800",
//     paddingHorizontal: 24,
//     paddingVertical: 12,
//     borderRadius: 25,
//     marginBottom: 12,
//   },
//   retryButtonText: {
//     color: "white",
//     fontSize: 16,
//     fontWeight: "bold",
//   },
//   backToListButton: {
//     backgroundColor: "#3d8bcd",
//     paddingHorizontal: 24,
//     paddingVertical: 12,
//     borderRadius: 25,
//   },
//   backToListText: {
//     color: "white",
//     fontSize: 16,
//     fontWeight: "bold",
//   },
// });

// export default ReportDetailsScreenn;
