import { View, StyleSheet } from "react-native";
import EventComp from "./Screens/EventComp";
import HomePage from "./Screens/HomePage";
import Navigation from "./Navigation";
import Report from "./Screens/Report";
import NavReport from "./Screens/NavReport";
import { NavigationContainer, NavigationIndependentTree } from "@react-navigation/native";

export default function Index() {
  return (
    <NavigationIndependentTree>
      <>
        {/* <NavReport /> */}
        <Navigation />
      </>
    </NavigationIndependentTree>
  );
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
