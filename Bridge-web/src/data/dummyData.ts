import { Job } from '../types';

// ─── JOBS ───────────────────────────────────────────────────────────────────
export const JOBS: Job[] = [
  { id: 1, title: "Senior Software Engineer", company: "TechCorp", companyId: 1, location: "Abidjan, CI", type: "Full-time", sector: "Technology", posted: "Jan 10, 2025", deadline: "Feb 10, 2025", salary: "800,000–1,200,000 XAF", description: "Join our engineering team to build scalable backend services that power millions of users across West Africa.", requirements: ["5+ years of experience", "Proficiency in Node.js or Python", "Experience with AWS or GCP", "Strong communication skills"], responsibilities: ["Design and maintain RESTful APIs", "Lead code reviews and technical discussions", "Collaborate with product and design teams", "Mentor junior engineers"], skills: ["Node.js", "Python", "PostgreSQL", "Docker", "AWS"], minEducation: "Bachelor's", minExperience: "5+ years", applicants: 18 },
  { id: 2, title: "Marketing Intern", company: "BrandCo", companyId: 2, location: "Dakar, SN", type: "Internship", sector: "Marketing", posted: "Jan 18, 2025", deadline: "Feb 28, 2025", salary: "150,000 XAF/month", description: "A 3-month internship to support the marketing team in campaign execution and social media management.", requirements: ["Currently enrolled in a Marketing or Communication degree", "Excellent writing skills in French and English", "Social media savvy"], responsibilities: ["Draft social media content calendars", "Assist with event coordination", "Analyze campaign performance metrics"], skills: ["Social Media", "Copywriting", "Excel", "Canva"], minEducation: "In progress", minExperience: "0–1 year", applicants: 34 },
  { id: 3, title: "Data Analyst", company: "FinGroup", companyId: 3, location: "Lagos, NG", type: "Full-time", sector: "Finance", posted: "Feb 2, 2025", deadline: "Mar 2, 2025", salary: "600,000–900,000 XAF", description: "Bring financial insights to life by building dashboards and reports that guide executive decision-making.", requirements: ["3+ years in data analysis", "Proficient in SQL and Python", "Experience with Tableau or Power BI"], responsibilities: ["Design automated reporting pipelines", "Conduct ad-hoc data investigations", "Present findings to C-level stakeholders"], skills: ["SQL", "Python", "Tableau", "Excel"], minEducation: "Bachelor's", minExperience: "3–5 years", applicants: 11 },
  { id: 4, title: "UX Designer", company: "DesignHub", companyId: 4, location: "Remote", type: "Contract", sector: "Design", posted: "Feb 5, 2025", deadline: "Mar 5, 2025", salary: "400,000–700,000 XAF", description: "Shape the end-to-end user experience for a suite of enterprise SaaS products serving African SMEs.", requirements: ["Portfolio demonstrating UX process", "Figma proficiency", "Experience with design systems"], responsibilities: ["Create wireframes and prototypes", "Conduct user research interviews", "Collaborate with frontend engineers"], skills: ["Figma", "User Research", "Design Systems", "Prototyping"], minEducation: "Bachelor's", minExperience: "1–3 years", applicants: 9 },
  { id: 5, title: "Sales Executive", company: "CommercePro", companyId: 5, location: "Lomé, TG", type: "Full-time", sector: "Sales", posted: "Jan 28, 2025", deadline: "Feb 28, 2025", salary: "500,000–800,000 XAF + commission", description: "Drive B2B revenue growth by acquiring and managing enterprise clients in the retail and logistics sectors.", requirements: ["2+ years in B2B sales", "Strong negotiation skills", "CRM proficiency (Salesforce or HubSpot)"], responsibilities: ["Generate and qualify leads", "Conduct product demonstrations", "Negotiate contracts and close deals"], skills: ["Sales", "Negotiation", "CRM", "Communication"], minEducation: "Bachelor's", minExperience: "1–3 years", applicants: 22 },
  { id: 6, title: "HR Manager", company: "PeopleFirst", companyId: 6, location: "Accra, GH", type: "Full-time", sector: "Human Resources", posted: "Feb 8, 2025", deadline: "Mar 8, 2025", salary: "700,000–1,000,000 XAF", description: "Lead HR operations for a 200-person organisation with a focus on talent acquisition and employee engagement.", requirements: ["5+ years in HR roles", "SHRM or CIPD certification preferred", "Strong knowledge of labor law"], responsibilities: ["Oversee full-cycle recruitment", "Manage payroll and benefits programs", "Develop and implement HR policies"], skills: ["Recruitment", "HR Policy", "Payroll", "Labor Law"], minEducation: "Bachelor's", minExperience: "5+ years", applicants: 7 },
  { id: 7, title: "DevOps Intern", company: "CloudNine", companyId: 7, location: "Remote", type: "Internship", sector: "Technology", posted: "Jan 25, 2025", deadline: "Feb 25, 2025", salary: "200,000 XAF/month", description: "Work alongside senior DevOps engineers to automate infrastructure provisioning and CI/CD pipelines.", requirements: ["Studying Computer Science or related field", "Basic knowledge of Linux", "Interest in cloud technologies"], responsibilities: ["Write Terraform scripts for cloud resources", "Monitor CI/CD pipeline health", "Document infrastructure processes"], skills: ["Linux", "Docker", "Terraform", "CI/CD"], minEducation: "In progress", minExperience: "0–1 year", applicants: 15 },
  { id: 8, title: "Finance Officer", company: "CapGroup", companyId: 8, location: "Abidjan, CI", type: "Full-time", sector: "Finance", posted: "Feb 6, 2025", deadline: "Mar 6, 2025", salary: "550,000–750,000 XAF", description: "Manage day-to-day financial operations including budgeting, invoicing, and month-end close.", requirements: ["CPA or ACCA qualified", "3+ years in finance roles", "Advanced Excel skills"], responsibilities: ["Prepare monthly financial statements", "Manage accounts payable/receivable", "Support annual audit processes"], skills: ["Accounting", "Excel", "Budgeting", "IFRS"], minEducation: "Bachelor's", minExperience: "3–5 years", applicants: 6 },
];

// ─── USERS ───────────────────────────────────────────────────────────────────
export const SEEKER_USER = {
  id: 1, name: "Jean Dupont", email: "jean@mail.com", phone: "+237 655 111 222",
  role: "Job Seeker", memberSince: "January 2025", city: "Abidjan, CI",
  title: "Software Engineer", yearsExp: "3–5", skills: ["JavaScript", "React", "Node.js", "PostgreSQL"],
  education: { degree: "Bachelor's", field: "Computer Science", institution: "Université de Cocody", year: 2021 },
  cvUploaded: true, profileCompletion: 85, avatar: null,
  preferences: { seeking: "Both", sector: "Technology", city: "Abidjan", availableFrom: "2025-03-01" },
};

export const RECRUITER_USER = {
  id: 10, name: "Paul Tremblay", email: "paul@techcorp.com", phone: "+237 670 333 444",
  role: "Recruiter", company: "TechCorp", industry: "Technology",
  companySize: "51–200", website: "https://techcorp.ci", hqLocation: "Abidjan, CI",
  logoUploaded: true, memberSince: "Dec 2024",
  hiringNeeds: { type: "Both", urgency: "Immediate", openPositions: 5 },
  categories: ["Engineering", "Design", "Operations"],
  candidatePrefs: { minExp: "1–3 years", minEdu: "Bachelor's", location: "Abidjan" },
};

// ─── APPLICATIONS ─────────────────────────────────────────────────────────────
export const MY_APPLICATIONS = [
  { id: 1, jobTitle: "Software Engineer", company: "TechCorp", type: "Job", appliedOn: "Jan 12, 2025", payment: "Validated", cvStatus: "Uploaded", recruiterInterest: "Interested" },
  { id: 2, jobTitle: "Marketing Intern", company: "BrandCo", type: "Internship", appliedOn: "Jan 18, 2025", payment: "Pending", cvStatus: "Awaiting Validation", recruiterInterest: "—" },
  { id: 3, jobTitle: "Data Analyst", company: "FinGroup", type: "Job", appliedOn: "Feb 2, 2025", payment: "Validated", cvStatus: "Uploaded", recruiterInterest: "Under Review" },
  { id: 4, jobTitle: "DevOps Intern", company: "CloudNine", type: "Internship", appliedOn: "Feb 5, 2025", payment: "Rejected", cvStatus: "—", recruiterInterest: "—" },
];

// ─── APPLICANTS (Recruiter sees these) ────────────────────────────────────────
export const APPLICANTS = [
  { id: 101, name: "Jean Dupont", jobTitle: "Software Engineer", education: "BSc Computer Science — 2021", experience: "3–5 yrs", skills: ["JavaScript", "React", "Node.js"], appliedOn: "Jan 12, 2025", payment: "Validated", cvStatus: "Uploaded", interest: "Interested" },
  { id: 102, name: "Marie Cam", jobTitle: "Software Engineer", education: "MSc Informatics — 2022", experience: "1–3 yrs", skills: ["Python", "Django", "PostgreSQL"], appliedOn: "Jan 14, 2025", payment: "Validated", cvStatus: "Uploaded", interest: "Under Review" },
  { id: 103, name: "Kofi Asante", jobTitle: "Software Engineer", education: "BSc Software Eng — 2020", experience: "3–5 yrs", skills: ["Java", "Spring Boot", "AWS"], appliedOn: "Jan 15, 2025", payment: "Pending", cvStatus: "Awaiting Validation", interest: "—" },
  { id: 104, name: "Amara Diallo", jobTitle: "Marketing Intern", education: "In Progress — Marketing", experience: "0–1 yr", skills: ["Copywriting", "Canva", "Social Media"], appliedOn: "Jan 18, 2025", payment: "Validated", cvStatus: "Uploaded", interest: "Shortlisted" },
  { id: 105, name: "Sophie Tano", jobTitle: "Data Analyst", education: "BSc Statistics — 2022", experience: "1–3 yrs", skills: ["SQL", "Python", "Tableau"], appliedOn: "Feb 2, 2025", payment: "Pending", cvStatus: "Awaiting Validation", interest: "—" },
];

// ─── PAYMENTS (Admin sees these) ──────────────────────────────────────────────
export const PAYMENTS = [
  { id: 201, applicant: "Jean Dupont", job: "Software Engineer", company: "TechCorp", method: "Orange Money", amount: "2,000 XAF", ref: "ATS-2025-00481", submittedAt: "Jan 12, 2025 10:35", status: "Validated" },
  { id: 202, applicant: "Marie Cam", job: "Software Engineer", company: "TechCorp", method: "MTN Money", amount: "2,000 XAF", ref: "ATS-2025-00482", submittedAt: "Jan 14, 2025 14:20", status: "Pending" },
  { id: 203, applicant: "Kofi Asante", job: "Software Engineer", company: "TechCorp", method: "Orange Money", amount: "2,000 XAF", ref: "ATS-2025-00483", submittedAt: "Jan 15, 2025 09:00", status: "Pending" },
  { id: 204, applicant: "Amara Diallo", job: "Marketing Intern", company: "BrandCo", method: "MTN Money", amount: "2,000 XAF", ref: "ATS-2025-00484", submittedAt: "Jan 18, 2025 16:45", status: "Validated" },
  { id: 205, applicant: "Sophie Tano", job: "Data Analyst", company: "FinGroup", method: "Orange Money", amount: "2,000 XAF", ref: "ATS-2025-00485", submittedAt: "Feb 2, 2025 11:00", status: "Rejected" },
  { id: 206, applicant: "Nathan Ekou", job: "HR Manager", company: "PeopleFirst", method: "MTN Money", amount: "2,000 XAF", ref: "ATS-2025-00486", submittedAt: "Feb 8, 2025 08:30", status: "Pending" },
];

// ─── ALL USERS (Admin) ────────────────────────────────────────────────────────
export const ALL_USERS = [
  { id: 1, name: "Jean Dupont", role: "Job Seeker", email: "jean@mail.com", registered: "Jan 5, 2025", status: "Active" },
  { id: 2, name: "Marie Cam", role: "Job Seeker", email: "marie@mail.com", registered: "Jan 14, 2025", status: "Active" },
  { id: 3, name: "Kofi Asante", role: "Intern Seeker", email: "kofi@mail.com", registered: "Jan 15, 2025", status: "Active" },
  { id: 4, name: "Amara Diallo", role: "Intern Seeker", email: "amara@mail.com", registered: "Jan 18, 2025", status: "Active" },
  { id: 5, name: "Sophie Tano", role: "Job Seeker", email: "sophie@mail.com", registered: "Feb 2, 2025", status: "Suspended" },
  { id: 10, name: "Paul Tremblay", role: "Recruiter", email: "paul@techcorp.com", registered: "Dec 12, 2024", status: "Active" },
  { id: 11, name: "TechCorp HR", role: "Recruiter", email: "hr@techcorp.com", registered: "Dec 12, 2024", status: "Active" },
  { id: 12, name: "BrandCo Talent", role: "Recruiter", email: "talent@brandco.com", registered: "Jan 3, 2025", status: "Active" },
];

// ─── ALL SEEKERS (For Recruiter Search) ────────────────────────────────────────
export const ALL_SEEKERS: any[] = [
  {
    id: 1, name: "Jean Dupont", email: "jean@mail.com", phone: "+237 655 111 222",
    role: "Job Seeker", city: "Abidjan, CI",
    title: "Software Engineer", yearsExp: "3–5", skills: ["JavaScript", "React", "Node.js"],
    education: { degree: "Bachelor's", field: "Computer Science", institution: "Université de Cocody", year: 2021 },
  },
  {
    id: 2, name: "Marie Cam", email: "marie@mail.com", phone: "+237 655 222 333",
    role: "Job Seeker", city: "Dakar, SN",
    title: "Frontend Developer", yearsExp: "1–3", skills: ["TypeScript", "Vue.js", "CSS"],
    education: { degree: "Master's", field: "Informatics", institution: "UCAD", year: 2022 },
  },
  {
    id: 3, name: "Kofi Asante", email: "kofi@mail.com", phone: "+233 244 555 666",
    role: "Job Seeker", city: "Accra, GH",
    title: "Backend Engineer", yearsExp: "5+", skills: ["Java", "Spring Boot", "AWS"],
    education: { degree: "Bachelor's", field: "Software Engineering", institution: "KNUST", year: 2019 },
  },
  {
    id: 4, name: "Amara Diallo", email: "amara@mail.com", phone: "+224 622 777 888",
    role: "Job Seeker", city: "Conakry, GN",
    title: "Marketing Specialist", yearsExp: "0–1", skills: ["SEO", "Content Marketing", "Canva"],
    education: { degree: "In Progress", field: "Marketing", institution: "UGANC", year: 2024 },
  },
  {
    id: 5, name: "Sophie Tano", email: "sophie@mail.com", phone: "+225 070 999 000",
    role: "Job Seeker", city: "Abidjan, CI",
    title: "Data Analyst", yearsExp: "1–3", skills: ["SQL", "Python", "Tableau"],
    education: { degree: "Bachelor's", field: "Statistics", institution: "ENSEA", year: 2022 },
  },
  {
    id: 6, name: "Issa Traore", email: "issa@mail.com", phone: "+223 777 111 222",
    role: "Job Seeker", city: "Bamako, ML",
    title: "Project Manager", yearsExp: "5+", skills: ["Agile", "Scrum", "Jira"],
    education: { degree: "Master's", field: "Business Administration", institution: "USTTB", year: 2018 },
  },
];

// ─── CV ACCESS REQUESTS ───────────────────────────────────────────────────────
export const CV_ACCESS_REQUESTS = [
  { id: 301, recruiter: "Paul Tremblay", company: "TechCorp", candidate: "Jean Dupont", job: "Software Engineer", dateInterest: "Jan 14, 2025", status: "Pending" },
  { id: 302, recruiter: "BrandCo Talent", company: "BrandCo", candidate: "Amara Diallo", job: "Marketing Intern", dateInterest: "Jan 20, 2025", status: "Granted" },
  { id: 303, recruiter: "Paul Tremblay", company: "TechCorp", candidate: "Marie Cam", job: "Software Engineer", dateInterest: "Jan 16, 2025", status: "Denied" },
];

// ─── ADMIN STATS ──────────────────────────────────────────────────────────────
export const ADMIN_STATS = {
  totalUsers: 142, jobSeekers: 98, recruiters: 31, pendingPayments: 14, pendingCVReviews: 9, activeJobPosts: 22,
};

export const ACTIVITY_FEED = [
  { id: 1, text: "New registration: Jean Dupont (Job Seeker)", time: "5 min ago" },
  { id: 2, text: "Payment submitted: Marie Cam — Software Engineer at TechCorp", time: "22 min ago" },
  { id: 3, text: "New job post: TechCorp — Data Analyst", time: "1 hr ago" },
  { id: 4, text: "CV uploaded: Kofi Asante — Software Engineer at TechCorp", time: "2 hr ago" },
  { id: 5, text: "Payment validated: Amara Diallo — Marketing Intern at BrandCo", time: "3 hr ago" },
  { id: 6, text: "Recruiter registered: BrandCo Talent", time: "5 hr ago" },
  { id: 7, text: "Application rejected (payment issue): Sophie Tano — Data Analyst", time: "6 hr ago" },
  { id: 8, text: "New job post: DesignHub — UX Designer", time: "Yesterday" },
];

export const MONTHLY_REGISTRATIONS = [
  { month: "Sep", seekers: 8, recruiters: 2 },
  { month: "Oct", seekers: 14, recruiters: 3 },
  { month: "Nov", seekers: 19, recruiters: 5 },
  { month: "Dec", seekers: 22, recruiters: 7 },
  { month: "Jan", seekers: 35, recruiters: 10 },
  { month: "Feb", seekers: 28, recruiters: 8 },
];

export const SKILLS_OPTIONS = [
  "Python", "JavaScript", "TypeScript", "React", "Node.js", "Java", "SQL", "Excel",
  "Marketing", "Communication", "Project Management", "Design", "Sales", "Finance",
  "HR", "Operations", "Docker", "AWS", "Figma", "Copywriting", "Canva", "Tableau",
];

export const SECTORS = ["Technology", "Finance", "Marketing", "Design", "Sales", "Operations", "Human Resources", "Healthcare", "Education", "Logistics"];
export const INDUSTRIES = ["Technology", "Finance & Banking", "Marketing & Media", "Healthcare", "Education", "Logistics", "Retail", "Real Estate", "Energy", "NGO"];
