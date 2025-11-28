import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

interface BuyerLayoutProps {
  children: React.ReactNode;
}

const BuyerLayout = ({ children }: BuyerLayoutProps) => {
  const location = useLocation();
  const { user, logout } = useAuthStore();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/buyer" className="text-xl font-bold text-primary-600">
                AgroMarketHub
              </Link>
              <div className="ml-10 flex items-center space-x-4">
                <Link
                  to="/buyer"
                  className={`${
                    location.pathname === '/buyer' ? 'text-primary-600' : 'text-gray-500'
                  } hover:text-gray-700`}
                >
                  Marketplace
                </Link>
                <Link
                  to="/buyer/seasonal"
                  className={`${
                    location.pathname === '/buyer/seasonal' ? 'text-primary-600' : 'text-gray-500'
                  } hover:text-gray-700`}
                >
                  Seasonal
                </Link>
                <Link
                  to="/buyer/auctions"
                  className={`${
                    location.pathname.startsWith('/buyer/auctions') ? 'text-primary-600' : 'text-gray-500'
                  } hover:text-gray-700`}
                >
                  Auctions
                </Link>
                <Link
                  to="/buyer/orders"
                  className={`${
                    location.pathname === '/buyer/orders' ? 'text-primary-600' : 'text-gray-500'
                  } hover:text-gray-700`}
                >
                  My Orders
                </Link>
                <Link
                  to="/buyer/cart"
                  className={`${
                    location.pathname === '/buyer/cart' ? 'text-primary-600' : 'text-gray-500'
                  } hover:text-gray-700`}
                >
                  Cart
                </Link>
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
      <main>{children}</main>
    </div>
  );
};

export default BuyerLayout;

