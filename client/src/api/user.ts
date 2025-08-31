import api from './api';

// Description: Get user's usage statistics
// Endpoint: GET /api/user
// Request: {}
// Response: { scriptsGenerated: number, limit: number, plan: string, _id: string, email: string, createdAt: string, lastLoginAt: string }
export const getUserUsage = async () => {
  try {
    const response = await api.get('/api/user');
    console.log(response);

    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || error.message);
  }
};

// Description: Create Stripe checkout session
// Endpoint: POST /api/checkout-sessions
// Request: { planId: string, successUrl: string, cancelUrl: string }
// Response: { success: boolean, data: { url: string } }
export const createCheckoutSession = async (data: { planType: 'monthly' | 'per-script' }) => {
  try {
    // First get available plans to find the plan ID
    const { getSubscriptionPlans } = await import('./subscriptions');
    const plansResponse = await getSubscriptionPlans();
    const plans = plansResponse.data;

    // Find the plan that matches the requested type
    const plan = plans.find((p: any) => p.planType === data.planType);
    if (!plan) {
      throw new Error(`Plan type '${data.planType}' not found`);
    }

    // Create checkout session with the plan ID
    const { createCheckoutSession: createSession } = await import('./subscriptions');
    const result = await createSession({
      planId: plan._id,
      successUrl: `${window.location.origin}/dashboard?success=true`,
      cancelUrl: `${window.location.origin}/dashboard?canceled=true`
    });

    return { url: result.data.url };
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || error.message);
  }
};