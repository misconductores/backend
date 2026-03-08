const {UsersModel} = require('../models');
const NotificationsServices = require('./notificationsServices');
const {newJobPosted} = require('../utils/email/processes');
const {
  roles,
  driverStatuses,
  notificationTypes,
  vehicleTypes,
} = require('../constants/usersConstants');

module.exports = class JobNotificationServices {
  /**
   * Notifica a conductores elegibles sobre una nueva vacante publicada
   * @param {Object} job - El trabajo recién creado
   * @returns {Object} - Resultado con cantidad de conductores notificados
   */
  static async notifyDriversAboutNewJob({job}) {
    try {
      // 1. Construir query base: solo conductores verificados y disponibles
      const query = {
        role: roles.driver.value,
        isVerified: true,
        driverStatus: {
          $in: [
            driverStatuses.available.value,
            driverStatuses.availableSoon.value,
          ],
        },
      };

      const andConditions = [];

      // 2. Filtro de licencias (CRÍTICO)
      // El conductor debe tener al menos UNA de las licencias requeridas
      const licenseConditions = [];

      if (job.federalLicenseTypes && job.federalLicenseTypes.length > 0) {
        licenseConditions.push({
          federalLicenses: {
            $elemMatch: {
              federalLicenseType: {$in: job.federalLicenseTypes},
            },
          },
        });
      }

      if (job.stateLicenseTypes && job.stateLicenseTypes.length > 0) {
        licenseConditions.push({
          stateLicenses: {
            $elemMatch: {
              stateLicenseType: {$in: job.stateLicenseTypes},
            },
          },
        });
      }

      // Si hay requisitos de licencia, el conductor debe cumplir al menos uno
      if (licenseConditions.length > 0) {
        andConditions.push({$or: licenseConditions});
      }

      // 3. Tipo de vehículo (IMPORTANTE - debe coincidir exactamente)
      if (job.vehicleType) {
        query.vehicleType = job.vehicleType;
      }

      // 4. Equipo manejado (IMPORTANTE - solo para fifthWheeler)
      if (
        job.vehicleType === vehicleTypes.fifthWheeler.value &&
        job.handledEquipment &&
        job.handledEquipment.length > 0
      ) {
        query.handleEquipment = {$in: job.handledEquipment};
      }

      // 5. Experiencia (MODERADO - debe estar en el rango requerido)
      if (job.experience && job.experience.length > 0) {
        query.experience = {$in: job.experience};
      }

      // 6. Ubicación (OPCIONAL - mismo city para relevancia geográfica)
      if (job.city) {
        query.city = job.city;
      }

      // Aplicar condiciones AND si existen
      if (andConditions.length > 0) {
        query.$and = andConditions;
      }

      // 7. Buscar conductores elegibles
      const eligibleDrivers = await UsersModel.find(query).select('_id firstName lastName email');

      // 8. Obtener información de la empresa para los emails
      const company = await UsersModel.findById(job.companyId).select('companyName email');

      // 9. Crear notificaciones para cada conductor elegible
      let notifiedCount = 0;
      let emailsSent = 0;
      
      const notificationPromises = eligibleDrivers.map((driver) =>
        NotificationsServices.createNotification({
          userId: driver._id,
          relatedUserId: job.companyId,
          type: notificationTypes.new_job_posted.value,
        })
      );

      // 10. Enviar emails en paralelo
      const emailPromises = eligibleDrivers.map((driver) =>
        newJobPosted({
          driver,
          job,
          company,
        })
      );

      // Ejecutar notificaciones y emails en paralelo
      const [notificationResults, emailResults] = await Promise.allSettled([
        Promise.allSettled(notificationPromises),
        Promise.allSettled(emailPromises),
      ]);

      // Contar notificaciones exitosas
      if (notificationResults.status === 'fulfilled') {
        notificationResults.value.forEach((result) => {
          if (result.status === 'fulfilled' && result.value.success) {
            notifiedCount++;
          }
        });
      }

      // Contar emails exitosos
      if (emailResults.status === 'fulfilled') {
        emailResults.value.forEach((result) => {
          if (result.status === 'fulfilled' && result.value.success) {
            emailsSent++;
          }
        });
      }

      return {
        success: true,
        notifiedCount,
        emailsSent,
        totalEligible: eligibleDrivers.length,
      };
    } catch (error) {
      console.error('Error notifying drivers about new job:', error);
      return {success: false, error};
    }
  }

  /**
   * Obtiene estadísticas de cuántos conductores serían notificados sin crear notificaciones
   * Útil para preview antes de publicar
   * @param {Object} jobData - Datos del trabajo a publicar
   * @returns {Object} - Cantidad de conductores que recibirían la notificación
   */
  static async getEligibleDriversCount({jobData}) {
    try {
      const query = {
        role: roles.driver.value,
        isVerified: true,
        driverStatus: {
          $in: [
            driverStatuses.available.value,
            driverStatuses.availableSoon.value,
          ],
        },
      };

      const andConditions = [];

      const licenseConditions = [];

      if (jobData.federalLicenseTypes && jobData.federalLicenseTypes.length > 0) {
        licenseConditions.push({
          federalLicenses: {
            $elemMatch: {
              federalLicenseType: {$in: jobData.federalLicenseTypes},
            },
          },
        });
      }

      if (jobData.stateLicenseTypes && jobData.stateLicenseTypes.length > 0) {
        licenseConditions.push({
          stateLicenses: {
            $elemMatch: {
              stateLicenseType: {$in: jobData.stateLicenseTypes},
            },
          },
        });
      }

      if (licenseConditions.length > 0) {
        andConditions.push({$or: licenseConditions});
      }

      if (jobData.vehicleType) {
        query.vehicleType = jobData.vehicleType;
      }

      if (
        jobData.vehicleType === vehicleTypes.fifthWheeler.value &&
        jobData.handledEquipment &&
        jobData.handledEquipment.length > 0
      ) {
        query.handleEquipment = {$in: jobData.handledEquipment};
      }

      if (jobData.experience && jobData.experience.length > 0) {
        query.experience = {$in: jobData.experience};
      }

      if (jobData.city) {
        query.city = jobData.city;
      }

      if (andConditions.length > 0) {
        query.$and = andConditions;
      }

      const count = await UsersModel.countDocuments(query);

      return {success: true, eligibleCount: count};
    } catch (error) {
      console.error('Error getting eligible drivers count:', error);
      return {success: false, error};
    }
  }
};
