import axios, { type AxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const instance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

instance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const fromBody = error.response?.data?.error;
    const message =
      fromBody ||
      (error.code === 'ERR_NETWORK' || error.message === 'Network Error'
        ? 'Cannot reach the server. Check that the API is running and VITE_API_URL is correct.'
        : error.message) ||
      'Something went wrong';
    return Promise.reject(new Error(typeof message === 'string' ? message : 'Something went wrong'));
  }
);

/** Axios instance whose methods resolve to `response.data` (see response interceptor). */
export type DataAxios = {
  get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T>;
  post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>;
  put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>;
  patch<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>;
  delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T>;
};

export const api = instance as DataAxios;

export const jobsApi = {
  getAll: () => api.get<any[]>('/jobs'),
  getMine: () => api.get<any[]>('/jobs/mine'),
  getById: (id: number) => api.get<Record<string, unknown>>(`/jobs/${id}`),
  create: (jobData: Record<string, unknown>) => api.post<Record<string, unknown>>('/jobs', jobData),
};

export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    api.post<{ token: string; user: { id: number; name: string; email: string; role: string } }>('/auth/login', credentials),
  register: (userData: Record<string, unknown>) => api.post('/auth/register', userData),
  googleLogin: (data: { idToken?: string; accessToken?: string }) =>
    api.post<{ token: string; user: { id: number; name: string; email: string; role: string } }>('/auth/google', data),
  getMe: () =>
    api.get<{
      id: number;
      name: string;
      email: string;
      role: string;
      seekerProfile?: Record<string, unknown> | null;
      recruiterProfile?: Record<string, unknown> | null;
    }>('/auth/me'),
};


export type ApplyResponse = { application: { id: number }; paymentReference: string };

export const applicationsApi = {
  getAll: () => api.get<any[]>('/applications'),
  getByJob: (jobId: number) => api.get<any[]>(`/applications?jobId=${jobId}`),
  apply: (jobId: number, paymentMethod: string) =>
    api.post<ApplyResponse>('/applications', { jobId, paymentMethod }),
  update: (id: number, data: { recruiterInterest?: string; cvStatus?: string }) =>
    api.patch(`/applications/${id}`, data),
};

export const profilesApi = {
  updateSeeker: (profileData: Record<string, unknown> | FormData) => api.post('/profiles/seeker', profileData),
  updateRecruiter: (profileData: Record<string, unknown> | FormData) => api.post('/profiles/recruiter', profileData),
};

export type AdminReportsPayload = {
  monthlyRegistrations: { month: string; seekers: number; recruiters: number }[];
  topJobs: { id: number; title: string; company: string; applicants: number }[];
  topRecruiters: { name: string; posts: number; applicants: number }[];
  paymentStats: {
    validated: number;
    pending: number;
    rejected: number;
    totalCollectedLabel: string;
  };
};

export const adminApi = {
  getStats: () =>
    api.get<{
      totalUsers: number;
      jobSeekers: number;
      recruiters: number;
      pendingPayments: number;
      pendingCVReviews: number;
      activeJobPosts: number;
    }>('/admin/stats'),
  getRegistrationsByMonth: () => api.get<{ month: string; seekers: number; recruiters: number }[]>('/admin/registrations-by-month'),
  getActivity: () => api.get<{ id: string; text: string; time: string }[]>('/admin/activity'),
  getReports: () => api.get<AdminReportsPayload>('/admin/reports'),
  getUsers: () => api.get<{ id: number; name: string; email: string; role: string; status: string; createdAt: string }[]>('/admin/users'),
  patchUserStatus: (id: number, status: string) => api.patch(`/admin/users/${id}`, { status }),
  getPayments: () => api.get('/admin/payments'),
  patchPaymentStatus: (id: number, status: string) => api.patch(`/admin/payments/${id}`, { status }),
  getJobs: () => api.get('/admin/jobs'),
  patchJobModeration: (id: number, moderationStatus: string) =>
    api.patch(`/admin/jobs/${id}`, { moderationStatus }),
  deleteJob: (id: number) => api.delete(`/admin/jobs/${id}`),
  getCvAccessRequests: () => api.get('/admin/cv-access-requests'),
  patchCvAccessDecision: (applicationId: number, decision: 'Granted' | 'Denied') =>
    api.patch(`/admin/cv-access-requests/${applicationId}`, { decision }),
};
updateRecruiter: (profileData: Record<string, unknown> | FormData) => {
  const isFormData = profileData instanceof FormData;
  return api.post('/profiles/recruiter', profileData, {
    headers: isFormData
      ? { 'Content-Type': 'multipart/form-data' }
      : { 'Content-Type': 'application/json' },
  });
}

export default api;
