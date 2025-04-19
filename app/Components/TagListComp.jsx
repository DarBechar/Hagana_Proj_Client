import { View, StyleSheet } from "react-native";
import { useState } from "react";
import TagComp from "./TagComp";

export default function TagListComp({
  tags,
  multiSelect = false,
  onSelectionChange,
  containerStyle,
  tagStyle,
  textStyle,
  activeColor = "#8e44ad",
  inactiveColor = "white",
  activeTextColor = "white",
  inactiveTextColor = "#333",
}) {
  const [selectedTags, setSelectedTags] = useState(
    tags.reduce((acc, tag) => {
      acc[tag.id] = tag.initialSelected || false;
      return acc;
    }, {})
  );
  const handleTagPress = (id, selected) => {
    let newSelectedTags = { ...selectedTags };

    if (!multiSelect) {
      // If not multiSelect, deselect all other tags
      Object.keys(newSelectedTags).forEach((tagId) => {
        newSelectedTags[tagId] = false;
      });
    }

    newSelectedTags[id] = selected;
    setSelectedTags(newSelectedTags);

    if (onSelectionChange) {
      onSelectionChange(
        Object.keys(newSelectedTags).filter((key) => newSelectedTags[key])
      );
    }
  };
  return (
    <View style={[styles.groupContainer, containerStyle]}>
      {tags.map((tag) => (
        <TagComp
          key={tag.id}
          label={tag.label}
          initialSelected={selectedTags[tag.id]}
          onPress={(selected) => handleTagPress(tag.id, selected)}
          style={tagStyle}
          textStyle={textStyle}
          activeColor={activeColor}
          inactiveColor={inactiveColor}
          activeTextColor={activeTextColor}
          inactiveTextColor={inactiveTextColor}
        />
      ))}
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
    alignItems: "right",
  },
});
