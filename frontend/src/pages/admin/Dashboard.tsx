import { Routes, Route } from 'react-router-dom';
import AdminLayout from '../../components/layouts/AdminLayout';
import Verifications from './Verifications';
import Disputes from './Disputes';
import Analytics from './Analytics';
import AIManagement from './AIManagement';

const AdminDashboard = () => {
  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<Analytics />} />
        <Route path="/verifications" element={<Verifications />} />
        <Route path="/disputes" element={<Disputes />} />
        <Route path="/ai-management" element={<AIManagement />} />
      </Routes>
    </AdminLayout>
  );
};

export default AdminDashboard;

