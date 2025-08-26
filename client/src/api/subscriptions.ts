import api from './api';

// Description: Get all available subscription plans
// Endpoint: GET /api/subscription-plans
// Request: {}
// Response: { success: boolean, data: Array<{ _id: string, name: string, description: string, price: number, interval: string, currency: string, features: string[], planType: string, stripePriceId: string }> }
export const getSubscriptionPlans = async () => {
  try {
    const response = await api.get('/api/subscription-plans');

    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.message || error.message);
  }
};

// Description: Create a new subscription plan (admin only)
// Endpoint: POST /api/subscription-plans
// Request: { name: string, description: string, price: number, interval: string, currency?: string, features: string[], planType: string }
// Response: { success: boolean, data: object, message: string }
export const createSubscriptionPlan = async (planData: {
  name: string;
  description: string;
  price: number;
  interval: string;
  currency?: string;
  features: string[];
  planType: string;
}) => {
  try {
    const response = await api.post('/api/subscription-plans', planData);
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.message || error.message);
  }
};

// Description: Create Stripe checkout session
// Endpoint: POST /api/checkout-sessions
// Request: { planId: string, successUrl: string, cancelUrl: string }
// Response: { success: boolean, data: { url: string, sessionId: string } }
export const createCheckoutSession = async (data: {
  planId: string;
  successUrl: string;
  cancelUrl: string;
}) => {
  try {
    const response = await api.post('/api/checkout-sessions', data);
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.message || error.message);
  }
};

// Description: Get current user's subscription status
// Endpoint: GET /api/subscriptions/status
// Request: {}
// Response: { success: boolean, data: { plan: string, status: string, endDate: string } }
export const getSubscriptionStatus = async () => {
  try {
    const response = await api.get('/api/subscriptions/status');
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.message || error.message);
  }
};

// Description: Cancel current subscription
// Endpoint: POST /api/subscriptions/cancel
// Request: {}
// Response: { success: boolean, message: string }
export const cancelSubscription = async () => {
  try {
    const response = await api.post('/api/subscriptions/cancel');
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.message || error.message);
  }
};