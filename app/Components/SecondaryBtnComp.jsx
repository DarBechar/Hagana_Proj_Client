import { Text, StyleSheet, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function SecondaryBtnComp(props) {
  return (
    <Pressable
      style={({ pressed }) => (pressed ? { opacity: 0.5 } : { opacity: 1 })}
      onPress={props.onPress}
    >
      <LinearGradient
        colors={["#F89300", "#FFBB58"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <Text style={styles.text}>{props.text}</Text>
      </LinearGradient>
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
    marginHorizontal: 16,
    width: 150,
  },
  text: {
    color: "white",
    fontSize: 16,
    fontWeight: "regular",
  },
});
