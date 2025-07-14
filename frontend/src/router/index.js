import { createRouter, createWebHistory } from 'vue-router'
import store from '../store'

// Import Views
import Login from '../views/Login.vue'
import Dashboard from '../views/Dashboard.vue'
import LeaveRequests from '../views/LeaveRequests.vue'
import LeaveHistory from '../views/LeaveHistory.vue'
import Reports from '../views/Reports.vue'
import Profile from '../views/Profile.vue'
import PendingApprovals from '../views/PendingApprovals.vue'
import UserManagement from '../views/UserManagement.vue'

const routes = [
  // Redirect root to dashboard
  {
    path: '/',
    redirect: '/dashboard'
  },

  // Authentication
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { 
      requiresAuth: false,
      hideNavigation: true 
    }
  },

  // Main Dashboard
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { 
      requiresAuth: true,
      title: 'หน้าหลัก'
    }
  },

  // Leave Management
  {
    path: '/leave-requests',
    name: 'LeaveRequests',
    component: LeaveRequests,
    meta: { 
      requiresAuth: true,
      title: 'คำขอลา'
    }
  },

  {
    path: '/leave-history',
    name: 'LeaveHistory',
    component: LeaveHistory,
    meta: { 
      requiresAuth: true,
      title: 'ประวัติการลา'
    }
  },

  // Approvals (for supervisors, HR, admin)
  {
    path: '/pending-approvals',
    name: 'PendingApprovals',
    component: PendingApprovals,
    meta: { 
      requiresAuth: true,
      requiresRole: ['supervisor', 'hr', 'admin'],
      title: 'รอการอนุมัติ'
    }
  },

  // Reports
  {
    path: '/reports',
    name: 'Reports',
    component: Reports,
    meta: { 
      requiresAuth: true,
      requiresRole: ['hr', 'admin'],
      title: 'รายงาน'
    }
  },

  // User Management
  {
    path: '/users',
    name: 'UserManagement',
    component: UserManagement,
    meta: { 
      requiresAuth: true,
      requiresRole: ['hr', 'admin'],
      title: 'จัดการผู้ใช้'
    }
  },

  // Profile
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: { 
      requiresAuth: true,
      title: 'ข้อมูลส่วนตัว'
    }
  },

  // 404 Page
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFound.vue'),
    meta: { 
      title: 'ไม่พบหน้า'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// Navigation guards
router.beforeEach(async (to, from, next) => {
  // Set page title
  document.title = to.meta.title 
    ? `${to.meta.title} - ระบบวันลาราชการ` 
    : 'ระบบวันลาราชการ'

  // Check authentication
  const token = localStorage.getItem('token')
  const isAuthenticated = !!token

  // Set authentication state in store if token exists
  if (token && !store.state.isAuthenticated) {
    store.commit('setAuth', { user: null, token })
    
    try {
      // Try to get user profile
      await store.dispatch('getProfile')
    } catch (error) {
      // Token is invalid, clear it
      localStorage.removeItem('token')
      store.commit('logout')
      
      if (to.meta.requiresAuth) {
        return next('/login')
      }
    }
  }

  // Handle routes that require authentication
  if (to.meta.requiresAuth && !isAuthenticated) {
    return next('/login')
  }

  // Handle routes that require specific roles
  if (to.meta.requiresRole && isAuthenticated) {
    const userRole = store.state.user?.role
    
    if (!userRole || !to.meta.requiresRole.includes(userRole)) {
      store.commit('showNotification', {
        type: 'error',
        message: 'คุณไม่มีสิทธิ์เข้าถึงหน้านี้'
      })
      return next('/dashboard')
    }
  }

  // Redirect to dashboard if user is authenticated and trying to access login
  if (to.name === 'Login' && isAuthenticated) {
    return next('/dashboard')
  }

  next()
})

// After each route
router.afterEach((to, from) => {
  // Initialize app data after login
  if (to.meta.requiresAuth && store.state.isAuthenticated) {
    store.dispatch('initializeApp')
  }
})

export default router