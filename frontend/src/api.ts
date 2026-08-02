import axios from 'axios'
import { API_BASE_URL } from './config'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const storedUser = window.localStorage.getItem('ecoaction_user')
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser)
        if (parsed?.email) {
          const headers = (config.headers as Record<string, string> | undefined) || {}
          config.headers = {
            ...headers,
            'x-user-email': parsed.email,
          } as any
        }
      } catch {
        // ignore malformed user storage
      }
    }
  }
  return config
})

export type LoginPayload = {
  email: string
  password: string
}

export type RegisterPayload = {
  email: string
  username: string
  password: string
}

export type UserProfile = {
  id: string
  email: string
  username: string
  role: string
  coins: string
  cashBalance: string
  referralCode: string
}

export type Task = {
  id: string
  title: string
  description: string
  rewardAmount: string
  proofType: string
  maxParticipants: number
  status: string
}

export type TaskSubmission = {
  id: string
  proof: string
  status: string
  adminNote?: string
  createdAt: string
  user: {
    id: string
    username: string
    email: string
  }
  task: Task
}

export const authApi = {
  login: (payload: LoginPayload) => api.post('/auth/login', payload),
  register: (payload: RegisterPayload) => api.post('/auth/register', payload),
}

export const userApi = {
  profile: (userId: string) => api.get<UserProfile>(`/users/profile?userId=${userId}`),
}

export const tasksApi = {
  list: () => api.get<Task[]>('/tasks'),
  submit: (payload: { userId: string; taskId: string; proof: string }) => api.post('/tasks/submit', payload),
  pendingSubmissions: () => api.get<TaskSubmission[]>('/tasks/pending-submissions'),
  reviewSubmission: (payload: { submissionId: string; status: 'APPROVED' | 'REJECTED'; adminNote?: string }) =>
    api.post('/tasks/review-submission', payload),
}

export const withdrawalsApi = {
  request: (payload: { userId: string; amount: number; paymentMethod: string; paymentDetails: string }) =>
    api.post('/withdrawals/request', payload),
  pending: () => api.get('/withdrawals/pending'),
  review: (payload: { withdrawalId: string; status: 'APPROVED' | 'REJECTED'; adminNote?: string }) =>
    api.post('/withdrawals/review', payload),
}

export const adminApi = {
  stats: () => api.get('/admin/stats'),
  users: () => api.get('/admin/users'),
  withdrawals: () => api.get('/admin/withdrawals'),
  taskSubmissions: () => api.get('/admin/task-submissions'),
  reviewTaskSubmission: (payload: { submissionId: string; status: 'APPROVED' | 'REJECTED'; adminNote?: string }) =>
    api.post('/admin/task-submission/review', payload),
  tasks: () => api.get('/admin/tasks'),
  createTask: (payload: {
    title: string
    description: string
    rewardAmount: number
    proofType: 'SCREENSHOT' | 'LINK' | 'TEXT' | 'VIDEO'
    maxParticipants: number
    status?: 'ACTIVE' | 'PAUSED' | 'COMPLETED'
  }) => api.post('/admin/task', payload),
  updateTask: (payload: {
    id: string
    data: {
      title?: string
      description?: string
      rewardAmount?: number
      proofType?: 'SCREENSHOT' | 'LINK' | 'TEXT' | 'VIDEO'
      maxParticipants?: number
      status?: 'ACTIVE' | 'PAUSED' | 'COMPLETED'
    }
  }) => api.post('/admin/task/update', payload),
  banners: () => api.get('/admin/banners'),
  createBanner: (payload: any) => api.post('/admin/banner', payload),
  updateBanner: (payload: { id: string; data: any }) => api.post('/admin/banner/update', payload),
  reviewWithdrawal: (payload: { withdrawalId: string; status: 'APPROVED' | 'REJECTED'; adminNote?: string }) =>
    api.post('/admin/withdrawal/review', payload),
  setUserRole: (payload: { userId: string; role: 'USER' | 'ADMIN' | 'MODERATOR' }) => api.post('/admin/user/role', payload),
  adjustUserBalance: (payload: { userId: string; coins: number; cashBalance: number }) => api.post('/admin/user/balance', payload),
}

export const bannersApi = {
  active: () => api.get('/banners/active'),
}
