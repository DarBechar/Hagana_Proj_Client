import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  Linking,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import {
  Ionicons,
  MaterialIcons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { API_URL } from "../Constants/Utils";
import { useEmergency } from "../Context/EmergencyContext";

const { width } = Dimensions.get("window");

const ReportDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { reportId } = route.params;
  const { refreshEmergencyStatus, setActiveEvent, setHasActiveEmergency } =
    useEmergency();

  const [report, setReport] = useState(null);
  const [isClosingReport, setIsClosingReport] = useState(false);
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    fetchReportDetails();
  }, [reportId]);

  const fetchReportDetails = async () => {
    try {
      setIsLoading(true);

      console.log("Fetching report with ID:", reportId);

      // Get report details from server
      const response = await fetch(`${API_URL}Report/active`, {
        method: "GET",
        headers: new Headers({
          "Content-Type": "application/json; charset=UTF-8",
          Accept: "application/json; charset=UTF-8",
        }),
      });

      if (response.ok) {
        const activeReports = await response.json();
        console.log("Got reports from server, looking for reportId:", reportId);
        console.log(
          "Available report codes:",
          activeReports.map((r) => r.ReportCode)
        );

        const foundReport = activeReports.find((r) => r.ReportCode == reportId);

        if (foundReport) {
          console.log("Found report:", foundReport.ReportCode);

          // Format the server data to match our expected structure - עם כל השדות
          const formattedReport = {
            id: foundReport.ReportCode,
            reportCode: foundReport.ReportCode,
            reportDate: foundReport.ReportDate || foundReport.ReportDateTime,
            reporterName: foundReport.ReporterName || "לא צוין",
            reporterPhoneNumber: foundReport.ReporterPhoneNumber || "לא צוין",
            reportDescription: foundReport.ReportDescription || "אין תיאור",
            eventTypeName: foundReport.EventTypeName || "לא צוין",
            authorityName: foundReport.AuthorityName || "לא צוין",
            isOpen: foundReport.IsOpen !== false,
            priority: determinePriority(foundReport.EventTypeName),
            locationDescription:
              foundReport.LocationDescription ||
              foundReport.LocationName ||
              "מיקום לא צוין",
            // Additional fields from server - הוספת השדות החסרים
            reportNotes: foundReport.ReportNotes,
            longitude:
              foundReport.LocationLongitude || foundReport.Longitude || 34.7818,
            latitude:
              foundReport.LocationLatitude || foundReport.Latitude || 32.0853,
            userFullName: foundReport.UserFullName,
            imageUrl: foundReport.ImageUrl,
            // השדות החדשים שהשרת צריך
            authorityCode: foundReport.AuthorityCode,
            eventCode: foundReport.EventCode,
            userID: foundReport.UserID,
            eventTypeCode: foundReport.EventTypeCode,
            reportTitle:
              foundReport.ReportTitle || foundReport.EventTypeName || "דיווח",
          };

          setReport(formattedReport);
          console.log("Report formatted and set:", formattedReport.reportCode);
          return;
        } else {
          console.warn(`Report ${reportId} not found in active reports`);
        }
      } else {
        console.error("Server response not ok:", response.status);
      }

      // If not found in active reports or server error
      setReport(null);
    } catch (error) {
      console.error("Error fetching report details:", error);
      Alert.alert("שגיאת חיבור", "לא ניתן לטעון את פרטי הדיווח מהשרת", [
        { text: "חזור", onPress: () => navigation.goBack() },
        { text: "נסה שוב", onPress: fetchReportDetails },
      ]);
      setReport(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to determine priority based on event type
  const determinePriority = (eventType) => {
    if (!eventType) return "low";

    const eventTypeLower = eventType.toLowerCase();

    if (
      eventTypeLower.includes("שריפה") ||
      eventTypeLower.includes("חירום") ||
      eventTypeLower.includes("הצפה") ||
      eventTypeLower.includes("רעידת אדמה")
    ) {
      return "high";
    } else if (
      eventTypeLower.includes("תאונה") ||
      eventTypeLower.includes("מפגע")
    ) {
      return "medium";
    } else {
      return "low";
    }
  };

  // Get report location from server data or default
  const getReportLocation = () => {
    if (report && report.latitude && report.longitude) {
      return {
        latitude: parseFloat(report.latitude),
        longitude: parseFloat(report.longitude),
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
    }

    // Default location fallback
    return {
      latitude: 32.0853,
      longitude: 34.7818,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "#ff4444";
      case "medium":
        return "#ff9800";
      case "low":
        return "#4caf50";
      default:
        return "#666";
    }
  };

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case "high":
        return "דחוף";
      case "medium":
        return "בינוני";
      case "low":
        return "נמוך";
      default:
        return "לא ידוע";
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case "high":
        return "warning";
      case "medium":
        return "alert-circle";
      case "low":
        return "information-circle";
      default:
        return "ellipse-outline";
    }
  };

  const formatDate = (dateString) => {
    try {
      if (!dateString) return "תאריך לא ידוע";
      const date = new Date(dateString);
      return date.toLocaleDateString("he-IL", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "תאריך לא ידוע";
    }
  };

  const formatTime = (dateString) => {
    try {
      if (!dateString) return "זמן לא ידוע";
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));

      if (diffInMinutes < 60) {
        return `לפני ${diffInMinutes} דקות`;
      } else if (diffInHours < 24) {
        return `לפני ${diffInHours} שעות`;
      } else {
        const diffInDays = Math.floor(diffInHours / 24);
        return `לפני ${diffInDays} ימים`;
      }
    } catch (error) {
      return "זמן לא ידוע";
    }
  };

  const handleCall = (phoneNumber) => {
    if (!phoneNumber || phoneNumber === "לא צוין") {
      Alert.alert("שגיאה", "מספר הטלפון לא זמין");
      return;
    }

    Alert.alert("התקשרות", `האם ברצונך להתקשר ל-${phoneNumber}?`, [
      { text: "ביטול", style: "cancel" },
      {
        text: "התקשר",
        onPress: () => {
          Linking.openURL(`tel:${phoneNumber}`);
        },
      },
    ]);
  };

  const openLocation = () => {
    Alert.alert("פתיחת מפה מלאה", "האם ברצונך לפתוח את המיקום במפה מלאה?", [
      { text: "ביטול", style: "cancel" },
      {
        text: "פתח במפות",
        onPress: () => {
          const location = getReportLocation();
          const url = `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
          Linking.openURL(url);
        },
      },
    ]);
  };

  const handleCreateEvent = () => {
    Alert.alert(
      "יצירת אירוע חירום",
      `האם ברצונך ליצור אירוע חירום על בסיס דיווח #${report.reportCode}?\n\nפעולה זו תיצור אירוع פעיל חדש ותתחיל הפעלת פרוטוקולי חירום.`,
      [
        { text: "ביטול", style: "cancel" },
        {
          text: "צור אירוע",
          style: "default",
          onPress: createEventFromReport,
        },
      ]
    );
  };

  const createEventFromReport = async () => {
    setIsCreatingEvent(true);

    try {
      console.log(`Creating event from report: ${report.reportCode}`);

      const now = new Date().toISOString();

      // מבנה הנתונים המתוקן לפי המבנה המדויק של השרת
      const eventPayload = {
        eventCode: 0, // יוגדר על ידי השרת
        eventName: `אירוע חירום - ${report.eventTypeName}`,
        openingDate: now,
        description: `אירוע חירום שנוצר מדיווח #${report.reportCode}\n\nתיאור מקורי: ${report.reportDescription}`,
        creatorUserID: String(report.userID || "1"), // string כמו בדוגמה
        eventStatusCode: 5, // סטטוס "חירום"
        isActive: true,
        activatedAt: now,
        deactivatedAt: null, // null כי האירוע פעיל
        locationLatitude: parseFloat(report.latitude) || 32.0853,
        locationLongitude: parseFloat(report.longitude) || 34.7818,
        locationName: report.locationDescription || "מיקום מהדיווח",
        affectedAreaRadius: 1000, // רדיוס השפעה
        eventTypeCode: report.eventTypeCode || 0, // קוד סוג האירוע
      };

      console.log("Event payload:", JSON.stringify(eventPayload, null, 2));

      const response = await fetch(`${API_URL}Event`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(eventPayload),
      });

      console.log(`Create event response status: ${response.status}`);

      if (response.ok) {
        const newEvent = await response.json();
        console.log("Event created successfully:", newEvent);

        // וודא שהאירוע מכיל את כל הפרטים הדרושים
        const completeEvent = {
          ...newEvent,
          // וודא שכל השדות הדרושים קיימים
          eventCode: newEvent.eventCode || newEvent.EventCode,
          eventName:
            newEvent.eventName ||
            newEvent.EventName ||
            `אירוע חירום - ${report.eventTypeName}`,
          description:
            newEvent.description ||
            `אירוע חירום שנוצר מדיווח #${report.reportCode}\n\nתיאור מקורי: ${report.reportDescription}`,
          locationLatitude:
            newEvent.locationLatitude || parseFloat(report.latitude) || 32.0853,
          locationLongitude:
            newEvent.locationLongitude ||
            parseFloat(report.longitude) ||
            34.7818,
          locationName:
            newEvent.locationName ||
            report.locationDescription ||
            "מיקום מהדיווח",
          eventStatusCode: newEvent.eventStatusCode || 5, // חירום
          isActive: newEvent.isActive !== false,
          creatorUserID: newEvent.creatorUserID || report.userID,
          eventTypeCode: newEvent.eventTypeCode || report.eventTypeCode,
          openingDate: newEvent.openingDate || new Date().toISOString(),
          activatedAt: newEvent.activatedAt || new Date().toISOString(),
          deactivatedAt: newEvent.deactivatedAt || null,
          affectedAreaRadius: newEvent.affectedAreaRadius || 1000,
        };

        console.log(
          "Complete event object:",
          JSON.stringify(completeEvent, null, 2)
        );

        // נסה לסגור את הדיווח אוטומטית לפני עדכון ה-Context
        let reportClosedSuccessfully = false;
        try {
          console.log("Auto-closing report after event creation...");
          await closeReportSilently();
          reportClosedSuccessfully = true;
          console.log("Report closed successfully after event creation");
        } catch (closeError) {
          console.warn(
            "Failed to auto-close report after event creation:",
            closeError
          );
          // נמשיך גם אם סגירת הדיווח נכשלה
        }

        // עדכון מיידי של ה-Context עם האירוע המלא
        console.log("Updating Context with complete event...");
        setActiveEvent(completeEvent);
        setHasActiveEmergency(true);

        // רענון נוסף של הסטטוס כדי להבטיח סינכרון עם השרת
        setTimeout(() => {
          console.log("Refreshing emergency status from server...");
          refreshEmergencyStatus();
        }, 2000);

        const successMessage = reportClosedSuccessfully
          ? `אירוע חירום #${completeEvent.eventCode} נוצר על בסיס הדיווח.\n\nהדיווח נסגר אוטומטית והאירוע הועבר לטיפול הרשויות.`
          : `אירוע חירום #${completeEvent.eventCode} נוצר בהצלחה.\n\n⚠️ הדיווח לא נסגר אוטומטית - יש לסגור אותו ידנית.`;

        Alert.alert("אירוע נוצר בהצלחה", successMessage, [
          {
            text: "צפה באירוע",
            onPress: () => {
              // ניווט לאירוע החדש עם האירוע המלא
              navigation.navigate("EventDetailsScreen", {
                event: completeEvent,
              });
            },
          },
          {
            text: "חזור לבית",
            onPress: () => {
              navigation.navigate("בית");
            },
          },
        ]);
      } else {
        // טיפול בשגיאות שרת
        let errorMessage = "שגיאה לא צפויה";

        try {
          const errorData = await response.text();
          console.error("Server error response:", errorData);

          try {
            const errorJson = JSON.parse(errorData);

            // טיפול מיוחד בשגיאות validation
            if (errorJson.errors) {
              const validationErrors = [];
              for (const [field, messages] of Object.entries(
                errorJson.errors
              )) {
                validationErrors.push(`${field}: ${messages.join(", ")}`);
              }
              errorMessage = `שגיאות validation:\n${validationErrors.join(
                "\n"
              )}`;
            } else {
              errorMessage =
                errorJson.message ||
                errorJson.title ||
                `שגיאת שרת: ${response.status}`;
            }
          } catch {
            errorMessage = `שגיאת שרת: ${response.status}`;
          }
        } catch (parseError) {
          console.error("Error parsing server response:", parseError);
          errorMessage = `שגיאת שרת: ${response.status}`;
        }

        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error("Error creating event:", error);
      Alert.alert(
        "שגיאה ביצירת אירוע",
        error.message || "לא ניתן ליצור אירוע חירום כרגע. נסה שוב מאוחר יותר.",
        [
          { text: "נסה שוב", onPress: createEventFromReport },
          { text: "ביטול", style: "cancel" },
        ]
      );
    } finally {
      setIsCreatingEvent(false);
    }
  };

  const handleCloseReport = () => {
    Alert.alert(
      "סגירת דיווח",
      "האם אתה בטוח שברצונך לסגור את הדיווח?\n\nפעולה זו תסמן את הדיווח כמטופל ולא ניתן יהיה לבטל אותה.",
      [
        { text: "ביטול", style: "cancel" },
        {
          text: "סגור דיווח",
          style: "destructive",
          onPress: closeReport,
        },
      ]
    );
  };

  // פונקציה לסגירת דיווח בשקט (בלי הודעות למשתמש)
  const closeReportSilently = async () => {
    console.log("Starting silent report closure...");

    const updatedReportData = {
      ReportCode: report.reportCode,
      ReportDate: report.reportDate,
      ReporterName: report.reporterName || "",
      ReporterPhoneNumber: report.reporterPhoneNumber || "",
      ReportDescription: report.reportDescription || "",
      ReportNotes: report.reportNotes || "",
      Longitude: parseFloat(report.longitude) || 0,
      Latitude: parseFloat(report.latitude) || 0,
      LocationDescription: report.locationDescription || "",
      AuthorityCode: report.authorityCode || null,
      AuthorityName: report.authorityName || "",
      EventCode: report.eventCode || null,
      UserID: report.userID || null,
      UserFullName: report.userFullName || "",
      EventTypeCode: report.eventTypeCode || null,
      EventTypeName: report.eventTypeName || "",
      IsOpen: false, // סגירת הדיווח
      ReportTitle: report.reportTitle || report.eventTypeName || "דיווח",
      ReportDateTime: report.reportDate,
      LocationLatitude: parseFloat(report.latitude) || 0,
      LocationLongitude: parseFloat(report.longitude) || 0,
      LocationName: report.locationDescription || "",
      ImageUrl: report.imageUrl || "",
    };

    console.log(
      "Closing report with data:",
      JSON.stringify(updatedReportData, null, 2)
    );

    // נסה כמה אפשרויות לסגירת דיווח
    const attemptReportClose = async (endpoint, method, data) => {
      console.log(`🔄 Attempting: ${method} ${endpoint}`);
      console.log(`📄 Data:`, JSON.stringify(data, null, 2));

      const response = await fetch(endpoint, {
        method: method,
        headers: {
          "Content-Type": "application/json; charset=UTF-8",
          Accept: "application/json; charset=UTF-8",
        },
        body: JSON.stringify(data),
      });

      console.log(`📊 Response: ${response.status} ${response.statusText}`);

      if (response.ok) {
        try {
          const responseData = await response.json();
          console.log("✅ Success response data:", responseData);
        } catch (e) {
          console.log("✅ Success (no JSON response)");
        }
      } else {
        try {
          const errorText = await response.text();
          console.log(`❌ Error response: ${errorText}`);
        } catch (e) {
          console.log(`❌ Error ${response.status} (no response text)`);
        }
      }

      return response;
    };

    // רשימת אפשרויות לנסות
    const closeAttempts = [
      // נסה PUT עם הנתונים המלאים
      () =>
        attemptReportClose(
          `${API_URL}Report/${report.reportCode}`,
          "PUT",
          updatedReportData
        ),
      // נסה PATCH עם רק השדות הדרושים
      () =>
        attemptReportClose(`${API_URL}Report/${report.reportCode}`, "PATCH", {
          ReportCode: report.reportCode,
          IsOpen: false,
        }),
      // נסה endpoint מיוחד לסגירה
      () =>
        attemptReportClose(
          `${API_URL}Report/${report.reportCode}/close`,
          "POST",
          { ReportCode: report.reportCode }
        ),
      // נסה PUT ללא ה-ID בנתיב
      () => attemptReportClose(`${API_URL}Report`, "PUT", updatedReportData),
      // נסה עם endpoint active reports
      () =>
        attemptReportClose(`${API_URL}Report/close`, "POST", {
          ReportCode: report.reportCode,
        }),
      // נסה PATCH פשוט יותר
      () =>
        attemptReportClose(`${API_URL}Report`, "PATCH", {
          ReportCode: report.reportCode,
          IsOpen: false,
          ReportTitle: report.reportTitle || report.eventTypeName || "דיווח",
        }),
    ];

    let lastError;

    // נסה את כל האפשרויות
    for (let i = 0; i < closeAttempts.length; i++) {
      try {
        const response = await closeAttempts[i]();

        if (response.ok) {
          console.log(`Report closed successfully with attempt ${i + 1}`);

          // עדכון המידע המקומי
          setReport((prev) => ({
            ...prev,
            isOpen: false,
          }));

          return true;
        } else if (response.status !== 404 && response.status !== 405) {
          // אם זה לא 404 או 405, נדפיס את השגיאה
          const errorText = await response.text();
          console.warn(
            `Attempt ${i + 1} failed with ${response.status}:`,
            errorText
          );
          lastError = new Error(`${response.status}: ${errorText}`);
        }
      } catch (error) {
        console.warn(`Attempt ${i + 1} failed with error:`, error.message);
        lastError = error;
      }
    }

    // אם כל הניסיונות נכשלו
    console.error(
      "All attempts to close report failed. Last error:",
      lastError
    );
    throw lastError || new Error("Failed to close report - all methods failed");
  };

  // פונקציה מתוקנת לסגירת דיווח
  const closeReport = async () => {
    setIsClosingReport(true);

    try {
      console.log(`Closing report with ID: ${report.reportCode}`);

      // יצירת אובייקט עם כל הנתונים המעודכנים על בסיס המבנה של השרת
      const updatedReportData = {
        ReportCode: report.reportCode,
        ReportDate: report.reportDate,
        ReporterName: report.reporterName || "",
        ReporterPhoneNumber: report.reporterPhoneNumber || "",
        ReportDescription: report.reportDescription || "",
        ReportNotes: report.reportNotes || "",
        Longitude: parseFloat(report.longitude) || 0,
        Latitude: parseFloat(report.latitude) || 0,
        LocationDescription: report.locationDescription || "",
        AuthorityCode: report.authorityCode || null,
        AuthorityName: report.authorityName || "",
        EventCode: report.eventCode || null,
        UserID: report.userID || null,
        UserFullName: report.userFullName || "",
        EventTypeCode: report.eventTypeCode || null,
        EventTypeName: report.eventTypeName || "",
        IsOpen: false, // זה השדה החשוב - סגירת הדיווח
        ReportTitle: report.reportTitle || report.eventTypeName || "דיווח", // השדה שחסר!
        ReportDateTime: report.reportDate,
        LocationLatitude: parseFloat(report.latitude) || 0,
        LocationLongitude: parseFloat(report.longitude) || 0,
        LocationName: report.locationDescription || "",
        ImageUrl: report.imageUrl || "", // תיקון: שדה ריק במקום null
      };

      console.log(
        "Sending updated report data:",
        JSON.stringify(updatedReportData, null, 2)
      );

      // שליחת בקשה לשרת לסגירת הדיווח
      const response = await fetch(`${API_URL}Report/${report.reportCode}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json; charset=UTF-8",
          Accept: "application/json; charset=UTF-8",
        },
        body: JSON.stringify(updatedReportData),
      });

      console.log(`Close report response status: ${response.status}`);

      if (response.ok) {
        const responseData = await response.json();
        console.log("Report closed successfully:", responseData);

        // עדכון המידע המקומי
        setReport((prev) => ({
          ...prev,
          isOpen: false,
        }));

        Alert.alert(
          "דיווח נסגר בהצלחה",
          "הדיווח נסגר בהצלחה ועבר למצב מטופל.",
          [
            {
              text: "אישור",
              onPress: () => {
                // חזרה למסך הקודם ורענון הרשימה
                navigation.goBack();
              },
            },
          ]
        );
      } else {
        // טיפול בשגיאות שרת
        let errorMessage = "שגיאה לא צפויה";

        try {
          const errorData = await response.text();
          console.error("Server error response:", errorData);

          // נסה לפרסר כ-JSON אם אפשר
          try {
            const errorJson = JSON.parse(errorData);

            // טיפול מיוחד בשגיאות validation
            if (errorJson.errors) {
              const validationErrors = [];
              for (const [field, messages] of Object.entries(
                errorJson.errors
              )) {
                validationErrors.push(`${field}: ${messages.join(", ")}`);
              }
              errorMessage = `שגיאות validation:\n${validationErrors.join(
                "\n"
              )}`;
            } else {
              errorMessage =
                errorJson.message ||
                errorJson.title ||
                `שגיאת שרת: ${response.status}`;
            }
          } catch {
            errorMessage = `שגיאת שרת: ${response.status}`;
          }
        } catch (parseError) {
          console.error("Error parsing server response:", parseError);
          errorMessage = `שגיאת שרת: ${response.status}`;
        }

        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error("Error closing report:", error);

      Alert.alert(
        "שגיאה בסגירת הדיווח",
        error.message ||
          "לא ניתן לסגור את הדיווח כרגע. אנא נסה שוב מאוחר יותר.",
        [
          { text: "נסה שוב", onPress: closeReport },
          { text: "ביטול", style: "cancel" },
        ]
      );
    } finally {
      setIsClosingReport(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={28} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>טוען פרטי דיווח...</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3d8bcd" />
          <Text style={styles.loadingText}>טוען נתונים מהשרת...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state - report not found
  if (!report) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={28} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>פרטי דיווח</Text>
        </View>
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons
            name="alert-circle"
            size={80}
            color="#ff4444"
          />
          <Text style={styles.errorText}>דיווח לא נמצא בשרת</Text>
          <Text style={styles.errorSubText}>
            הדיווח אולי נסגר או שאינו קיים יותר במערכת
          </Text>
          <TouchableOpacity
            style={styles.backToListButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backToListText}>חזרה לרשימת הדיווחים</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>דיווח #{report.reportCode}</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status and Priority Card - עדכון עם סטטוס דינמי */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View style={styles.statusInfo}>
              <View
                style={[
                  styles.priorityBadge,
                  { backgroundColor: getPriorityColor(report.priority) },
                ]}
              >
                <Ionicons
                  name={getPriorityIcon(report.priority)}
                  size={16}
                  color="white"
                />
                <Text style={styles.priorityText}>
                  {getPriorityLabel(report.priority)}
                </Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: report.isOpen ? "#e8f5e8" : "#f5f5f5" },
                ]}
              >
                <Ionicons
                  name={report.isOpen ? "checkmark-circle" : "close-circle"}
                  size={16}
                  color={report.isOpen ? "#4caf50" : "#666"}
                />
                <Text
                  style={[
                    styles.statusText,
                    { color: report.isOpen ? "#4caf50" : "#666" },
                  ]}
                >
                  {report.isOpen ? "פעיל" : "סגור"}
                </Text>
              </View>
            </View>
            <Text style={styles.timeAgo}>{formatTime(report.reportDate)}</Text>
          </View>
        </View>

        {/* Event Type Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>סוג האירוע</Text>
            <MaterialCommunityIcons name="alert" size={24} color="#ff6b35" />
          </View>
          <Text style={styles.eventType}>{report.eventTypeName}</Text>
        </View>

        {/* Description Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>תיאור האירוע</Text>
            <MaterialCommunityIcons name="text-box" size={24} color="#3d8bcd" />
          </View>
          <Text style={styles.description}>{report.reportDescription}</Text>
        </View>

        {/* Location Card with Map */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>מיקום האירוע</Text>
            <MaterialIcons name="location-on" size={24} color="#4caf50" />
          </View>
          <Text style={styles.locationText}>{report.locationDescription}</Text>

          {/* Map section */}
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: getReportLocation().latitude,
                longitude: getReportLocation().longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              scrollEnabled={false}
              zoomEnabled={false}
              rotateEnabled={false}
            >
              <Marker
                coordinate={{
                  latitude: getReportLocation().latitude,
                  longitude: getReportLocation().longitude,
                }}
                title={report.locationDescription || "מיקום האירוע"}
              />
            </MapView>
            <TouchableOpacity style={styles.mapButton} onPress={openLocation}>
              <Text style={styles.mapButtonText}>צפה במפה מלאה</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Reporter Info Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>פרטי המדווח</Text>
            <MaterialIcons name="person" size={24} color="#9c27b0" />
          </View>
          <View style={styles.reporterInfo}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>שם:</Text>
              <Text style={styles.infoValue}>{report.reporterName}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>טלפון:</Text>
              <TouchableOpacity
                onPress={() => handleCall(report.reporterPhoneNumber)}
                disabled={
                  !report.reporterPhoneNumber ||
                  report.reporterPhoneNumber === "לא צוין"
                }
              >
                <Text
                  style={[
                    styles.infoValue,
                    report.reporterPhoneNumber &&
                    report.reporterPhoneNumber !== "לא צוין"
                      ? styles.phoneLink
                      : styles.phoneDisabled,
                  ]}
                >
                  {report.reporterPhoneNumber}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Authority Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>רשות מטפלת</Text>
            <MaterialIcons name="business" size={24} color="#ff9800" />
          </View>
          <Text style={styles.authorityText}>{report.authorityName}</Text>
        </View>

        {/* Date and Time Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>תאריך ושעה</Text>
            <MaterialIcons name="schedule" size={24} color="#607d8b" />
          </View>
          <Text style={styles.dateText}>{formatDate(report.reportDate)}</Text>
        </View>

        {/* Action Buttons - עדכון עם לוגיקה מותאמת */}
        <View style={styles.btnSection}>
          {/* הצג את כפתור סגירת הדיווח רק אם הדיווח פעיל */}
          {report.isOpen && (
            <TouchableOpacity
              style={[
                styles.secondaryBtn,
                isClosingReport && styles.closeButtonDisabled,
              ]}
              onPress={handleCloseReport}
              disabled={isClosingReport}
            >
              {isClosingReport ? (
                <View style={styles.loadingButtonContainer}>
                  <ActivityIndicator size="small" color="#9610FF" />
                  <Text style={[styles.secondaryBtnText, { marginLeft: 8 }]}>
                    סוגר דיווח...
                  </Text>
                </View>
              ) : (
                <Text style={styles.secondaryBtnText}>סגור דיווח</Text>
              )}
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[
              styles.primaryBtn,
              isCreatingEvent && styles.primaryBtnDisabled,
            ]}
            onPress={handleCreateEvent}
            disabled={isCreatingEvent}
          >
            {isCreatingEvent ? (
              <View style={styles.loadingButtonContainer}>
                <ActivityIndicator size="small" color="white" />
                <Text style={[styles.primaryBtnText, { marginLeft: 8 }]}>
                  יוצר אירוע...
                </Text>
              </View>
            ) : (
              <Text style={styles.primaryBtnText}>צור אירוע חירום</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* הודעת מידע מותאמת */}
        <Text style={styles.warningText}>
          {report.isOpen
            ? "💡 ניתן ליצור אירוע חירום מהדיווח או לסגור אותו כמטופל"
            : "✅ דיווח זה נסגר ומטופל"}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    marginLeft: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
    marginRight: 34,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statusCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  priorityBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 15,
    marginLeft: 8,
  },
  priorityText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 4,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 15,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 4,
  },
  timeAgo: {
    fontSize: 14,
    color: "#666",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginRight: 8,
    textAlign: "right",
  },
  eventType: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ff6b35",
    textAlign: "right",
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: "#333",
    textAlign: "right",
  },
  locationText: {
    fontSize: 16,
    color: "#333",
    textAlign: "right",
    marginBottom: 16,
  },
  // Map styles
  mapContainer: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
    marginBottom: 12,
  },
  map: {
    width: "100%",
    height: "100%",
  },
  mapButton: {
    position: "absolute",
    bottom: 10,
    left: 10,
    right: 10,
    backgroundColor: "rgba(61, 139, 205, 0.9)",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  mapButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  reporterInfo: {
    gap: 8,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  infoLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  phoneLink: {
    color: "#3d8bcd",
    textDecorationLine: "underline",
  },
  phoneDisabled: {
    color: "#999",
  },
  authorityText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ff9800",
    textAlign: "right",
  },
  dateText: {
    fontSize: 16,
    color: "#333",
    textAlign: "right",
  },
  // Button styles
  btnSection: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 15,
    marginBottom: 15,
  },
  primaryBtn: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 30,
    marginLeft: 8,
    marginBottom: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#9610FF",
    minWidth: 150,
  },
  primaryBtnDisabled: {
    backgroundColor: "#ccc",
    opacity: 0.6,
  },
  primaryBtnText: {
    color: "white",
    fontSize: 16,
    fontWeight: "regular",
  },
  secondaryBtn: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 30,
    marginRight: 8,
    marginBottom: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#9610FF",
    minWidth: 150,
  },
  secondaryBtnText: {
    color: "#9610FF",
    fontSize: 16,
    fontWeight: "regular",
  },
  closeButtonDisabled: {
    backgroundColor: "#f0f0f0",
    borderColor: "#ccc",
    opacity: 0.6,
  },
  loadingButtonContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  warningText: {
    fontSize: 12,
    color: "#ff6b35",
    textAlign: "center",
    marginTop: 12,
    marginBottom: 32,
    paddingHorizontal: 16,
    lineHeight: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  errorText: {
    fontSize: 18,
    color: "#666",
    marginTop: 16,
    marginBottom: 12,
    textAlign: "center",
  },
  errorSubText: {
    fontSize: 14,
    color: "#999",
    marginBottom: 24,
    textAlign: "center",
    lineHeight: 20,
  },
  backToListButton: {
    backgroundColor: "#3d8bcd",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  backToListText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  closedReportContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    backgroundColor: "#e8f5e8",
    borderRadius: 30,
    minWidth: 200,
  },
  closedReportText: {
    color: "#4caf50",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
});

export default ReportDetailsScreen;
