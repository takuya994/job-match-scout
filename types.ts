export interface Company {
  id: string;
  name: string;
  description: string;
  websiteUrl?: string;
  relevance: string; // Why it was selected (e.g., "Building experimental reactor")
  isSelected?: boolean;
}

export interface JobRequirement {
  role: string;
  description: string;
  requirements: string[];
  educationLevel: string; // e.g., "High School", "Bachelor", "Not specified"
  employmentType: string; // e.g., "Full-time", "Contract"
  salary?: string;
  location?: string;
  url?: string;
  matchScore: number; // 0-100 relevance to user criteria
  matchReason: string;
}

export interface CompanyAnalysis {
  companyId: string;
  companyName: string;
  jobs: JobRequirement[];
  generalRecruitmentSummary: string;
  isAnalyzed: boolean;
  isLoading: boolean;
}

export interface SearchCriteria {
  industryKeywords: string; // e.g. "Nuclear Fusion", "Tokamak"
  jobKeywords: string; // User defined criteria (e.g. "High school grad, construction, HR")
}

export enum AppStep {
  DEFINE_CRITERIA = 0,
  SEARCH_COMPANIES = 1,
  ANALYZE_JOBS = 2,
}