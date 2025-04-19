import { View, Pressable, Text, StyleSheet } from "react-native";
import { useState } from "react";
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
  const [isSelected, setIsSelected] = useState(initialSelected);

  const handlePress = () => {
    setIsSelected(!isSelected);
    if (onPress) {
      onPress(!isSelected);
    }
  };
  return (
    <View>
      <Pressable
        style={[
          styles.container,
          {
            backgroundColor: isSelected ? activeColor : inactiveColor,
            borderColor: activeColor,
          },
          style,
        ]}
        onPress={handlePress}
      >
        <Text
          style={[
            styles.text,
            {
              color: isSelected ? activeTextColor : inactiveTextColor,
            },
            textStyle,
          ]}
        >
          {label}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 30,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
  groupContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
  },
});
