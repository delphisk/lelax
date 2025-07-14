import axios from 'axios'

// Create axios instance
const apiClient = axios.create({
  baseURL: process.env.VUE_APP_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// API service object
const api = {
  // Set auth token
  setAuthToken(token) {
    if (token) {
      apiClient.defaults.headers.Authorization = `Bearer ${token}`
    }
  },

  // Clear auth token
  clearAuthToken() {
    delete apiClient.defaults.headers.Authorization
  },

  // Authentication endpoints
  auth: {
    login(credentials) {
      return apiClient.post('/auth/login', credentials)
    },

    logout() {
      return apiClient.post('/auth/logout')
    },

    getProfile() {
      return apiClient.get('/auth/me')
    },

    refreshToken() {
      return apiClient.post('/auth/refresh')
    },

    changePassword(data) {
      return apiClient.post('/auth/change-password', data)
    }
  },

  // Leave management endpoints
  leaves: {
    // Get leave balance
    getBalance(fiscalYearId = null) {
      const params = fiscalYearId ? { fiscal_year_id: fiscalYearId } : {}
      return apiClient.get('/leaves/balance', { params })
    },

    // Get leave balance by user ID
    getBalanceByUserId(userId, fiscalYearId = null) {
      const params = fiscalYearId ? { fiscal_year_id: fiscalYearId } : {}
      return apiClient.get(`/leaves/balance/${userId}`, { params })
    },

    // Get leave requests
    getRequests(params = {}) {
      return apiClient.get('/leaves/requests', { params })
    },

    // Get specific leave request
    getRequestById(id) {
      return apiClient.get(`/leaves/requests/${id}`)
    },

    // Create leave request
    createRequest(data) {
      return apiClient.post('/leaves/requests', data)
    },

    // Update leave request (approve/deny)
    updateRequest(id, data) {
      return apiClient.put(`/leaves/requests/${id}`, data)
    },

    // Cancel leave request
    cancelRequest(id) {
      return apiClient.delete(`/leaves/requests/${id}`)
    },

    // Get leave history
    getHistory(params = {}) {
      return apiClient.get('/leaves/history', { params })
    },

    // Get leave types
    getTypes() {
      return apiClient.get('/leaves/types')
    },

    // Get fiscal years
    getFiscalYears() {
      return apiClient.get('/leaves/fiscal-years')
    },

    // Get pending approvals
    getPendingApprovals(params = {}) {
      return apiClient.get('/leaves/pending-approvals', { params })
    }
  },

  // Reports endpoints
  reports: {
    // Get leave statistics
    getStatistics(fiscalYearId = null) {
      const params = fiscalYearId ? { fiscal_year_id: fiscalYearId } : {}
      return apiClient.get('/reports/statistics', { params })
    },

    // Get department report
    getDepartmentReport(departmentId, fiscalYearId = null) {
      const params = fiscalYearId ? { fiscal_year_id: fiscalYearId } : {}
      return apiClient.get(`/reports/department/${departmentId}`, { params })
    },

    // Get user report
    getUserReport(userId, fiscalYearId = null) {
      const params = fiscalYearId ? { fiscal_year_id: fiscalYearId } : {}
      return apiClient.get(`/reports/user/${userId}`, { params })
    },

    // Get summary report
    getSummary(fiscalYearId = null) {
      const params = fiscalYearId ? { fiscal_year_id: fiscalYearId } : {}
      return apiClient.get('/reports/summary', { params })
    },

    // Get leave usage report
    getUsageReport(params = {}) {
      return apiClient.get('/reports/usage', { params })
    },

    // Export report
    exportReport(params = {}) {
      return apiClient.get('/reports/export', { params })
    }
  },

  // User management endpoints
  users: {
    // Get all users
    getAll(params = {}) {
      return apiClient.get('/users', { params })
    },

    // Get user by ID
    getById(id) {
      return apiClient.get(`/users/${id}`)
    },

    // Update user
    update(id, data) {
      return apiClient.put(`/users/${id}`, data)
    },

    // Create user
    create(data) {
      return apiClient.post('/users', data)
    },

    // Deactivate user
    deactivate(id) {
      return apiClient.delete(`/users/${id}`)
    },

    // Get users by department
    getByDepartment(departmentId) {
      return apiClient.get(`/users/department/${departmentId}`)
    },

    // Get subordinates
    getSubordinates(userId) {
      return apiClient.get(`/users/${userId}/subordinates`)
    }
  },

  // Generic API methods
  get(endpoint, params = {}) {
    return apiClient.get(endpoint, { params })
  },

  post(endpoint, data = {}) {
    return apiClient.post(endpoint, data)
  },

  put(endpoint, data = {}) {
    return apiClient.put(endpoint, data)
  },

  delete(endpoint) {
    return apiClient.delete(endpoint)
  }
}

export default api