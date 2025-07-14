<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <!-- Header -->
      <div>
        <div class="mx-auto h-16 w-16 bg-gray-900 rounded-lg flex items-center justify-center">
          <svg class="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"/>
          </svg>
        </div>
        <h2 class="mt-6 text-center text-3xl font-bold text-gray-900">
          ระบบวันลาราชการ
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          เข้าสู่ระบบเพื่อใช้งาน
        </p>
      </div>

      <!-- Login Form -->
      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <div class="rounded-md shadow-sm space-y-4">
          <!-- Username -->
          <div>
            <label for="username" class="label">ชื่อผู้ใช้</label>
            <input
              id="username"
              v-model="form.username"
              name="username"
              type="text"
              autocomplete="username"
              required
              class="input-field"
              placeholder="กรอกชื่อผู้ใช้"
              :disabled="isLoading"
            />
          </div>

          <!-- Password -->
          <div>
            <label for="password" class="label">รหัสผ่าน</label>
            <input
              id="password"
              v-model="form.password"
              name="password"
              type="password"
              autocomplete="current-password"
              required
              class="input-field"
              placeholder="กรอกรหัสผ่าน"
              :disabled="isLoading"
            />
          </div>
        </div>

        <!-- Remember me -->
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <input
              id="remember-me"
              v-model="form.rememberMe"
              name="remember-me"
              type="checkbox"
              class="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
            />
            <label for="remember-me" class="ml-2 block text-sm text-gray-900">
              จดจำการเข้าสู่ระบบ
            </label>
          </div>
        </div>

        <!-- Submit Button -->
        <div>
          <button
            type="submit"
            :disabled="isLoading"
            class="btn btn-primary w-full btn-lg"
          >
            <div v-if="isLoading" class="flex items-center justify-center">
              <div class="spinner mr-2"></div>
              กำลังเข้าสู่ระบบ...
            </div>
            <span v-else>เข้าสู่ระบบ</span>
          </button>
        </div>

        <!-- Error Message -->
        <div v-if="errorMessage" class="bg-red-50 border border-red-200 rounded-md p-4">
          <div class="flex">
            <svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
            </svg>
            <div class="ml-3">
              <p class="text-sm text-red-800">{{ errorMessage }}</p>
            </div>
          </div>
        </div>
      </form>

      <!-- Demo Credentials -->
      <div class="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <h3 class="text-sm font-medium text-blue-900 mb-3">ข้อมูลสำหรับทดสอบระบบ:</h3>
        <div class="space-y-2 text-xs text-blue-800">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <strong>ผู้ดูแลระบบ:</strong><br>
              Username: admin<br>
              Password: password123
            </div>
            <div>
              <strong>HR:</strong><br>
              Username: hr001<br>
              Password: password123
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4 mt-2">
            <div>
              <strong>หัวหน้างาน:</strong><br>
              Username: sup001<br>
              Password: password123
            </div>
            <div>
              <strong>ข้าราชการ:</strong><br>
              Username: emp001<br>
              Password: password123
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="text-center">
        <p class="text-sm text-gray-500">
          ระบบวันลาราชการ © 2024
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
  name: 'Login',
  data() {
    return {
      form: {
        username: '',
        password: '',
        rememberMe: false
      },
      errorMessage: ''
    }
  },
  computed: {
    ...mapState(['isLoading'])
  },
  methods: {
    ...mapActions(['login']),
    
    async handleLogin() {
      this.errorMessage = ''
      
      try {
        await this.login({
          username: this.form.username,
          password: this.form.password
        })
        
        // Redirect to dashboard
        this.$router.push('/dashboard')
      } catch (error) {
        this.errorMessage = error.response?.data?.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ'
      }
    },

    // Quick login for demo
    quickLogin(username, password) {
      this.form.username = username
      this.form.password = password
      this.handleLogin()
    }
  },
  mounted() {
    // Focus on username field
    this.$nextTick(() => {
      document.getElementById('username')?.focus()
    })
  }
}
</script>

<style scoped>
/* Additional login-specific styles can be added here */
</style>