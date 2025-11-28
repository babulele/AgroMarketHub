import { Response, NextFunction } from 'express';
import { Product } from '../models';
import { AuthRequest } from '../middleware/auth';
import logger from '../utils/logger';

export const createProduct = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      name,
      description,
      category,
      price,
      unit,
      inventory,
      location,
      images,
    } = req.body;

    // Validate required top-level fields
    if (!name || !description || !category) {
      res.status(400).json({
        success: false,
        message: 'Please provide name, description, and category',
      });
      return;
    }

    // Validate price
    const priceNum = Number(price);
    if (isNaN(priceNum) || priceNum < 0) {
      res.status(400).json({
        success: false,
        message: 'Please provide a valid price (number >= 0)',
      });
      return;
    }

    // Validate inventory object and quantity
    if (!inventory || typeof inventory !== 'object') {
      res.status(400).json({
        success: false,
        message: 'Please provide inventory object with quantity',
      });
      return;
    }

    const quantityNum = Number(inventory.quantity);
    if (isNaN(quantityNum) || quantityNum < 0) {
      res.status(400).json({
        success: false,
        message: 'Please provide a valid inventory quantity (number >= 0)',
      });
      return;
    }

    // Validate location object
    if (!location || typeof location !== 'object') {
      res.status(400).json({
        success: false,
        message: 'Please provide location object with county and subCounty',
      });
      return;
    }

    if (!location.county || !location.subCounty) {
      res.status(400).json({
        success: false,
        message: 'Please provide both county and subCounty in location',
      });
      return;
    }

    // Validate farmer ID
    if (!req.user || !req.user.id) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
      return;
    }

    // Validate images array if provided
    if (images && !Array.isArray(images)) {
      res.status(400).json({
        success: false,
        message: 'Images must be an array',
      });
      return;
    }

    const product = await Product.create({
      farmer: req.user.id,
      name: name.trim(),
      description: description.trim(),
      category: category.trim(),
      price: priceNum,
      unit: unit || 'kg',
      images: images || [],
      inventory: {
        quantity: quantityNum,
        available: quantityNum > 0,
      },
      location: {
        county: location.county.trim(),
        subCounty: location.subCounty.trim(),
      },
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: { product },
    });
  } catch (error: any) {
    logger.error('Create product error:', error);
    logger.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code,
      keyPattern: error.keyPattern,
      keyValue: error.keyValue,
      requestBody: JSON.stringify(req.body),
    });

    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors,
      });
      return;
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      res.status(400).json({
        success: false,
        message: 'Duplicate entry. Product with this information already exists.',
      });
      return;
    }

    next(error);
  }
};

export const getProducts = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      category,
      county,
      minPrice,
      maxPrice,
      search,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    // Build query - filter for active products with available inventory
    // Use $ne: false to include products where field is true or not set
    const query: any = { 
      isActive: { $ne: false },
      'inventory.available': { $ne: false },
    };

    if (category) query.category = category;
    if (county) query['location.county'] = county;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

    const products = await Product.find(query)
      .populate({
        path: 'farmer',
        select: 'firstName lastName farmLocation verificationStatus',
      })
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error: any) {
    logger.error('Get products error:', error);
    logger.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      query: JSON.stringify(query),
    });
    next(error);
  }
};

export const getProduct = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      res.status(400).json({
        success: false,
        message: 'Invalid product ID',
      });
      return;
    }

    const product = await Product.findById(id).populate({
      path: 'farmer',
      select: 'firstName lastName farmLocation verificationStatus',
    });

    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found',
      });
      return;
    }

    // Increment views
    product.views += 1;
    await product.save();

    res.json({
      success: true,
      data: { product },
    });
  } catch (error: any) {
    logger.error('Get product error:', error);
    logger.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      productId: req.params.id,
    });
    next(error);
  }
};

export const updateProduct = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const product = await Product.findById(id);
    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found',
      });
      return;
    }

    // Check ownership
    if (product.farmer.toString() !== req.user!.id) {
      res.status(403).json({
        success: false,
        message: 'Not authorized to update this product',
      });
      return;
    }

    // Update inventory availability
    if (updateData.inventory) {
      updateData.inventory.available = updateData.inventory.quantity > 0;
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: { product: updatedProduct },
    });
  } catch (error: any) {
    logger.error('Update product error:', error);
    next(error);
  }
};

export const deleteProduct = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found',
      });
      return;
    }

    // Check ownership
    if (product.farmer.toString() !== req.user!.id) {
      res.status(403).json({
        success: false,
        message: 'Not authorized to delete this product',
      });
      return;
    }

    // Soft delete
    product.isActive = false;
    await product.save();

    res.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error: any) {
    logger.error('Delete product error:', error);
    next(error);
  }
};

export const getTrendingProducts = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const limit = Number(req.query.limit) || 10;

    const products = await Product.find({
      isActive: true,
      'inventory.available': true,
    })
      .sort({ cartAdditions: -1, views: -1 })
      .limit(limit)
      .populate({
        path: 'farmer',
        select: 'firstName lastName',
      });

    res.json({
      success: true,
      data: { products },
    });
  } catch (error: any) {
    logger.error('Get trending products error:', error);
    logger.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    next(error);
  }
};

