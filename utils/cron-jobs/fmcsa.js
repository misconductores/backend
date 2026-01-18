const { TIMEZONES } = require('../../constants/usersConstants');
const { CronJob } = require('cron');
const logger = require('../../middleware/loggerMiddleware');
const { UsersModel } = require('../../models');
const { OthersServices } = require('../../services');

exports.updateCompaniesFmcsaData = async () => {
  const schedule = '0 9 * * *'; // 09:00 UTC = 03:00 CDMX (UTC-6)

  const cb = () => async () => {
    try {
      const companiesToUpdate = await UsersModel.find({ role: 'company' });

      if (!companiesToUpdate.length) {
        logger.info('No hay empresas con rol "company" para actualizar.');
        return;
      }

      for (const company of companiesToUpdate) {
        try {
          let result = null;

          if (company?.deptOfTransport) {
            result = await OthersServices.getCarrierInfoByDotNumber(company.deptOfTransport);
          } else if (company?.motorCarrier) {
            result = await OthersServices.getCarrierInfoByDocket(company.motorCarrier);
          } else {
            logger.warn(`DOT y MC no registrados para empresa: ${company.companyName || company._id}`);
            continue;
          }

          const { success, carrierInfo, error } = result;

          if (success && carrierInfo) {
            company.fmsca = carrierInfo;
            await company.save();
            logger.info(`Actualizada FMCSA para: ${company.companyName || company._id}`);
          } else {
            logger.error(`Error al obtener datos FMCSA para ${company.companyName || company._id}: ${error?.message || error}`);
          }

        } catch (err) {
          logger.error(`Error al procesar empresa ${company.companyName || company._id}: ${err.message}`);
        }
      }
    } catch (globalErr) {
      logger.error(`Error general al actualizar empresas FMCSA: ${globalErr.message}`);
    }
  };

  Object.values(TIMEZONES).forEach(({ value: timezone }) => {
    new CronJob(schedule, cb(), null, true, timezone);
    logger.info(`Tarea programada para zona horaria: ${timezone}`);
  });
};
