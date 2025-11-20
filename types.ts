
export enum Page {
  DASHBOARD = 'DASHBOARD',
  RESUME_OPTIMIZER = 'RESUME_OPTIMIZER',
  JOB_MATCHER = 'JOB_MATCHER',
  INTERVIEW_COACH = 'INTERVIEW_COACH',
  JOB_SEARCH = 'JOB_SEARCH',
  PROFILE = 'PROFILE',
}

export interface JobSearchFilters {
  datePosted: string;
  experienceLevel: string;
  minSalary: string;
}

export interface AnalysisResult {
  atsScore: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  improvements: string;
  rewrittenResume: string;
}

export interface JobMatchResult {
  matchScore: number;
  jobTitle: string;
  company: string;
  missingKeywords: string[];
  analysis: string;
  culturalFit: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface SavedJob {
  id: string;
  title: string;
  company: string;
  url?: string;
  description?: string;
  dateSaved: number;
}

export interface UserProfile {
  name: string;
  email: string;
  targetRole: string;
  resumeText: string; // Keep for fallback/text extraction
  resumeBase64?: string; // For PDF handling
  savedJobs: SavedJob[];
  lastAtsScore?: number;
  lastInterviewDate?: number;
}

export interface JobListing {
  title: string;
  company: string;
  location: string;
  url: string;
  snippet: string;
}