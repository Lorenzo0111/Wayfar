import VisitModal from "@/components/visit-modal";
import { useVisitedStore } from "@/store/useVisitedStore";
import { useTheme } from "@/theme/ThemeProvider";
import { reverseGeocode } from "@/utils/geo";
import { countries } from "@/utils/regions";
import { Check, X } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import MapView, { Geojson, MapPressEvent } from "react-native-maps";

export default function WorldMapScreen() {
  const { colors, isDark } = useTheme();
  const [selectedCountry, setSelectedCountry] = useState<{
    countryName: string;
    countryCode: string;
    regionCode?: string;
    regionName?: string;
  } | null>(null);
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [geoJsonData, setGeoJsonData] = useState<any>(null);
  const { visitedRegions } = useVisitedStore();

  useEffect(() => {
    const loadGeoJsonData = async () => {
      try {
        const data = require("@/assets/regions.json");
        setGeoJsonData(data);
      } catch (error) {
        console.error("Failed to load GeoJSON data:", error);
      }
    };

    loadGeoJsonData();
  }, []);

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

    if (
      (region && region.name.length === 0) ||
      (!region && location.principalSubdivision.length === 0)
    )
      return;

    setSelectedCountry({
      countryName: location.countryName,
      countryCode: location.countryCode,
      regionCode: location.principalSubdivisionCode,
      regionName: region?.name || location.principalSubdivision,
    });
  }, []);

  const handleOpenVisitModal = () => {
    if (selectedCountry) setShowVisitModal(true);
  };

  const handleCloseVisitModal = () => {
    setShowVisitModal(false);
    setSelectedCountry(null);
  };

  if (!geoJsonData)
    return (
      <View
        style={[
          styles.container,
          {
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: colors.background,
          },
        ]}
      >
        <ActivityIndicator />
      </View>
    );

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
        liteMode
        loadingEnabled
        loadingBackgroundColor={colors.background}
      >
        <Geojson
          geojson={{
            type: "FeatureCollection",
            features: geoJsonData.features.filter((feature: any) =>
              visitedRegions.some(
                (region) =>
                  region ===
                  feature.properties.group_region_code.replace(".", "-"),
              ),
            ),
          }}
          fillColor="#22c55e"
          strokeColor={colors.text}
        />
      </MapView>

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
