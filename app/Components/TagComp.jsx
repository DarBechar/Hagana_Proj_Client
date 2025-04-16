import React, { useState, useEffect } from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

export default function TagComp({
  label,
  initialSelected = false,
  onPress,
  style,
  textStyle,
  activeColor = "#8e44ad",
  inactiveColor = "white",
  activeTextColor = "white",
  inactiveTextColor = "#333",
}) {
  const [selected, setSelected] = useState(initialSelected);

  // Update selected state if initialSelected changes
  useEffect(() => {
    setSelected(initialSelected);
  }, [initialSelected]);

  const handlePress = () => {
    const newSelected = !selected;
    setSelected(newSelected);
    if (onPress) {
      onPress(newSelected);
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: selected ? activeColor : inactiveColor,
          borderColor: activeColor,
        },
        style,
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.text,
          {
            color: selected ? activeTextColor : inactiveTextColor,
          },
          textStyle,
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 30,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 40,
  },
  text: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
});
