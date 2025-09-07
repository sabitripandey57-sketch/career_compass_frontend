// API Configuration
const API_BASE_URL = 'http://localhost:5001/api';

// API Service Class
class ApiService {
    constructor() {
        this.baseURL = API_BASE_URL;
        this.token = localStorage.getItem('accessToken');
    }

    // Helper method to get headers
    getHeaders(includeAuth = false) {
        const headers = {
            'Content-Type': 'application/json',
        };
        
        if (includeAuth && this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        
        return headers;
    }

    // Helper method to handle API responses
    async handleResponse(response) {
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Something went wrong');
        }
        
        return data;
    }

    // User Authentication APIs
    async register(userData) {
        const response = await fetch(`${this.baseURL}/users/register`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(userData)
        });
        
        const data = await this.handleResponse(response);
        
        // Store tokens
        if (data.data && data.data.accessToken) {
            this.token = data.data.accessToken;
            localStorage.setItem('accessToken', data.data.accessToken);
            localStorage.setItem('refreshToken', data.data.refreshToken);
            localStorage.setItem('user', JSON.stringify(data.data.user));
        }
        
        return data;
    }

    async login(email, password) {
        const response = await fetch(`${this.baseURL}/users/login`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ email, password })
        });
        
        const data = await this.handleResponse(response);
        
        // Store tokens
        if (data.data && data.data.accessToken) {
            this.token = data.data.accessToken;
            localStorage.setItem('accessToken', data.data.accessToken);
            localStorage.setItem('refreshToken', data.data.refreshToken);
            localStorage.setItem('user', JSON.stringify(data.data.user));
        }
        
        return data;
    }

    async logout() {
        const response = await fetch(`${this.baseURL}/users/logout`, {
            method: 'POST',
            headers: this.getHeaders(true)
        });
        
        const data = await this.handleResponse(response);
        
        // Clear local storage
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        this.token = null;
        
        return data;
    }

    async getCurrentUser() {
        const response = await fetch(`${this.baseURL}/users/current-user`, {
            method: 'GET',
            headers: this.getHeaders(true)
        });
        
        return await this.handleResponse(response);
    }

    async updateProfile(userData) {
        const response = await fetch(`${this.baseURL}/users/update-profile`, {
            method: 'PATCH',
            headers: this.getHeaders(true),
            body: JSON.stringify(userData)
        });
        
        return await this.handleResponse(response);
    }

    // College APIs
    async getAllColleges(page = 1, limit = 10) {
        const response = await fetch(`${this.baseURL}/colleges?page=${page}&limit=${limit}`, {
            method: 'GET',
            headers: this.getHeaders()
        });
        
        return await this.handleResponse(response);
    }

    async searchCollegesByMarks(totalMarks = null, gpa = null) {
        let queryParams = '';
        if (totalMarks || gpa) {
            const params = new URLSearchParams();
            if (totalMarks) params.append('totalMarks', totalMarks);
            if (gpa) params.append('gpa', gpa);
            queryParams = '?' + params.toString();
        }
        
        const response = await fetch(`${this.baseURL}/colleges/search/by-marks${queryParams}`, {
            method: 'GET',
            headers: this.getHeaders(true)
        });
        
        return await this.handleResponse(response);
    }

    async getRecommendedColleges() {
        const response = await fetch(`${this.baseURL}/colleges/recommendations`, {
            method: 'GET',
            headers: this.getHeaders(true)
        });
        
        return await this.handleResponse(response);
    }

    async searchCollegesByLocation(location) {
        const response = await fetch(`${this.baseURL}/colleges/search/location?location=${encodeURIComponent(location)}`, {
            method: 'GET',
            headers: this.getHeaders()
        });
        
        return await this.handleResponse(response);
    }

    // Course APIs
    async getAllCourses() {
        const response = await fetch(`${this.baseURL}/courses`, {
            method: 'GET',
            headers: this.getHeaders()
        });
        
        return await this.handleResponse(response);
    }

    async getUserPreferredCourses() {
        const response = await fetch(`${this.baseURL}/courses/preferences`, {
            method: 'GET',
            headers: this.getHeaders(true)
        });
        
        return await this.handleResponse(response);
    }

    async addCourseToPreferences(courseId) {
        const response = await fetch(`${this.baseURL}/courses/preferences/add`, {
            method: 'POST',
            headers: this.getHeaders(true),
            body: JSON.stringify({ courseId })
        });
        
        return await this.handleResponse(response);
    }

    // Mark APIs
    async getMyMarks() {
        const response = await fetch(`${this.baseURL}/marks/my-marks`, {
            method: 'GET',
            headers: this.getHeaders(true)
        });
        
        return await this.handleResponse(response);
    }

    async addMyMark(markData) {
        const response = await fetch(`${this.baseURL}/marks/add-my-mark`, {
            method: 'POST',
            headers: this.getHeaders(true),
            body: JSON.stringify(markData)
        });
        
        return await this.handleResponse(response);
    }

    async updateMyMark(markId, markData) {
        const response = await fetch(`${this.baseURL}/marks/update-my-mark/${markId}`, {
            method: 'PUT',
            headers: this.getHeaders(true),
            body: JSON.stringify(markData)
        });
        
        return await this.handleResponse(response);
    }

    async deleteMyMark(markId) {
        const response = await fetch(`${this.baseURL}/marks/delete-my-mark/${markId}`, {
            method: 'DELETE',
            headers: this.getHeaders(true)
        });
        
        return await this.handleResponse(response);
    }

    async calculateGPA() {
        const response = await fetch(`${this.baseURL}/marks/calculate-gpa`, {
            method: 'GET',
            headers: this.getHeaders(true)
        });
        
        return await this.handleResponse(response);
    }

    async getAnalytics() {
        const response = await fetch(`${this.baseURL}/marks/analytics`, {
            method: 'GET',
            headers: this.getHeaders(true)
        });
        
        return await this.handleResponse(response);
    }

    // Admin APIs
    async getAllUsers(page = 1, limit = 10, role = '') {
        let queryParams = `page=${page}&limit=${limit}`;
        if (role) queryParams += `&role=${role}`;
        
        const response = await fetch(`${this.baseURL}/admin/users?${queryParams}`, {
            method: 'GET',
            headers: this.getHeaders(true)
        });
        
        return await this.handleResponse(response);
    }

    async deleteUser(userId) {
        const response = await fetch(`${this.baseURL}/admin/users/${userId}`, {
            method: 'DELETE',
            headers: this.getHeaders(true)
        });
        
        return await this.handleResponse(response);
    }

    async updateUserRole(userId, role) {
        const response = await fetch(`${this.baseURL}/admin/users/${userId}/role`, {
            method: 'PATCH',
            headers: this.getHeaders(true),
            body: JSON.stringify({ role })
        });
        
        return await this.handleResponse(response);
    }

    async getUserStats() {
        const response = await fetch(`${this.baseURL}/admin/users/stats`, {
            method: 'GET',
            headers: this.getHeaders(true)
        });
        
        return await this.handleResponse(response);
    }

    async createCollegeAdmin(collegeData) {
        const response = await fetch(`${this.baseURL}/admin/colleges`, {
            method: 'POST',
            headers: this.getHeaders(true),
            body: JSON.stringify(collegeData)
        });
        
        return await this.handleResponse(response);
    }

    async updateCollegeAdmin(collegeId, collegeData) {
        const response = await fetch(`${this.baseURL}/admin/colleges/${collegeId}`, {
            method: 'PUT',
            headers: this.getHeaders(true),
            body: JSON.stringify(collegeData)
        });
        
        return await this.handleResponse(response);
    }

    async deleteCollegeAdmin(collegeId) {
        const response = await fetch(`${this.baseURL}/admin/colleges/${collegeId}`, {
            method: 'DELETE',
            headers: this.getHeaders(true)
        });
        
        return await this.handleResponse(response);
    }

    async createCourseAdmin(courseData) {
        const response = await fetch(`${this.baseURL}/admin/courses`, {
            method: 'POST',
            headers: this.getHeaders(true),
            body: JSON.stringify(courseData)
        });
        
        return await this.handleResponse(response);
    }

    async updateCourseAdmin(courseId, courseData) {
        const response = await fetch(`${this.baseURL}/admin/courses/${courseId}`, {
            method: 'PUT',
            headers: this.getHeaders(true),
            body: JSON.stringify(courseData)
        });
        
        return await this.handleResponse(response);
    }

    async deleteCourseAdmin(courseId) {
        const response = await fetch(`${this.baseURL}/admin/courses/${courseId}`, {
            method: 'DELETE',
            headers: this.getHeaders(true)
        });
        
        return await this.handleResponse(response);
    }

    // Utility methods
    isLoggedIn() {
        return !!this.token;
    }

    getStoredUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }
}

// Create a global instance
const apiService = new ApiService();
