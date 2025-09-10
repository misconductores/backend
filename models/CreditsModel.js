const mongoose = require('mongoose');
//validar si con estos documentos son suficientes para el registro en la bd
const creditsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  stripeSessionId: {
    type: String,
    required: true,
    unique: true 
  },

  packageType: {
    type: String,
    enum: ['Paquete Básico', 'Paquete Pro', 'Verificación'],
    required: true
  },

  credits: {
    type: Number,
    required: true
  },

  amount: {
    type: Number, 
    required: true
  },

  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'cancelled'],
    default: 'pending'
  },

  sessionStatus: {
    type: String,
    enum: ['open', 'complete', 'expired'],
    default: 'open'
  },

  customerEmail: {
    type: String,
    required: false
  },

  completedAt: {
    type: Date,
    required: false 
  }

}, {
  timestamps: true 
});

creditsSchema.index({ userId: 1 });
creditsSchema.index({ stripeSessionId: 1 });
creditsSchema.index({ paymentStatus: 1 });
creditsSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Credits', creditsSchema);
