import { View, StyleSheet } from "react-native";
import { useState, useEffect } from "react";
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
      if (multiSelect) {
        onSelectionChange(
          Object.keys(newSelectedTags).filter((key) => newSelectedTags[key])
        );
      } else {
        const selectedId = Object.keys(newSelectedTags).find(
          (key) => newSelectedTags[key]
        );
        onSelectionChange(selectedId || null);
      }
    }
  };

  useEffect(() => {
    if (tags && tags.length > 0) {
      setSelectedTags(
        tags.reduce((acc, tag) => {
          acc[tag.id] = tag.initialSelected || false;
          return acc;
        }, {})
      );
    }
  }, [tags]);

  return (
    <View style={[styles.groupContainer, containerStyle]}>
      {tags.map((tag) => (
        <TagComp
          key={tag.id}
          label={tag.label}
          initialSelected={selectedTags[tag.id]}
          onPress={(selected) => handleTagPress(tag.id, selected)}
          style={[styles.tag, tagStyle]}
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
    marginLeft: 8, // Changed from marginRight to marginLeft for RTL
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
    flexDirection: "row-reverse", // Changed from "row" to "row-reverse" for RTL layout
    flexWrap: "wrap",
    justifyContent: "flex-start",
    alignItems: "flex-start",
  },
  tag: {
    marginLeft: 8, // Set margin for spacing between tags
    marginRight: 0,
    marginBottom: 8,
  },
});
