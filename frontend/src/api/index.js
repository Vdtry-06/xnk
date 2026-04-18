import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

export const authApi = {
  login:     (data) => api.post('/auth/login', data),
  listUsers: ()     => api.get('/auth/users'),
}

export const refApi = {
  agents:         () => api.get('/ref/agents'),
  warehouseStaffs:() => api.get('/ref/warehouse-staffs'),
}

export const salesOrderApi = {
  getAll:  (status) => api.get('/sales-orders', { params: status ? { status } : {} }),
  getById: (id)     => api.get(`/sales-orders/${id}`),
  create:  (data)   => api.post('/sales-orders', data),
  approve: (id, managerId) => api.patch(`/sales-orders/${id}/approve`, null, { params: { managerId } }),
}

export const deliveryNoteApi = {
  getAll:          ()            => api.get('/delivery-notes'),
  getBySalesOrder: (soId)        => api.get(`/delivery-notes/by-sales-order/${soId}`),
  create:          (data)        => api.post('/delivery-notes', data),
}

export const agentApi = {
  getAll: () => api.get('/agents'),
  create: (data) => api.post('/agents', data),
}

export const paymentApi = {
  getAll:           ()         => api.get('/payments'),
  getBySalesOrder:  (soId)     => api.get(`/payments/by-sales-order/${soId}`),
  create:           (data)     => api.post('/payments', data),
  confirmPaid:      (id, managerId) => api.patch(`/payments/${id}/confirm-paid`, null, { params: { managerId } }),
}
