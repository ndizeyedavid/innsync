import api from './api';

export const hotelManagerAPI = {
  getDashboard: () => api.get('/manager/dashboard').then(res => res.data),
  getStays: () => api.get('/manager/stays').then(res => res.data),
  getStay: (stayId) => api.get(`/manager/stays/${stayId}`).then(res => res.data),
  getOrders: () => api.get('/manager/orders').then(res => res.data),
  updateOrderStatus: (orderId, status) => api.put(`/manager/orders/${orderId}/status`, { status }).then(res => res.data),
  getRooms: () => api.get('/manager/rooms').then(res => res.data),
};
