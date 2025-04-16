import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  Image,
  TouchableOpacity,
  Animated,
  PanResponder,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");
const SLIDER_TRACK_WIDTH = 250;
const SLIDER_BUTTON_SIZE = 60;
const MODAL_HEIGHT = (height * 2) / 3;

const EmergencyAlertModal = ({ visible, onClose, onSlide }) => {
  // Animation values
  const pan = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(MODAL_HEIGHT)).current;
  const [sliderComplete, setSliderComplete] = useState(false);

  // Handle modal animation
  useEffect(() => {
    if (visible) {
      pan.setValue(0);
      setSliderComplete(false);

      // Animate the modal sliding up
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 70,
        friction: 12,
        useNativeDriver: true,
      }).start();
    } else {
      // Animate the modal sliding down when closing
      Animated.timing(slideAnim, {
        toValue: MODAL_HEIGHT,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  // Create the pan responder with fixed completion behavior
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        // Limit the slider to move only right and within bounds (0 to max track width)
        const newX = Math.max(
          0,
          Math.min(gestureState.dx, SLIDER_TRACK_WIDTH - SLIDER_BUTTON_SIZE)
        );
        pan.setValue(newX);
      },
      onPanResponderRelease: (_, gestureState) => {
        // Calculate the maximum slide distance
        const maxSlideDistance = SLIDER_TRACK_WIDTH - SLIDER_BUTTON_SIZE;

        // Check if slider is dragged far enough to trigger action (at least 75% of the way)
        const threshold = maxSlideDistance * 0.75;

        if (gestureState.dx > threshold) {
          // Immediately set to final position instead of animating
          pan.setValue(maxSlideDistance);
          setSliderComplete(true);

          // Call the callback function after a short delay to show the completed state
          setTimeout(() => {
            if (onSlide) onSlide();
          }, 250);
        } else {
          // Reset the slider if not dragged far enough
          Animated.timing(pan, {
            toValue: 0,
            duration: 200,
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  // Calculate the background gradient based on slider position
  const interpolatedColor = pan.interpolate({
    inputRange: [0, SLIDER_TRACK_WIDTH - SLIDER_BUTTON_SIZE],
    outputRange: ["rgba(225, 190, 255, 0.5)", "rgba(123, 31, 219, 0.8)"],
    extrapolate: "clamp",
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <Animated.View
          style={[
            styles.modalContent,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          {/* Logo */}
          <Image
            source={require("../../assets/images/Hagana_Logo.png")}
            style={styles.logo}
          />
          <Text style={styles.title}>HAGANA</Text>
          {/* Alert message */}
          <Text style={styles.alertMessage}>נדרש סיוע באירוע חירום</Text>
          {/* Location indicator */}
          <View style={styles.locationContainer}>
            <Text style={styles.locationText}>בית העם, עולש</Text>
            <Ionicons name="location" size={18} color="#333" />
          </View>
          <View style={styles.indicatorContainer}>
            <View style={[styles.statusIndicator, styles.Indicator]}>
              <Text style={styles.indicatorText}>סירוב הבקשה</Text>
            </View>

            <View style={[styles.statusIndicator, styles.Indicator]}>
              <Text style={styles.indicatorText}>אישור</Text>
              <Ionicons
                name="flame-outline"
                size={16}
                color="#888"
                style={styles.indicatorIcon}
              />
            </View>
          </View>
          {/* Slide to answer */}
          <View style={styles.sliderContainer}>
            <Animated.View
              style={[
                styles.sliderTrack,
                { backgroundColor: interpolatedColor },
              ]}
            >
              <Text style={styles.sliderText}>הצטרף לאירוע</Text>
            </Animated.View>

            <Animated.View
              style={[
                styles.sliderButton,
                { transform: [{ translateX: pan }] },
                sliderComplete && styles.sliderButtonComplete,
              ]}
              {...panResponder.panHandlers}
            >
              <Ionicons name="chevron-forward" size={30} color="#FFF" />
            </Animated.View>
          </View>
          {/* Skip link */}
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.skipText}>לא יכול להכנס לאירוע</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "100%",
    height: MODAL_HEIGHT,
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 10,
  },
  logo: {
    width: 60,
    height: 60,
    resizeMode: "contain",
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  alertMessage: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  locationText: {
    fontSize: 16,
    marginRight: 5,
  },
  indicatorContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 30,
  },
  statusIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    width: "48%",
  },
  Indicator: {
    backgroundColor: "#f2f2f2",
  },
  indicatorText: {
    color: "#000",
    fontWeight: "500",
    fontSize: 14,
  },
  indicatorIcon: {
    marginLeft: 5,
  },
  sliderContainer: {
    position: "relative",
    width: SLIDER_TRACK_WIDTH,
    height: SLIDER_BUTTON_SIZE,
    marginBottom: 15,
  },
  sliderTrack: {
    width: "100%",
    height: SLIDER_BUTTON_SIZE,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  sliderText: {
    textAlign: "center",
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  sliderButton: {
    position: "absolute",
    width: SLIDER_BUTTON_SIZE,
    height: SLIDER_BUTTON_SIZE,
    borderRadius: 30,
    backgroundColor: "#7b1fdb",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    left: 0, // Explicitly set the starting position
  },
  sliderButtonComplete: {
    backgroundColor: "#6200ea",
  },
  skipText: {
    color: "#7b1fdb",
    fontSize: 14,
    marginTop: 5,
    textDecorationLine: "underline",
  },
});

export default EmergencyAlertModal;
