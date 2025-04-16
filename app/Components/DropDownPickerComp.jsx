import { View } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import React, { useState } from "react";
import { useEffect } from "react";
import { API_URL } from "../Constants/Utils";

export default function Dropdown({ onChangeValue, onToggle, hasError }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(null);
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetchEventTypes();
  }, []);

  useEffect(() => {
    if (onToggle) {
      onToggle(open);
    }
  }, [open, onToggle]);

  const fetchEventTypes = () => {
    setLoading(true);
    fetch(`${API_URL}EventType`, {
      method: "GET",
      headers: new Headers({
        "Content-Type": "application/json; charset=UTF-8",
        Accept: "application/json; charset=UTF-8",
      }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Network response error: ${res.status}`);
        }

        return res.json();
      })
      .then((result) => {
        // Log the first item to inspect its structure
        if (result && result.length > 0) {
          console.log("First item structure:", JSON.stringify(result[0]));
        }

        const formattedData = result.map((item) => {
          const label = item.eventTypeName;
          const value = item.eventTypeCode;

          return {
            label: String(label),
            value: String(value),
          };
        });

        setData(formattedData);
        setLoading(false);
      })
      .catch((error) => {
        console.log("Error fetching event types:", error);
        setError(error.message);
        setLoading(false);
      });
  };

  const handleValueChange = (selectedValue) => {
    if (onChangeValue) {
      onChangeValue(selectedValue);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 8,
        marginTop: 10,
      }}
    >
      <DropDownPicker
        onChangeValue={handleValueChange}
        style={{
          backgroundColor: "#F5F5F5",
          borderWidth: hasError ? 1 : 0,
          borderColor: hasError ? "red" : undefined,
        }}
        textStyle={{
          textAlign: "right", // Text alignment for the selected item
          fontSize: 16,
          writingDirection: "rtl",
        }}
        labelStyle={{
          textAlign: "right", // Text alignment for labels
          writingDirection: "rtl",
        }}
        listItemLabelStyle={{
          textAlign: "right", // Text alignment for list items
          writingDirection: "rtl",
        }}
        dropDownContainerStyle={{
          backgroundColor: "#F5F5F5",
          borderWidth: hasError ? 1 : 0,
          borderColor: hasError ? "red" : undefined,
        }}
        listItemContainerStyle={{
          flexDirection: "row-reverse", // RTL layout for items
          justifyContent: "flex-start",
        }}
        ArrowDownIconComponent={({ style }) => null} // Hide default down arrow
        ArrowUpIconComponent={({ style }) => null} // Hide default up arrow
        TickIconComponent={({ style }) => null} // Hide default tick icon
        open={open}
        rtl={true}
        value={value}
        items={data}
        setOpen={setOpen}
        setValue={setValue}
        setItems={setItems}
        listMode="SCROLLVIEW"
        theme="LIGHT"
        placeholder="בחר סוג אירוע"
        multiple={false}
        showArrowIcon={true}
        arrowIconPosition="RIGHT" // Arrow position on right side (visually left in RTL)
        badgeDotColors={[
          "#e76f51",
          "#00b4d8",
          "#e9c46a",
          "#e76f51",
          "#8ac926",
          "#00b4d8",
          "#e9c46a",
        ]}
      />
    </View>
  );
}
