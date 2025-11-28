import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

interface FarmerLayoutProps {
  children: React.ReactNode;
}

const FarmerLayout = ({ children }: FarmerLayoutProps) => {
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const navigation = [
    { name: 'Dashboard', href: '/farmer', current: location.pathname === '/farmer' },
    { name: 'Products', href: '/farmer/products', current: location.pathname === '/farmer/products' },
    { name: 'Auctions', href: '/farmer/auctions', current: location.pathname === '/farmer/auctions' },
    { name: 'Sales', href: '/farmer/sales', current: location.pathname === '/farmer/sales' },
    { name: 'Payouts', href: '/farmer/payouts', current: location.pathname === '/farmer/payouts' },
    { name: 'AI Dashboard', href: '/farmer/ai-dashboard', current: location.pathname === '/farmer/ai-dashboard' },
    { name: 'Subscription', href: '/farmer/subscription', current: location.pathname === '/farmer/subscription' },
    { name: 'Profile', href: '/farmer/profile', current: location.pathname === '/farmer/profile' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-primary-600">AgroMarketHub</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`${
                      item.current
                        ? 'border-primary-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
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

export default FarmerLayout;

