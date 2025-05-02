import TripInfoCard from "@/components/trip-info";
import { useVisitedStore } from "@/store/useVisitedStore";
import { useTheme } from "@/theme/ThemeProvider";
import { countries, regions } from "@/utils/regions";
import { setAppIcon } from "@howincodes/expo-dynamic-app-icon";
import { ChevronDown, Moon, Palette, Sun } from "lucide-react-native";
import { useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type AppIconVariant = "light" | "dark" | "tinted" | null;

export default function TripsScreen() {
  const { clearAll, visitedCountries, visitedRegions, visits } =
    useVisitedStore();
  const { colors } = useTheme();
  const [showIconSelector, setShowIconSelector] = useState(false);

  const handleIconChange = (iconName: AppIconVariant) => {
    setAppIcon(iconName);
    setShowIconSelector(false);
  };

  const visitsWithRegionInfo = useMemo(() => {
    return visits
      .map((visit) => {
        const region = regions.find((r) => r.code === visit.regionCode);
        return {
          ...visit,
          regionName: region?.name || "Unknown Region",
          countryName: region?.countryName || "Unknown Country",
        };
      })
      .sort((a, b) => {
        if (!a.dateFrom && !b.dateFrom) return 0;
        if (!a.dateFrom) return 1;
        if (!b.dateFrom) return -1;
        return new Date(b.dateFrom).getTime() - new Date(a.dateFrom).getTime();
      });
  }, [visits]);

  const completedCountries = useMemo(() => {
    return visitedCountries.filter((countryCode) => {
      const country = countries.find((c) => c.code2 === countryCode);
      if (!country) return false;

      const regions = country.states.map((state) => state.code);
      return regions.every((region) => visitedRegions.includes(region));
    });
  }, [visitedCountries, visitedRegions]);

  const handleReset = () => {
    Alert.alert(
      "Reset All Data",
      "Are you sure you want to reset all your travel data? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Reset",
          style: "destructive",
          onPress: clearAll,
        },
      ],
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.statNumber, { color: colors.primary }]}>
              {visitedCountries.length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.secondaryText }]}>
              Countries Visited
            </Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.statNumber, { color: colors.primary }]}>
              {visitedRegions.length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.secondaryText }]}>
              Regions Visited
            </Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.statNumber, { color: colors.primary }]}>
              {completedCountries.length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.secondaryText }]}>
              Countries Completed
            </Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.statNumber, { color: colors.primary }]}>
              {((visitedCountries.length / countries.length) * 100).toFixed(1)}%
            </Text>
            <Text style={[styles.statLabel, { color: colors.secondaryText }]}>
              World Completed
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Trips
          </Text>

          <Pressable style={styles.resetButton} onPress={handleReset}>
            <Text style={styles.resetButtonText}>Remove All</Text>
          </Pressable>

          {visitsWithRegionInfo.length > 0 ? (
            <FlatList
              data={visitsWithRegionInfo}
              keyExtractor={(item) => item.id || item.regionCode}
              style={styles.tripsList}
              renderItem={({ item }) => (
                <TripInfoCard
                  regionName={item.regionName}
                  countryName={item.countryName}
                  dateFrom={item.dateFrom}
                  dateTo={item.dateTo}
                />
              )}
              ListEmptyComponent={
                <Text
                  style={[styles.noTripsText, { color: colors.secondaryText }]}
                >
                  No trips recorded yet.
                </Text>
              }
            />
          ) : (
            <View
              style={[
                styles.noTripsContainer,
                {
                  backgroundColor: colors.card,
                },
              ]}
            >
              <Text
                style={[styles.noTripsText, { color: colors.secondaryText }]}
              >
                No trips recorded yet. Add your travels by tapping regions on
                the map.
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.iconSelectorButton}
          onPress={() => setShowIconSelector(true)}
        >
          <Text style={[styles.iconSelectorButtonText]}>Change App Icon</Text>
        </TouchableOpacity>

        <Modal
          visible={showIconSelector}
          transparent={true}
          animationType="slide"
        >
          <View style={styles.modalContainer}>
            <View
              style={[styles.modalContent, { backgroundColor: colors.card }]}
            >
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Select App Icon
              </Text>
              <TouchableOpacity
                style={styles.iconOption}
                onPress={() => handleIconChange("light")}
              >
                <Sun color={colors.primary} />
                <Text style={[styles.iconLabel, { color: colors.text }]}>
                  Light
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconOption}
                onPress={() => handleIconChange("dark")}
              >
                <Moon color={colors.primary} />
                <Text style={[styles.iconLabel, { color: colors.text }]}>
                  Dark
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconOption}
                onPress={() => handleIconChange("tinted")}
              >
                <Palette color={colors.primary} />
                <Text style={[styles.iconLabel, { color: colors.text }]}>
                  Tinted
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconOption}
                onPress={() => handleIconChange(null)}
              >
                <ChevronDown color={colors.primary} />
                <Text style={[styles.iconLabel, { color: colors.text }]}>
                  Default
                </Text>
              </TouchableOpacity>
              <Pressable
                style={styles.closeButton}
                onPress={() => setShowIconSelector(false)}
              >
                <Text
                  style={[styles.closeButtonText, { color: colors.primary }]}
                >
                  Close
                </Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
    padding: 16,
  },
  statsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: "700",
    color: "#2563eb",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "#64748b",
  },
  section: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  tripsList: {
    maxHeight: "68%",
  },
  tripCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tripInfo: {
    marginBottom: 8,
  },
  regionName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0f172a",
  },
  countryName: {
    fontSize: 14,
    color: "#64748b",
  },
  tripDate: {
    flexDirection: "row",
    alignItems: "center",
  },
  calendarIcon: {
    marginRight: 6,
  },
  dateText: {
    fontSize: 14,
    color: "#64748b",
  },
  noTripsContainer: {
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  noTripsText: {
    textAlign: "center",
    color: "#64748b",
  },
  resetButton: {
    backgroundColor: "#ef4444",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  resetButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  iconSelectorButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    borderRadius: 12,
    backgroundColor: "#2563eb",
    marginTop: 16,
  },
  iconSelectorButtonText: {
    color: "white",
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "600",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  iconOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    width: "100%",
  },
  iconLabel: {
    marginLeft: 8,
    fontSize: 16,
  },
  closeButton: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#2563eb",
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
