<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
        <!-- 404 Illustration -->
        <div class="mx-auto flex items-center justify-center h-32 w-32 rounded-full bg-gray-100 mb-6">
          <svg class="h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.462-.695-6.25-1.875C5.555 14.76 5.555 16.666 6.25 18.125 7.688 17.5 9.813 17 12 17c2.188 0 4.313.5 5.75 1.125.695-1.459.695-3.365 0-4.875z"/>
          </svg>
        </div>

        <!-- Error Message -->
        <h1 class="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 class="text-2xl font-semibold text-gray-900 mb-4">ไม่พบหน้าที่ต้องการ</h2>
        <p class="text-gray-600 mb-8">
          ขออภัย หน้าที่คุณกำลังมองหาไม่มีอยู่ในระบบ<br>
          หรืออาจถูกย้ายไปยังที่อื่นแล้ว
        </p>

        <!-- Action Buttons -->
        <div class="space-y-3">
          <router-link 
            to="/dashboard" 
            class="w-full btn btn-primary block text-center"
          >
            <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
            </svg>
            กลับสู่หน้าหลัก
          </router-link>
          
          <button 
            @click="goBack" 
            class="w-full btn btn-secondary block text-center"
          >
            <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 17l-5-5m0 0l5-5m-5 5h12"/>
            </svg>
            ย้อนกลับ
          </button>
        </div>

        <!-- Additional Links -->
        <div class="mt-8 pt-6 border-t border-gray-200">
          <p class="text-sm text-gray-500 mb-4">หากคุณต้องการความช่วยเหลือ:</p>
          <div class="flex justify-center space-x-6 text-sm">
            <router-link to="/dashboard" class="text-gray-600 hover:text-gray-900">
              หน้าหลัก
            </router-link>
            <router-link to="/profile" class="text-gray-600 hover:text-gray-900">
              ข้อมูลส่วนตัว
            </router-link>
            <a href="mailto:support@government.local" class="text-gray-600 hover:text-gray-900">
              ติดต่อสนับสนุน
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NotFound',
  methods: {
    goBack() {
      // Go back to previous page or dashboard if no history
      if (window.history.length > 1) {
        this.$router.go(-1)
      } else {
        this.$router.push('/dashboard')
      }
    }
  }
}
</script>

<style scoped>
/* Additional 404 page styles */
</style>