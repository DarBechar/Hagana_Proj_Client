import { View, TextInput, Text, StyleSheet } from "react-native";
import { useState, useEffect } from "react";

export default function FormInputComp(props) {
  const [inputHeight, setInputHeight] = useState(40);
  const [textDirection, setTextDirection] = useState("rtl");

  useEffect(() => {
    if (props.type === "multiLine") {
      setInputHeight(100);
    } else {
      setInputHeight(40);
    }

    // Handle text direction based on textAlign prop
    if (props.textAlign === "ltr") {
      setTextDirection("ltr");
    } else {
      setTextDirection("rtl");
    }
  }, [props.type, props.textAlign]);

  return (
    <View>
      <View style={styles.section}>
        <Text style={styles.title}>{props.text}</Text>
        <TextInput
          placeholder={props.placeholder}
          onChangeText={props.inputChange}
          style={[
            styles.input,
            {
              height: inputHeight,
              writingDirection: textDirection,
              textAlign: textDirection === "rtl" ? "right" : "left",
            },
          ]}
          multiline={props.type === "multiLine"}
          returnKeyType="done"
          blurOnSubmit={true}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 20,
    textAlign: "right",
    marginRight: 10,
  },
  input: {
    margin: 8,
    borderWidth: 0,
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    padding: 10,
    textAlignVertical: "top",
  },
  section: {
    flex: 1,
    padding: 5,
    borderBottomWidth: 1,
    borderBottomColor: "black",
  },
});
