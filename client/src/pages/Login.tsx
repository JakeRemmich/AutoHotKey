import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { login } from '@/api/auth';
import { useToast } from '@/hooks/useToast';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login: authLogin, } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    console.log('=== LOGIN FORM SUBMISSION ===');
    console.log('Form submitted with email:', email);
    console.log('AuthContext login function available:', typeof authLogin);

    try {
      console.log('Calling login API...');
      const result = await login(email, password);
      console.log('Login API call completed');
      console.log('Login result received:', {
        success: result.success,
        hasUser: !!result.user,
        hasAccessToken: !!result.accessToken,
        hasRefreshToken: !!result.refreshToken
      });
      console.log('Full login result:', result);

      if (result.success && result.user && result.accessToken) {
        console.log('Login validation passed, calling authLogin...');
        console.log('User object:', result.user);
        console.log('Access token (first 20 chars):', result.accessToken.substring(0, 20));
        console.log('Refresh token exists:', !!result.refreshToken);

        // Call AuthContext login
        console.log('About to call authLogin...');
        authLogin(result.user, result.accessToken, result.refreshToken);
        console.log('AuthLogin called successfully');

        // Verify tokens were stored
        setTimeout(() => {
          const storedAccessToken = localStorage.getItem('accessToken');
          const storedRefreshToken = localStorage.getItem('refreshToken');
          const storedUserData = localStorage.getItem('userData');

          console.log('=== POST-LOGIN VERIFICATION ===');
          console.log('Stored access token exists:', !!storedAccessToken);
          console.log('Stored refresh token exists:', !!storedRefreshToken);
          console.log('Stored user data exists:', !!storedUserData);
          console.log('Stored user data:', storedUserData);
          console.log('=== END POST-LOGIN VERIFICATION ===');
        }, 100);

        toast({
          title: "Success",
          description: "Logged in successfully"
        });

        console.log('About to navigate to dashboard...');
        navigate('/dashboard');
        console.log('Navigation called');
      } else {
        console.error('Login validation failed');
        console.error('Success:', result.success);
        console.error('User exists:', !!result.user);
        console.error('AccessToken exists:', !!result.accessToken);
        throw new Error('Login failed - invalid response from server');
      }
    } catch (error) {
      console.error('Login error in handleSubmit:', error);
      console.error('Error type:', typeof error);
      console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Login failed",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      console.log('=== END LOGIN FORM SUBMISSION ===');
    }
  };

  return (
    <div className="py-16 flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Sign In</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Don't have an account?{" "}
            <Link to="/register" className="text-blue-600 hover:underline">
              Sign up here
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}