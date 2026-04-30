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

const handleResponse = async (res) => {
    if (!res.ok) {
        const raw = await res.text();
        let message = res.statusText;
        try {
            const parsed = JSON.parse(raw);
            // Backend returns { error } (our API) or { message } or ProblemDetails { title, errors }
            message = parsed.error
                || parsed.message
                || parsed.title
                || Object.values(parsed.errors || {})?.[0]?.[0]
                || raw
                || res.statusText;
        } catch {
            message = raw || res.statusText;
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
        if (filters.categoryId) params.append('categoryId', filters.categoryId);
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
    applyForJob:              (data)       => post(`${BASE_URL}/ApplicationJobs`, data),
    updateApplicationStatus:  (id, status) => {
        console.log(`Updating application ${id} status to: ${status}`);
        return put(`${BASE_URL}/ApplicationJobs/${id}/status`, { status })
            .catch(err => {
                console.error(`Failed to update application status:`, err);
                throw err;
            });
    },

    // Categories
    getCategories: () => get(`${BASE_URL}/Categories`),

    // Follows
    followCompany:        (userId, companyId) => post(`${BASE_URL}/Follows/${userId}/follow/${companyId}`),
    unfollowCompany:      (userId, companyId) => del(`${BASE_URL}/Follows/${userId}/unfollow/${companyId}`),
    getFollowedCompanies: (userId)            => get(`${BASE_URL}/Follows/${userId}/following`),

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

    // Search
    search: (query, role, userId, lang) => get(`${BASE_URL}/Search?q=${query}&role=${role || ''}&userId=${userId || ''}&lang=${lang || 'en'}`),

    // Support Chatbot
    sendSupportMessage: (message, userId = null) =>
        post(`${BASE_URL}/support/chat`, { message, userId }),

    // Interview AI
    startInterview: (jobTitle, jobDescription) =>
        post(`${BASE_URL}/interview/start`, { jobTitle, jobDescription }),
    answerInterview: (sessionId, answer) =>
        post(`${BASE_URL}/interview/answer`, { sessionId, answer }),

    // CV vs Job Analysis — multipart/form-data (do NOT set Content-Type; browser sets boundary)
    analyzeCv: (file, jobTitle, jobDescription) => {
        const form = new FormData();
        form.append('file', file);
        form.append('jobTitle', jobTitle);
        form.append('jobDescription', jobDescription);
        const headers = {};
        const token = sessionStorage.getItem('token');
        if (token) headers['Authorization'] = `Bearer ${token}`;
        return fetch(`${BASE_URL}/cv/analyze`, { method: 'POST', headers, body: form })
            .then(handleResponse);
    },
};
