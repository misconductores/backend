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
const SCHEDULE = '0 * * * * *'; // every minute (testing)

const getReminderThreshold = () => {
  if (config.has('documentExpirationWarningDays')) {
    const parsed = Number(config.get('documentExpirationWarningDays'));
    if (!Number.isNaN(parsed) && parsed > 0) return parsed;
  }
  return DEFAULT_WARNING_DAYS;
};

const parseExpiryDate = (value) => {
  if (!value) return null;

  const normalizedValue =
    typeof value === 'string' ? value.trim() : value;

  if (!normalizedValue) return null;

  if (normalizedValue instanceof Date) {
    const fromDate = DateTime.fromJSDate(normalizedValue);
    return fromDate.isValid ? fromDate.startOf('day') : null;
  }

  const fromISO = DateTime.fromISO(normalizedValue);
  if (fromISO.isValid) return fromISO.startOf('day');

  const fromJSDate = DateTime.fromJSDate(new Date(normalizedValue));
  return fromJSDate.isValid ? fromJSDate.startOf('day') : null;
};

const formatDateForTemplate = (dateTime) =>
  dateTime ? dateTime.toISODate() : null;

const evaluateDocument = ({
  expiryDate,
  reminderSent,
  expiredSent,
  setReminderSent,
  setExpiredSent,
  reminderPayload,
  expiredPayload,
  label,
  now,
  reminderThreshold,
}) => {
  const parsedDate = parseExpiryDate(expiryDate);

  if (!parsedDate) {
    if (reminderSent) setReminderSent(false);
    if (expiredSent) setExpiredSent(false);
    return;
  }

  const diff = parsedDate.diff(now, 'days').days;

  if (diff < 0) {
    if (!expiredSent) {
      expiredPayload.push({
        label,
        expiryDate: formatDateForTemplate(parsedDate),
      });
      setExpiredSent(true);
    }
    if (reminderSent) setReminderSent(false);
    return;
  }

  if (diff <= reminderThreshold) {
    if (!reminderSent) {
      reminderPayload.push({
        label,
        expiryDate: formatDateForTemplate(parsedDate),
        daysRemaining: Math.max(0, Math.ceil(diff)),
      });
      setReminderSent(true);
    }
    if (expiredSent) setExpiredSent(false);
    return;
  }

  if (reminderSent) setReminderSent(false);
  if (expiredSent) setExpiredSent(false);
};

const fetchDriversWithDocuments = () =>
  UsersModel.find({
    role: roles.driver.value,
    $or: [
      {'federalLicenses.expiryDate': {$nin: [null, '']}},
      {'stateLicenses.expiryDate': {$nin: [null, '']}},
      {visaExpiry: {$nin: [null, '']}},
      {fastExpiry: {$nin: [null, '']}},
    ],
  }).select(
    'email firstName lastName companyName role federalLicenses stateLicenses visaExpiry fastExpiry visaExpiryReminderSent visaExpiryExpiredSent fastExpiryReminderSent fastExpiryExpiredSent'
  );

const processDriverDocuments = async ({driver, reminderThreshold, now}) => {
  const reminderPayload = [];
  const expiredPayload = [];
  let shouldSave = false;

  const setSaveAndMutate = (mutator) => {
    shouldSave = true;
    mutator();
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
      reminderPayload,
      expiredPayload,
      label,
      now,
      reminderThreshold,
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

  if (shouldSave) {
    await driver.save();
    logger.info(
      `[DocumentsExpirationCron] Updated reminder flags for driver ${driver.email}`
    );
  }

  if (reminderPayload.length > 0) {
    logger.info(
      `[DocumentsExpirationCron] Sending reminder email to ${driver.email} for ${reminderPayload.length} document(s): ${JSON.stringify(reminderPayload)}`
    );
    await emailNotificationProcesses.documentExpirationWarning({
      user: driver,
      documents: reminderPayload,
    });
  }

  if (expiredPayload.length > 0) {
    logger.info(
      `[DocumentsExpirationCron] Sending expired email to ${driver.email} for ${expiredPayload.length} document(s): ${JSON.stringify(expiredPayload)}`
    );
    await emailNotificationProcesses.documentExpired({
      user: driver,
      documents: expiredPayload,
    });
  }
};

const runJob = async () => {
  try {
    const reminderThreshold = getReminderThreshold();
    const now = DateTime.now().startOf('day');
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
      await processDriverDocuments({driver, reminderThreshold, now});
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
