import { createStore } from 'vuex'
import api from '../services/api'

export default createStore({
  state: {
    // UI State
    isLoading: false,
    notification: {
      show: false,
      type: 'info', // 'success', 'error', 'warning', 'info'
      message: ''
    },

    // Authentication
    user: null,
    token: localStorage.getItem('token') || null,
    isAuthenticated: false,

    // Leave Management
    leaveBalances: [],
    leaveRequests: [],
    leaveHistory: [],
    leaveTypes: [],
    fiscalYears: [],
    pendingApprovals: [],

    // Reports
    leaveStatistics: {},
    departmentReport: {},
    summaryReport: {},

    // Master Data
    departments: [],
    positions: [],
    users: []
  },

  mutations: {
    // UI Mutations
    setLoading(state, loading) {
      state.isLoading = loading
    },

    showNotification(state, { type, message }) {
      state.notification = {
        show: true,
        type,
        message
      }
    },

    hideNotification(state) {
      state.notification.show = false
    },

    // Authentication Mutations
    setAuth(state, { user, token }) {
      state.user = user
      state.token = token
      state.isAuthenticated = !!token
      
      if (token) {
        localStorage.setItem('token', token)
        api.setAuthToken(token)
      } else {
        localStorage.removeItem('token')
        api.clearAuthToken()
      }
    },

    updateUser(state, user) {
      state.user = { ...state.user, ...user }
    },

    logout(state) {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      localStorage.removeItem('token')
      api.clearAuthToken()
    },

    // Leave Management Mutations
    setLeaveBalances(state, balances) {
      state.leaveBalances = balances
    },

    setLeaveRequests(state, requests) {
      state.leaveRequests = requests
    },

    setLeaveHistory(state, history) {
      state.leaveHistory = history
    },

    setLeaveTypes(state, types) {
      state.leaveTypes = types
    },

    setFiscalYears(state, years) {
      state.fiscalYears = years
    },

    setPendingApprovals(state, approvals) {
      state.pendingApprovals = approvals
    },

    addLeaveRequest(state, request) {
      state.leaveRequests.unshift(request)
    },

    updateLeaveRequest(state, updatedRequest) {
      const index = state.leaveRequests.findIndex(req => req.id === updatedRequest.id)
      if (index !== -1) {
        state.leaveRequests.splice(index, 1, updatedRequest)
      }
    },

    // Reports Mutations
    setLeaveStatistics(state, statistics) {
      state.leaveStatistics = statistics
    },

    setDepartmentReport(state, report) {
      state.departmentReport = report
    },

    setSummaryReport(state, report) {
      state.summaryReport = report
    },

    // Master Data Mutations
    setDepartments(state, departments) {
      state.departments = departments
    },

    setPositions(state, positions) {
      state.positions = positions
    },

    setUsers(state, users) {
      state.users = users
    }
  },

  actions: {
    // Authentication Actions
    async login({ commit }, credentials) {
      try {
        commit('setLoading', true)
        const response = await api.auth.login(credentials)
        
        commit('setAuth', {
          user: response.data.user,
          token: response.data.token
        })
        
        commit('showNotification', {
          type: 'success',
          message: 'เข้าสู่ระบบสำเร็จ'
        })
        
        return response.data
      } catch (error) {
        commit('showNotification', {
          type: 'error',
          message: error.response?.data?.message || 'เข้าสู่ระบบไม่สำเร็จ'
        })
        throw error
      } finally {
        commit('setLoading', false)
      }
    },

    async logout({ commit }) {
      try {
        await api.auth.logout()
      } catch (error) {
        // Ignore logout errors
      } finally {
        commit('logout')
        commit('showNotification', {
          type: 'info',
          message: 'ออกจากระบบแล้ว'
        })
      }
    },

    async getProfile({ commit }) {
      try {
        const response = await api.auth.getProfile()
        commit('updateUser', response.data.user)
        return response.data
      } catch (error) {
        commit('showNotification', {
          type: 'error',
          message: 'ไม่สามารถโหลดข้อมูลโปรไฟล์ได้'
        })
        throw error
      }
    },

    // Leave Management Actions
    async fetchLeaveBalances({ commit }, fiscalYearId = null) {
      try {
        commit('setLoading', true)
        const response = await api.leaves.getBalance(fiscalYearId)
        commit('setLeaveBalances', response.data.leave_balances)
        return response.data
      } catch (error) {
        commit('showNotification', {
          type: 'error',
          message: 'ไม่สามารถโหลดข้อมูลยอดวันลาได้'
        })
        throw error
      } finally {
        commit('setLoading', false)
      }
    },

    async fetchLeaveRequests({ commit }, params = {}) {
      try {
        commit('setLoading', true)
        const response = await api.leaves.getRequests(params)
        commit('setLeaveRequests', response.data.requests)
        return response.data
      } catch (error) {
        commit('showNotification', {
          type: 'error',
          message: 'ไม่สามารถโหลดข้อมูลคำขอลาได้'
        })
        throw error
      } finally {
        commit('setLoading', false)
      }
    },

    async createLeaveRequest({ commit, dispatch }, requestData) {
      try {
        commit('setLoading', true)
        const response = await api.leaves.createRequest(requestData)
        
        commit('addLeaveRequest', response.data.request)
        commit('showNotification', {
          type: 'success',
          message: 'ส่งคำขอลาสำเร็จ'
        })
        
        // Refresh leave balances
        await dispatch('fetchLeaveBalances')
        
        return response.data
      } catch (error) {
        commit('showNotification', {
          type: 'error',
          message: error.response?.data?.message || 'ไม่สามารถส่งคำขอลาได้'
        })
        throw error
      } finally {
        commit('setLoading', false)
      }
    },

    async updateLeaveRequest({ commit, dispatch }, { id, data }) {
      try {
        commit('setLoading', true)
        const response = await api.leaves.updateRequest(id, data)
        
        commit('updateLeaveRequest', response.data.request)
        commit('showNotification', {
          type: 'success',
          message: `${data.status === 'approved' ? 'อนุมัติ' : 'ไม่อนุมัติ'}คำขอลาแล้ว`
        })
        
        // Refresh related data
        await dispatch('fetchPendingApprovals')
        
        return response.data
      } catch (error) {
        commit('showNotification', {
          type: 'error',
          message: error.response?.data?.message || 'ไม่สามารถอัปเดตคำขอลาได้'
        })
        throw error
      } finally {
        commit('setLoading', false)
      }
    },

    async fetchLeaveTypes({ commit }) {
      try {
        const response = await api.leaves.getTypes()
        commit('setLeaveTypes', response.data.leave_types)
        return response.data
      } catch (error) {
        commit('showNotification', {
          type: 'error',
          message: 'ไม่สามารถโหลดประเภทการลาได้'
        })
        throw error
      }
    },

    async fetchFiscalYears({ commit }) {
      try {
        const response = await api.leaves.getFiscalYears()
        commit('setFiscalYears', response.data.fiscal_years)
        return response.data
      } catch (error) {
        commit('showNotification', {
          type: 'error',
          message: 'ไม่สามารถโหลดข้อมูลปีงบประมาณได้'
        })
        throw error
      }
    },

    async fetchPendingApprovals({ commit }, params = {}) {
      try {
        const response = await api.leaves.getPendingApprovals(params)
        commit('setPendingApprovals', response.data.pending_requests)
        return response.data
      } catch (error) {
        commit('showNotification', {
          type: 'error',
          message: 'ไม่สามารถโหลดคำขอที่รออนุมัติได้'
        })
        throw error
      }
    },

    // Reports Actions
    async fetchLeaveStatistics({ commit }, fiscalYearId = null) {
      try {
        const response = await api.reports.getStatistics(fiscalYearId)
        commit('setLeaveStatistics', response.data)
        return response.data
      } catch (error) {
        commit('showNotification', {
          type: 'error',
          message: 'ไม่สามารถโหลดสถิติการลาได้'
        })
        throw error
      }
    },

    async fetchSummaryReport({ commit }, fiscalYearId = null) {
      try {
        const response = await api.reports.getSummary(fiscalYearId)
        commit('setSummaryReport', response.data)
        return response.data
      } catch (error) {
        commit('showNotification', {
          type: 'error',
          message: 'ไม่สามารถโหลดรายงานสรุปได้'
        })
        throw error
      }
    },

    // Initialize app data
    async initializeApp({ dispatch, state }) {
      if (state.isAuthenticated) {
        try {
          await Promise.all([
            dispatch('getProfile'),
            dispatch('fetchLeaveTypes'),
            dispatch('fetchFiscalYears')
          ])
        } catch (error) {
          // Handle initialization errors
          console.error('App initialization error:', error)
        }
      }
    }
  },

  getters: {
    isAuthenticated: state => state.isAuthenticated,
    currentUser: state => state.user,
    currentUserRole: state => state.user?.role || 'employee',
    
    // Leave Management Getters
    currentFiscalYear: state => {
      return state.fiscalYears.find(fy => fy.is_active) || null
    },
    
    totalRemainingDays: state => {
      return state.leaveBalances.reduce((total, balance) => total + balance.remaining_days, 0)
    },
    
    leaveRequestsByStatus: state => status => {
      return state.leaveRequests.filter(request => request.status === status)
    },
    
    // Permission Getters
    canApproveLeave: state => {
      return ['supervisor', 'hr', 'admin'].includes(state.user?.role)
    },
    
    canViewReports: state => {
      return ['hr', 'admin'].includes(state.user?.role)
    },
    
    canManageUsers: state => {
      return ['hr', 'admin'].includes(state.user?.role)
    }
  }
})