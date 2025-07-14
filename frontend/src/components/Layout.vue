<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Mobile menu overlay -->
    <div v-if="mobileMenuOpen" class="fixed inset-0 z-40 md:hidden">
      <div class="fixed inset-0 bg-gray-600 bg-opacity-75" @click="mobileMenuOpen = false"></div>
    </div>

    <!-- Sidebar -->
    <div 
      :class="[
        'fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-0',
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      ]"
    >
      <div class="flex flex-col h-full">
        <!-- Logo/Header -->
        <div class="flex items-center justify-between h-16 px-4 bg-gray-900 text-white">
          <div class="flex items-center">
            <svg class="w-8 h-8 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"/>
            </svg>
            <h1 class="text-lg font-semibold">ระบบวันลา</h1>
          </div>
          <button @click="mobileMenuOpen = false" class="md:hidden">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 px-2 py-4 space-y-1 overflow-y-auto scrollbar-thin">
          <router-link
            v-for="item in navigationItems"
            :key="item.name"
            :to="item.to"
            :class="[
              'sidebar-nav-item',
              $route.name === item.name ? 'active' : ''
            ]"
            @click="mobileMenuOpen = false"
          >
            <component :is="item.icon" class="w-5 h-5 mr-3" />
            {{ item.label }}
          </router-link>
        </nav>

        <!-- User Info -->
        <div class="p-4 border-t border-gray-200">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                <svg class="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
                </svg>
              </div>
            </div>
            <div class="ml-3 flex-1">
              <p class="text-sm font-medium text-gray-900">
                {{ user?.first_name }} {{ user?.last_name }}
              </p>
              <p class="text-xs text-gray-500">{{ user?.department_name }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main content -->
    <div class="md:ml-64">
      <!-- Top navigation bar -->
      <div class="bg-white shadow-sm border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16">
            <div class="flex items-center">
              <!-- Mobile menu button -->
              <button 
                @click="mobileMenuOpen = true"
                class="md:hidden mr-3 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
                </svg>
              </button>

              <!-- Page title -->
              <h1 class="text-xl font-semibold text-gray-900">
                {{ $route.meta.title || 'ระบบวันลาราชการ' }}
              </h1>
            </div>

            <div class="flex items-center space-x-4">
              <!-- Fiscal year selector -->
              <div class="hidden sm:block">
                <select 
                  v-model="selectedFiscalYear"
                  @change="onFiscalYearChange"
                  class="text-sm border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                >
                  <option v-for="fy in fiscalYears" :key="fy.id" :value="fy.id">
                    ปีงบประมาณ {{ fy.name }}
                  </option>
                </select>
              </div>

              <!-- Notifications -->
              <button class="p-2 text-gray-400 hover:text-gray-500 relative">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-3.5-3.5a.5.5 0 01-.11-.54l1.05-2.63A1 1 0 0017.88 9h-1.38a1 1 0 00-.9.56l-1.05 2.63a.5.5 0 01-.11-.04L11 9.5h-1l-3.44 2.65a.5.5 0 01-.11.04l-1.05-2.63A1 1 0 004.5 9H3.12a1 1 0 00.44 1.06l1.05 2.63a.5.5 0 01-.11.54L1 17h5m1 0v1a3 3 0 006 0v-1"/>
                </svg>
                <span v-if="pendingCount > 0" class="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {{ pendingCount }}
                </span>
              </button>

              <!-- User menu -->
              <div class="relative">
                <button 
                  @click="userMenuOpen = !userMenuOpen"
                  class="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  <div class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <svg class="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
                    </svg>
                  </div>
                </button>

                <!-- User dropdown -->
                <Transition name="fade">
                  <div 
                    v-if="userMenuOpen"
                    class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-10"
                  >
                    <div class="py-1">
                      <router-link 
                        to="/profile" 
                        class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        @click="userMenuOpen = false"
                      >
                        ข้อมูลส่วนตัว
                      </router-link>
                      <button 
                        @click="logout"
                        class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        ออกจากระบบ
                      </button>
                    </div>
                  </div>
                </Transition>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Page content -->
      <main class="p-4 md:p-6">
        <slot />
      </main>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'

export default {
  name: 'Layout',
  data() {
    return {
      mobileMenuOpen: false,
      userMenuOpen: false,
      selectedFiscalYear: null
    }
  },
  computed: {
    ...mapState(['user', 'fiscalYears', 'pendingApprovals']),
    ...mapGetters(['currentUser', 'currentUserRole', 'currentFiscalYear', 'canApproveLeave']),
    
    navigationItems() {
      const items = [
        {
          name: 'Dashboard',
          label: 'หน้าหลัก',
          to: '/dashboard',
          icon: 'HomeIcon'
        },
        {
          name: 'LeaveRequests',
          label: 'คำขอลา',
          to: '/leave-requests',
          icon: 'DocumentTextIcon'
        },
        {
          name: 'LeaveHistory',
          label: 'ประวัติการลา',
          to: '/leave-history',
          icon: 'ClockIcon'
        }
      ]

      // Add supervisor/HR/Admin specific items
      if (this.canApproveLeave) {
        items.push({
          name: 'PendingApprovals',
          label: 'รอการอนุมัติ',
          to: '/pending-approvals',
          icon: 'CheckCircleIcon'
        })
      }

      if (['hr', 'admin'].includes(this.currentUserRole)) {
        items.push(
          {
            name: 'Reports',
            label: 'รายงาน',
            to: '/reports',
            icon: 'ChartBarIcon'
          },
          {
            name: 'UserManagement',
            label: 'จัดการผู้ใช้',
            to: '/users',
            icon: 'UsersIcon'
          }
        )
      }

      return items
    },

    pendingCount() {
      return this.pendingApprovals?.length || 0
    }
  },
  watch: {
    currentFiscalYear: {
      handler(newVal) {
        if (newVal && !this.selectedFiscalYear) {
          this.selectedFiscalYear = newVal.id
        }
      },
      immediate: true
    }
  },
  methods: {
    ...mapActions(['logout']),
    
    async onFiscalYearChange() {
      // Emit event to parent components about fiscal year change
      this.$emit('fiscal-year-changed', this.selectedFiscalYear)
      
      // Refresh relevant data
      if (this.$route.name === 'Dashboard') {
        // Refresh dashboard data
        await this.$store.dispatch('fetchLeaveBalances', this.selectedFiscalYear)
      }
    },

    // Icon components (using simple divs since we don't have Heroicons setup)
    HomeIcon: () => 'div',
    DocumentTextIcon: () => 'div',
    ClockIcon: () => 'div',
    CheckCircleIcon: () => 'div',
    ChartBarIcon: () => 'div',
    UsersIcon: () => 'div'
  },
  async mounted() {
    // Fetch pending approvals if user can approve
    if (this.canApproveLeave) {
      await this.$store.dispatch('fetchPendingApprovals')
    }

    // Close menus when clicking outside
    document.addEventListener('click', (e) => {
      if (!this.$el.contains(e.target)) {
        this.userMenuOpen = false
      }
    })
  }
}
</script>

<style scoped>
.sidebar-nav-item {
  @apply flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200;
}

.sidebar-nav-item.active {
  @apply bg-gray-900 text-white;
}

.sidebar-nav-item:not(.active) {
  @apply text-gray-600 hover:bg-gray-100 hover:text-gray-900;
}
</style>