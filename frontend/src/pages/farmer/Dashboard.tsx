import { Routes, Route } from 'react-router-dom';
import FarmerLayout from '../../components/layouts/FarmerLayout';
import DashboardHome from './DashboardHome';
import Products from './Products';
import Profile from './Profile';
import Subscription from './Subscription';
import Sales from './Sales';
import AIDashboard from './AIDashboard';
import FarmerAuctions from './Auctions';
import Payouts from './Payouts';

const FarmerDashboard = () => {
  return (
    <FarmerLayout>
      <Routes>
        <Route path="/" element={<DashboardHome />} />
        <Route path="/products" element={<Products />} />
        <Route path="/auctions" element={<FarmerAuctions />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/subscription" element={<Subscription />} />
        <Route path="/sales" element={<Sales />} />
        <Route path="/ai-dashboard" element={<AIDashboard />} />
        <Route path="/payouts" element={<Payouts />} />
      </Routes>
    </FarmerLayout>
  );
};

export default FarmerDashboard;

