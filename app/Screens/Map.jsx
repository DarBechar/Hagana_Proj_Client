import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "react-native";
import MapComp from "../Components/MapComp";

export default function Map() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <MapComp></MapComp>
    </SafeAreaView>
  );
}
