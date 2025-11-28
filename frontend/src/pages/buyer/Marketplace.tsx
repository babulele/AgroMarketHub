import { Routes, Route } from 'react-router-dom';
import BuyerLayout from '../../components/layouts/BuyerLayout';
import ProductList from './ProductList';
import ProductDetail from './ProductDetail';
import Cart from './Cart';
import Checkout from './Checkout';
import Orders from './Orders';
import SeasonalProducts from './SeasonalProducts';
import Auctions from './Auctions';
import AuctionDetail from './AuctionDetail';
import MyBids from './MyBids';
import FarmerProfile from './FarmerProfile';

const BuyerMarketplace = () => {
  return (
    <BuyerLayout>
      <Routes>
        <Route path="/" element={<ProductList />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/seasonal" element={<SeasonalProducts />} />
        <Route path="/auctions" element={<Auctions />} />
        <Route path="/auctions/:id" element={<AuctionDetail />} />
        <Route path="/my-bids" element={<MyBids />} />
        <Route path="/farmer/:farmerId" element={<FarmerProfile />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/orders" element={<Orders />} />
      </Routes>
    </BuyerLayout>
  );
};

export default BuyerMarketplace;

