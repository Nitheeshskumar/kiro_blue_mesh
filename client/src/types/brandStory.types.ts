export interface BrandStory {
  hero: {
    title: string;
    subtitle: string;
    backgroundImage: string;
    video?: string;
  };
  timeline: TimelineEvent[];
  values: BrandValue[];
  team: TeamMember[];
  sustainability?: SustainabilityInfo;
}

export interface TimelineEvent {
  id: string;
  year: number;
  title: string;
  description: string;
  image: string;
  milestone: boolean;
}

export interface BrandValue {
  id: string;
  title: string;
  description: string;
  icon: string;
  image?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  image: string;
  isFounder: boolean;
}

export interface SustainabilityInfo {
  title: string;
  description: string;
  commitments: SustainabilityCommitment[];
  certifications: Certification[];
}

export interface SustainabilityCommitment {
  id: string;
  title: string;
  description: string;
  icon: string;
  progress?: number; // percentage
}

export interface Certification {
  id: string;
  name: string;
  description: string;
  logo: string;
  url?: string;
}