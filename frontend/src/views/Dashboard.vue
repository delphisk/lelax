<template>
  <Layout>
    <div class="space-y-6">
      <!-- Welcome Header -->
      <div class="card">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">
              สวัสดี, {{ user?.first_name }} {{ user?.last_name }}
            </h1>
            <p class="text-gray-600">
              {{ user?.position_name }} - {{ user?.department_name }}
            </p>
            <p class="text-sm text-gray-500 mt-1">
              ปีงบประมาณ {{ currentFiscalYear?.name || '2568' }}
            </p>
          </div>
          <div class="text-right">
            <p class="text-sm text-gray-500">วันที่</p>
            <p class="text-lg font-medium">{{ $formatDate(new Date(), 'DD MMMM YYYY') }}</p>
          </div>
        </div>
      </div>

      <!-- Leave Balance Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div 
          v-for="balance in leaveBalances" 
          :key="balance.leave_type_id"
          class="card"
        >
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div :class="[
                'w-10 h-10 rounded-full flex items-center justify-center',
                getLeaveTypeColor(balance.leave_type_code)
              ]">
                <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/>
                </svg>
              </div>
            </div>
            <div class="ml-4 flex-1">
              <h3 class="text-sm font-medium text-gray-900">{{ balance.leave_type_name }}</h3>
              <div class="flex items-center space-x-2">
                <span class="text-2xl font-bold text-gray-900">{{ balance.remaining_days }}</span>
                <span class="text-sm text-gray-500">/ {{ balance.total_days }} วัน</span>
              </div>
            </div>
          </div>
          
          <!-- Progress bar -->
          <div class="mt-4">
            <div class="flex justify-between text-xs text-gray-600 mb-1">
              <span>ใช้ไป {{ balance.used_days }} วัน</span>
              <span>{{ Math.round((balance.remaining_days / balance.total_days) * 100) }}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div 
                :class="[
                  'h-2 rounded-full transition-all duration-300',
                  getLeaveTypeColor(balance.leave_type_code).replace('bg-', 'bg-')
                ]"
                :style="{ width: `${(balance.remaining_days / balance.total_days) * 100}%` }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions & Recent Activity -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Quick Actions -->
        <div class="card">
          <div class="card-header">
            <h2 class="text-lg font-semibold text-gray-900">การดำเนินการด่วน</h2>
          </div>
          <div class="space-y-3">
            <router-link 
              to="/leave-requests" 
              class="block w-full btn btn-primary text-center"
            >
              <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
              ส่งคำขอลา
            </router-link>
            
            <router-link 
              to="/leave-history" 
              class="block w-full btn btn-secondary text-center"
            >
              <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              ประวัติการลา
            </router-link>
            
            <router-link 
              v-if="canApproveLeave"
              to="/pending-approvals" 
              class="block w-full btn btn-warning text-center"
            >
              <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              รอการอนุมัติ ({{ pendingApprovals?.length || 0 }})
            </router-link>
          </div>
        </div>

        <!-- Recent Leave Requests -->
        <div class="lg:col-span-2 card">
          <div class="card-header">
            <h2 class="text-lg font-semibold text-gray-900">คำขอลาล่าสุด</h2>
          </div>
          
          <div v-if="recentRequests.length === 0" class="text-center py-8">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
            <p class="mt-2 text-sm text-gray-500">ยังไม่มีคำขอลา</p>
          </div>
          
          <div v-else class="space-y-3">
            <div 
              v-for="request in recentRequests.slice(0, 5)" 
              :key="request.id"
              class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div class="flex-1">
                <div class="flex items-center space-x-3">
                  <span class="text-sm font-medium text-gray-900">
                    {{ request.leave_type_name }}
                  </span>
                  <span :class="$getStatusClass(request.status)">
                    {{ $formatStatus(request.status) }}
                  </span>
                </div>
                <p class="text-xs text-gray-500 mt-1">
                  {{ $formatDate(request.start_date) }} - {{ $formatDate(request.end_date) }}
                  ({{ request.days_count }} วัน)
                </p>
              </div>
              <div class="text-right">
                <p class="text-xs text-gray-500">
                  {{ $formatDate(request.created_at, 'DD/MM/YY') }}
                </p>
              </div>
            </div>
            
            <div class="text-center pt-2">
              <router-link 
                to="/leave-history" 
                class="text-sm text-gray-600 hover:text-gray-900"
              >
                ดูทั้งหมด →
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <!-- Statistics for Supervisors/HR -->
      <div v-if="canViewReports && summaryStats" class="card">
        <div class="card-header">
          <h2 class="text-lg font-semibold text-gray-900">สรุปสถิติองค์กร</h2>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div class="text-center">
            <div class="text-3xl font-bold text-blue-600">{{ summaryStats.total_employees || 0 }}</div>
            <div class="text-sm text-gray-500">ข้าราชการทั้งหมด</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-green-600">{{ summaryStats.approved_requests || 0 }}</div>
            <div class="text-sm text-gray-500">คำขออนุมัติแล้ว</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-yellow-600">{{ summaryStats.pending_requests || 0 }}</div>
            <div class="text-sm text-gray-500">รอการอนุมัติ</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-purple-600">{{ summaryStats.total_approved_days || 0 }}</div>
            <div class="text-sm text-gray-500">วันลาทั้งหมด</div>
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'
import Layout from '../components/Layout.vue'

export default {
  name: 'Dashboard',
  components: {
    Layout
  },
  data() {
    return {
      summaryStats: null
    }
  },
  computed: {
    ...mapState(['user', 'leaveBalances', 'leaveRequests', 'pendingApprovals']),
    ...mapGetters(['currentFiscalYear', 'canApproveLeave', 'canViewReports']),
    
    recentRequests() {
      return [...this.leaveRequests]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5)
    }
  },
  methods: {
    ...mapActions(['fetchLeaveBalances', 'fetchLeaveRequests', 'fetchPendingApprovals', 'fetchSummaryReport']),
    
    getLeaveTypeColor(code) {
      const colors = {
        VACATION: 'bg-blue-500',
        SICK: 'bg-red-500',
        PERSONAL: 'bg-green-500',
        MATERNITY: 'bg-purple-500',
        STUDY: 'bg-yellow-500',
        ORDINATION: 'bg-indigo-500'
      }
      return colors[code] || 'bg-gray-500'
    },
    
    async loadDashboardData() {
      try {
        await Promise.all([
          this.fetchLeaveBalances(),
          this.fetchLeaveRequests({ limit: 10 })
        ])
        
        if (this.canApproveLeave) {
          await this.fetchPendingApprovals()
        }
        
        if (this.canViewReports) {
          const summary = await this.fetchSummaryReport()
          this.summaryStats = summary.overall_statistics
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      }
    }
  },
  async mounted() {
    await this.loadDashboardData()
  }
}
</script>

<style scoped>
/* Additional dashboard-specific styles */
</style>