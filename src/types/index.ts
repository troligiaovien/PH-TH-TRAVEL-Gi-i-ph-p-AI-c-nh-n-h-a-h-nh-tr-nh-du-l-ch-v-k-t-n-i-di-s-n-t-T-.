export type DestinationCategory =
  | 'all'
  | 'history_culture'
  | 'nature_ecology'
  | 'resort_wellness'
  | 'community_craft'
  | 'cuisine_specialty'
  | 'family_leisure';

export interface HighlightPlace {
  name: string;
  description: string;
}

export interface GalleryImage {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  tag: string;
  tagColor?: string;
  location?: string;
  photographerOrSource?: string;
  url?: string;
  colorGradient?: string;
  symbol?: string;
  architecturalStyle?: string;
  bestViewTime?: string;
  isUserUploaded?: boolean;
}

export interface Destination {
  id: string;
  slug: string;
  name: string;
  kicker: string;
  category: DestinationCategory;
  categoryLabel: string;
  district: string;
  shortDescription: string;
  fullDescription: string;
  historicalValue: string;
  activities: string[];
  visitorFeedback?: string[];
  spatialHighlights?: string[];
  mustKnows?: string[];
  prominentSpotsIntro?: string;
  prominentSpots?: HighlightPlace[];
  natureAndClimate?: string;
  distinctiveLandscape?: string;
  historyAndArchitecture?: string;
  travelExperience?: string;
  landscapeExperience?: string;
  visitingTimeNote?: string;
  locationAndLandscape?: string;
  locationAndInfo?: string;
  culturalSignificance?: string;
  tourismValue?: string;
  verifiedAddress: string;
  latitude: number;
  longitude: number;
  googleMapsUrl: string;
  googleEarthUrl: string;
  bestTimeToVisit: string;
  tips: string[];
  imagePlaceholder: {
    title: string;
    caption: string;
    colorGradient: string;
    symbol: string;
  };
  coverImage?: string;
  gallery?: GalleryImage[];
  source: string;
  lastVerified: string;
  distanceFromVietTriKm: number;
}

export interface CulturalArticle {
  id: string;
  slug: string;
  title: string;
  category: 'heritage' | 'customs' | 'cuisine' | 'craft';
  categoryLabel: string;
  summary: string;
  content: string[];
  keyHighlights: string[];
  unescoRecognition?: string;
  source: string;
  lastVerified: string;
  readTime: string;
}

export interface TravelGuideArticle {
  id: string;
  title: string;
  category: 'transport' | 'etiquette' | 'preparation' | 'seasons';
  categoryLabel: string;
  summary: string;
  steps: {
    heading: string;
    details: string;
  }[];
  importantNotice: string;
  source: string;
}

export interface ItineraryStop {
  destinationId: string;
  order: number;
  timeEstimate: string;
  activityTitle: string;
  description: string;
  recommendedTransport: string;
  preTripCheck: string;
}

export interface SuggestedItinerary {
  id: string;
  title: string;
  tagline: string;
  duration: '1_day' | '2_days_1_night' | '3_days_2_nights' | 'half_day';
  durationLabel: string;
  theme: 'culture' | 'nature' | 'wellness' | 'family';
  themeLabel: string;
  suitableFor: string;
  overview: string;
  stops: ItineraryStop[];
  estimatedPacing: string;
  advisoryNote: string;
}

export interface PartnerProposal {
  businessName: string;
  contactPerson: string;
  phone: string;
  email: string;
  serviceType: 'homestay' | 'restaurant' | 'specialty' | 'tour' | 'other';
  district: string;
  description: string;
  createdAt: string;
}

export interface AppAnnouncement {
  enabled: boolean;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'festival';
  link?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface AdminAccount {
  email: string;
  name: string;
  role: 'super_admin';
  assignedDate: string;
  permissions: string[];
}

export interface AppUISettings {
  heroTitle: string;
  heroSubtitle: string;
  heroKicker: string;
  heroFontTheme?: 'sharp_gold' | 'luminous_white' | 'emerald_modern';
  removeTextBg?: boolean;
  heroBgUrl?: string;
  heroBgOverlayOpacity?: number;
  logoUrl?: string;
  logoText?: string;
  logoHeight?: number;
  logoScale?: number;
  logoScaleX?: number;
  logoScaleY?: number;
  updatedAt?: string;
  updatedBy?: string;
}

