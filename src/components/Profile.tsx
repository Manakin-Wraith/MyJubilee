import React, { useState } from 'react';
import { auth } from '../lib/firebase';
import { 
  updateProfile, 
  updatePassword, 
  EmailAuthProvider, 
  reauthenticateWithCredential,
  sendEmailVerification
} from 'firebase/auth';
import { User } from '../types';
import { ArrowLeft, Save, Key, Mail, Shield } from 'lucide-react';

interface ProfileProps {
  user: User;
  onBack: () => void;
  onUpdateUser: (user: User) => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onBack, onUpdateUser }) => {
  const [displayName, setDisplayName] = useState(user.displayName || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (displayName !== user.displayName) {
        await updateProfile(auth.currentUser!, { displayName });
        onUpdateUser({ ...user, displayName });
        setSuccess('Profile updated successfully!');
      }
    } catch (err) {
      setError('Failed to update profile');
      console.error(err);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    try {
      const credential = EmailAuthProvider.credential(
        user.email!,
        currentPassword
      );
      await reauthenticateWithCredential(auth.currentUser!, credential);
      await updatePassword(auth.currentUser!, newPassword);
      
      setSuccess('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsChangingPassword(false);
    } catch (err) {
      setError('Failed to update password. Please check your current password.');
      console.error(err);
    }
  };

  const handleSendVerification = async () => {
    try {
      await sendEmailVerification(auth.currentUser!);
      setVerificationSent(true);
      setSuccess('Verification email sent! Please check your inbox.');
    } catch (err) {
      setError('Failed to send verification email. Please try again later.');
      console.error(err);
    }
  };

  return (
    <div className="w-full max-w-md bg-white shadow-md rounded-lg p-6">
      <div className="flex items-center mb-6">
        <button
          onClick={onBack}
          className="text-indigo-600 hover:text-indigo-800 flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </button>
      </div>

      <h2 className="text-2xl font-semibold mb-6">Profile Settings</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
          {success}
        </div>
      )}

      {/* Email Verification Status */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Shield className={`w-5 h-5 mr-2 ${user.emailVerified ? 'text-green-500' : 'text-yellow-500'}`} />
            <div>
              <p className="text-sm font-medium text-gray-700">Email Status</p>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>
          {!user.emailVerified && !verificationSent && (
            <button
              onClick={handleSendVerification}
              className="flex items-center px-3 py-1 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 transition-colors"
            >
              <Mail className="w-4 h-4 mr-1" />
              Verify Email
            </button>
          )}
          {user.emailVerified && (
            <span className="text-sm text-green-600 font-medium">Verified</span>
          )}
          {!user.emailVerified && verificationSent && (
            <span className="text-sm text-yellow-600 font-medium">Check your inbox</span>
          )}
        </div>
      </div>

      <form onSubmit={handleUpdateProfile} className="mb-8">
        <div className="mb-4">
          <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
            Display Name
          </label>
          <input
            type="text"
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 flex items-center justify-center"
        >
          <Save className="w-4 h-4 mr-2" /> Update Profile
        </button>
      </form>

      <div className="border-t pt-6">
        {!isChangingPassword ? (
          <button
            onClick={() => setIsChangingPassword(true)}
            className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 flex items-center justify-center"
          >
            <Key className="w-4 h-4 mr-2" /> Change Password
          </button>
        ) : (
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Current Password
              </label>
              <input
                type="password"
                id="currentPassword"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div className="flex space-x-2">
              <button
                type="submit"
                className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Update Password
              </button>
              <button
                type="button"
                onClick={() => setIsChangingPassword(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Profile;