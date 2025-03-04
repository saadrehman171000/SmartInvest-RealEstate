const API_URL = 'https://investoriq-production.up.railway.app/api';
// const API_URL = 'http://localhost:5000/api';

export const api = {
  async getProperties() {
    const response = await fetch(`${API_URL}/properties`);
    if (!response.ok) throw new Error('Failed to fetch properties');
    return response.json();
  },

  async addProperty(data: any) {
    const response = await fetch(`${API_URL}/properties`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to add property');
    return response.json();
  },

  async deleteProperty(propertyId: string) {
    console.log("attempting to delete property with id: ", propertyId);
    try {
      const response = await fetch(`${API_URL}/properties/${propertyId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorDetails = await response.text();
        console.error('Failed to delete property:', errorDetails);
        throw new Error('Failed to delete property');
      }
      return response.json();
    } catch (error) {
      console.error('Error in deleteProperty:', error);
      throw error;
    }
  },

  async getAdvisorRequests() {
    const response = await fetch(`${API_URL}/advisor-requests`);
    if (!response.ok) throw new Error('Failed to fetch advisor requests');
    return response.json();
  },

  async createAdvisorRequest(data: any) {
    const response = await fetch(`${API_URL}/advisor-requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create advisor request');
    return response.json();
  },

  async updateAdvisorRequest(requestId: string, data: any) {
    const response = await fetch(`${API_URL}/advisor-requests/${requestId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update advisor request');
    return response.json();
  },
};