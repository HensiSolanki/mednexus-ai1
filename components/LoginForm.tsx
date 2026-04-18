import React, { useState } from 'react';
import { LogIn, Mail, Lock, User as UserIcon, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { LoginCredentials, SignupData } from '../types/auth';

interface LoginFormProps {
  onSuccess?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, signup } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isLogin) {
        const credentials: LoginCredentials = { email, password };
        await login(credentials);
      } else {
        const signupData: SignupData = { email, password, name };
        await signup(signupData);
      }
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-900 p-4">
      <div className="w-full max-w-md">
        <div className="bg-dark-800 border border-med-900 rounded-2xl p-8 shadow-2xl shadow-med-900/20">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-med-500/10 rounded-full flex items-center justify-center border border-med-500/30 mx-auto mb-4">
              <LogIn className="w-8 h-8 text-med-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-slate-400 text-sm">
              {isLogin 
                ? 'Sign in to access MedNexus AI' 
                : 'Join MedNexus AI to get started'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center space-x-2 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={!isLogin}
                    className="w-full pl-10 pr-4 py-3 bg-dark-900 border border-med-900/50 rounded-xl text-slate-200 focus:outline-none focus:border-med-500/50 focus:ring-1 focus:ring-med-500/20"
                    placeholder="John Doe"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-dark-900 border border-med-900/50 rounded-xl text-slate-200 focus:outline-none focus:border-med-500/50 focus:ring-1 focus:ring-med-500/20"
                  placeholder="your.email@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-dark-900 border border-med-900/50 rounded-xl text-slate-200 focus:outline-none focus:border-med-500/50 focus:ring-1 focus:ring-med-500/20"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Demo Credentials Hint */}
            <div className="text-xs text-slate-500 bg-dark-900/50 p-3 rounded-lg border border-med-900/30">
              <p className="font-semibold mb-1">Demo Accounts:</p>
              <p>Patient: john.doe@example.com / password123</p>
              <p>Doctor: dr.smith@example.com / doctor123</p>
              <p>Admin: admin@mednexus.com / admin123</p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-med-600 hover:bg-med-500 text-white font-medium rounded-xl transition shadow-[0_0_15px_rgba(13,148,136,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {/* Toggle Login/Signup */}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setEmail('');
                setPassword('');
                setName('');
              }}
              className="text-sm text-med-400 hover:text-med-300 transition"
            >
              {isLogin 
                ? "Don't have an account? Sign up" 
                : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


