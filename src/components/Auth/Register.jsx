import { useState } from 'react';
import { useForm } from 'react-hook-form';
import apiService from '../../services/apiService';

const Register = ({ onRegister }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const password = watch('password');

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError('');

    try {
      // Convert email to lowercase before sending to API
      const response = await apiService.register({
        email: data.email.toLowerCase().trim(),
        password: data.password
      });

      if (response.success) {
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        onRegister(token, user);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-light text-gray-900 tracking-tight">Create account</h2>
        <p className="text-gray-500 font-light">Join Peta Talenta today</p>
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
            <input
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters'
                }
              })}
              type="password"
              className="w-full px-4 py-4 border border-gray-200 rounded-none focus:outline-none focus:border-gray-900 transition-colors duration-200 bg-white text-gray-900 placeholder-gray-400"
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="mt-2 text-sm text-gray-600">
                {errors.password.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-800 mb-3">
              Confirm Password
            </label>
            <input
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: value => value === password || 'Passwords do not match'
              })}
              type="password"
              className="w-full px-4 py-4 border border-gray-200 rounded-none focus:outline-none focus:border-gray-900 transition-colors duration-200 bg-white text-gray-900 placeholder-gray-400"
              placeholder="••••••••"
            />
            {errors.confirmPassword && (
              <p className="mt-2 text-sm text-gray-600">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="flex items-start space-x-3 pt-2">
          <div className="flex items-center h-5 mt-0.5">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              className="h-4 w-4 text-gray-900 focus:ring-gray-900 border-gray-300 rounded-none"
              required
            />
          </div>
          <div className="text-sm">
            <label htmlFor="terms" className="text-gray-600 leading-relaxed font-light">
              I agree to the{' '}
              <a href="#" className="text-gray-900 hover:text-gray-700 underline">
                Terms and Conditions
              </a>{' '}
              and{' '}
              <a href="#" className="text-gray-900 hover:text-gray-700 underline">
                Privacy Policy
              </a>
            </label>
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
              <span className="font-light">Creating account...</span>
            </div>
          ) : (
            <span className="font-light tracking-wide">Create account</span>
          )}
        </button>
      </form>
    </div>
  );
};

export default Register;
