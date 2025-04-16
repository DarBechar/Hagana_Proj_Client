import { View, StyleSheet } from "react-native";
import EventComp from "./Screens/EventComp";
import HomePage from "./Screens/HomePage";
import Navigation from "./Navigation";

export default function Index() {
  return <Navigation />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#FFFFFF",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  selectedText: {
    marginTop: 10,
    fontSize: 16,
    color: "#007BFF",
  },
});
