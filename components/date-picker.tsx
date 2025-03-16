import { useTheme } from "@/theme/ThemeProvider";
import DateTimePicker, {
  DateTimePickerAndroid,
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Calendar, X } from "lucide-react-native";
import { useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

interface DatePickerProps {
  label: string;
  date: Date | null;
  onChange: (date: Date | null) => void;
  clearable?: boolean;
}

export default function DatePicker({
  label,
  date,
  onChange,
  clearable = true,
}: DatePickerProps) {
  const { colors, isDark } = useTheme();
  const [showPicker, setShowPicker] = useState(false);

  const handlePress = () => {
    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value: date || new Date(),
        onChange: (event, selectedDate) => {
          if (event.type === "dismissed") return;
          onChange(selectedDate || null);
        },
        mode: "date",
      });
    } else {
      setShowPicker(true);
    }
  };

  const handleChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (event.type === "dismissed") return;
    onChange(selectedDate || null);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString();
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.secondaryText }]}>
        {label}
      </Text>
      <View style={styles.inputRow}>
        <Pressable
          style={[
            styles.dateButton,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
          onPress={handlePress}
        >
          <Calendar
            size={20}
            color={colors.secondaryText}
            style={styles.icon}
          />
          <Text
            style={[
              styles.dateText,
              { color: date ? colors.text : colors.secondaryText },
            ]}
          >
            {date ? formatDate(date) : "Select date"}
          </Text>
        </Pressable>

        {date && clearable && (
          <Pressable
            style={[styles.clearButton, { backgroundColor: colors.border }]}
            onPress={() => onChange(null)}
          >
            <X size={16} color={colors.secondaryText} />
          </Pressable>
        )}
      </View>

      {Platform.OS === "ios" && showPicker && (
        <Modal
          transparent={true}
          animationType="slide"
          visible={showPicker}
          onRequestClose={() => setShowPicker(false)}
        >
          <View style={styles.modalContainer}>
            <View
              style={[styles.pickerContainer, { backgroundColor: colors.card }]}
            >
              <View style={styles.pickerHeader}>
                <Pressable onPress={() => setShowPicker(false)}>
                  <Text style={[styles.headerButton, { color: colors.danger }]}>
                    Cancel
                  </Text>
                </Pressable>
                <Text style={[styles.headerTitle, { color: colors.text }]}>
                  {label}
                </Text>
                <Pressable
                  onPress={() => {
                    setShowPicker(false);
                    onChange(date || new Date());
                  }}
                >
                  <Text
                    style={[styles.headerButton, { color: colors.primary }]}
                  >
                    Done
                  </Text>
                </Pressable>
              </View>
              <DateTimePicker
                value={date || new Date()}
                mode="date"
                display="spinner"
                onChange={handleChange}
                themeVariant={isDark ? "dark" : "light"}
                style={styles.picker}
              />
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: "500",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  icon: {
    marginRight: 8,
  },
  dateText: {
    fontSize: 16,
  },
  clearButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  pickerContainer: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    paddingBottom: 30,
  },
  pickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  headerButton: {
    fontSize: 16,
    fontWeight: "600",
  },
  picker: {
    width: "100%",
  },
});
