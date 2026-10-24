export type ArticleCategory =
  | 'all'
  | 'general_guide'
  | 'tips_hacks'
  | 'culture_heritage'
  | 'local_cuisine'
  | 'itineraries'
  | 'family'
  | 'green_sustainable'
  | 'smart_tourism';

export interface ArticleSectionCallout {
  type: 'info' | 'warning' | 'tip' | 'quote';
  title: string;
  text: string;
}

export interface ArticleSection {
  id: string;
  title: string;
  paragraphs?: string[];
  subsections?: {
    title: string;
    content: string[];
  }[];
  callout?: ArticleSectionCallout;
  checklist?: string[];
  bulletPoints?: {
    heading: string;
    detail: string;
  }[];
  comparisonTable?: {
    headers: string[];
    rows: string[][];
  };
}

export interface PracticalAdviceItem {
  tip: string;
  why: string;
  howToApply: string;
}

export interface VerifiedSource {
  name: string;
  publisher: string;
  url?: string;
  accessDate?: string;
  verifiedNote: string;
}

export interface MagazineArticle {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  excerpt: string;
  category: ArticleCategory;
  categoryLabel: string;
  categoryBadgeColor: string;
  coverImage: string;
  coverImageCredit?: string;
  readingTimeMinutes: number;
  publishedDate: string;
  lastUpdated: string;
  editor: string;
  targetAudience: string;
  difficultyLevel: 'Dễ tiếp cận' | 'Cần chuẩn bị' | 'Chuyên sâu';
  keyTakeaways: string[];
  tableOfContents: {
    id: string;
    title: string;
  }[];
  sections: ArticleSection[];
  practicalAdvice?: PracticalAdviceItem[];
  preTripChecklist: string[];
  verifiedSources: VerifiedSource[];
  relatedDestinationIds: string[];
  suggestedAiPrompt?: string;
  relatedArticleIds: string[];
  featured?: boolean;
}

export type ProjectStatus = 'mvp' | 'pilot_testing' | 'research_proposal' | 'implemented';

export interface TourismProjectProfile {
  id: string;
  title: string;
  tagline: string;
  category: 'digital_transformation' | 'heritage_preservation' | 'community_empowerment' | 'eco_tourism';
  categoryLabel: string;
  leadOrganization: string;
  status: ProjectStatus;
  statusLabel: string;
  statusBadgeColor: string;
  targetBeneficiaries: string[];
  problemAddressed: string;
  objectives: string[];
  solutionOverview: string;
  keyComponents: {
    title: string;
    description: string;
  }[];
  technicalStack: string[];
  verifiedOutcomes: string[];
  developmentRoadmap: {
    phase: string;
    timeline: string;
    goal: string;
    isCurrent?: boolean;
  }[];
  officialSources: {
    title: string;
    url?: string;
    note: string;
  }[];
  lastUpdated: string;
}
