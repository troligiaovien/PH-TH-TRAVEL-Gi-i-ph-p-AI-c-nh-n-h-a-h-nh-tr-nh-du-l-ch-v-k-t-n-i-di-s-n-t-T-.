/**
 * Types for the PHU THO AI TRAVEL PLANNER
 * AI Kiến Tạo Hành Trình Cá Nhân Hóa
 */

export type BudgetTier = 'budget' | 'balanced' | 'comfort' | 'luxury';

export type TravelPace = 'relaxed' | 'balanced' | 'active';

export interface TripMembers {
  total: number;
  adults: number;
  children: number;
  childAges?: string;
  seniors: number;
  specialNeeds?: string;
}

export interface TripRequestForm {
  prompt: string;
  startLocation: string;
  startDate: string;
  daysCount: number;
  nightsCount: number;
  members: TripMembers;
  budgetTier: BudgetTier;
  budgetAmountVND?: number;
  interests: string[];
  dislikes: string[];
  flexibility: 'fixed' | 'weather_adaptive' | 'cost_first' | 'comfort_first';
  pace: TravelPace;
  preferredAccommodation?: 'homestay' | 'hotel' | 'resort' | 'any';
  requiredDestinationIds: string[];
}

export type ActivityType =
  | 'transit'
  | 'sightseeing'
  | 'dining'
  | 'relaxation'
  | 'lodging'
  | 'cultural'
  | 'photo';

export interface AIItineraryActivity {
  id: string;
  timeSlot: string;
  type: ActivityType;
  title: string;
  locationName: string;
  destinationId?: string;
  description: string;
  travelDistanceKm?: number;
  travelDurationMinutes?: number;
  estimatedCostVND: number;
  costVerificationStatus: 'verified' | 'estimated' | 'free' | 'unverified';
  costNote?: string;
  notes: string[];
  verifiedSources: string[];
  suitableFor: string;
  contingencyPlan?: string;
  latitude?: number;
  longitude?: number;
  googleMapsUrl?: string;
}

export interface AIItineraryDay {
  dayNumber: number;
  title: string;
  theme: string;
  summary: string;
  activities: AIItineraryActivity[];
  dayBudgetVND: number;
}

export interface ItineraryBudget {
  totalEstimatedVND: number;
  costPerPersonVND: number;
  targetBudgetVND?: number;
  status: 'within_budget' | 'near_budget' | 'exceeds_budget';
  differenceVND?: number;
  breakdown: {
    transportVND: number;
    lodgingVND: number;
    diningVND: number;
    activitiesVND: number;
    contingencyVND: number;
  };
  savingTips: string[];
  unverifiedItems: string[];
}

export interface ItineraryHandbook {
  weatherNote: string;
  packingList: string[];
  culturalEtiquette: string[];
  emergencyContacts: {
    name: string;
    phone: string;
    address?: string;
  }[];
}

export interface AIReasoning {
  whySelected: string;
  groupCustomization: string;
  routeOptimizationLogic: string;
  dislikeAccommodations: string;
}

export interface AIItineraryPlan {
  id: string;
  title: string;
  tagline: string;
  variant: 'optimal' | 'budget' | 'relaxed';
  variantLabel: string;
  durationLabel: string;
  totalDays: number;
  totalNights: number;
  startingPoint: string;
  transportation: string;
  feasibilityScore: number;
  dataConfidenceSummary: string;
  days: AIItineraryDay[];
  budget: ItineraryBudget;
  handbook: ItineraryHandbook;
  aiReasoning: AIReasoning;
  alternativePlans?: {
    variant: 'optimal' | 'budget' | 'relaxed';
    title: string;
    description: string;
    totalCostVND: number;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface PlannerChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggestedPrompts?: string[];
  planUpdated?: boolean;
}
