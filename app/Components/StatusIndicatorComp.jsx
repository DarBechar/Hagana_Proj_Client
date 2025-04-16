import { View, Text, StyleSheet } from "react-native";

export default function StatusIndicator({ status }) {
  const getStatusStyle = () => {
    switch (status) {
      case "emergency":
        return {
          backgroundColor: "#ffebeb",
          borderColor: "#ff5252",
          color: "#d32f2f",
        };
      case "warning":
        return {
          backgroundColor: "#fff8e1",
          borderColor: "#ffc107",
          color: "#ff8f00",
        };
      case "normal":
      default:
        return {
          backgroundColor: "#e8f5e9",
          borderColor: "#4caf50",
          color: "#2e7d32",
        };
    }
  };
  const statusStyle = getStatusStyle();

  return (
    <View style={styles.statusSection}>
      <Text style={styles.statusTitle}>סטטוס יישוב</Text>
      <View
        style={[
          styles.statusPill,
          {
            backgroundColor: statusStyle.backgroundColor,
            borderColor: statusStyle.borderColor,
          },
        ]}
      >
        <Text style={[styles.statusText, { color: statusStyle.color }]}>
          {status === "emergency"
            ? "אירוע חירום פעיל"
            : status === "warning"
            ? "בדיקת מצב"
            : "אין אירועים פעילים"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  statusSection: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  statusPill: {
    borderRadius: 25,
    borderWidth: 1,
    paddingHorizontal: 15,
    paddingVertical: 10,
    alignItems: "center",
  },
  statusText: {
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
});
