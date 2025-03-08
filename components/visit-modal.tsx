import { useVisitedStore } from "@/store/useVisitedStore";
import { useTheme } from "@/theme/ThemeProvider";
import { Check, X } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import DatePicker from "./date-picker";

interface VisitModalProps {
  isVisible: boolean;
  onClose: () => void;
  countryCode: string;
  countryName: string;
  regionCode?: string;
  regionName?: string;
}

export default function VisitModal({
  isVisible,
  onClose,
  countryCode,
  countryName,
  regionCode,
  regionName,
}: VisitModalProps) {
  const { colors } = useTheme();
  const { addVisit, removeVisit, getVisit } = useVisitedStore();
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isVisited, setIsVisited] = useState(false);

  const finalRegionCode = regionCode || countryCode;
  const finalRegionName = regionName || countryName;

  useEffect(() => {
    if (!isVisible) return;

    const existingVisit = getVisit(finalRegionCode);
    if (existingVisit) {
      setIsVisited(true);
      setStartDate(
        existingVisit.dateFrom ? new Date(existingVisit.dateFrom) : null,
      );
      setEndDate(existingVisit.dateTo ? new Date(existingVisit.dateTo) : null);
    } else {
      setIsVisited(false);
      setStartDate(null);
      setEndDate(null);
    }
  }, [isVisible, finalRegionCode, getVisit]);

  const handleSave = () => {
    addVisit({
      regionCode: finalRegionCode,
      countryCode,
      dateFrom: startDate ? startDate.toISOString() : null,
      dateTo: endDate ? endDate.toISOString() : null,
    });
    onClose();
  };

  const handleRemove = () => {
    removeVisit(finalRegionCode);
    onClose();
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {isVisited ? "Edit Visit" : "Mark as Visited"}
            </Text>
            <Pressable style={styles.closeButton} onPress={onClose}>
              <X size={24} color={colors.secondaryText} />
            </Pressable>
          </View>

          <View style={styles.locationInfo}>
            <Text style={[styles.locationName, { color: colors.text }]}>
              {finalRegionName}
            </Text>
            <Text style={[styles.countryName, { color: colors.secondaryText }]}>
              {countryName}
            </Text>
          </View>

          <View style={styles.dateSelectors}>
            <DatePicker
              label="Start Date"
              date={startDate}
              onChange={setStartDate}
              clearable
            />
            <DatePicker
              label="End Date"
              date={endDate}
              onChange={setEndDate}
              clearable
            />
          </View>

          <View style={styles.buttonContainer}>
            {isVisited && (
              <Pressable
                style={[
                  styles.button,
                  styles.removeButton,
                  { backgroundColor: colors.danger },
                ]}
                onPress={handleRemove}
              >
                <Text style={styles.buttonText}>Remove</Text>
              </Pressable>
            )}
            <Pressable
              style={[
                styles.button,
                styles.saveButton,
                { backgroundColor: colors.success },
              ]}
              onPress={handleSave}
            >
              <Check size={20} color="white" />
              <Text style={styles.buttonText}>
                {isVisited ? "Update" : "Mark as Visited"}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  closeButton: {
    padding: 4,
  },
  locationInfo: {
    marginBottom: 24,
  },
  locationName: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  countryName: {
    fontSize: 16,
  },
  dateSelectors: {
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 120,
  },
  saveButton: {
    backgroundColor: "#22c55e",
  },
  removeButton: {
    backgroundColor: "#ef4444",
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 8,
  },
});
