import { useAuthStore } from '../../store/authStore';

interface RiderLayoutProps {
  children: React.ReactNode;
}

const RiderLayout = ({ children }: RiderLayoutProps) => {
  const { user, logout } = useAuthStore();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-primary-600">AgroMarketHub - Rider</h1>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-700 mr-4">{user?.firstName}</span>
              <button
                onClick={logout}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
};

export default RiderLayout;

