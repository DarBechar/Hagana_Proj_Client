// app/Constants/MockReportsData.js

export const mockReports = [
  {
    id: 1,
    reportCode: 1001,
    reportDate: "2025-01-15T10:30:00",
    reporterName: "אברהם כהן",
    reporterPhoneNumber: "050-1234567",
    reportDescription:
      "שריפה גדולה ברחוב הרצל 25. יש עשן כבד ולהבות נראות מהחלון השני. צריך כיבוי אש דחוף!",
    eventTypeName: "שריפה",
    authorityName: "כיבוי אש",
    isOpen: true,
    priority: "high",
    locationDescription: "רחוב הרצל 25, קומה 2",
  },
  {
    id: 2,
    reportCode: 1002,
    reportDate: "2025-01-15T11:15:00",
    reporterName: "שרה לוי",
    reporterPhoneNumber: "052-9876543",
    reportDescription:
      "תאונת דרכים בצומת הרצל ורוטשילד. שני רכבים מעורבים, יש פצועים קלים.",
    eventTypeName: "תאונת דרכים",
    authorityName: "משטרה",
    isOpen: true,
    priority: "medium",
    locationDescription: "צומת הרצל ורוטשילד",
  },
  {
    id: 3,
    reportCode: 1003,
    reportDate: "2025-01-15T12:45:00",
    reporterName: "דוד מזרחי",
    reporterPhoneNumber: "054-5555555",
    reportDescription:
      "הצפה ברחוב בן גוריון עקב פיצוץ צינור מים ראשי. המים זורמים לכיוון הבתים.",
    eventTypeName: "הצפה",
    authorityName: "מי העיר",
    isOpen: true,
    priority: "high",
    locationDescription: "רחוב בן גוריון 15-20",
  },
  {
    id: 4,
    reportCode: 1004,
    reportDate: "2025-01-15T13:20:00",
    reporterName: "מירי גולן",
    reporterPhoneNumber: "053-7777777",
    reportDescription:
      "עץ גדול נפל על הכביש ברחוב הגליל וחוסם את התנועה לחלוטין.",
    eventTypeName: "מפגע בכביש",
    authorityName: "עיריה",
    isOpen: true,
    priority: "medium",
    locationDescription: "רחוב הגליל ליד הפארק",
  },
  {
    id: 5,
    reportCode: 1005,
    reportDate: "2025-01-15T14:10:00",
    reporterName: "יוסי אבני",
    reporterPhoneNumber: "050-3333333",
    reportDescription:
      "הפסקת חשמל נרחבת ברובע הצפוני. מספר רחובות ללא חשמל כבר שעתיים.",
    eventTypeName: "הפסקת חשמל",
    authorityName: "חברת החשמל",
    isOpen: true,
    priority: "low",
    locationDescription: "הרובע הצפוני",
  },
  // דיווח סגור לדוגמה
  {
    id: 6,
    reportCode: 1006,
    reportDate: "2025-01-15T09:00:00",
    reporterName: "רונית גל",
    reporterPhoneNumber: "050-1111111",
    reportDescription: "דיווח על רעש חזק - נפתר",
    eventTypeName: "הפרעת סדר",
    authorityName: "משטרה",
    isOpen: false, // דיווח סגור
    priority: "low",
    locationDescription: "רחוב הביאליק 10",
  },
];

// פונקציות עזר
export const getActiveReports = () => {
  return mockReports.filter((report) => report.isOpen);
};

export const getActiveReportsCount = () => {
  return getActiveReports().length;
};

export const getReportsByPriority = (priority) => {
  return getActiveReports().filter((report) => report.priority === priority);
};

// סימולציה של API call
export const fetchActiveReports = async () => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800));
  return getActiveReports();
};

export const fetchActiveReportsCount = async () => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  return getActiveReportsCount();
};
