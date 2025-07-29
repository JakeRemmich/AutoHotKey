import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, Loader2, Crown, Zap } from 'lucide-react';
import { getSubscriptionPlans, createSubscriptionPlan } from '@/api/subscriptions';
import { useToast } from '@/hooks/useToast';

export function Admin() {
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    interval: 'month',
    currency: 'usd',
    features: '',
    planType: 'monthly'
  });

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const result = await getSubscriptionPlans();
      setPlans(result.data);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load subscription plans",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.description || !formData.price || !formData.features) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);
    try {
      const planData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        interval: formData.interval,
        currency: formData.currency,
        features: formData.features.split('\n').filter(f => f.trim()),
        planType: formData.planType
      };

      await createSubscriptionPlan(planData);

      toast({
        title: "Success",
        description: "Subscription plan created successfully"
      });

      // Reset form and reload plans
      setFormData({
        name: '',
        description: '',
        price: '',
        interval: 'month',
        currency: 'usd',
        features: '',
        planType: 'monthly'
      });
      setShowCreateForm(false);
      await loadPlans();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create subscription plan",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] py-12 xl:py-16 px-6 md:px-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-12 xl:py-16 px-6 md:px-12">
      <div className="flex md:flex-row flex-col gap-6 md:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Admin Panel</h1>
          <p className="text-gray-600 mt-1">Manage subscription plans and system settings</p>
        </div>
        <Button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create New Plan
        </Button>
      </div>

      {showCreateForm && (
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-gray-800">Create New Subscription Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Plan Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="e.g., Premium Monthly"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Price (USD) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    placeholder="9.99"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="interval">Billing Interval</Label>
                  <Select value={formData.interval} onValueChange={(value) => handleInputChange('interval', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="month">Monthly</SelectItem>
                      <SelectItem value="year">Yearly</SelectItem>
                      <SelectItem value="one_time">One Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="planType">Plan Type</Label>
                  <Select value={formData.planType} onValueChange={(value) => handleInputChange('planType', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly Subscription</SelectItem>
                      <SelectItem value="per-script">Pay Per Script</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe what this plan includes..."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="features">Features (one per line) *</Label>
                <Textarea
                  id="features"
                  value={formData.features}
                  onChange={(e) => handleInputChange('features', e.target.value)}
                  placeholder="Unlimited script generation&#10;Priority support&#10;Advanced features"
                  rows={4}
                  required
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={isCreating}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Plan'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl text-gray-800">Existing Subscription Plans</CardTitle>
        </CardHeader>
        <CardContent>
          {plans.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No subscription plans created yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {plans.map((plan: any) => (
                <div key={plan._id} className="border rounded-lg p-4 bg-white">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {plan.planType === 'monthly' ? (
                          <Crown className="h-5 w-5 text-blue-600" />
                        ) : (
                          <Zap className="h-5 w-5 text-green-600" />
                        )}
                        <h3 className="text-lg font-semibold text-gray-800">{plan.name}</h3>
                        <Badge variant={plan.isActive ? "default" : "secondary"}>
                          {plan.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-3">{plan.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                        <span>${plan.price} / {plan.interval}</span>
                        <span>•</span>
                        <span>{plan.planType}</span>
                        <span>•</span>
                        <span>Stripe ID: {plan.stripePriceId}</span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-700">Features:</p>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {plan.features.map((feature: string, index: number) => (
                            <li key={index} className="flex items-center gap-2">
                              <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}