import json
import random
from datetime import datetime, timedelta
import uuid

# --- Configuration ---
NUM_EVENTS = 500

# Define "Hotspots" to ensure clustering happens (Lat, Lon)
HOTSPOTS = [
    {"name": "California Wildfire", "coords": (39.742043, -121.744122), "type": "wildfire"},
    {"name": "Amazon Flood", "coords": (-3.465305, -62.215881), "type": "flood"},
    {"name": "Turkey Earthquake", "coords": (37.1773, 37.0323), "type": "earthquake"},
]

# --- Helper Data ---
SEVERITIES = ["Severe Damage", "Mild Damage", "Little or No Damage"]
CATEGORIES = [
    "Infrastructure Damage",
    "Rescue Volunteering",
    "Affected Individuals",
    "Vehicle Damage",
    "Other Relevant Information"
]
SAMPLE_TEXTS = [
    "Heavy debris blocking the road.",
    "Water levels rising rapidly in the neighborhood.",
    "Building collapsed, people trapped inside.",
    "Fire spreading to nearby residential areas.",
    "Emergency services arriving at the scene.",
    "Bridge structure compromised.",
    "Local residents evacuating to safe ground."
]

def random_coord(center, radius_deg=2.0):
    """Generates a random coordinate within a radius of a center point."""
    lat, lon = center
    # Random offset
    r_lat = random.uniform(-radius_deg, radius_deg)
    r_lon = random.uniform(-radius_deg, radius_deg)
    return round(lon + r_lon, 6), round(lat + r_lat, 6) # GeoJSON is [Lon, Lat]

def generate_event():
    # Pick a random hotspot
    hotspot = random.choice(HOTSPOTS)
    
    # Generate location around that hotspot
    coords = random_coord(hotspot["coords"])
    
    # Random time in the last 7 days
    time_delay = random.randint(0, 7 * 24 * 60)
    timestamp = (datetime.now() - timedelta(minutes=time_delay)).isoformat() + "Z"

    return {
        "type": "Feature",
        "id": str(uuid.uuid4())[:8], # Short unique ID
        "geometry": {
            "type": "Point",
            "coordinates": coords # [Longitude, Latitude]
        },
        "properties": {
            "tweet_text": f"[{hotspot['name']}] {random.choice(SAMPLE_TEXTS)}",
            "image_url": f"https://placehold.co/600x400?text={hotspot['type']}",
            "llava_text": f"AI Analysis: visual evidence of {hotspot['type']} damage including debris and structural failure.",
            "timestamp": timestamp,
            "informativeness": "Informative" if random.random() > 0.1 else "Not Informative",
            "humanitarian_category": random.choice(CATEGORIES),
            "damage_severity": random.choice(SEVERITIES)
        }
    }

# --- Main Execution ---
features = [generate_event() for _ in range(NUM_EVENTS)]

geojson_data = {
    "type": "FeatureCollection",
    "features": features
}

# Save to file
filename = "./src/utils/crisis_events.json"
with open(filename, "w") as f:
    json.dump(geojson_data, f, indent=2)

print(f"Successfully generated {NUM_EVENTS} events in '{filename}'")