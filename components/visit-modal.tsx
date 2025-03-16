import DatePicker from "@/components/date-picker";
import { useVisitedStore } from "@/store/useVisitedStore";
import { useTheme } from "@/theme/ThemeProvider";
import { Visit } from "@/types/visited";
import { Check, Plus, Trash, X } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

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
  const { addVisit, removeVisit, getVisits } = useVisitedStore();
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [mode, setMode] = useState<"add" | "view">("add");
  const [visits, setVisits] = useState<Visit[]>([]);

  const finalRegionCode = regionCode || countryCode;
  const finalRegionName = regionName || countryName;

  useEffect(() => {
    if (!isVisible) return;

    const regionVisits = getVisits(finalRegionCode);
    setVisits(regionVisits);

    if (regionVisits.length > 0) {
      setMode("view");
    } else {
      setMode("add");
      resetForm();
    }
  }, [isVisible, finalRegionCode, getVisits]);

  const resetForm = () => {
    setStartDate(null);
    setEndDate(null);
  };

  const handleAddNew = () => {
    setMode("add");
    resetForm();
  };

  const handleSave = () => {
    addVisit({
      regionCode: finalRegionCode,
      countryCode,
      dateFrom: startDate ? startDate.toISOString() : null,
      dateTo: endDate ? endDate.toISOString() : null,
    });

    setVisits(getVisits(finalRegionCode));
    setMode("view");
    resetForm();
  };

  const handleRemove = (id: string) => {
    removeVisit(id);
    setVisits(getVisits(finalRegionCode));

    if (visits.length <= 1) {
      onClose();
    }
  };

  const renderVisit = ({ item }: { item: Visit }) => {
    const from = item.dateFrom
      ? new Date(item.dateFrom).toLocaleDateString()
      : "Unknown";
    const to = item.dateTo
      ? new Date(item.dateTo).toLocaleDateString()
      : "Present";

    return (
      <View style={[styles.visitItem, { backgroundColor: colors.card }]}>
        <View style={styles.visitInfo}>
          <Text style={[styles.visitDates, { color: colors.text }]}>
            {from} → {to}
          </Text>
        </View>
        <Pressable
          style={[styles.deleteButton, { backgroundColor: colors.danger }]}
          onPress={() => handleRemove(item.id!)}
        >
          <Trash size={16} color="white" />
        </Pressable>
      </View>
    );
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay}>
        <Pressable
          style={[styles.modalContent, { backgroundColor: colors.card }]}
        >
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {mode === "add" ? "Add Visit" : `Visits to ${finalRegionName}`}
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

          {mode === "add" ? (
            <View>
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
                <Pressable
                  style={[
                    styles.button,
                    styles.saveButton,
                    { backgroundColor: colors.success },
                  ]}
                  onPress={handleSave}
                >
                  <Check size={20} color="white" />
                  <Text style={styles.buttonText}>Save Visit</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <View style={styles.visitsContainer}>
              <FlatList
                data={visits}
                renderItem={renderVisit}
                keyExtractor={(item) => item.id!}
                style={styles.visitsList}
              />

              <View style={styles.buttonContainer}>
                <Pressable
                  style={[styles.button, { backgroundColor: colors.primary }]}
                  onPress={handleAddNew}
                >
                  <Plus size={20} color="white" />
                  <Text style={styles.buttonText}>Add New Visit</Text>
                </Pressable>
              </View>
            </View>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 16,
  },
  modalContent: {
    width: "100%",
    maxWidth: 500,
    borderRadius: 16,
    padding: 24,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0f172a",
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
    color: "#0f172a",
    marginBottom: 4,
  },
  countryName: {
    fontSize: 16,
    color: "#64748b",
  },
  dateSelectors: {
    gap: 16,
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
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  saveButton: {
    backgroundColor: "#10b981",
    flex: 1,
  },
  removeButton: {
    backgroundColor: "#ef4444",
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  visitsContainer: {
    maxHeight: 400,
  },
  visitsList: {
    marginBottom: 16,
    maxHeight: 300,
  },
  visitItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: "#f1f5f9",
  },
  visitInfo: {
    flex: 1,
  },
  visitDates: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0f172a",
  },
  deleteButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#ef4444",
  },
});
