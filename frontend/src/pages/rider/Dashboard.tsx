import { Routes, Route } from 'react-router-dom';
import RiderLayout from '../../components/layouts/RiderLayout';
import Deliveries from './Deliveries';

const RiderDashboard = () => {
  return (
    <RiderLayout>
      <Routes>
        <Route path="/" element={<Deliveries />} />
      </Routes>
    </RiderLayout>
  );
};

export default RiderDashboard;

