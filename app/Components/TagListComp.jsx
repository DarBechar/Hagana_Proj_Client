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
  // Initialize the selected tags state
  const [selectedTags, setSelectedTags] = useState({});

  // Update selected tags when the tags prop changes
  useEffect(() => {
    if (tags && tags.length > 0) {
      const initialSelectedTags = tags.reduce((acc, tag) => {
        acc[tag.id] = tag.initialSelected || false;
        return acc;
      }, {});
      setSelectedTags(initialSelectedTags);
    }
  }, [tags]);

  const handleTagPress = (id, selected) => {
    let newSelectedTags = {};

    if (multiSelect) {
      // For multiple selection, keep existing selections and toggle the current one
      newSelectedTags = { ...selectedTags };
      newSelectedTags[id] = selected;
    } else {
      // For single selection, reset all tags to unselected
      // and only set the clicked one to selected if it's being selected
      tags.forEach((tag) => {
        newSelectedTags[tag.id] = false;
      });

      if (selected) {
        newSelectedTags[id] = true;
      }
    }

    setSelectedTags(newSelectedTags);

    // Notify parent component of selection change
    if (onSelectionChange) {
      if (multiSelect) {
        // For multi-select, return array of all selected IDs
        const selectedIds = Object.keys(newSelectedTags).filter(
          (key) => newSelectedTags[key]
        );
        onSelectionChange(selectedIds);
      } else {
        // For single-select, return the selected ID or null
        const selectedId = selected ? id : null;
        onSelectionChange(selectedId);
      }
    }
  };

  return (
    <View style={[styles.groupContainer, containerStyle]}>
      {tags.map((tag) => (
        <TagComp
          key={tag.id}
          label={tag.label}
          initialSelected={selectedTags[tag.id] || false}
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
