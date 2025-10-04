const { creditPackages, creditsCheckoutSuccessUrl, creditsCheckoutCancelUrl } = require('../constants/usersConstants');
const StripeUtils = require('../utils/stripeUtils');
const { CreditsModel, UsersModel } = require('../models');

module.exports = class CreditsServices {
  static async getAvailablePackages() {
    try {
      const packages = Object.entries(creditPackages).map(([key, packageInfo]) => ({
        id: key,
        name: packageInfo.name,
        credits: packageInfo.credits,
        priceId: packageInfo.value
      }));

      return {
        success: true,
        packages
      };
    } catch (error) {
      console.error('Error getting available packages:', error);
      return {
        success: false,
        error: error.message || error
      };
    }
  }

  static async createCheckoutSession({userId, packageType, priceId}) {
    try {
      
      console.log('datos del credito:', { userId, packageType, priceId });
      
      const packageInfo = creditPackages[packageType];
      if (!packageInfo || packageInfo.value !== priceId) {
        throw new Error('Package type and price ID do not match');
      }

      const successUrl = creditsCheckoutSuccessUrl;
      const cancelUrl = creditsCheckoutCancelUrl;

      const checkoutSession = await StripeUtils.createCreditsCheckoutSession({
        priceId,
        userId,
        successUrl,
        cancelUrl
      });

      if (!checkoutSession.success) {
        throw checkoutSession.error;
      }

      const packageNameInDataBase = packageType === 'basicPackage' ? 'Revisión de Antecedentes (5)' : 'Revisión de Antecedentes (10)';
      
      const creditTransaction = new CreditsModel({
        userId,
        stripeSessionId: checkoutSession.sessionId,
        packageType: packageNameInDataBase, 
        credits: packageInfo.credits,
        amount: 0, 
        paymentStatus: 'pending',
        sessionStatus: 'open'
      });

      await creditTransaction.save();
      return {
        success: true,
        checkoutUrl: checkoutSession.checkoutUrl,
        sessionId: checkoutSession.sessionId,
        transactionId: creditTransaction._id,
        packageInfo
      };

    } catch (error) {
      console.error('Error creating credits checkout session:', error);
      return {
        success: false,
        error: error.message || error
      };
    }
  }

  static async handleCheckoutSessionCompleted({session}) {
    try {
      console.log('pago exitoso');
      console.log('Datos de la sesión:', JSON.stringify(session, null, 2));
      
      const userId = session.client_reference_id;
      const sessionId = session.id;
      const amountTotal = session.amount_total; 
      const paymentIntentId = session.payment_intent;
      const customerEmail = session.customer_details?.email;
      const customerName = session.customer_details?.name;
      
      console.log('id del Usuario:', userId);
      console.log('Cantidad pagada:', `$${amountTotal / 100} ${session.currency.toUpperCase()}`);
      console.log('id de Sesion:', sessionId);
      console.log('id del pago:', paymentIntentId);

      const creditTransaction = await CreditsModel.findOne({ 
        stripeSessionId: sessionId 
      });

      if (!creditTransaction) {
        throw new Error(`Transaction not found for session ID: ${sessionId}`);
      }

      const now = new Date();
      const tijuanaDate = new Date(now.toLocaleString("en-US", {timeZone: "America/Tijuana"}));
      
      creditTransaction.amount = amountTotal;
      creditTransaction.paymentStatus = 'paid';
      creditTransaction.sessionStatus = 'complete';
      creditTransaction.customerEmail = customerEmail;
      creditTransaction.completedAt = tijuanaDate; 

      await creditTransaction.save();
      console.log('Transacción actualizada:', creditTransaction._id);

      const user = await UsersModel.findById(userId);
      if (!user) {
        throw new Error(`User not found: ${userId}`);
      }

      const previousCredits = user.credits || 0;
      user.credits = previousCredits + creditTransaction.credits;
      await user.save();

      return {
        success: true,
        transactionId: creditTransaction._id,
        creditsAdded: creditTransaction.credits,
        totalCredits: user.credits
      };

    } catch (error) {
      console.error('Error handling checkout session completed:', error);
      return {
        success: false,
        error: error.message || error
      };
    }
  }

  static async getUserCreditsInfo(userId) {
    try {
      const allTransactions = await CreditsModel.find({
        userId,
        paymentStatus: 'paid'
      }).sort({ createdAt: 1 });

      console.log('total de transacciones realizadas:', allTransactions.length);

      let availableCredits = 0;
      let lastPurchase = null;

      allTransactions.forEach(transaction => {
        
      
        availableCredits += transaction.credits;
        
        if (transaction.packageType !== 'Verificación' && 
            (transaction.packageType === 'Revisión de Antecedentes (5)' || transaction.packageType === 'Revisión de Antecedentes (10)')) {
          if (!lastPurchase || transaction.createdAt > lastPurchase.createdAt) {
            lastPurchase = transaction;
          }
        }
      });

      const user = await UsersModel.findById(userId).select('credits');
      if (!user) {
        throw new Error(`User not found: ${userId}`);
      }

      if (user.credits !== availableCredits) {
        await UsersModel.findByIdAndUpdate(userId, { credits: availableCredits });
      }

      const currentDate = new Date();
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      const thisMonthUsage = await CreditsModel.countDocuments({
        userId,
        packageType: 'Verificación',
        completedAt: {
          $gte: startOfMonth,
          $lte: endOfMonth
        }
      });

      const result = {
        availableCredits,
        lastRecharge: lastPurchase ? {
          date: lastPurchase.createdAt, 
          credits: lastPurchase.credits,
          packageType: lastPurchase.packageType
        } : null,
        thisMonthUsage
      };

      return {
        success: true,
        data: result
      };

    } catch (error) {
      console.error('Error getting user credits info:', error);
      return {
        success: false,
        error: error.message || error
      };
    }
  }

  static async deductCredit(userId) {
    try {
      console.log('🔄 Descontando crédito para usuario:', userId);

      const user = await UsersModel.findById(userId);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      if (user.role !== 'company') {
        throw new Error('Solo las empresas pueden usar créditos');
      }

      if (user.credits <= 0) {
        throw new Error('No tienes créditos disponibles');
      }

      const updatedUser = await UsersModel.findByIdAndUpdate(
        userId, 
        { $inc: { credits: -1 } },
        { new: true } 
      );

      if (!updatedUser) {
        throw new Error('Error al actualizar los créditos del usuario');
      }

      const now = new Date();
      const tijuanaDate = new Date(now.toLocaleString("en-US", {timeZone: "America/Tijuana"}));
      
      const startOfMonth = new Date(tijuanaDate.getFullYear(), tijuanaDate.getMonth(), 1);
      const endOfMonth = new Date(tijuanaDate.getFullYear(), tijuanaDate.getMonth() + 1, 0);

      const creditUsage = new CreditsModel({
        userId,
        packageType: 'Verificación', 
        credits: -1, 
        amount: 0,
        paymentStatus: 'paid',
        sessionStatus: 'complete',
        completedAt: tijuanaDate,
        stripeSessionId: `verification_${Date.now()}` 
      });

      await creditUsage.save();

      const thisMonthUsage = await CreditsModel.countDocuments({
        userId,
        packageType: 'Verificación',
        completedAt: {
          $gte: startOfMonth,
          $lte: endOfMonth
        }
      });

      return {
        success: true,
        data: {
          availableCredits: updatedUser.credits,
          thisMonthUsage,
          message: 'Crédito descontado exitosamente'
        }
      };

    } catch (error) {
      console.error('Error deducting credit:', error);
      return {
        success: false,
        error: error.message || error
      };
    }
  }
};
