import re
import json
import random
import os
import urllib.parse
html_file = 'gallery_view.html'

js_file = 'js/data.js'
json_file = 'extracted_images_data_threshold_0_7.json'

# Bounding box of Paris: lat 48.8155 to 48.9021, lng 2.2241 to 2.4699
def random_paris_coord():
    # Slightly biased towards center for heatmap
    lat = random.triangular(48.8155, 48.9021, 48.8588)
    lng = random.triangular(2.2241, 2.4699, 2.3470)
    return round(lat, 6), round(lng, 6)

def run():
    print(f"Reading {json_file}...")
    coords_map = {}
    if os.path.exists(json_file):
        with open(json_file, 'r', encoding='utf-8') as f:
            jdata = json.load(f)
            for item in jdata:
                if 'Image_URL' in item and 'Latitude' in item and 'Longitude' in item:
                    fname = os.path.basename(urllib.parse.urlparse(item['Image_URL']).path)
                    coords_map[fname] = (item['Latitude'], item['Longitude'])
                    
    print(f"Loaded {len(coords_map)} real coordinates.")

    print(f"Reading {html_file}...")
    with open(html_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Regex to find cards
    pattern = re.compile(r'<div class="card">.*?<img src="(.*?)".*?<strong>(.*?)</strong>.*?<div class="ids">ID:\s*(.*?)</div>.*?<a href="(.*?)".*?View Museum Page</a>', re.DOTALL)
    matches = pattern.findall(content)
    print(f"Extracted {len(matches)} records with regex.")

    data = []
    # Using 1000 items max to ensure smooth performance in Leaflet Canvas for a prototype
    # If using thousands, canvas punch-holes might be slow if triggered too often, but heatmap handles it fine.
    limit = 2500
    for i, match in enumerate(matches):
        if i >= limit:
            break
        
        img_url = match[0]
        label = match[1].strip()
        record_id = match[2].strip()
        source_url = match[3]
        
        # Approximate Year from Label
        year_match = re.search(r'\b(18\d{2}|19\d{2}|20\d{2})\b', label)
        if year_match:
            y = int(year_match.group(1))
            year = f"{y}"
            century = (y // 100) + 1
        else:
            y = random.randint(1860, 1930)
            year = f"~ {y}"
            century = (y // 100) + 1

        fname = os.path.basename(urllib.parse.urlparse(img_url).path)
        if fname in coords_map:
            lat, lng = coords_map[fname]
        else:
            lat, lng = random_paris_coord()

        data.append({
            "id": int(record_id) if record_id.isdigit() else i,
            "lat": lat,
            "lng": lng,
            "label": label,
            "year": year,
            "image_url": img_url,
            "source_url": source_url,
            "century": century
        })

    print(f"Writing {len(data)} items to {js_file}...")
    js_content = f"// Automatically extracted from gallery_view.html\nconst archiveData = {json.dumps(data, indent=4, ensure_ascii=False)};\n"
    
    with open(js_file, 'w', encoding='utf-8') as f:
        f.write(js_content)
        
    print("Done!")

if __name__ == '__main__':
    run()
