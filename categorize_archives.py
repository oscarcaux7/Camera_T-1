import json
import urllib.request
import re

# Download geojson
url = "https://opendata.paris.fr/api/explore/v2.1/catalog/datasets/arrondissements/exports/geojson"
try:
    req = urllib.request.urlopen(url)
    geojson = json.loads(req.read())
except Exception as e:
    print("Error downloading GeoJSON:", e)
    exit(1)

# Simple ray-casting point-in-polygon
def point_in_poly(x, y, poly):
    n = len(poly)
    inside = False
    p1x, p1y = poly[0]
    for i in range(n+1):
        p2x, p2y = poly[i % n]
        if y > min(p1y, p2y):
            if y <= max(p1y, p2y):
                if x <= max(p1x, p2x):
                    if p1y != p2y:
                        xints = (y-p1y)*(p2x-p1x)/(p2y-p1y)+p1x
                    if p1x == p2x or x <= xints:
                        inside = not inside
        p1x, p1y = p2x, p2y
    return inside

# Helper to check all polygons for an arrondissement
def get_arrond(lat, lng):
    # geojson has coordinates as [lng, lat]
    x, y = lng, lat
    for feature in geojson['features']:
        # 'c_ar' is 1, 2, 3, etc.
        arr = int(feature['properties']['c_ar'])
        geom = feature['geometry']
        if geom['type'] == 'Polygon':
            polys = [geom['coordinates'][0]]
        elif geom['type'] == 'MultiPolygon':
            polys = [p[0] for p in geom['coordinates']]
        
        for poly in polys:
            if point_in_poly(x, y, poly):
                return arr
    return "Other"

# Read data.js
with open('js/data.js', 'r', encoding='utf-8') as f:
    text = f.read()

# Prefix can have slightly different whitespaces, just extract the list
start = text.find('[')
end = text.rfind(']') + 1
data_json = text[start:end]
prefix = text[:start]

data = json.loads(data_json)

# Assign
counts = {}
for item in data:
    arr = get_arrond(item['lat'], item['lng'])
    item['arrondissement'] = arr
    counts[arr] = counts.get(arr, 0) + 1

out_text = prefix + json.dumps(data, indent=4, ensure_ascii=False) + ";\n"
with open('js/data.js', 'w', encoding='utf-8') as f:
    f.write(out_text)

print("Done categorization.")
print("Counts:", counts)
