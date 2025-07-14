<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <!-- Loading overlay -->
    <div 
      v-if="isLoading" 
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white p-6 rounded-lg shadow-lg flex items-center space-x-3">
        <div class="spinner"></div>
        <span class="text-gray-700">กำลังโหลด...</span>
      </div>
    </div>

    <!-- Notification Toast -->
    <Transition name="fade">
      <div 
        v-if="notification.show"
        class="fixed top-4 right-4 z-40 max-w-sm"
      >
        <div 
          :class="[
            'p-4 rounded-lg shadow-lg border',
            notification.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
            notification.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
            notification.type === 'warning' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' :
            'bg-blue-50 border-blue-200 text-blue-800'
          ]"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <!-- Success icon -->
                <svg v-if="notification.type === 'success'" class="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                <!-- Error icon -->
                <svg v-else-if="notification.type === 'error'" class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                </svg>
                <!-- Warning icon -->
                <svg v-else-if="notification.type === 'warning'" class="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                </svg>
                <!-- Info icon -->
                <svg v-else class="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
                </svg>
              </div>
              <div class="ml-3">
                <p class="text-sm font-medium">{{ notification.message }}</p>
              </div>
            </div>
            <button 
              @click="hideNotification"
              class="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-600"
            >
              <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Main App Content -->
    <router-view />
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex'

export default {
  name: 'App',
  computed: {
    ...mapState(['isLoading', 'notification'])
  },
  methods: {
    ...mapMutations(['hideNotification']),
    
    initializeApp() {
      // Check if user is logged in and token exists
      const token = localStorage.getItem('token')
      if (token && this.$route.path === '/') {
        this.$router.push('/dashboard')
      } else if (!token && this.$route.path !== '/login') {
        this.$router.push('/login')
      }
    }
  },
  mounted() {
    this.initializeApp()
    
    // Auto-hide notifications after 5 seconds
    this.$store.watch(
      (state) => state.notification.show,
      (newVal) => {
        if (newVal) {
          setTimeout(() => {
            this.hideNotification()
          }, 5000)
        }
      }
    )
  },
  watch: {
    $route() {
      // Hide any existing notifications when route changes
      this.hideNotification()
    }
  }
}
</script>

<style>
/* Global app styles are defined in main.css */
</style>