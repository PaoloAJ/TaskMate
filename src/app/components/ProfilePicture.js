'use client';

import { useState, useEffect } from 'react';
import { getUrl } from 'aws-amplify/storage';
import { getCurrentUser } from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/data';
import { useProfilePicture } from '@/lib/profile-picture-context';

const client = generateClient({
  authMode: 'userPool',
});

export default function ProfilePicture({
  userId = null,
  size = 'md',
  className = '',
  showOnline = false,
  onClick = null
}) {
  const [profilePicUrl, setProfilePicUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const { profilePicture } = useProfilePicture();

  // Size presets
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  // Fetch on mount or when userId changes
  useEffect(() => {
    fetchProfilePicture();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Update when context changes (optimistic update)
  useEffect(() => {
    if (profilePicture.url && !userId) {
      // Only update if this is for the current user (no userId prop)
      setProfilePicUrl(profilePicture.url);
      setLoading(false);
    }
  }, [profilePicture.timestamp, profilePicture.url, userId]);

  const fetchProfilePicture = async () => {
    try {
      setLoading(true);

      // Get current user's ID if no userId provided
      let userIdToFetch = userId;
      if (!userIdToFetch) {
        const user = await getCurrentUser();
        userIdToFetch = user.userId;
      }

      // Fetch the user's profile from database to get pfp_key
      const { data: profiles } = await client.models.UserProfile.list({
        filter: {
          id: {
            eq: userIdToFetch,
          },
        },
      });

      // If profile exists and has a pfp_key, fetch the image from S3
      if (profiles && profiles.length > 0 && profiles[0].pfp_key) {
        const result = await getUrl({
          path: profiles[0].pfp_key,
        });
        setProfilePicUrl(result.url.toString());
      } else {
        setProfilePicUrl(null);
      }
    } catch (error) {
      console.log('No profile picture found, using default');
      setProfilePicUrl(null);
    } finally {
      setLoading(false);
    }
  };

  const sizeClass = sizeClasses[size] || sizeClasses.md;
  const cursorClass = onClick ? 'cursor-pointer hover:opacity-80' : '';

  return (
    <div className="relative inline-block">
      {loading ? (
        <div className={`${sizeClass} rounded-full bg-gray-200 animate-pulse ${className}`} />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={profilePicUrl || '/default-avatar.png'}
          alt="Profile"
          className={`${sizeClass} rounded-full object-cover ${cursorClass} ${className}`}
          onClick={onClick}
        />
      )}

      {showOnline && (
        <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-400 ring-2 ring-white" />
      )}
    </div>
  );
}
