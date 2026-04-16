// src/types/index.ts

export interface CrisisEvent {
  type: 'Feature';
  id: string | number; // Unique ID is crucial for map interactions
  geometry: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  properties: {
    // Core Data
    tweet_text: string;
    image_urls: string; // Comma-separated list of full image URLs
    llava_text: string;
    timestamp: string;

    // AI Model Classifications
    informativeness: 'Informative' | 'Not Informative';
    humanitarian_category: string; // e.g., "Infrastructure Damage", "Rescue"
    damage_severity: 'Severe Damage' | 'Mild Damage' | 'Little or No Damage';

    // Optional properties Mapbox might add during clustering
    cluster?: boolean;
    cluster_id?: number;
    point_count?: number;
    point_count_abbreviated?: string | number;
  };
}

export interface CrisisEventCollection {
  type: 'FeatureCollection';
  features: CrisisEvent[];
}
