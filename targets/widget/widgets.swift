import WidgetKit
import SwiftUI

struct Provider: TimelineProvider {
    func placeholder(in context: Context) -> SimpleEntry {
        SimpleEntry(date: Date())
    }

    func getSnapshot(in context: Context, completion: @escaping (SimpleEntry) -> ()) {
        let entry = SimpleEntry(date: Date())
        completion(entry)
    }
    
    func getTimeline(in context: Context, completion: @escaping (Timeline<SimpleEntry>) -> ()) {
        var entries: [SimpleEntry] = []
        let currentDate = Date()
        
        for hourOffset in 0 ..< 5 {
            let entryDate = Calendar.current.date(byAdding: .hour, value: hourOffset, to: currentDate)!
            entries.append(SimpleEntry(date: entryDate))
        }

        let timeline = Timeline(entries: entries, policy: .atEnd)
        completion(timeline)
    }
}

struct SimpleEntry: TimelineEntry {
    let date: Date
}

struct TravelStats {
    let visitedCountries: Int
    let visitedRegions: Int
    let countriesCompleted: Int
    let worldCompleted: Int
    
    static var placeholder: TravelStats {
        TravelStats(
            visitedCountries: 25,
            visitedRegions: 12, 
            countriesCompleted: 13,
            worldCompleted: 13
        )
    }
}

struct ProgressBar: View {
    var value: Int
    var label: String
    var color: Color
    
    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack {
                Text(label)
                    .font(.caption)
                    .foregroundColor(.secondary)
                Spacer()
                Text("\(value)%")
                    .font(.caption)
                    .fontWeight(.bold)
            }
            
            GeometryReader { geometry in
                ZStack(alignment: .leading) {
                    RoundedRectangle(cornerRadius: 4)
                        .fill(Color.gray.opacity(0.2))
                        .frame(height: 6)
                    
                    RoundedRectangle(cornerRadius: 4)
                        .fill(LinearGradient(gradient: Gradient(colors: [color.opacity(0.8), color]), startPoint: .leading, endPoint: .trailing))
                        .frame(width: geometry.size.width * CGFloat(value) / 100, height: 6)
                }
            }
            .frame(height: 6)
        }
    }
}

struct CounterView: View {
    var value: Int
    var label: String
    var color: Color
    
    var body: some View {
        VStack(spacing: 4) {
            Text("\(value)")
                .font(.system(size: 22, weight: .bold, design: .rounded))
                .foregroundColor(color)
            
            Text(label)
                .font(.caption2)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
    }
}

struct CircularProgressView: View {
    var progress: Double
    var label: String
    
    var body: some View {
        ZStack {
            Circle()
                .stroke(Color.gray.opacity(0.2), lineWidth: 5)
            
            Circle()
                .trim(from: 0, to: CGFloat(progress))
                .stroke(
                    LinearGradient(
                        gradient: Gradient(colors: [.blue, .green]),
                        startPoint: .leading,
                        endPoint: .trailing
                    ),
                    style: StrokeStyle(lineWidth: 5, lineCap: .round)
                )
                .rotationEffect(.degrees(-90))
                .animation(.easeInOut, value: progress)
            
            Text(label)
                .font(.caption2)
                .fontWeight(.bold)
        }
    }
}

struct WorldMapView: View {
    var percentage: Double
    
    var body: some View {
        ZStack {
            Image(systemName: "globe")
                .resizable()
                .scaledToFit()
                .foregroundStyle(
                    .linearGradient(
                        colors: [.gray.opacity(0.3), .gray.opacity(0.2)],
                        startPoint: .top,
                        endPoint: .bottom
                    )
                )
            
            Circle()
                .trim(from: 0, to: CGFloat(percentage))
                .stroke(
                    LinearGradient(
                        gradient: Gradient(colors: [.blue, .green]),
                        startPoint: .leading,
                        endPoint: .trailing
                    ),
                    style: StrokeStyle(lineWidth: 6, lineCap: .round)
                )
                .rotationEffect(.degrees(-90))
                .padding(15)
        }
    }
}

struct widgetEntryView : View {
    var entry: Provider.Entry
    @Environment(\.widgetFamily) var widgetFamily
    @Environment(\.colorScheme) var colorScheme
  
    var stats: TravelStats {
        #if DEBUG
        return TravelStats.placeholder
        #else
        let defaults = UserDefaults(suiteName: "group.me.lorenzo0111.wayfar")
        return TravelStats(
            visitedCountries: defaults?.integer(forKey: "visitedCountries") ?? 0,
            visitedRegions: defaults?.integer(forKey: "visitedRegions") ?? 0,
            countriesCompleted: defaults?.integer(forKey: "countriesCompleted") ?? 0,
            worldCompleted: defaults?.integer(forKey: "worldCompleted") ?? 0
        )
        #endif
    }

    var formattedDate: String {
        let formatter = DateFormatter()
        formatter.dateStyle = .short
        formatter.timeStyle = .short
        return formatter.string(from: entry.date)
    }

    var body: some View {
        Group {
            switch widgetFamily {
            case .systemSmall:
                smallWidget
            case .systemMedium:
                mediumWidget
            default:
                largeWidget
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
    
    var smallWidget: some View {
        VStack(spacing: 10) {                
            Text("\(stats.visitedCountries)")
                .font(.system(size: 42, weight: .bold, design: .rounded))
                .foregroundColor(.primary)
                .minimumScaleFactor(0.5)
            
            Text("Visited Countries")
                .font(.caption)
                .fontWeight(.medium)
            
            CircularProgressView(
                progress: Double(stats.worldCompleted) / 100.0,
                label: "\(stats.worldCompleted)%"
            )
            .frame(width: 60, height: 60)
        }
    }
    
    var mediumWidget: some View {
        HStack {
            VStack(alignment: .leading, spacing: 12) {                  
                HStack(spacing: 20) {
                    CounterView(
                        value: stats.visitedCountries,
                        label: "Countries",
                        color: .blue
                    )
                    
                    CounterView(
                        value: stats.visitedRegions,
                        label: "Regions",
                        color: .green
                    )
                }
                
                Spacer()
                
                ProgressBar(
                    value: stats.worldCompleted,
                    label: "World Completed",
                    color: .blue
                )
            }
            
            Divider()
            
            VStack {
                WorldMapView(percentage: Double(stats.worldCompleted) / 100.0)
                    .frame(width: 100, height: 70)
                
                Text("\(stats.worldCompleted)%")
                    .font(.system(.title3, design: .rounded))
                    .fontWeight(.bold)
                    .foregroundColor(.blue)
            }
            .padding(.leading, 8)
        }
        .padding()
    }
    
    var largeWidget: some View {
        VStack(spacing: 16) {          
            WorldMapView(percentage: Double(stats.worldCompleted) / 100.0)
                .frame(height: 120)
            
            HStack {
                CounterView(
                    value: stats.visitedCountries,
                    label: "Visited Countries",
                    color: .blue
                )
                
                Divider()
                
                CounterView(
                    value: stats.visitedRegions,
                    label: "Explored Regions",
                    color: .green
                )
            }
            .padding(.vertical, 8)
            
            Divider()
            
            VStack(spacing: 12) {
                ProgressBar(
                    value: stats.countriesCompleted,
                    label: "Completed Countries",
                    color: .blue
                )
                
                ProgressBar(
                    value: stats.worldCompleted,
                    label: "Completed World",
                    color: .green
                )
            }
        }
        .padding()
    }
}

struct TravelWidget: Widget {
    let kind: String = "TravelWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            widgetEntryView(entry: entry)
                .containerBackground(.background, for: .widget)
        }
        .configurationDisplayName("Travel Stats")
        .description("Track your travel statistics.")
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
    }
}

#Preview(as: .systemSmall) {
    TravelWidget()
} timeline: {
    SimpleEntry(date: Date())
}

#Preview(as: .systemMedium) {
    TravelWidget()
} timeline: {
    SimpleEntry(date: Date())
}

#Preview(as: .systemLarge) {
    TravelWidget()
} timeline: {
    SimpleEntry(date: Date())
}