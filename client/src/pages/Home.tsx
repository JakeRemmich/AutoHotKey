import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Zap, Code, Download, History, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">



      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <Badge variant="secondary" className="mb-4">
            AI-Powered Automation
          </Badge>

          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Automate Your Windows Tasks in Seconds
          </h1>

          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Transform your ideas into powerful AutoHotkey scripts using plain English.
            No coding experience required - just describe what you want to automate.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="text-lg px-8 py-3" asChild>
              <Link to={isAuthenticated ? "/dashboard" : "/register"}>
                Get Started
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-3" asChild>
              <Link to="/instructions">
                Learn More
              </Link>
            </Button>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-3 text-gray-600">
              <Check className="h-5 w-5 text-green-600" />
              <span>No coding required</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <Check className="h-5 w-5 text-green-600" />
              <span>Instant script generation</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <Check className="h-5 w-5 text-green-600" />
              <span>Ready-to-use downloads</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose AutoHotkey Generator?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Create powerful automation scripts without learning complex syntax or spending hours coding.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-2 hover:border-blue-200 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>Lightning Fast</CardTitle>
                <CardDescription>
                  Generate complex AutoHotkey scripts in seconds, not hours
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-green-200 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Code className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>Plain English Input</CardTitle>
                <CardDescription>
                  Just describe what you want - our AI handles the technical details
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-purple-200 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Download className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>Instant Download</CardTitle>
                <CardDescription>
                  Get ready-to-run .ahk files that work immediately on your system
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-orange-200 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <History className="h-6 w-6 text-orange-600" />
                </div>
                <CardTitle>Script History</CardTitle>
                <CardDescription>
                  Save, organize, and reuse your generated scripts anytime
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-red-200 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-red-600" />
                </div>
                <CardTitle>Safe & Secure</CardTitle>
                <CardDescription>
                  Your scripts are private and secure - we never store sensitive data
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-indigo-200 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <Check className="h-6 w-6 text-indigo-600" />
                </div>
                <CardTitle>Always Improving</CardTitle>
                <CardDescription>
                  Our AI gets smarter with every script, delivering better results
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-blue-600">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Automate Your Workflow?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of users who are already saving time with AI-generated AutoHotkey scripts.
          </p>
          <Button size="lg" variant="secondary" className="text-lg px-8 py-3" asChild>
            <Link to={isAuthenticated ? "/dashboard" : "/register"}>
              Get Started Now
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
    </div>
  );
}