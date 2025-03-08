import VisitModal from "@/components/visit-modal";
import { useTheme } from "@/theme/ThemeProvider";
import { reverseGeocode } from "@/utils/geo";
import { countries } from "@/utils/regions";
import { Check, X } from "lucide-react-native";
import { useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import MapView, { MapPressEvent } from "react-native-maps";

export default function WorldMapScreen() {
  const { colors, isDark } = useTheme();
  const [selectedCountry, setSelectedCountry] = useState<{
    countryName: string;
    countryCode: string;
    regionCode?: string;
    regionName?: string;
  } | null>(null);
  const [showVisitModal, setShowVisitModal] = useState(false);

  const handleMapPress = useCallback(async (e: MapPressEvent) => {
    const { coordinate } = e.nativeEvent;
    const location = await reverseGeocode(
      coordinate.latitude,
      coordinate.longitude,
    );

    if (!location.countryCode) return;

    const country = countries.find((c) => c.code2 === location.countryCode);
    const region = country?.states.find(
      (c) => c.code === location.principalSubdivisionCode,
    );

    setSelectedCountry({
      countryName: location.countryName,
      countryCode: location.countryCode,
      regionCode: location.principalSubdivisionCode,
      regionName: region?.name || location.principalSubdivision,
    });
  }, []);

  const handleOpenVisitModal = () => {
    if (selectedCountry) {
      setShowVisitModal(true);
    }
  };

  const handleCloseVisitModal = () => {
    setShowVisitModal(false);
    setSelectedCountry(null);
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 20,
          longitude: 0,
          latitudeDelta: 100,
          longitudeDelta: 100,
        }}
        onPress={handleMapPress}
        userInterfaceStyle={isDark ? "dark" : "light"}
      />

      {selectedCountry && (
        <View style={[styles.countryModal, { backgroundColor: colors.card }]}>
          <Text style={[styles.countryName, { color: colors.text }]}>
            {selectedCountry.regionName ?? selectedCountry.countryName}
          </Text>
          <View style={styles.buttonContainer}>
            <Pressable
              style={[styles.button, styles.cancelButton]}
              onPress={() => setSelectedCountry(null)}
            >
              <X size={24} color="#fff" />
            </Pressable>
            <Pressable
              style={[styles.button, styles.confirmButton]}
              onPress={handleOpenVisitModal}
            >
              <Check size={24} color="#fff" />
            </Pressable>
          </View>
        </View>
      )}

      {selectedCountry && (
        <VisitModal
          isVisible={showVisitModal}
          onClose={handleCloseVisitModal}
          countryCode={selectedCountry.countryCode}
          countryName={selectedCountry.countryName}
          regionCode={selectedCountry.regionCode}
          regionName={selectedCountry.regionName}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: "100%",
    height: "100%",
  },
  countryModal: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  countryName: {
    fontSize: 18,
    fontWeight: "600",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 10,
  },
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#ef4444",
  },
  confirmButton: {
    backgroundColor: "#22c55e",
  },
});
