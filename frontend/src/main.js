import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './assets/css/main.css'

// Global components and filters
import moment from 'moment'

const app = createApp(App)

// Configure moment locale to Thai
moment.locale('th')

// Global properties
app.config.globalProperties.$moment = moment

// Format currency helper
app.config.globalProperties.$formatCurrency = (amount) => {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB'
  }).format(amount)
}

// Format date helper
app.config.globalProperties.$formatDate = (date, format = 'DD/MM/YYYY') => {
  return moment(date).format(format)
}

// Format status helper
app.config.globalProperties.$formatStatus = (status) => {
  const statusMap = {
    pending: 'รอการอนุมัติ',
    approved: 'อนุมัติ',
    denied: 'ไม่อนุมัติ'
  }
  return statusMap[status] || status
}

// Get status class helper
app.config.globalProperties.$getStatusClass = (status) => {
  const classMap = {
    pending: 'status-badge status-pending',
    approved: 'status-badge status-approved',
    denied: 'status-badge status-denied'
  }
  return classMap[status] || 'status-badge'
}

app.use(store).use(router).mount('#app')