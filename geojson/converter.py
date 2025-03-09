# Script to convert and optimize GeoJSON file

# URLs:
# - Data files: https://www.naturalearthdata.com/downloads/10m-cultural-vectors/ (Admin 1 - States, Provinces)
# - Converter to GeoJSON: https://mapshaper.org/
# - Optimizer: https://samples.azuremaps.com/geospatial-files/geojson-file-optimizer

import geopandas as gpd
import numpy as np

# Load the GeoJSON file
geojson_path = "data.geojson"
gdf = gpd.read_file(geojson_path)

# Replace empty strings with NaN for easier processing
gdf.replace("", np.nan, inplace=True)

# Create 'group_region_code': 
# Value is 'region_cod' if 'region_cod' and 'region' are not empty
# Otherwise, value is 'iso_3166_2'
gdf["group_region_code"] = np.where(
    gdf["region_cod"].notna() & gdf["region"].notna(),
    gdf["region_cod"],
    gdf["iso_3166_2"]
)

# Create 'group_region_name':
# Value is 'region' if 'region_cod' and 'region' are not empty
# Otherwise, value is 'name'
gdf["group_region_name"] = np.where(
    gdf["region_cod"].notna() & gdf["region"].notna(),
    gdf["region"],
    gdf["name"]
)

# Group by 'group_region_code' and dissolve geometries
gdf_regions = gdf.dissolve(by="group_region_code")

# Keep only the required columns
columns_to_keep = ["group_region_code", "group_region_name", "geometry"]
gdf_regions = gdf_regions.reset_index()[columns_to_keep]

# Save the optimized GeoJSON
output_path = "optimized_regions.geojson"
gdf_regions.to_file(output_path, driver="GeoJSON")

print(f"✅ Optimized GeoJSON saved to {output_path}")

# Please optimize the GeoJSON file using [Optimizer] after processing