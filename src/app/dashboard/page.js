'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchAuthSession } from 'aws-amplify/auth';
import { useAuth } from '@/lib/auth-context';
import Navbar from '../components/Navbar';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [tokens, setTokens] = useState(null);
  const [showTokens, setShowTokens] = useState(false);

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/signin');
    }
  }, [isAuthenticated, isLoading, router]);

  // Fetch tokens when user is authenticated
  useEffect(() => {
    const fetchTokens = async () => {
      if (isAuthenticated) {
        try {
          const session = await fetchAuthSession();
          setTokens(session.tokens);
        } catch (error) {
          console.error('Error fetching tokens:', error);
        }
      }
    };

    fetchTokens();
  }, [isAuthenticated]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // Don't render dashboard if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar variant="dashboard" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-purple-800">
              Welcome to Your Dashboard
            </h1>
            <p className="mt-2 text-gray-600">
              You're successfully signed in!
            </p>
          </div>

          {user && (
            <div className="space-y-4">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h2 className="text-lg font-semibold text-purple-800 mb-2">
                  User Information
                </h2>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">User ID:</span> {user.userId}</p>
                  <p><span className="font-medium">Username:</span> {user.username}</p>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-semibold text-gray-800">
                    Authentication Tokens
                  </h2>
                  <button
                    onClick={() => setShowTokens(!showTokens)}
                    className="px-4 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition-colors duration-200"
                  >
                    {showTokens ? 'Hide' : 'Show'} Tokens
                  </button>
                </div>

                {showTokens && tokens && (
                  <div className="space-y-3 mt-4">
                    <div>
                      <p className="font-medium text-sm text-gray-700 mb-1">ID Token:</p>
                      <div className="bg-white p-3 rounded border border-gray-300 overflow-x-auto">
                        <code className="text-xs break-all">{tokens.idToken.toString()}</code>
                      </div>
                    </div>

                    <div>
                      <p className="font-medium text-sm text-gray-700 mb-1">Access Token:</p>
                      <div className="bg-white p-3 rounded border border-gray-300 overflow-x-auto">
                        <code className="text-xs break-all">{tokens.accessToken.toString()}</code>
                      </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mt-3">
                      <p className="text-xs text-yellow-800">
                        <strong>Note:</strong> Never expose these tokens in production!
                        This is for educational purposes only. Copy and paste them into{' '}
                        <a
                          href="https://jwt.io"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-600 hover:underline"
                        >
                          jwt.io
                        </a>
                        {' '}to decode and see the contents.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
