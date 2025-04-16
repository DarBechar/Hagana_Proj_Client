import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";

export default function FormInputComp({
  text,
  type,
  textAlign,
  placeholder,
  inputChange,
  hasError = false,
}) {
  return (
    <View style={styles.container}>
      {text && <Text style={styles.label}>{text}</Text>}
      {type === "singleLine" ? (
        <TextInput
          style={[
            styles.input,
            { textAlign: textAlign },
            hasError && styles.inputError,
          ]}
          placeholder={placeholder}
          onChangeText={inputChange}
          returnKeyType="done"
        />
      ) : (
        <TextInput
          style={[
            styles.multiLineInput,
            { textAlign: textAlign },
            hasError && styles.inputError,
          ]}
          placeholder={placeholder}
          onChangeText={inputChange}
          multiline={true}
          numberOfLines={4}
          textAlignVertical="top"
          textAlign={textAlign} // Important for placeholder alignment
          writingDirection="rtl" // Forces RTL text direction
          placeholderTextColor="#999" //
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    padding: 10,
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: "right",
    fontWeight: "500",
  },
  input: {
    height: 50,
    padding: 10,
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    fontSize: 16,
  },
  multiLineInput: {
    minHeight: 100,
    padding: 10,
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    fontSize: 16,
  },
  inputError: {
    borderWidth: 1,
    borderColor: "red",
  },
});
