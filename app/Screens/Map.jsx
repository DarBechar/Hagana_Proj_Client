import { Text, StyleSheet, View, SafeAreaView } from "react-native";
import MapComp from "../Components/MapComp";

export default function Map() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.section}>
        <View style={styles.mapContainer}>
          <MapComp></MapComp>
        </View>
      </View>
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

  section: {
    width: "100%",
    padding: 10,
  },
  mapContainer: {
    height: "100%",
  },
});
