import { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

interface Farmer {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  farmLocation?: {
    county: string;
    subCounty: string;
  };
  idDocument?: {
    url: string;
  };
  verificationStatus: string;
  createdAt: string;
}

const Verifications = () => {
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVerifications();
  }, []);

  const fetchVerifications = async () => {
    try {
      const response = await api.get('/users/verifications/pending');
      setFarmers(response.data.data.farmers || []);
    } catch (error: any) {
      toast.error('Failed to load verifications');
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (farmerId: string, action: 'approve' | 'reject') => {
    try {
      await api.put(`/users/verifications/${farmerId}`, { action });
      toast.success(`Farmer ${action}d successfully`);
      fetchVerifications();
    } catch (error: any) {
      toast.error(`Failed to ${action} farmer`);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Loading verifications...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Farmer Verifications</h1>

      {farmers.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-600">No pending verifications</p>
        </div>
      ) : (
        <div className="space-y-4">
          {farmers.map((farmer) => (
            <div key={farmer._id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {farmer.firstName} {farmer.lastName}
                  </h3>
                  <p className="text-sm text-gray-600">{farmer.email}</p>
                  <p className="text-sm text-gray-600">{farmer.phone}</p>
                  {farmer.farmLocation && (
                    <p className="text-sm text-gray-600 mt-1">
                      {farmer.farmLocation.county}, {farmer.farmLocation.subCounty}
                    </p>
                  )}
                </div>
                <span className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                  PENDING
                </span>
              </div>

              {farmer.idDocument && (
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900 mb-2">ID Document</h4>
                  <a
                    href={farmer.idDocument.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-700"
                  >
                    View ID Document
                  </a>
                </div>
              )}

              <div className="flex space-x-4">
                <button
                  onClick={() => handleVerification(farmer._id, 'approve')}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleVerification(farmer._id, 'reject')}
                  className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Verifications;
