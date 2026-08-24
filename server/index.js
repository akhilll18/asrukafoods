// server/index.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Razorpay from 'razorpay';

// Load environment variables from parent folder
dotenv.config({ path: '../.env.local' });

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
}));
app.use(express.json());

// ============================================
// RAZORPAY INSTANCE
// ============================================
const razorpay = new Razorpay({
  key_id: process.env.VITE_RAZORPAY_KEY_ID,
  key_secret: process.env.VITE_RAZORPAY_KEY_SECRET,
});

console.log('🔑 Razorpay Key ID:', process.env.VITE_RAZORPAY_KEY_ID);

// ============================================
// API ROUTES
// ============================================

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: '✅ Server is running!',
    timestamp: new Date().toISOString(),
  });
});

// Create Razorpay Order
app.post('/api/create-razorpay-order', async (req, res) => {
  try {
    const { amount, currency, receipt } = req.body;

    const options = {
      amount: amount,
      currency: currency || 'INR',
      receipt: receipt || `receipt_${Date.now()}`,
      payment_capture: 1,
    };

    const order = await razorpay.orders.create(options);
    
    console.log('✅ Razorpay Order Created:', order.id);
    console.log('💰 Amount:', order.amount / 100, order.currency);
    
    res.json({
      success: true,
      id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    console.error('❌ Error creating Razorpay order:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Verify Razorpay Payment
app.post('/api/verify-razorpay-payment', async (req, res) => {
  try {
    const { orderId, paymentId, signature } = req.body;

    const crypto = await import('crypto');
    const secret = process.env.VITE_RAZORPAY_KEY_SECRET;
    
    const generatedSignature = crypto
      .createHmac('sha256', secret)
      .update(orderId + '|' + paymentId)
      .digest('hex');

    if (generatedSignature === signature) {
      console.log('✅ Payment verified successfully:', paymentId);
      res.json({
        success: true,
        message: 'Payment verified successfully',
      });
    } else {
      console.log('❌ Invalid signature for payment:', paymentId);
      res.status(400).json({
        success: false,
        error: 'Invalid signature',
      });
    }
  } catch (error) {
    console.error('❌ Error verifying payment:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ============================================
// START SERVER
// ============================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('\n========================================');
  console.log('🚀 Razorpay Server is running!');
  console.log(`📍 http://localhost:${PORT}`);
  console.log('========================================');
  console.log(`📦 Razorpay Mode: ${process.env.VITE_RAZORPAY_KEY_ID?.includes('live') ? 'LIVE' : 'TEST'}`);
  console.log(`🔑 Key ID: ${process.env.VITE_RAZORPAY_KEY_ID}`);
  console.log('========================================\n');
});

export default app;