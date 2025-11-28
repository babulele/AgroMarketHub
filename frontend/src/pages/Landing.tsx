import { Link } from 'react-router-dom';
import { 
  FaSeedling, 
  FaShoppingCart, 
  FaTruck, 
  FaChartLine, 
  FaMobileAlt,
  FaShieldAlt,
  FaUsers,
  FaLeaf,
  FaCheckCircle,
  FaArrowRight
} from 'react-icons/fa';

const Landing = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <FaSeedling className="text-primary-600 text-2xl mr-2" />
              <span className="text-xl font-bold text-gray-900">AgroMarketHub</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-green-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Connect Farmers Directly with Consumers
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Kenya's premier direct-to-consumer marketplace for fresh farm produce. 
              Powered by AI demand forecasting to help farmers maximize their sales.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="bg-primary-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-primary-700 transition-colors inline-flex items-center justify-center"
              >
                Start Selling
                <FaArrowRight className="ml-2" />
              </Link>
              <Link
                to="/buyer"
                className="bg-white text-primary-600 border-2 border-primary-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-primary-50 transition-colors inline-flex items-center justify-center"
              >
                Browse Products
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose AgroMarketHub?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We provide a comprehensive platform that benefits everyone in the agricultural supply chain
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gray-50 p-6 rounded-lg hover:shadow-lg transition-shadow">
              <div className="bg-primary-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <FaChartLine className="text-primary-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Demand Forecasting</h3>
              <p className="text-gray-600">
                Get intelligent predictions on what crops will be in high demand, helping you plan your production and maximize profits.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gray-50 p-6 rounded-lg hover:shadow-lg transition-shadow">
              <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <FaMobileAlt className="text-green-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">M-Pesa Integration</h3>
              <p className="text-gray-600">
                Seamless payment processing with M-Pesa. Fast, secure, and convenient transactions for all users.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gray-50 p-6 rounded-lg hover:shadow-lg transition-shadow">
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <FaTruck className="text-blue-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Direct Delivery</h3>
              <p className="text-gray-600">
                Connect with verified riders for fast, reliable delivery from farm to consumer, ensuring freshness.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-gray-50 p-6 rounded-lg hover:shadow-lg transition-shadow">
              <div className="bg-yellow-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <FaShieldAlt className="text-yellow-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Verified Farmers</h3>
              <p className="text-gray-600">
                All farmers are verified with ID documents and farm location details, ensuring trust and quality.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-gray-50 p-6 rounded-lg hover:shadow-lg transition-shadow">
              <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <FaUsers className="text-purple-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Community Support</h3>
              <p className="text-gray-600">
                Connect with county agricultural officers and NGOs for support, training, and market insights.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-gray-50 p-6 rounded-lg hover:shadow-lg transition-shadow">
              <div className="bg-red-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <FaLeaf className="text-red-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Fresh & Local</h3>
              <p className="text-gray-600">
                Buy directly from local farmers. Get the freshest produce while supporting local agriculture.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Simple steps to connect farmers with consumers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="bg-primary-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Farmers Register</h3>
              <p className="text-gray-600">
                Farmers create accounts, upload verification documents, and list their products with prices and inventory.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="bg-primary-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Buyers Browse & Order</h3>
              <p className="text-gray-600">
                Consumers browse products, add to cart, and place orders with secure M-Pesa payment.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="bg-primary-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Fast Delivery</h3>
              <p className="text-gray-600">
                Verified riders pick up orders from farms and deliver fresh produce directly to consumers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits for Different Users */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Benefits for Everyone
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* For Farmers */}
            <div className="border-2 border-primary-200 rounded-lg p-6 hover:border-primary-400 transition-colors">
              <FaSeedling className="text-primary-600 text-3xl mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">For Farmers</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <FaCheckCircle className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span>AI-powered demand forecasting</span>
                </li>
                <li className="flex items-start">
                  <FaCheckCircle className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span>Direct access to consumers</span>
                </li>
                <li className="flex items-start">
                  <FaCheckCircle className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span>Fair pricing control</span>
                </li>
                <li className="flex items-start">
                  <FaCheckCircle className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span>Real-time sales analytics</span>
                </li>
              </ul>
            </div>

            {/* For Buyers */}
            <div className="border-2 border-green-200 rounded-lg p-6 hover:border-green-400 transition-colors">
              <FaShoppingCart className="text-green-600 text-3xl mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">For Buyers</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <FaCheckCircle className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span>Fresh produce from farms</span>
                </li>
                <li className="flex items-start">
                  <FaCheckCircle className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span>Competitive prices</span>
                </li>
                <li className="flex items-start">
                  <FaCheckCircle className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span>Convenient M-Pesa payments</span>
                </li>
                <li className="flex items-start">
                  <FaCheckCircle className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span>Fast home delivery</span>
                </li>
              </ul>
            </div>

            {/* For Riders */}
            <div className="border-2 border-blue-200 rounded-lg p-6 hover:border-blue-400 transition-colors">
              <FaTruck className="text-blue-600 text-3xl mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">For Riders</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <FaCheckCircle className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span>Flexible delivery assignments</span>
                </li>
                <li className="flex items-start">
                  <FaCheckCircle className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span>Fair compensation</span>
                </li>
                <li className="flex items-start">
                  <FaCheckCircle className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span>Real-time order tracking</span>
                </li>
                <li className="flex items-start">
                  <FaCheckCircle className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span>Delivery history dashboard</span>
                </li>
              </ul>
            </div>

            {/* For Communities */}
            <div className="border-2 border-purple-200 rounded-lg p-6 hover:border-purple-400 transition-colors">
              <FaUsers className="text-purple-600 text-3xl mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">For Communities</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <FaCheckCircle className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span>Support local agriculture</span>
                </li>
                <li className="flex items-start">
                  <FaCheckCircle className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span>Food security insights</span>
                </li>
                <li className="flex items-start">
                  <FaCheckCircle className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span>Market data analytics</span>
                </li>
                <li className="flex items-start">
                  <FaCheckCircle className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span>NGO and county officer tools</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-green-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Transform Agriculture in Kenya?
          </h2>
          <p className="text-xl text-primary-50 mb-8">
            Join thousands of farmers and consumers already using AgroMarketHub
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-white text-primary-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center justify-center"
            >
              Create Account
              <FaArrowRight className="ml-2" />
            </Link>
            <Link
              to="/login"
              className="bg-transparent text-white border-2 border-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors inline-flex items-center justify-center"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* About */}
            <div>
              <div className="flex items-center mb-4">
                <FaSeedling className="text-primary-400 text-2xl mr-2" />
                <span className="text-xl font-bold text-white">AgroMarketHub</span>
              </div>
              <p className="text-sm">
                Connecting Kenyan farmers directly with consumers through technology and innovation.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/register" className="hover:text-primary-400">Register</Link>
                </li>
                <li>
                  <Link to="/login" className="hover:text-primary-400">Login</Link>
                </li>
                <li>
                  <Link to="/buyer" className="hover:text-primary-400">Browse Products</Link>
                </li>
              </ul>
            </div>

            {/* For Users */}
            <div>
              <h4 className="text-white font-semibold mb-4">For Users</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/register" className="hover:text-primary-400">Farmers</Link>
                </li>
                <li>
                  <Link to="/register" className="hover:text-primary-400">Buyers</Link>
                </li>
                <li>
                  <Link to="/register" className="hover:text-primary-400">Riders</Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-white font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm">
                <li>Email: support@agromarkethub.com</li>
                <li>Phone: +254 700 000 000</li>
                <li>Kenya</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} AgroMarketHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;

