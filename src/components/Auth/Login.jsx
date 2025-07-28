import { useState } from 'react';
import { useForm } from 'react-hook-form';
import apiService from '../../services/apiService';

const Login = ({ onLogin }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError('');

    try {
      // Convert email to lowercase before sending to API
      const loginData = {
        ...data,
        email: data.email.toLowerCase().trim()
      };

      const response = await apiService.login(loginData);

      if (response.success) {
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        onLogin(token, user);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-light text-gray-900 tracking-tight">Welcome back</h2>
        <p className="text-gray-500 font-light">Sign in to continue</p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-800 mb-3">
              Email
            </label>
            <input
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: 'Invalid email address'
                }
              })}
              type="email"
              className="w-full px-4 py-4 border border-gray-200 rounded-none focus:outline-none focus:border-gray-900 transition-colors duration-200 bg-white text-gray-900 placeholder-gray-400"
              placeholder="your@email.com"
            />
            {errors.email && (
              <p className="mt-2 text-sm text-gray-600">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-800 mb-3">
              Password
            </label>
            <div className="relative">
              <input
                {...register('password', { required: 'Password is required' })}
                type={showPassword ? 'text' : 'password'}
                className="w-full px-4 py-4 pr-12 border border-gray-200 rounded-none focus:outline-none focus:border-gray-900 transition-colors duration-200 bg-white text-gray-900 placeholder-gray-400"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
              >
                {showPassword ? (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-2 text-sm text-gray-600">
                {errors.password.message}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-gray-900 focus:ring-gray-900 border-gray-300 rounded-none"
            />
            <label htmlFor="remember-me" className="ml-3 text-sm text-gray-600 font-light">
              Remember me
            </label>
          </div>

          <div className="text-sm">
            <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors font-light underline">
              Forgot password?
            </a>
          </div>
        </div>

        {error && (
          <div className="border-l-4 border-gray-400 bg-gray-50 p-4">
            <p className="text-gray-700 text-sm font-light">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-4 px-6 bg-gray-900 text-white font-light rounded-none hover:bg-gray-800 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 mt-8"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b border-white mr-3"></div>
              <span className="font-light">Signing in...</span>
            </div>
          ) : (
            <span className="font-light tracking-wide">Sign in</span>
          )}
        </button>
      </form>
    </div>
  );
};

export default Login;
