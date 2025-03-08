import { useTheme } from "@/theme/ThemeProvider";
import { formatDate, getDurationDays } from "@/utils/date";
import { Calendar } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";

interface TripInfoCardProps {
  regionName?: string;
  countryName?: string;
  dateFrom: string | null;
  dateTo: string | null;
  compact?: boolean;
}

export default function TripInfoCard({
  regionName,
  countryName,
  dateFrom,
  dateTo,
  compact = false,
}: TripInfoCardProps) {
  const { colors } = useTheme();
  const duration = getDurationDays(dateFrom, dateTo);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.card },
        compact && styles.compactContainer,
      ]}
    >
      {!compact && (
        <View style={styles.locationInfo}>
          <Text
            style={[
              styles.regionName,
              { color: colors.text },
              compact && styles.compactRegionName,
            ]}
          >
            {regionName}
          </Text>
          <Text
            style={[
              styles.countryName,
              { color: colors.secondaryText },
              compact && styles.compactCountryName,
            ]}
          >
            {countryName}
          </Text>
        </View>
      )}

      {(dateFrom || dateTo) && (
        <View style={styles.dateInfo}>
          <Calendar
            size={compact ? 14 : 16}
            color={colors.secondaryText}
            style={styles.calendarIcon}
          />
          <View>
            <Text
              style={[
                styles.dateText,
                { color: colors.secondaryText },
                compact && styles.compactDateText,
              ]}
            >
              {formatDate(dateFrom)} - {formatDate(dateTo)}
            </Text>
            {duration && !compact && (
              <Text
                style={[styles.durationText, { color: colors.tertiaryText }]}
              >
                {duration} {duration === 1 ? "day" : "days"}
              </Text>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
  compactContainer: {
    padding: 12,
    marginBottom: 8,
  },
  locationInfo: {
    marginBottom: 8,
  },
  regionName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0f172a",
  },
  compactRegionName: {
    fontSize: 14,
  },
  countryName: {
    fontSize: 14,
    color: "#64748b",
  },
  compactCountryName: {
    fontSize: 12,
  },
  dateInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  calendarIcon: {
    marginRight: 6,
    marginTop: 2,
  },
  dateText: {
    fontSize: 14,
    color: "#64748b",
  },
  compactDateText: {
    fontSize: 12,
  },
  durationText: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 2,
  },
});
