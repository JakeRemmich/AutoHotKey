import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Zap, Gift, Loader2 } from 'lucide-react';
import { getSubscriptionPlans, createCheckoutSession } from '@/api/subscriptions';
import { getUserUsage } from '@/api/user';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/useToast';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { useMeta } from '@/hooks/useMeta';

export function Pricing() {
  const [plans, setPlans] = useState([]);
  const [userUsage, setUserUsage] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, [isAuthenticated]); // run again when auth state changes


  const loadData = async () => {
    try {
      const [plansResult, usageResult] = await Promise.all([
        getSubscriptionPlans(),
        isAuthenticated ? getUserUsage() : Promise.resolve(null)
      ]);

      setPlans(plansResult.data);
      if (usageResult) {
        setUserUsage(usageResult);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load pricing data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };


  const handleSubscribe = async (planId: string) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setProcessingPlan(planId);
    try {
      const result = await createCheckoutSession({
        planId,
        successUrl: `${window.location.origin}/dashboard?success=true`,
        cancelUrl: `${window.location.origin}/pricing?canceled=true`
      });

      // Redirect to Stripe checkout
      window.location.href = result.data.url;
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create checkout session",
        variant: "destructive"
      });
    } finally {
      setProcessingPlan(null);
    }
  };

  const isCurrentPlan = (planType: string) => {
    if (!userUsage) return false;

    return userUsage.subscription_plan === planType;
  };

  const isFreePlan = () => {
    return !userUsage || userUsage.subscription_plan === 'free';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading pricing plans...</p>
        </div>
      </div>
    );
  }

  // Define the free plan
  const freePlan = {
    _id: 'free',
    name: 'Free Plan',
    description: 'Perfect for trying out AutoHotkey script generation',
    price: 0,
    interval: 'forever',
    planType: 'free',
    features: [
      '3 free script generations',
      'Basic AutoHotkey scripts',
      'Download .ahk files',
      'Community support'
    ]
  };

  // Sort plans: per-script first, then monthly
  const sortedPlans = [...plans].sort((a: any, b: any) => {
    if (a.planType === 'per-script' && b.planType === 'monthly') return -1;
    if (a.planType === 'monthly' && b.planType === 'per-script') return 1;
    return 0;
  });

  // Combine free plan with sorted paid plans
  const allPlans = [freePlan, ...sortedPlans];
  function discountPercent(original: number, sale: number, decimals = 2) {
    if (original <= 0) return 0;                // avoid divide-by-zero
    if (sale >= original) return 0;             // no discount (or negative)
    const pct = ((original - sale) / original) * 100;
    return parseFloat(pct.toFixed(decimals));   // e.g., 28.57
  }
  return (
    <>
      {useMeta({
        title: "Pricing | AutoHotkey Generator",
        description: "Select the perfect plan for your automation needs. Upgrade or downgrade at any time.",
        canonical: "https://www.autohotkeygenerator.com/pricing",
      })}
      <div className="space-y-8  py-12 xl:py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Choose Your Plan</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Select the perfect plan for your automation needs. Upgrade or downgrade at any time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {allPlans.map((plan: any) => {
            const isFree = plan._id === 'free';
            const isPerScript = plan.planType === 'per-script';
            const isMonthly = plan.planType === 'monthly';
            const isUserCurrentPlan = isFree ? isFreePlan() : isCurrentPlan(plan.planType);

            return (
              <Card
                key={plan._id}
                className={`border-2 relative hover:shadow-lg transition-all duration-300 ${isMonthly
                  ? 'border-blue-200 hover:border-blue-400 scale-105'
                  : isPerScript
                    ? 'border-green-200 hover:border-green-400'
                    : 'border-gray-200 hover:border-gray-400'
                  } ${isUserCurrentPlan ? 'ring-2 ring-blue-500' : ''}`}
              >
                {isMonthly && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-600 text-white px-3 py-1">Most Popular</Badge>
                  </div>
                )}
                {plan.onSale && (
                  <div className="absolute -top-3 right-1/2 transform -translate-x-[80px]">
                    <Badge className="bg-red-600 text-white px-3 py-1">{discountPercent(plan.price, plan.salePrice, 0)}% off</Badge>
                  </div>
                )}

                {isAuthenticated && isUserCurrentPlan && (
                  <div className="absolute -top-3 right-4">
                    <Badge className="bg-green-600 text-white px-3 py-1">Current Plan</Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isMonthly ? 'bg-blue-100' : isPerScript ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                    {isFree ? (
                      <Gift className="h-8 w-8 text-gray-600" />
                    ) : isMonthly ? (
                      <Crown className="h-8 w-8 text-blue-600" />
                    ) : (
                      <Zap className="h-8 w-8 text-green-600" />
                    )}
                  </div>

                  <CardTitle className="text-2xl text-gray-800 mb-2">{plan.name}</CardTitle>

                  <div className=" font-bold mb-2">
                    <span className={
                      clsx(
                        isMonthly ? 'text-blue-600' :
                          isPerScript ? 'text-green-600' :
                            'text-gray-600', `${plan.onSale ? 'text-xl line-through' : 'text-4xl'}`)
                    }>
                      ${plan.price}
                    </span>
                    {plan.onSale && <span className={clsx(
                      isMonthly ? 'text-blue-600' :
                        isPerScript ? 'text-green-600' :
                          'text-gray-600', 'ml-3 text-4xl')
                    }>
                      ${plan.salePrice}
                    </span>}

                    <span className="text-lg text-gray-500 font-normal">
                      {isFree ? '' : `/${plan.interval === 'one_time' ? 'script' : plan.interval}`}
                    </span>
                  </div>

                  <p className="text-gray-600">{plan.description}</p>
                </CardHeader>

                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature: string, featureIndex: number) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <Check className={`h-5 w-5 mt-0.5 flex-shrink-0 ${isMonthly ? 'text-blue-600' :
                          isPerScript ? 'text-green-600' :
                            'text-gray-600'
                          }`} />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {isFree ? (
                    <Button
                      disabled
                      className="w-full py-3 text-lg font-semibold bg-gray-400 text-white cursor-not-allowed"
                    >
                      {isUserCurrentPlan ? 'Current Plan' : 'Free Plan'}
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleSubscribe(plan._id)}
                      disabled={processingPlan !== null || isUserCurrentPlan}
                      className={`w-full py-3 text-lg font-semibold ${isUserCurrentPlan
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : isMonthly
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                    >
                      {isUserCurrentPlan ? (
                        'Current Plan'
                      ) : processingPlan === plan._id ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        'Subscribe'
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">
            Need help choosing the right plan?
            <a href="/instructions" className="text-blue-600 hover:text-blue-800 ml-1">
              Check our instructions
            </a>
          </p>
        </div>
      </div >
    </>
  );
}