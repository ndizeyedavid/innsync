import api from "./api";

const unwrap = (res) => res.data.data;

export const hotelManagerAPI = {
  // Dashboard
  getDashboard: (days) =>
    api.get(`/manager/dashboard${days ? `?days=${days}` : ""}`).then(unwrap),

  // Stays / Guests
  getStays: (status) =>
    api.get(`/manager/stays${status ? `?status=${status}` : ""}`).then(unwrap),
  getStay: (stayId) => api.get(`/manager/stays/${stayId}`).then(unwrap),
  checkIn: (stayId) => api.post(`/manager/stays/${stayId}/check-in`).then(unwrap),
  checkOut: (stayId) => api.post(`/manager/stays/${stayId}/check-out`).then(unwrap),
  cancelStay: (stayId) => api.post(`/manager/stays/${stayId}/cancel`).then(unwrap),

  // Orders
  getOrders: (status) =>
    api.get(`/manager/orders${status ? `?status=${status}` : ""}`).then(unwrap),
  updateOrderStatus: (orderId, status) =>
    api.put(`/manager/orders/${orderId}/status`, { status }).then(unwrap),

  // Rooms
  getRooms: () => api.get("/manager/rooms").then(unwrap),
  createRoom: (dto) => api.post("/manager/rooms", dto).then(unwrap),
  updateRoom: (id, dto) => api.put(`/manager/rooms/${id}`, dto).then(unwrap),
  deleteRoom: (id) => api.delete(`/manager/rooms/${id}`).then(unwrap),

  // Housekeeping
  getHousekeeping: (status) =>
    api.get(`/manager/housekeeping${status ? `?status=${status}` : ""}`).then(unwrap),
  updateHousekeepingStatus: (id, status, notes, assignedTo) =>
    api.put(`/manager/housekeeping/${id}/status`, { status, notes, assignedTo }).then(unwrap),

  // Folio / Billing
  getFolio: (stayId) => api.get(`/manager/folio/${stayId}`).then(unwrap),
  addCharge: (stayId, dto) =>
    api.post(`/manager/folio/${stayId}/charge`, dto).then(unwrap),
  voidCharge: (stayId, chargeId) =>
    api.post(`/manager/folio/${stayId}/void-charge/${chargeId}`).then(unwrap),
  getInvoices: () => api.get("/manager/invoices").then(unwrap),
  generateInvoice: (stayId) =>
    api.post(`/manager/folio/${stayId}/generate-invoice`).then(unwrap),
  updateInvoiceStatus: (invoiceId, status) =>
    api.patch(`/manager/invoices/${invoiceId}/status`, { status }).then(unwrap),
  recordPayment: (stayId, dto) =>
    api.post(`/manager/folio/${stayId}/record-payment`, dto).then(unwrap),

  // Itinerary
  getItinerary: (stayId) =>
    api.get(`/manager/itinerary?stayId=${stayId}`).then(unwrap),

  // Digital Keys
  getDigitalKeys: () => api.get("/manager/digital-keys").then(unwrap),
  issueDigitalKey: (dto) => api.post("/manager/digital-keys/issue", dto).then(unwrap),
  revokeDigitalKey: (id) => api.post(`/manager/digital-keys/${id}/revoke`).then(unwrap),

  // Amenities
  getAmenities: () => api.get("/manager/amenities").then(unwrap),
  createAmenity: (dto) => api.post("/manager/amenities", dto).then(unwrap),
  updateAmenity: (id, dto) =>
    api.put(`/manager/amenities/${id}`, dto).then(unwrap),
  deleteAmenity: (id) => api.delete(`/manager/amenities/${id}`).then(unwrap),

  // Audit Logs
  getAuditLogs: (limit) =>
    api.get(`/manager/audit-logs${limit ? `?limit=${limit}` : ""}`).then(unwrap),

  // Upload
  uploadImage: (file) => {
    const fd = new FormData();
    fd.append("file", file);
    return api.post("/manager/upload", fd).then(unwrap);
  },

  // Hotel Settings
  getHotelSettings: () => api.get("/manager/hotel").then(unwrap),
  updateHotelSettings: (dto) => api.put("/manager/hotel", dto).then(unwrap),

  // Staff
  getStaff: () => api.get("/manager/staff").then(unwrap),
  inviteStaff: (dto) => api.post("/manager/staff/invite", dto).then(unwrap),
  updateStaffRole: (id, role) => api.patch(`/manager/staff/${id}/role`, { role }).then(unwrap),
  removeStaff: (id) => api.delete(`/manager/staff/${id}`).then(unwrap),

  // Disputes
  getDisputes: () => api.get("/manager/disputes").then(unwrap),
  resolveDispute: (id, resolution) => api.patch(`/manager/disputes/${id}/resolve`, { resolution }).then(unwrap),
  rejectDispute: (id, resolution) => api.patch(`/manager/disputes/${id}/reject`, { resolution }).then(unwrap),

  // Feature Flags
  getFeatureFlags: () => api.get("/manager/feature-flags").then(unwrap),
  updateFeatureFlag: (key, data) => api.patch(`/manager/feature-flags/${key}`, data).then(unwrap),

  // Menu (admin view)
  getMenuItems: (category) =>
    api.get(`/manager/menu${category ? `?category=${category}` : ""}`).then(unwrap),
  createMenuItem: (dto) => api.post("/manager/menu", dto).then(unwrap),
  updateMenuItem: (id, dto) => api.put(`/manager/menu/${id}`, dto).then(unwrap),
  deleteMenuItem: (id) => api.delete(`/manager/menu/${id}`).then(unwrap),

  // Bulk Housekeeping
  bulkHousekeepingStatus: (ids, status, assignedTo) =>
    api.post("/manager/housekeeping/bulk-status", { ids, status, assignedTo }).then(unwrap),

  // Notifications
  getNotifications: (limit) =>
    api.get(`/manager/notifications${limit ? `?limit=${limit}` : ""}`).then(unwrap),
  markNotificationRead: (id) =>
    api.patch(`/manager/notifications/${id}/read`).then(unwrap),
};
