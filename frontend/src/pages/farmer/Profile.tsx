import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';
import toast from 'react-hot-toast';
import ImageUpload from '../../components/ImageUpload';

const Profile = () => {
  const { user, updateUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    farmLocation: {
      county: user?.farmLocation?.county || '',
      subCounty: user?.farmLocation?.subCounty || '',
    },
  });
  const [idDocumentUrl, setIdDocumentUrl] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/users/profile');
      const userData = response.data.data.user;
      setFormData({
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        phone: userData.phone || '',
        farmLocation: {
          county: userData.farmLocation?.county || '',
          subCounty: userData.farmLocation?.subCounty || '',
        },
      });
      setIdDocumentUrl(userData.idDocument?.url || '');
    } catch (error: any) {
      toast.error('Failed to load profile');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.put('/users/profile', formData);
      toast.success('Profile updated successfully');
      fetchProfile();
    } catch (error: any) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleIdUploadComplete = async (url: string) => {
    try {
      await api.post('/users/upload-id', { url });
      toast.success('ID document uploaded successfully');
      setIdDocumentUrl(url);
      fetchProfile();
    } catch (error: any) {
      toast.error('Failed to upload ID document');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Profile Settings</h1>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Verification Status</h2>
        <div className="flex items-center space-x-4">
          <span
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              user?.verificationStatus === 'approved'
                ? 'bg-green-100 text-green-800'
                : user?.verificationStatus === 'rejected'
                ? 'bg-red-100 text-red-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            {user?.verificationStatus?.toUpperCase() || 'PENDING'}
          </span>
          {user?.verificationStatus === 'pending' && (
            <p className="text-sm text-gray-600">
              Your account is pending verification. Please upload your ID document.
            </p>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name
            </label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name
            </label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
              value={user?.email || ''}
            />
            <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Farm Location</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                County
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                value={formData.farmLocation.county}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    farmLocation: { ...formData.farmLocation, county: e.target.value },
                  })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sub-County
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                value={formData.farmLocation.subCounty}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    farmLocation: { ...formData.farmLocation, subCounty: e.target.value },
                  })
                }
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">ID Document</h3>
          {idDocumentUrl ? (
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">ID Document uploaded</p>
              <div className="flex items-center space-x-4">
                <a
                  href={idDocumentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700"
                >
                  View Document
                </a>
                <button
                  type="button"
                  onClick={() => setIdDocumentUrl('')}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <ImageUpload
              label="Upload ID Document"
              accept="image/*,.pdf"
              onUploadComplete={handleIdUploadComplete}
              maxSize={5}
            />
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 font-medium disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

export default Profile;
