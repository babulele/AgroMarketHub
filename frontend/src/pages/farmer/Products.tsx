import { useEffect, useState } from 'react';
import api from '../../services/api';
import { Product } from '../../types';
import toast from 'react-hot-toast';
import ImageUpload from '../../components/ImageUpload';

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    unit: 'kg',
    inventory: { quantity: '' },
    location: { county: '', subCounty: '' },
    images: [] as string[],
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      setProducts(response.data.data.products);
    } catch (error: any) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name || !formData.description || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    const priceNum = parseFloat(formData.price);
    const quantityNum = parseInt(formData.inventory.quantity);

    if (isNaN(priceNum) || priceNum < 0) {
      toast.error('Please enter a valid price');
      return;
    }

    if (isNaN(quantityNum) || quantityNum < 0) {
      toast.error('Please enter a valid quantity');
      return;
    }

    if (!formData.location.county || !formData.location.subCounty) {
      toast.error('Please provide both county and sub-county');
      return;
    }

    try {
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: formData.category.trim(),
        price: priceNum,
        unit: formData.unit || 'kg',
        inventory: {
          quantity: quantityNum,
        },
        location: {
          county: formData.location.county.trim(),
          subCounty: formData.location.subCounty.trim(),
        },
        images: formData.images || [],
      };

      await api.post('/products', productData);
      toast.success('Product created successfully');
      setShowForm(false);
      setFormData({
        name: '',
        description: '',
        category: '',
        price: '',
        unit: 'kg',
        inventory: { quantity: '' },
        location: { county: '', subCounty: '' },
        images: [],
      });
      fetchProducts();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to create product';
      toast.error(errorMessage);
      console.error('Product creation error:', error.response?.data);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Products</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          Add Product
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Product Name"
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Category"
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
            />
            <textarea
              placeholder="Description"
              className="px-4 py-2 border border-gray-300 rounded-md col-span-2 text-gray-900 bg-white focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
            <div className="col-span-2">
              <ImageUpload
                label="Product Images"
                multiple={true}
                existingImages={formData.images}
                onImagesChange={(urls) => setFormData({ ...formData, images: urls })}
                maxSize={5}
              />
            </div>
            <input
              type="number"
              placeholder="Price"
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              required
            />
            <input
              type="number"
              placeholder="Quantity"
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              value={formData.inventory.quantity}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  inventory: { quantity: e.target.value },
                })
              }
              required
              min="0"
            />
            <input
              type="text"
              placeholder="County"
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              value={formData.location.county}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  location: { ...formData.location, county: e.target.value },
                })
              }
              required
            />
            <input
              type="text"
              placeholder="Sub-County"
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              value={formData.location.subCounty}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  location: { ...formData.location, subCounty: e.target.value },
                })
              }
              required
            />
          </div>
          <button
            type="submit"
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            Create Product
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product._id} className="bg-white rounded-lg shadow overflow-hidden">
            {product.images && product.images.length > 0 && (
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-4">
              <h3 className="text-lg font-semibold">{product.name}</h3>
              <p className="text-gray-600">KES {product.price}/{product.unit}</p>
              <p className="text-sm text-gray-500">Quantity: {product.inventory.quantity}</p>
              <p className="text-sm text-gray-500">
                {product.images?.length || 0} image(s)
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Products;

