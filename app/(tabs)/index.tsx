import { CountryHeader } from "@/components/regions/country";
import TripInfoCard from "@/components/trip-info";
import VisitModal from "@/components/visit-modal";
import { useVisitedStore } from "@/store/useVisitedStore";
import { useTheme } from "@/theme/ThemeProvider";
import { CountryGroup, ListItem, Region } from "@/types/regions";
import { regions } from "@/utils/regions";
import Fuse from "fuse.js";
import { CircleCheckBig, Search, X } from "lucide-react-native";
import { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function RegionsScreen() {
  const { colors } = useTheme();
  const { visitedRegions, getVisit } = useVisitedStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [showOnlyVisited, setShowOnlyVisited] = useState(false);
  const [expandedCountries, setExpandedCountries] = useState<
    Record<string, boolean>
  >({});
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [showVisitModal, setShowVisitModal] = useState(false);

  const fuse = useMemo(
    () =>
      new Fuse(regions, {
        keys: ["name", "countryName"],
        threshold: 0.3,
      }),
    [],
  );

  const groupedRegions = useMemo(() => {
    const result: CountryGroup[] = [];
    const countriesMap: Record<string, CountryGroup> = {};

    let filteredRegions = regions;

    if (searchQuery) {
      filteredRegions = fuse.search(searchQuery).map((result) => result.item);
    }

    if (showOnlyVisited) {
      filteredRegions = filteredRegions.filter((region) =>
        visitedRegions.includes(region.code),
      );
    }

    filteredRegions.forEach((region) => {
      if (!countriesMap[region.countryCode]) {
        countriesMap[region.countryCode] = {
          name: region.countryName,
          code2: region.countryCode,
          states: [],
          isExpanded: expandedCountries[region.countryCode] ?? true,
        };
        result.push(countriesMap[region.countryCode]);
      }
      countriesMap[region.countryCode].states.push(region);
    });

    result.sort((a, b) => {
      const aHasVisited = a.states.some((region) =>
        visitedRegions.includes(region.code),
      );
      const bHasVisited = b.states.some((region) =>
        visitedRegions.includes(region.code),
      );

      if (aHasVisited && !bHasVisited) return -1;
      if (!aHasVisited && bHasVisited) return 1;

      return a.name.localeCompare(b.name);
    });

    result.forEach((country) => {
      country.states.sort((a, b) => {
        const aVisited = visitedRegions.includes(a.code);
        const bVisited = visitedRegions.includes(b.code);

        if (aVisited && !bVisited) return -1;
        if (!aVisited && bVisited) return 1;

        return a.name.localeCompare(b.name);
      });
    });

    return result;
  }, [searchQuery, showOnlyVisited, visitedRegions, fuse, expandedCountries]);

  const toggleVisitedFilter = useCallback(() => {
    setShowOnlyVisited((prev) => !prev);
  }, []);

  const toggleCountryExpanded = useCallback((countryCode: string) => {
    setExpandedCountries((prev) => ({
      ...prev,
      [countryCode]: !(prev[countryCode] ?? true),
    }));
  }, []);

  const handleRegionPress = useCallback((region: Region) => {
    setSelectedRegion(region);
    setShowVisitModal(true);
  }, []);

  const handleCloseVisitModal = useCallback(() => {
    setShowVisitModal(false);
    setSelectedRegion(null);
  }, []);

  const flatListItems = useMemo(() => {
    const items: ListItem[] = [];

    groupedRegions.forEach((country) => {
      items.push(country);
      if (country.isExpanded) {
        items.push(...country.states);
      }
    });

    return items;
  }, [groupedRegions]);

  const isCountry = (item: ListItem): item is CountryGroup => {
    return "states" in item;
  };

  const getItemKey = (item: ListItem): string => {
    if (isCountry(item)) return `country-${item.code2}`;

    return `region-${item.countryCode}-${item.code}`;
  };

  const regionsCount = useMemo(() => {
    return groupedRegions.reduce(
      (count, country) => count + country.states.length,
      0,
    );
  }, [groupedRegions]);

  const renderItem = useCallback(
    ({ item }: { item: ListItem }) => {
      if (isCountry(item)) {
        return (
          <CountryHeader
            country={item}
            onToggle={toggleCountryExpanded}
            colors={colors}
          />
        );
      }

      const visit = getVisit(item.code);

      return (
        <Pressable
          style={[
            styles.regionCard,
            { backgroundColor: colors.card },
            visitedRegions.includes(item.code) && [
              styles.visitedRegion,
              { backgroundColor: colors.visitedBackground },
            ],
          ]}
          onPress={() => handleRegionPress(item)}
        >
          <View style={{ flex: 1 }}>
            <Text style={[styles.regionName, { color: colors.text }]}>
              {item.name}
            </Text>
            {visit && (visit.dateFrom || visit.dateTo) && (
              <View style={styles.visitDates}>
                <TripInfoCard
                  compact
                  dateFrom={visit.dateFrom}
                  dateTo={visit.dateTo}
                />
              </View>
            )}
          </View>

          {visitedRegions.includes(item.code) && (
            <View
              style={[styles.visitedBadge, { backgroundColor: colors.success }]}
            >
              <Text style={styles.visitedText}>Visited</Text>
            </View>
          )}
        </Pressable>
      );
    },
    [
      colors,
      visitedRegions,
      getVisit,
      handleRegionPress,
      toggleCountryExpanded,
    ],
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.card }}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View
          style={[
            styles.header,
            { backgroundColor: colors.card, borderBottomColor: colors.border },
          ]}
        >
          <View
            style={[
              styles.searchContainer,
              { backgroundColor: colors.searchBackground },
            ]}
          >
            <Search
              size={20}
              color={colors.secondaryText}
              style={styles.searchIcon}
            />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search regions or countries..."
              placeholderTextColor={colors.secondaryText}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery ? (
              <Pressable
                style={styles.clearButton}
                onPress={() => setSearchQuery("")}
              >
                <X size={20} color={colors.secondaryText} />
              </Pressable>
            ) : null}
            <Pressable
              style={[
                styles.filterButton,
                {
                  backgroundColor: showOnlyVisited
                    ? colors.success
                    : colors.searchBackground,
                },
              ]}
              onPress={toggleVisitedFilter}
            >
              <CircleCheckBig
                size={20}
                color={showOnlyVisited ? "#ffffff" : colors.secondaryText}
              />
            </Pressable>
          </View>
          <Text style={[styles.resultsCount, { color: colors.secondaryText }]}>
            {regionsCount} regions found{" "}
            {showOnlyVisited ? "(visited only)" : ""}
          </Text>
        </View>

        <FlatList
          style={styles.flatList}
          data={flatListItems}
          keyExtractor={getItemKey}
          renderItem={renderItem}
        />

        {selectedRegion && (
          <VisitModal
            isVisible={showVisitModal}
            onClose={handleCloseVisitModal}
            countryCode={selectedRegion.countryCode!}
            countryName={selectedRegion.countryName!}
            regionCode={selectedRegion.code}
            regionName={selectedRegion.name}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    padding: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: "#0f172a",
  },
  clearButton: {
    padding: 4,
  },
  resultsCount: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
  },
  flatList: {
    flex: 1,
    padding: 16,
  },
  regionCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    marginLeft: 16,
    flexDirection: "row",
    justifyContent: "space-between",
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
  visitedRegion: {
    backgroundColor: "#f0fdf4",
  },
  regionName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
    color: "#0f172a",
  },
  visitedBadge: {
    backgroundColor: "#22c55e",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  visitedText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  filterButton: {
    padding: 8,
    marginLeft: 4,
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
  },
  visitDates: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
});
