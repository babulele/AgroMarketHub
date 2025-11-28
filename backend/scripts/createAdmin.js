/**
 * Script to create an admin user
 * 
 * Usage: node scripts/createAdmin.js
 * 
 * This will create an admin account with:
 * - Email: admin@agromarkethub.com
 * - Password: Admin123!
 * 
 * ⚠️ IMPORTANT: Change the password in production!
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import User model
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6, select: false },
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  role: { type: String, enum: ['farmer', 'buyer', 'rider', 'admin', 'county_officer', 'ngo'], required: true },
  isEmailVerified: { type: Boolean, default: false },
  farmLocation: {
    county: String,
    subCounty: String,
    coordinates: { lat: Number, lng: Number }
  },
  idDocument: {
    url: String,
    uploadedAt: Date
  },
  verificationStatus: { type: String, enum: ['pending', 'approved', 'rejected'] },
  verifiedAt: Date,
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  vehicleType: String,
  licenseNumber: String,
  isAvailable: { type: Boolean, default: true },
  organizationName: String,
  organizationType: String
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);

async function createAdmin() {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      console.error('❌ MONGODB_URI is not defined in environment variables');
      console.error('Please set MONGODB_URI in backend/.env');
      process.exit(1);
    }

    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@agromarkethub.com' });
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log('   Email:', existingAdmin.email);
      console.log('   Role:', existingAdmin.role);
      console.log('\n   To create a new admin, either:');
      console.log('   1. Delete the existing admin from the database');
      console.log('   2. Use a different email address');
      await mongoose.disconnect();
      process.exit(0);
    }

    // Hash password
    const password = 'Admin123!';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create admin user
    const admin = await User.create({
      email: 'admin@agromarkethub.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      phone: '254712345678',
      role: 'admin',
      isEmailVerified: true,
    });

    console.log('\n✅ Admin user created successfully!');
    console.log('\n📋 Admin Credentials:');
    console.log('   Email: admin@agromarkethub.com');
    console.log('   Password: Admin123!');
    console.log('\n⚠️  IMPORTANT: Change the password in production!');
    console.log('\n🔗 Next Steps:');
    console.log('   1. Start the frontend: cd frontend && npm run dev');
    console.log('   2. Go to http://localhost:3000/login');
    console.log('   3. Login with the credentials above');
    console.log('   4. You will be redirected to /admin dashboard');
    console.log('\n');

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    if (error.code === 11000) {
      console.error('   A user with this email already exists');
    }
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run the script
createAdmin();

