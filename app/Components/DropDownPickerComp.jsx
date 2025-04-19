import { View } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import React, { useState } from "react";
import { useEffect } from "react";

export default function Dropdown() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState([]);
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetchEventTypes();
  }, []);

  const fetchEventTypes = () => {
    setLoading(true);
    fetch("https://proj.ruppin.ac.il/bgroup4/test2/tar1/api/EventType", {
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

        // Transform the API response to match dropdown format
        // We'll use a more flexible approach without assuming specific properties
        const formattedData = result.map((item) => {
          // Try different possible property names for label and value
          const label = item.eventTypeName;

          JSON.stringify(item);
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
      const selectedItem = data.find((item) => item.value === selectedValue);

      // Pass both value and label to the parent component
      if (selectedItem) {
        onChangeValue(selectedValue, selectedItem.label);
      } else {
        onChangeValue(selectedValue, null);
      }
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
        onChangeValue={(value) => {
          console.log("Selected value:", value);
        }}
        style={{
          backgroundColor: "#F5F5F5",
          borderWidth: 0,
          textStyle: {
            textAlign: "right",
          },
        }}
        dropDownContainerStyle={{
          backgroundColor: "#F5F5F5",
          borderWidth: 0,
          textAlign: "right",
        }}
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
        multiple={true}
        mode="BADGE"
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
