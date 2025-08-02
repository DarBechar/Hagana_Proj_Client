import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  Alert,
  Image,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import FormInputComp from "../Components/FormInputComp";
import PrimaryBtnComp from "../Components/PrimaryBtnComp";
import SecondaryBtnComp from "../Components/SecondaryBtnComp";
import User from "../Constants/Utils";

export default function SettingsScreen() {
  const navigation = useNavigation();

  const [userForm, setUserForm] = useState({
    id: User.id,
    picture: User.picture,
    FirstName: User.FirstName,
    LastName: User.LastName,
    Email: User.Email,
    phoneNumber: User.phoneNumber,
    birthDate: User.birthDate,
    Address: User.Address,
    EmergencyContacName: User.EmergencyContacName,
    EmercgencyContactPhoneNumber: User.EmercgencyContactPhoneNumber,
    CityID: User.CityID,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Track validation errors
  const [errors, setErrors] = useState({
    FirstName: false,
    LastName: false,
    Email: false,
    phoneNumber: false,
    Address: false,
    EmergencyContacName: false,
    EmercgencyContactPhoneNumber: false,
  });

  const handleInputChange = (field, value) => {
    setUserForm((prevState) => ({
      ...prevState,
      [field]: value,
    }));

    // Mark that there are changes
    setHasChanges(true);

    // Clear error when field is filled
    if (value.trim() !== "" && errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: false,
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {
      FirstName: !userForm.FirstName || userForm.FirstName.trim() === "",
      LastName: !userForm.LastName || userForm.LastName.trim() === "",
      Email: !userForm.Email || userForm.Email.trim() === "",
      phoneNumber: !userForm.phoneNumber || userForm.phoneNumber.trim() === "",
      Address: !userForm.Address || userForm.Address.trim() === "",
      EmergencyContacName:
        !userForm.EmergencyContacName ||
        userForm.EmergencyContacName.trim() === "",
      EmercgencyContactPhoneNumber:
        !userForm.EmercgencyContactPhoneNumber ||
        userForm.EmercgencyContactPhoneNumber.trim() === "",
    };

    setErrors(newErrors);

    // Check if there are any errors
    return !Object.values(newErrors).some((error) => error);
  };

  const handleSave = () => {
    if (!validateForm()) {
      Alert.alert("שגיאת טופס", "אנא מלא את כל השדות הנדרשים", [
        { text: "הבנתי", style: "default" },
      ]);
      return;
    }

    // Here you would typically send the data to your API
    console.log("Saving user data:", userForm);

    Alert.alert("נשמר בהצלחה", "הפרטים האישיים עודכנו בהצלחה", [
      {
        text: "אישור",
        onPress: () => {
          setIsEditing(false);
          setHasChanges(false);
        },
      },
    ]);
  };

  const handleCancel = () => {
    if (hasChanges) {
      Alert.alert("ביטול שינויים", "האם אתה בטוח שברצונך לבטל את השינויים?", [
        {
          text: "המשך עריכה",
          style: "cancel",
        },
        {
          text: "בטל שינויים",
          style: "destructive",
          onPress: () => {
            // Reset form to original values
            setUserForm({
              id: User.id,
              picture: User.picture,
              FirstName: User.FirstName,
              LastName: User.LastName,
              Email: User.Email,
              phoneNumber: User.phoneNumber,
              birthDate: User.birthDate,
              Address: User.Address,
              EmergencyContacName: User.EmergencyContacName,
              EmercgencyContactPhoneNumber: User.EmercgencyContactPhoneNumber,
              CityID: User.CityID,
            });
            setIsEditing(false);
            setHasChanges(false);
            setErrors({});
          },
        },
      ]);
    } else {
      setIsEditing(false);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      handleCancel();
    } else {
      setIsEditing(true);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>הגדרות אישיות</Text>
        <TouchableOpacity style={styles.editButton} onPress={handleEditToggle}>
          <MaterialIcons
            name={isEditing ? "close" : "edit"}
            size={24}
            color="#9610FF"
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
      >
        {/* Profile Picture Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            <Image
              source={require("../../assets/images/Hagana_Logo.png")}
              style={styles.profileImage}
            />
            {isEditing && (
              <TouchableOpacity style={styles.editImageButton}>
                <Ionicons name="camera" size={20} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.userName}>
            {userForm.FirstName} {userForm.LastName}
          </Text>
          <Text style={styles.userRole}>תושב רשום</Text>
        </View>

        {/* Personal Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>פרטים אישיים</Text>

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={styles.inputLabel}>שם פרטי *</Text>
              {isEditing ? (
                <TextInput
                  style={[
                    styles.textInput,
                    errors.FirstName && styles.inputError,
                  ]}
                  value={userForm.FirstName}
                  onChangeText={(value) =>
                    handleInputChange("FirstName", value)
                  }
                  placeholder="הכנס שם פרטי"
                  textAlign="right"
                />
              ) : (
                <Text style={styles.readOnlyText}>{userForm.FirstName}</Text>
              )}
            </View>

            <View style={styles.halfInput}>
              <Text style={styles.inputLabel}>שם משפחה *</Text>
              {isEditing ? (
                <TextInput
                  style={[
                    styles.textInput,
                    errors.LastName && styles.inputError,
                  ]}
                  value={userForm.LastName}
                  onChangeText={(value) => handleInputChange("LastName", value)}
                  placeholder="הכנס שם משפחה"
                  textAlign="right"
                />
              ) : (
                <Text style={styles.readOnlyText}>{userForm.LastName}</Text>
              )}
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>כתובת אימייל *</Text>
            {isEditing ? (
              <TextInput
                style={[styles.textInput, errors.Email && styles.inputError]}
                value={userForm.Email}
                onChangeText={(value) => handleInputChange("Email", value)}
                placeholder="example@email.com"
                textAlign="right"
                keyboardType="email-address"
              />
            ) : (
              <Text style={styles.readOnlyText}>{userForm.Email}</Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>מספר טלפון *</Text>
            {isEditing ? (
              <TextInput
                style={[
                  styles.textInput,
                  errors.phoneNumber && styles.inputError,
                ]}
                value={userForm.phoneNumber}
                onChangeText={(value) =>
                  handleInputChange("phoneNumber", value)
                }
                placeholder="05X-XXXXXXX"
                textAlign="right"
                keyboardType="phone-pad"
              />
            ) : (
              <Text style={styles.readOnlyText}>{userForm.phoneNumber}</Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>תאריך לידה</Text>
            {isEditing ? (
              <TextInput
                style={styles.textInput}
                value={userForm.birthDate}
                onChangeText={(value) => handleInputChange("birthDate", value)}
                placeholder="DD-MM-YYYY"
                textAlign="right"
              />
            ) : (
              <Text style={styles.readOnlyText}>{userForm.birthDate}</Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>כתובת מגורים *</Text>
            {isEditing ? (
              <TextInput
                style={[styles.textInput, errors.Address && styles.inputError]}
                value={userForm.Address}
                onChangeText={(value) => handleInputChange("Address", value)}
                placeholder="רחוב, מספר בית, עיר"
                textAlign="right"
              />
            ) : (
              <Text style={styles.readOnlyText}>{userForm.Address}</Text>
            )}
          </View>
        </View>

        {/* Emergency Contact Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>איש קשר לחירום</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>שם איש קשר *</Text>
            {isEditing ? (
              <TextInput
                style={[
                  styles.textInput,
                  errors.EmergencyContacName && styles.inputError,
                ]}
                value={userForm.EmergencyContacName}
                onChangeText={(value) =>
                  handleInputChange("EmergencyContacName", value)
                }
                placeholder="שם מלא"
                textAlign="right"
              />
            ) : (
              <Text style={styles.readOnlyText}>
                {userForm.EmergencyContacName}
              </Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>טלפון איש קשר *</Text>
            {isEditing ? (
              <TextInput
                style={[
                  styles.textInput,
                  errors.EmercgencyContactPhoneNumber && styles.inputError,
                ]}
                value={userForm.EmercgencyContactPhoneNumber}
                onChangeText={(value) =>
                  handleInputChange("EmercgencyContactPhoneNumber", value)
                }
                placeholder="05X-XXXXXXX"
                textAlign="right"
                keyboardType="phone-pad"
              />
            ) : (
              <Text style={styles.readOnlyText}>
                {userForm.EmercgencyContactPhoneNumber}
              </Text>
            )}
          </View>
        </View>

        {/* Account Info Section */}
        {/* <View style={styles.section}>
          <Text style={styles.sectionTitle}>פרטי חשבון</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>מספר זהות:</Text>
            <Text style={styles.infoValue}>{userForm.id}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>קוד עיר:</Text>
            <Text style={styles.infoValue}>{userForm.CityID}</Text>
          </View>
        </View> */}

        {/* Action Buttons */}
        {isEditing && (
          <View style={styles.buttonSection}>
            <SecondaryBtnComp text="ביטול" onPress={handleCancel} />
            <PrimaryBtnComp text="שמירה" onPress={handleSave} />
          </View>
        )}

        {/* Additional Settings */}
        {/* <View style={styles.section}>
          <Text style={styles.sectionTitle}>הגדרות נוספות</Text>

          <TouchableOpacity style={styles.settingItem}>
            <MaterialIcons name="notifications" size={24} color="#666" />
            <Text style={styles.settingText}>התראות</Text>
            <MaterialIcons name="chevron-left" size={24} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <MaterialIcons name="security" size={24} color="#666" />
            <Text style={styles.settingText}>פרטיות ואבטחה</Text>
            <MaterialIcons name="chevron-left" size={24} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <MaterialIcons name="language" size={24} color="#666" />
            <Text style={styles.settingText}>שפה</Text>
            <MaterialIcons name="chevron-left" size={24} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <MaterialIcons name="help" size={24} color="#666" />
            <Text style={styles.settingText}>עזרה ותמיכה</Text>
            <MaterialIcons name="chevron-left" size={24} color="#ccc" />
          </TouchableOpacity>
        </View> */}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    flex: 1,
  },
  editButton: {
    padding: 5,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 30,
  },
  profileSection: {
    alignItems: "center",
    paddingVertical: 30,
    backgroundColor: "#f8f9fa",
    marginBottom: 20,
  },
  profileImageContainer: {
    position: "relative",
    marginBottom: 15,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#ddd",
  },
  editImageButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#9610FF",
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  userName: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 5,
  },
  userRole: {
    fontSize: 16,
    color: "#666",
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "right",
    color: "#333",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  halfInput: {
    width: "48%",
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 5,
    textAlign: "right",
    fontWeight: "500",
    color: "#333",
  },
  textInput: {
    height: 50,
    padding: 10,
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "transparent",
  },
  inputError: {
    borderColor: "red",
  },
  readOnlyText: {
    fontSize: 16,
    color: "#333",
    textAlign: "right",
    paddingHorizontal: 10,
    paddingVertical: 15,
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  infoLabel: {
    fontSize: 16,
    color: "#666",
    textAlign: "right",
  },
  infoValue: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
    textAlign: "left",
  },
  buttonSection: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  settingText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 15,
    textAlign: "right",
    color: "#333",
  },
});
