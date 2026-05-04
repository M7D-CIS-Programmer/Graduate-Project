const BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;
if (!BASE_URL) throw new Error('API base URL is not set. Define VITE_API_URL in frontend/.env');

// Converts a relative server path (e.g. "uploads/profiles/x.jpg") to a full URL.
// Strips the trailing "/api" segment from BASE_URL since static files are served at root.
export const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const origin = BASE_URL.replace(/\/api\/?$/, '');
    return `${origin}/${path}`;
};

// Sentinel thrown when the backend returns 403 ACCOUNT_SUSPENDED.
// Callers and the AuthContext watch for this to show the suspension screen.
export class SuspendedError extends Error {
    constructor() {
        super('ACCOUNT_SUSPENDED');
        this.name = 'SuspendedError';
    }
}

const handleResponse = async (res) => {
    if (!res.ok) {
        const raw = await res.text();
        let message = res.statusText;
        let errorCode = null;
        try {
            const parsed = JSON.parse(raw);
            errorCode = parsed.error;
            message = parsed.error
                || parsed.message
                || parsed.title
                || Object.values(parsed.errors || {})?.[0]?.[0]
                || raw
                || res.statusText;
        } catch {
            message = raw || res.statusText;
        }
        // Surface suspension as a typed error so the app can react globally.
        // Also dispatch a window event so AuthContext can intercept it even
        // when the throw happens inside a React Query mutation callback.
        if (res.status === 403 && errorCode === 'ACCOUNT_SUSPENDED') {
            window.dispatchEvent(new CustomEvent('accountSuspended'));
            throw new SuspendedError();
        }
        throw new Error(message);
    }
    const text = await res.text();
    const data = text ? JSON.parse(text) : {};
    return data?.$values || data;
};

const getHeaders = () => {
    const headers = { 'Content-Type': 'application/json' };
    const token = sessionStorage.getItem('token');
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

const get  = (url)         => fetch(url, { headers: getHeaders() }).then(handleResponse);
const post = (url, body)   => fetch(url, { method: 'POST',   headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse);
const postForm = (url, form) => {
    const headers = {};
    const token = sessionStorage.getItem('token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return fetch(url, { method: 'POST', headers, body: form }).then(handleResponse);
};
const put  = (url, body)   => fetch(url, { method: 'PUT',    headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse);
const del  = (url)         => fetch(url, { method: 'DELETE', headers: getHeaders() }).then(handleResponse);

export const api = {
    // Auth
    login:               (credentials) => post(`${BASE_URL}/Users/login`, credentials),
    register:            (userData)    => post(`${BASE_URL}/Users`, userData),

    // Jobs
    getJobs: (filters = {}) => {
        const params = new URLSearchParams();
        if (filters.type) params.append('type', filters.type);
        if (filters.workMode) params.append('workMode', filters.workMode);
        if (filters.departmentId) params.append('departmentId', filters.departmentId);
        if (filters.minSalary) params.append('minSalary', filters.minSalary);
        if (filters.maxSalary) params.append('maxSalary', filters.maxSalary);
        if (filters.q) params.append('q', filters.q);
        
        const queryString = params.toString();
        return get(`${BASE_URL}/Jobs${queryString ? `?${queryString}` : ''}`);
    },
    getJobsByUser:       (userId)     => get(`${BASE_URL}/Jobs/user/${userId}`),
    getJob:              (id)         => get(`${BASE_URL}/Jobs/${id}`),
    createJob:           (job)        => post(`${BASE_URL}/Jobs`, job),
    updateJob:           (id, job)    => put(`${BASE_URL}/Jobs/${id}`, job),
    updateJobStatus:     (id, status) => put(`${BASE_URL}/Jobs/${id}/status`, status),
    deleteJob:           (id)         => del(`${BASE_URL}/Jobs/${id}`),

    // Users
    getUsers:            ()           => get(`${BASE_URL}/Users`),
    getUser:             (id, viewerId) => get(`${BASE_URL}/Users/${id}${viewerId ? `?viewerId=${viewerId}` : ''}`),
    getCompanyProfile:   (id)         => get(`${BASE_URL}/Users/${id}`), // Read-only; no auth needed
    updateUser:          (id, data)   => put(`${BASE_URL}/Users/${id}`, data),
    updateUserStatus:    (id, status) => put(`${BASE_URL}/Users/${id}/status`, status),
    deleteUser:          (id)         => del(`${BASE_URL}/Users/${id}`),
    changePassword:      (id, data)   => post(`${BASE_URL}/Users/${id}/change-password`, data),

    // Saved Jobs
    getSavedJobs:   ()          => get(`${BASE_URL}/SavedJobs`),
    checkSavedJob:  (jobId)     => get(`${BASE_URL}/SavedJobs/check/${jobId}`),
    saveJob:        (jobId)     => fetch(`${BASE_URL}/SavedJobs/${jobId}`, { method: 'POST', headers: getHeaders() }).then(handleResponse),
    unsaveJob:      (savedId)   => del(`${BASE_URL}/SavedJobs/${savedId}`),
    uploadProfilePicture: (id, file) => {
        const form = new FormData();
        form.append('image', file);
        const headers = {};
        const token = sessionStorage.getItem('token');
        if (token) headers['Authorization'] = `Bearer ${token}`;
        return fetch(`${BASE_URL}/Users/${id}/upload-profile-picture`, { method: 'POST', headers, body: form })
            .then(handleResponse);
    },

    // Applications
    getApplications:          (employerId) => get(`${BASE_URL}/ApplicationJobs${employerId ? `?employerId=${employerId}` : ''}`),
    getApplicationsByCompany: (companyId)  => get(`${BASE_URL}/ApplicationJobs/company/${companyId}`),
    applyForJob:              (formData)   => postForm(`${BASE_URL}/ApplicationJobs`, formData),
    updateApplicationStatus:  (id, status) => put(`${BASE_URL}/ApplicationJobs/${id}/status`, { status }),

    // Departments (public — all global + company-owned departments)
    getDepartments:    ()              => get(`${BASE_URL}/Departments`),
    // My departments — authenticated employer only
    getMyDepartments:  ()              => get(`${BASE_URL}/Departments/mine`),
    createDepartment:   (name)          => post(`${BASE_URL}/Departments`, { name }),
    updateDepartment:   (id, name)      => put(`${BASE_URL}/Departments/${id}`, { name }),
    deleteDepartment:   (id)            => del(`${BASE_URL}/Departments/${id}`),

    // Follows
    followCompany:        (userId, companyId) => post(`${BASE_URL}/Follows/${userId}/follow/${companyId}`),
    unfollowCompany:      (userId, companyId) => del(`${BASE_URL}/Follows/${userId}/unfollow/${companyId}`),
    getFollowedCompanies: (userId)            => get(`${BASE_URL}/Follows/${userId}/following`),
    getCompanyFollowers:  (companyId)         => get(`${BASE_URL}/Follows/${companyId}/followers`),

    // Resumes
    getResumeByUserId: (userId, viewerId) => get(`${BASE_URL}/Resumes/user/${userId}${viewerId ? `?viewerId=${viewerId}` : ''}`),
    createResume:      (data)           => post(`${BASE_URL}/Resumes`, data),
    updateResume:      (id, data)       => put(`${BASE_URL}/Resumes/${id}`, data),

    // Notifications
    getNotificationsByUserId: (userId, receiver) => get(`${BASE_URL}/Notifications?userId=${userId}${receiver ? `&receiver=${receiver}` : ''}`),
    markNotificationAsRead:   (id)     => put(`${BASE_URL}/Notifications/${id}/read`),
    markAllNotificationsAsRead: (userId) => put(`${BASE_URL}/Notifications/read-all/${userId}`),
    clearAllNotifications:    (userId) => del(`${BASE_URL}/Notifications/clear-all/${userId}`),
    deleteNotification:       (id)     => del(`${BASE_URL}/Notifications/${id}`),

    // Messages (direct messaging per application thread)
    getMessages:      (applicationId, userId) => get(`${BASE_URL}/Messages/application/${applicationId}?userId=${userId}`),
    getConversations: (userId)                => get(`${BASE_URL}/Messages/conversations/${userId}`),
    getThreadInfo:    (applicationId, userId) => get(`${BASE_URL}/Messages/thread-info/${applicationId}?userId=${userId}`),
    sendMessage:      (applicationId, senderId, content) => post(`${BASE_URL}/Messages`, { applicationJobId: applicationId, senderId, content }),
    markMessagesRead: (applicationId, userId) => put(`${BASE_URL}/Messages/read/${applicationId}/${userId}`),

    // Contact Us
    submitContactMessage: (data) => post(`${BASE_URL}/contact`, data),
    getContactMessages: (params = {}) => {
        const p = new URLSearchParams();
        if (params.q)        p.append('q',        params.q);
        if (params.status)   p.append('status',   params.status);
        if (params.page)     p.append('page',     params.page);
        if (params.pageSize) p.append('pageSize', params.pageSize);
        const qs = p.toString();
        return get(`${BASE_URL}/contact${qs ? `?${qs}` : ''}`);
    },
    getContactMessage:          (id)           => get(`${BASE_URL}/contact/${id}`),
    updateContactMessageStatus: (id, status)   => put(`${BASE_URL}/contact/${id}/status`, { status }),
    deleteContactMessage:       (id)           => del(`${BASE_URL}/contact/${id}`),

    // Search
    search: (query, role, userId, lang) => get(`${BASE_URL}/Search?q=${query}&role=${role || ''}&userId=${userId || ''}&lang=${lang || 'en'}`),

    // Support Chatbot
    sendSupportMessage: (message, userId = null, role = null, language = 'en') =>
        post(`${BASE_URL}/support/chat`, { message, userId, role, language }),

    // Interview AI — language controls the response language for all AI text
    startInterview: (jobTitle, jobDescription, language = 'en') =>
        post(`${BASE_URL}/interview/start`, { jobTitle, jobDescription, language }),
    answerInterview: (sessionId, answer, language = 'en') =>
        post(`${BASE_URL}/interview/answer`, { sessionId, answer, language }),

    // Unified Job Matching Engine — language param controls AI response language
    matchCvToJob: (file, jobTitle, jobDescription, language = 'en') => {
        const form = new FormData();
        form.append('file', file);
        form.append('jobTitle', jobTitle);
        form.append('jobDescription', jobDescription);
        form.append('language', language);
        const headers = {};
        const token = sessionStorage.getItem('token');
        if (token) headers['Authorization'] = `Bearer ${token}`;
        return fetch(`${BASE_URL}/cv/match`, { method: 'POST', headers, body: form })
            .then(handleResponse);
    },

    // CV vs Job Analysis
    analyzeCv: (file, jobTitle, jobDescription, language = 'en') => {
        const form = new FormData();
        form.append('file', file);
        form.append('jobTitle', jobTitle);
        form.append('jobDescription', jobDescription);
        form.append('language', language);
        const headers = {};
        const token = sessionStorage.getItem('token');
        if (token) headers['Authorization'] = `Bearer ${token}`;
        return fetch(`${BASE_URL}/cv/analyze`, { method: 'POST', headers, body: form })
            .then(handleResponse);
    },

    // Deep semantic analysis
    semanticAnalyzeCv: (file, jobDescription, language = 'en') => {
        const form = new FormData();
        form.append('file', file);
        form.append('jobDescription', jobDescription);
        form.append('language', language);
        const headers = {};
        const token = sessionStorage.getItem('token');
        if (token) headers['Authorization'] = `Bearer ${token}`;
        return fetch(`${BASE_URL}/cv/semantic-analyze`, { method: 'POST', headers, body: form })
            .then(handleResponse);
    },

    // CV integrity & fraud detection
    detectCvFraud: (file, language = 'en') => {
        const form = new FormData();
        form.append('file', file);
        form.append('language', language);
        const headers = {};
        const token = sessionStorage.getItem('token');
        if (token) headers['Authorization'] = `Bearer ${token}`;
        return fetch(`${BASE_URL}/cv/fraud-check`, { method: 'POST', headers, body: form })
            .then(handleResponse);
    },

    // Aggregate hiring recommendation
    generateHiringRecommendation: (semanticAnalysis, fraudResult, matchScore, language = 'en') =>
        post(`${BASE_URL}/cv/hiring-recommendation`, { semanticAnalysis, fraudResult, matchScore, language }),

    // Fast local-only text match score — no PDF, no Gemini (used for bulk candidate ranking)
    getMatchScore: (cvText, jobTitle, jobDescription) =>
        post(`${BASE_URL}/cv/match-score`, { cvText, jobTitle, jobDescription }),
};
