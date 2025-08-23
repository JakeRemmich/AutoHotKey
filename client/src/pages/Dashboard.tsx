import { useState, useEffect } from 'react';
import { ScriptGenerator } from '@/components/ScriptGenerator';
import { UsageCounter } from '@/components/UsageCounter';
import { UpgradeModal } from '@/components/UpgradeModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Crown, ArrowRight } from 'lucide-react';
import { getUserUsage } from '@/api/user';
import { useToast } from '@/hooks/useToast';
import { useSearchParams, useNavigate } from 'react-router-dom';

export function Dashboard() {
  const [usage, setUsage] = useState({
    scriptsGenerated: 0,
    limit: 3,
    plan: 'free',
    credits: 0
  });
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    loadUsage();

    // Check for success parameter in URL
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');

    console.log('=== DASHBOARD URL PARAMS ===');
    console.log('Success param:', success);
    console.log('Canceled param:', canceled);

    if (success === 'true') {
      console.log('Payment successful, showing success toast');
      toast({
        title: "Upgrade successful!",
        description: "You now have unlimited script generation.",
        duration: 5000
      });

      // Remove the success parameter from URL
      searchParams.delete('success');
      setSearchParams(searchParams, { replace: true });

      // Reload usage data to reflect the new subscription
      setTimeout(() => {
        loadUsage();
      }, 1000);
    } else if (canceled === 'true') {
      console.log('Payment canceled, showing canceled toast');
      toast({
        title: "Payment canceled",
        description: "Your subscription upgrade was canceled.",
        variant: "destructive"
      });

      // Remove the canceled parameter from URL
      searchParams.delete('canceled');
      setSearchParams(searchParams, { replace: true });
    }

    console.log('=== END DASHBOARD URL PARAMS ===');
  }, [searchParams, setSearchParams, toast]);

  const loadUsage = async () => {
    try {
      console.log('=== LOADING USAGE DATA ===');
      const result = await getUserUsage() as typeof usage;
      console.log('Usage data loaded:', result);
      setUsage(result);
      console.log('=== END LOADING USAGE DATA ===');
    } catch (error) {
      console.error('Error loading usage data:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load usage data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleScriptGenerated = () => {
    setUsage(prev => ({
      ...prev,
      scriptsGenerated: prev.scriptsGenerated + 1,
      credits: prev.plan === 'per-script' ? Math.max(0, (prev.credits || 0) - 1) : prev.credits
    }));
  };

  const handleUpgradeClick = () => {
    console.log('Upgrade header clicked, navigating to pricing page');
    navigate('/pricing');
  };

  const shouldShowUpgradeHeader = () => {
    return usage.plan === 'free' || (usage.plan === 'per-script' && (usage.credits || 0) === 0);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] py-12 xl:py-16 px-6 md:px-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-12 xl:py-16 px-6 md:px-12">
      {/* Upgrade Header for Free Users and Per-Script Users with No Credits */}
      {shouldShowUpgradeHeader() && (
        <Card className="border-2 z-10 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-6 md:flex-row flex-col">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <Crown className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                    {usage.plan === 'per-script' && (usage.credits || 0) === 0
                      ? 'No Credits Remaining'
                      : 'Unlock Unlimited Script Generation'
                    }
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {usage.plan === 'per-script' && (usage.credits || 0) === 0
                      ? 'Purchase more scripts or upgrade to unlimited plan'
                      : 'Upgrade to generate unlimited AutoHotkey scripts and access premium features'
                    }
                  </p>
                </div>
              </div>
              <Button
                onClick={handleUpgradeClick}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 flex items-center space-x-2"
              >
                <span>Upgrade Now</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between ">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">AutoHotkey Generator</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Describe your automation task and get a working AutoHotkey script
          </p>
        </div>
      </div>

      <UsageCounter usage={usage} />

      <ScriptGenerator
        onScriptGenerated={handleScriptGenerated}
        usage={usage}
        onUpgradeClick={() => setShowUpgradeModal(true)}
      />

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        usage={usage}
      />
    </div>
  );
}