import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Mail, Lock, User, Eye, EyeOff, MessageCircle, Map, FileText } from 'lucide-react';

type AuthMode = 'login' | 'register';

interface LoginForm {
  email: string;
  password: string;
}

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const Auth = () => {
  const [authMode, setAuthMode] = useState<AuthMode>('register');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const loginForm = useForm<LoginForm>();
  const registerForm = useForm<RegisterForm>();

  const onLoginSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    console.log('Login data:', data);
    setTimeout(() => setIsLoading(false), 1000);
  };

  const onRegisterSubmit = async (data: RegisterForm) => {
    if (data.password !== data.confirmPassword) {
      registerForm.setError('confirmPassword', {
        type: 'manual',
        message: 'Passwords do not match'
      });
      return;
    }
    
    setIsLoading(true);
    console.log('Register data:', data);
    setTimeout(() => setIsLoading(false), 1000);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Column - Welcome Section (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-sky-500 to-purple-600 dark:from-purple-800 dark:to-indigo-900 text-white flex-col justify-center items-center p-12 relative overflow-hidden transition-colors duration-300">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-black/10 dark:bg-black/20"></div>
        <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 dark:bg-white/5 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-white/10 dark:bg-white/5 rounded-full blur-xl"></div>
        
        <div className="relative z-10 text-center max-w-md">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-white/20 dark:bg-white/10 rounded-2xl backdrop-blur-sm">
              <BookOpen className="h-12 w-12 text-white" />
            </div>
          </div>
          
          <h1 className="text-4xl font-bold mb-4">Welcome to AI Notes Buddy</h1>
          <p className="text-xl text-white/90 mb-8">Transform your learning experience with AI-powered tools</p>
          
          <div className="space-y-4 text-left">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 dark:bg-white/10 rounded-lg">
                <MessageCircle className="h-5 w-5" />
              </div>
              <span>Chat with your books and notes</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 dark:bg-white/10 rounded-lg">
                <Map className="h-5 w-5" />
              </div>
              <span>Generate personalized study roadmaps</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 dark:bg-white/10 rounded-lg">
                <FileText className="h-5 w-5" />
              </div>
              <span>Summarize complex materials instantly</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Auth Form */}
      <div className="flex-1 lg:w-1/2 flex items-center justify-center p-6 lg:p-12 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-gradient-to-r from-sky-500 to-purple-500 dark:from-purple-600 dark:to-indigo-600 rounded-xl">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-sky-600 to-purple-600 dark:from-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">
              AI Notes Buddy
            </h1>
          </div>

          <Card className="border-0 shadow-xl dark:bg-gray-800 dark:shadow-2xl transition-colors duration-300">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-2xl text-center">
                {authMode === 'login' ? 'Sign in' : 'Create account'}
              </CardTitle>
              <CardDescription className="text-center">
                {authMode === 'login' 
                  ? 'Welcome back! Enter your credentials to continue' 
                  : 'Enter your information to create a new account'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {authMode === 'login' ? (
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        className="pl-10"
                        {...loginForm.register('email', { required: 'Email is required' })}
                      />
                    </div>
                    {loginForm.formState.errors.email && (
                      <p className="text-sm text-destructive">{loginForm.formState.errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        className="pl-10 pr-10"
                        {...loginForm.register('password', { required: 'Password is required' })}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {loginForm.formState.errors.password && (
                      <p className="text-sm text-destructive">{loginForm.formState.errors.password.message}</p>
                    )}
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Signing in...' : 'Sign in'}
                  </Button>
                </form>
              ) : (
                <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="name"
                        type="text"
                        placeholder="Enter your full name"
                        className="pl-10"
                        {...registerForm.register('name', { required: 'Name is required' })}
                      />
                    </div>
                    {registerForm.formState.errors.name && (
                      <p className="text-sm text-destructive">{registerForm.formState.errors.name.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="Enter your email"
                        className="pl-10"
                        {...registerForm.register('email', { required: 'Email is required' })}
                      />
                    </div>
                    {registerForm.formState.errors.email && (
                      <p className="text-sm text-destructive">{registerForm.formState.errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="register-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password"
                        className="pl-10 pr-10"
                        {...registerForm.register('password', { 
                          required: 'Password is required',
                          minLength: { value: 6, message: 'Password must be at least 6 characters' }
                        })}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {registerForm.formState.errors.password && (
                      <p className="text-sm text-destructive">{registerForm.formState.errors.password.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirm-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        className="pl-10"
                        {...registerForm.register('confirmPassword', { required: 'Please confirm your password' })}
                      />
                    </div>
                    {registerForm.formState.errors.confirmPassword && (
                      <p className="text-sm text-destructive">{registerForm.formState.errors.confirmPassword.message}</p>
                    )}
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Creating account...' : 'Create account'}
                  </Button>
                </form>
              )}

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  {authMode === 'login' ? "Don't have an account?" : "Already have an account?"}
                  <button
                    type="button"
                    onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                    className="ml-1 text-primary hover:underline font-medium"
                  >
                    {authMode === 'login' ? 'Sign up' : 'Sign in'}
                  </button>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Auth;
