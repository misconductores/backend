const config = require('config');
const {DateTime} = require('luxon');
const {CronJob} = require('cron');

const {
  TIMEZONES,
  roles,
} = require('../../constants/usersConstants');
const {UsersModel} = require('../../models');
const emailNotificationProcesses = require('../email/processes');
const logger = require('../../middleware/loggerMiddleware');

const DEFAULT_WARNING_DAYS = 7;
const CDMX_TIMEZONE = 'America/Mexico_City';
// TEST_EMAIL: set to a value to limit processing for local testing.
const TEST_EMAIL = 'tcxogblkxekngotsug@nesopf.com';
const SCHEDULE = '0 * * * * *'; // every minute (testing)

const getReminderThreshold = () => {
  if (config.has('documentExpirationWarningDays')) {
    const parsed = Number(config.get('documentExpirationWarningDays'));
    if (!Number.isNaN(parsed) && parsed > 0) return parsed;
  }
  return DEFAULT_WARNING_DAYS;
};

const normalizeToCstDay = (dateTime) =>
  dateTime.setZone(CDMX_TIMEZONE, {keepLocalTime: true}).startOf('day');

const parseExpiryDate = (value) => {
  if (!value) return null;

  const normalizedValue =
    typeof value === 'string' ? value.trim() : value;

  if (!normalizedValue) return null;

  if (normalizedValue instanceof Date) {
    const fromDate = DateTime.fromJSDate(normalizedValue);
    return fromDate.isValid ? normalizeToCstDay(fromDate) : null;
  }

  const fromISO = DateTime.fromISO(normalizedValue);
  if (fromISO.isValid) return normalizeToCstDay(fromISO);

  const fromJSDate = DateTime.fromJSDate(new Date(normalizedValue));
  return fromJSDate.isValid ? normalizeToCstDay(fromJSDate) : null;
};

const formatDateForTemplate = (dateTime) =>
  dateTime ? normalizeToCstDay(dateTime).toFormat('yyyy/LL/dd') : null;

const evaluateDocument = ({
  expiryDate,
  reminderSent,
  expiredSent,
  setReminderSent,
  setExpiredSent,
  addReminderNotification,
  addExpiredNotification,
  label,
  now,
  reminderThreshold,
}) => {
  const parsedDate = parseExpiryDate(expiryDate);
  logger.info(
    `[DocumentsExpirationCron] Evaluating ${label}: rawExpiry=${expiryDate} parsedExpiry=${formatDateForTemplate(parsedDate)} now=${formatDateForTemplate(now)} reminderSent=${reminderSent} expiredSent=${expiredSent}`
  );

  if (!parsedDate) {
    if (reminderSent) setReminderSent(false);
    if (expiredSent) setExpiredSent(false);
    return;
  }

  const diff = parsedDate.diff(now, 'days').days;
  console.log("days passed", diff);
  if (diff < 0) {
    if (!expiredSent) {
      addExpiredNotification(
        {
          documentName: label,
          expirationDate: formatDateForTemplate(parsedDate),
          daysToExpire: 0,
        },
        () => setExpiredSent(true)
      );
    }
    if (reminderSent) setReminderSent(false);
    return;
  }

  if (diff <= reminderThreshold) {
    if (!reminderSent) {
      addReminderNotification(
        {
          documentName: label,
          expirationDate: formatDateForTemplate(parsedDate),
          daysToExpire: Math.max(0, Math.ceil(diff)),
        },
        () => setReminderSent(true)
      );
    }
    if (expiredSent) setExpiredSent(false);
    return;
  }

  if (reminderSent) setReminderSent(false);
  if (expiredSent) setExpiredSent(false);
};

const fetchDriversWithDocuments = () => {
  const query = {
    role: roles.driver.value,
    $or: [
      {'federalLicenses.expiryDate': {$nin: [null, '']}},
      {'stateLicenses.expiryDate': {$nin: [null, '']}},
      {visaExpiry: {$nin: [null, '']}},
      {fastExpiry: {$nin: [null, '']}},
    ],
  };

  if (TEST_EMAIL) {
    query.email = TEST_EMAIL;
  }

  return UsersModel.find(query).select(
    'email firstName lastName companyName role federalLicenses stateLicenses visaExpiry fastExpiry visaExpiryReminderSent visaExpiryExpiredSent fastExpiryReminderSent fastExpiryExpiredSent'
  );
};

const processDriverDocuments = async ({
  driver,
  reminderThreshold,
  now,
}) => {
  const reminderNotifications = [];
  const expiredNotifications = [];
  let shouldSave = false;

  const setSaveAndMutate = (mutator) => {
    shouldSave = true;
    mutator();
  };

  const addReminderNotification = (notification, mutator) => {
    reminderNotifications.push({notification, mutator});
  };

  const addExpiredNotification = (notification, mutator) => {
    expiredNotifications.push({notification, mutator});
  };

  const handleDocument = ({
    expiryDate,
    reminderSent,
    expiredSent,
    setReminderSent,
    setExpiredSent,
    label,
  }) => {
    evaluateDocument({
      expiryDate,
      reminderSent,
      expiredSent,
      setReminderSent: (value) =>
        setSaveAndMutate(() => setReminderSent(value)),
      setExpiredSent: (value) =>
        setSaveAndMutate(() => setExpiredSent(value)),
      label,
      now,
      reminderThreshold,
      addReminderNotification,
      addExpiredNotification,
    });
  };

  driver.federalLicenses?.forEach((license, index) => {
    handleDocument({
      expiryDate: license.expiryDate,
      reminderSent: license.expiryReminderSent,
      expiredSent: license.expiryExpiredSent,
      setReminderSent: (value) => {
        driver.federalLicenses[index].expiryReminderSent = value;
      },
      setExpiredSent: (value) => {
        driver.federalLicenses[index].expiryExpiredSent = value;
      },
      label: license.federalLicenseType
        ? `Licencia federal (${license.federalLicenseType})`
        : 'Licencia federal',
    });
  });

  driver.stateLicenses?.forEach((license, index) => {
    handleDocument({
      expiryDate: license.expiryDate,
      reminderSent: license.expiryReminderSent,
      expiredSent: license.expiryExpiredSent,
      setReminderSent: (value) => {
        driver.stateLicenses[index].expiryReminderSent = value;
      },
      setExpiredSent: (value) => {
        driver.stateLicenses[index].expiryExpiredSent = value;
      },
      label: license.stateLicenseType
        ? `Licencia estatal (${license.stateLicenseType})`
        : 'Licencia estatal',
    });
  });

  handleDocument({
    expiryDate: driver.visaExpiry,
    reminderSent: driver.visaExpiryReminderSent,
    expiredSent: driver.visaExpiryExpiredSent,
    setReminderSent: (value) => {
      driver.visaExpiryReminderSent = value;
    },
    setExpiredSent: (value) => {
      driver.visaExpiryExpiredSent = value;
    },
    label: 'VISA',
  });

  handleDocument({
    expiryDate: driver.fastExpiry,
    reminderSent: driver.fastExpiryReminderSent,
    expiredSent: driver.fastExpiryExpiredSent,
    setReminderSent: (value) => {
      driver.fastExpiryReminderSent = value;
    },
    setExpiredSent: (value) => {
      driver.fastExpiryExpiredSent = value;
    },
    label: 'FAST',
  });

  const sendNotifications = async ({notifications, handlerName, sender}) => {
    for (const {notification, mutator} of notifications) {
      logger.info(
        `[DocumentsExpirationCron] Sending ${handlerName} email to ${driver.email} for ${notification.documentName} (${notification.expirationDate})`
      );
      // Email sending disabled temporarily for testing.
      await sender({
         user: driver,
         notification,
       });
      setSaveAndMutate(mutator);
    }
  };

  if (reminderNotifications.length === 0 && expiredNotifications.length === 0) {
    logger.info(
      `[DocumentsExpirationCron] No notifications queued for ${driver.email}.`
    );
  } else {
    logger.info(
      `[DocumentsExpirationCron] Queued ${reminderNotifications.length} reminder and ${expiredNotifications.length} expired notification(s) for ${driver.email}.`
    );
  }

  await sendNotifications({
    notifications: reminderNotifications,
    handlerName: 'reminder',
    sender: emailNotificationProcesses.documentExpirationWarning,
  });
  await sendNotifications({
    notifications: expiredNotifications,
    handlerName: 'expired',
    sender: emailNotificationProcesses.documentExpired,
  });

  if (shouldSave) {
    await driver.save();
    logger.info(
      `[DocumentsExpirationCron] Updated reminder flags for driver ${driver.email}`
    );
  }
};

const runJob = async () => {
  try {
    const reminderThreshold = getReminderThreshold();
    const now = DateTime.now()
      .setZone(CDMX_TIMEZONE, {keepLocalTime: true})
      .startOf('day');
    logger.info(
      `[DocumentsExpirationCron] Starting run. Reminder threshold: ${reminderThreshold} days`
    );
    const drivers = await fetchDriversWithDocuments();
    logger.info(
      `[DocumentsExpirationCron] Retrieved ${drivers.length} drivers with expirable documents`
    );

    for (const driver of drivers) {
      logger.info(
        `[DocumentsExpirationCron] Processing driver ${driver.email} (${driver._id})`
      );
      await processDriverDocuments({
        driver,
        reminderThreshold,
        now,
      });
    }
    logger.info('[DocumentsExpirationCron] Completed run successfully');
  } catch (error) {
    logger.error(error);
  }
};

exports.sendDocumentExpirationNotifications = () => {
  Object.values(TIMEZONES).map(({value: timezone}) => {
    return new CronJob(SCHEDULE, () => runJob(), null, true, timezone);
  });
};
