export interface Job {
  id: number;
  title: string;
  company: string;
  companyId?: number;
  location: string;
  type: string;
  sector: string;
  posted: string;
  deadline?: string | null;
  salary?: string | null;
  description: string;
  requirements: string[];
  responsibilities: string[];
  skills: string[];
  minEducation?: string;
  minExperience?: string;
  applicants?: number;
  _count?: { applications: number };
  moderationStatus?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: string;
  status: string;
}

export interface SeekerUser extends User {
  memberSince: string;
  city: string;
  title: string;
  yearsExp: string;
  skills: string[];
  education: {
    degree: string;
    field: string;
    institution: string;
    year: number;
  };
  cvUploaded: boolean;
  profileCompletion: number;
  avatar: string | null;
  preferences: {
    seeking: string;
    sector: string;
    city: string;
    availableFrom: string;
  };
}

export interface RecruiterUser extends User {
  company: string;
  industry: string;
  companySize: string;
  website: string;
  hqLocation: string;
  logoUploaded: boolean;
  memberSince: string;
}
