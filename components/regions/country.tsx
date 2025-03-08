import type { CountryGroup } from "@/types/regions";
import { ChevronDown, ChevronRight } from "lucide-react-native";
import { memo, useCallback } from "react";
import { Pressable, StyleSheet, Text } from "react-native";

export const CountryHeader = memo(
  ({
    country,
    onToggle,
    colors,
  }: {
    country: CountryGroup;
    onToggle: (code: string) => void;
    colors: any;
  }) => {
    const handlePress = useCallback(() => {
      onToggle(country.code2);
    }, [country.code2, onToggle]);

    return (
      <Pressable
        style={[
          styles.countryHeader,
          { backgroundColor: colors.countryHeader },
        ]}
        onPress={handlePress}
      >
        {country.isExpanded ? (
          <ChevronDown
            size={20}
            color={colors.secondaryText}
            style={styles.headerIcon}
          />
        ) : (
          <ChevronRight
            size={20}
            color={colors.secondaryText}
            style={styles.headerIcon}
          />
        )}
        <Text style={[styles.countryHeaderText, { color: colors.text }]}>
          {country.name}
        </Text>
        <Text
          style={[styles.countryRegionCount, { color: colors.secondaryText }]}
        >
          {country.states.length}{" "}
          {country.states.length === 1 ? "region" : "regions"}
        </Text>
      </Pressable>
    );
  },
);
CountryHeader.displayName = "CountryHeader";

const styles = StyleSheet.create({
  countryHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: "#e2e8f0",
  },
  headerIcon: {
    marginRight: 8,
  },
  countryHeaderText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#334155",
    flex: 1,
  },
  countryRegionCount: {
    fontSize: 14,
    color: "#64748b",
  },
});
