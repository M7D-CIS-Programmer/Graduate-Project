const BASE_URL = import.meta.env.VITE_API_URL;
if (!BASE_URL) throw new Error('VITE_API_URL is not set');

const handleResponse = async (res) => {
    if (!res.ok) throw new Error((await res.text()) || res.statusText);
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
    updateUser:          (id, data)   => put(`${BASE_URL}/Users/${id}`, data),
    updateUserStatus:    (id, status) => put(`${BASE_URL}/Users/${id}/status`, status),
    deleteUser:          (id)         => del(`${BASE_URL}/Users/${id}`),

    // Applications
    getApplications:          ()           => get(`${BASE_URL}/ApplicationJobs`),
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

    // Resumes
    getResumeByUserId: (userId, viewerId) => get(`${BASE_URL}/Resumes/user/${userId}${viewerId ? `?viewerId=${viewerId}` : ''}`),

    // Notifications
    getNotificationsByUserId: (userId) => get(`${BASE_URL}/Notifications?userId=${userId}`),
    markNotificationAsRead:   (id)     => put(`${BASE_URL}/Notifications/${id}/read`),
    markAllNotificationsAsRead: (userId) => put(`${BASE_URL}/Notifications/read-all/${userId}`),
    clearAllNotifications:    (userId) => del(`${BASE_URL}/Notifications/clear-all/${userId}`),
    deleteNotification:       (id)     => del(`${BASE_URL}/Notifications/${id}`),

    // Search
    search: (query, role, userId) => get(`${BASE_URL}/Search?q=${query}&role=${role || ''}&userId=${userId || ''}`),
};
