import { View, Pressable, Text, StyleSheet } from "react-native";
export default function PrimaryBtnComp(props) {
  return (
    <Pressable
      style={({ pressed }) =>
        pressed ? [styles.container, { opacity: 0.5 }] : styles.container
      }
      onPress={props.onPress}
    >
      <Text style={styles.text}>{props.text}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 30,
    marginRight: 8,
    marginBottom: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#9610FF",
    marginHorizontal: 16,
    width: 150,
  },
  text: {
    color: "white",
    fontSize: 16,
    fontWeight: "regular",
  },
});
