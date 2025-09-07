const config = require('config');

module.exports.ACCESS_LEVELS = {
  create: 'CREATE',
  read: 'READ',
  update: 'UPDATE',
  delete: 'DELETE',
};
const levels = this.ACCESS_LEVELS;

module.exports.roles = {
  admin: {
    value: 'admin',
    accessLevels: [levels.create, levels.read, levels.update, levels.delete],
  },
  driver: {
    value: 'driver',
    accessLevels: [levels.create, levels.read, levels.update],
  },
  company: {
    value: 'company',
    accessLevels: [levels.create, levels.read, levels.update],
  },
};

module.exports.driverStatuses = {
  available: {
    value: 'available',
  },
  connected: {
    value: 'connected',
  },
  availableSoon: {
    value: 'availableSoon',
  },
  waitingDecision: {
    value: 'waitingDecision',
  },
  underInspection: {
    value: 'underInspection',
  },
};

module.exports.PARAMS_PROPERTY = 'params';
module.exports.QUERY_PROPERTY = 'query';
module.exports.BODY_PROPERTY = 'body';

module.exports.companyDocumentNames = {
  taxCertificate: {
    value: 'taxCertificate',
    label: 'Tax Certificate',
  },
  legalProof: {
    value: 'legalProof',
    label: 'Legal Proof',
  },
  operatingAuthority: {
    value: 'operatingAuthority',
    label: 'Operating Authority',
  },
  alphaCode: {
    value: 'alphaCode',
    label: 'SCAC',
  },
  carrierCode: {
    value: 'carrierCode',
    label: 'CAAT',
  },
  ctpatCertificate: {
    value: 'ctpatCertificate',
    label: 'CTPAT Certificate',
  },
  oeaCertificate: {
    value: 'oeaCertificate',
    label: 'OEA Certificate',
  },
  sctPermit: {
    value: 'sctPermit',
    label: 'SCT Permit',
  },
  other: {
    value: 'other',
    label: 'Other',
  },
};

module.exports.driverDocumentNames = {
  taxCertificate: {
    value: 'taxCertificate',
    label: 'Tax Certificate',
  },
  ineCertificate: {
    value: 'ineCertificate',
    label: 'INE Certificate',
  },
  birthCertificate: {
    value: 'birthCertificate',
    label: 'Birth Certificate',
  },
  domicile: {
    value: 'domicile',
    label: 'Domicile',
  },
  medicalCertificate: {
    value: 'medicalCertificate',
    label: 'Medical Certificate',
  },
  noCriminalLetter: {
    value: 'noCriminalLetter',
    label: 'No Criminal Letter',
  },
  visa: {
    value: 'visa',
    label: 'VISA',
  },
  fast: {
    value: 'fast',
    label: 'FAST',
  },
  passport: {
    value: 'passport',
    label: 'Passport',
  },
  binationalLicense: {
    value: 'binationalLicense',
    label: 'Binational License',
  },
  federalLicense: {
    value: 'federalLicense',
    label: 'Federal License',
  },
  recommendationLetter: {
    value: 'recommendationLetter',
    label: 'Recommendation Letter',
  },
  resume: {
    value: 'resume',
    label: 'Resume',
  },
  pitaBadge: {
    value: 'pitaBadge',
    label: 'PITA Badge',
  },
  anamBadge: {
    value: 'anamBadge',
    label: 'ANAM Badge',
  },
  other: {
    value: 'other',
    label: 'Other',
  },
};

module.exports.federalLicenseTypes = ['A', 'B', 'C', 'E'];
module.exports.stateLicenseTypes = ['A', 'B', 'C', 'D'];
module.exports.genderOptions = ['male', 'female', 'other'];

module.exports.errorCodes = {
  INVALID_TOKEN_ERR: 'INVALID_TOKEN_ERR',
  USER_NOT_VERIFIED: 'USER_NOT_VERIFIED',
  ONLY_COMPANY_ALLOWED: 'ONLY_COMPANY_ALLOWED',
  ONLY_ONE_JOB_ALLOWED: 'ONLY_ONE_JOB_ALLOWED',
  DOCS_ACCESS_REQ_NOT_ALLOWED: 'DOCS_ACCESS_REQ_NOT_ALLOWED',
  JOB_HISTORY_NOT_ALLOWED: 'JOB_HISTORY_NOT_ALLOWED',
};

// restricted user data without subscription
module.exports.restrictedUserData =
  '-federalLicenses.federalLicenseNo -stateLicenses.stateLicenseNo -visaNumber -fastNumber -password -verificationToken -documents';

// selected user data with free subscription
module.exports.freeSubscriptionSelectedData =
  'firstName role dateOfBirth lastName companyName driverStatus vehicleType handleEquipment postalCode experience federalLicenses.federalLicenseType stateLicenses.stateLicenseType profilePic id city country';

module.exports.experienceTypes = {
  student: {
    value: 'student',
    maxValue: 1,
    minValue: 0,
  },
  beginner: {
    value: 'beginner',
    maxValue: 4,
    minValue: 2,
  },
  intermediate: {
    value: 'intermediate',
    maxValue: 9,
    minValue: 5,
  },
  advance: {
    value: 'advance',
    maxValue: 10,
  },
};

module.exports.vehicleTypes = {
  fifthWheeler: {
    label: 'Fifth Wheeler',
    value: 'fifthWheeler',
  },
  boxTruck: {
    label: 'Box Truck',
    value: 'BoxTruck',
  },
  car: {
    label: 'Car',
    value: 'car',
  },
  motorcycle: {
    label: 'Motorcycle',
    value: 'motorcycle',
  },
};

module.exports.equipmentTypes = {
  dryBox: {
    label: 'Dry Box',
    value: 'dryBox',
  },
  specialized: {
    label: 'Specialized (Hazmat, Tank, among others)',
    value: 'specialized',
  },
  refrigerated: {
    label: 'Refrigerated',
    value: 'refrigerated',
  },
  platform: {
    label: 'Platform',
    value: 'platform',
  },
  others: {
    label: 'Others',
    value: 'others',
  },
};

module.exports.statusTypes = {
  pending: {
    value: 'pending',
    label: 'Pending',
  },
  accepted: {
    value: 'accepted',
    label: 'Accepted',
  },
  rejected: {
    value: 'rejected',
    label: 'Rejected',
  },
  expired: {
    value: 'expired',
    label: 'Expired',
  },
  withdrawn: {
    value: 'withdrawn',
    label: 'Withdrawn',
  },
};

module.exports.notificationTypes = {
  send_offer: {
    value: 'send_offer',
  },
  accept_offer: {
    value: 'accept_offer',
  },
  reject_offer: {
    value: 'reject_offer',
  },
  company_disconnect: {
    value: 'company_disconnect',
  },
  driver_disconnect: {
    value: 'driver_disconnect',
  },
  company_document_access: {
    value: 'company_document_access',
  },
  driver_accepted_docs_access: {
    value: 'driver_accepted_docs_access',
  },
  driver_rejected_docs_access: {
    value: 'driver_rejected_docs_access',
  },
  driver_removed_docs_access: {
    value: 'driver_removed_docs_access',
  },
   verification_progress: {
       value: "verification_progress",
   },
};

module.exports.TIMEZONES = {
  'Central Time': {
    value: 'America/Mexico_City',
  },
};

module.exports.reviewTypes = {
  company_review: {
    value: 'company_review',
  },
  driver_review: {
    value: 'driver_review',
  },
};

module.exports.connectionStatuses = {
  active: {
    value: 'active',
  },
  pending: {
    value: 'pending',
  },
  inactive: {
    value: 'inactive',
  },
};

module.exports.reviewYesNoOptions = ['yes', 'no'];

module.exports.reasonToLeaveOptions = {
  voluntary: {
    value: 'voluntary',
  },
  incident: {
    value: 'incident',
  },
  other: {
    value: 'other',
  },
};

module.exports.blockedErrorTypes = {
  already_blocked_err: {
    value: 'already_blocked_err',
  },
  cannot_blocked_err: {
    value: 'cannot_blocked_err',
  },
};

module.exports.subscriptionStatuses = {
  active: {
    value: 'active',
  },
  expired: {
    value: 'expired',
  },
  inactive: {
    value: 'inactive',
  },
  all: {
    value: 'all',
  },
  incomplete: {
    value: 'incomplete',
  },
  pastDue: {
    value: 'past_due',
  },
};

module.exports.subscriptionModes = {
  free: {
    value: 'free',
  },
  paid: {
    value: 'paid',
  },
};

module.exports.subscriptionProviders = {
  stripe: {
    value: 'stripe',
  },
};

module.exports.subscriptionTypes = {
  monthly: {
    value: 'monthly',
    stripeValue: 'month',
  },
  yearly: {
    value: 'yearly',
    stripeValue: 'year',
  },
};

module.exports.subscriptionStatusEnums = Object.values(
  this.subscriptionStatuses
).map((status) => status.value);

module.exports.subscriptionModeEnums = Object.values(
  this.subscriptionModes
).map((mode) => mode.value);

module.exports.subscriptionTypeEnums = Object.values(
  this.subscriptionTypes
).map((type) => type.value);

module.exports.stripeEvents = {
  invoicePaid: {
    value: 'invoice.paid',
  },
  paymentFailed: {
    value: 'invoice.payment_failed',
  },
  paymentSuccess: {
    value: 'payment_intent.succeeded',
  },
  checkoutSessionCompleted: {
    value: 'checkout.session.completed',
  },
};

module.exports.checkoutSuccessUrl = `${config.get('frontendURL')}`;
module.exports.checkoutCancelUrl = `${config.get(
  'frontendURL'
)}/dashboard/subscription`;

module.exports.creditPackages = {
    basicPackage: {
        value: config.get("creditsBasicPriceId") || "price_1RrtSKB2g3RJ2ZOUumZNyogh",  
        credits: 5,
        name: "Paquete Básico" 
    },
    premiumPackage: {
        value: config.get("creditsPremiumPriceId") || "price_1RrtStB2g3RJ2ZOU6pcUi0GZ", 
        credits: 10,
        name: "Paquete Pro"
    }
};

module.exports.creditsCheckoutSuccessUrl = `${config.get(
    "frontendURL"
)}/dashboard/profile?credits=success`;
module.exports.creditsCheckoutCancelUrl = `${config.get(
    "frontendURL"
)}/dashboard/profile?credits=cancelled`;

module.exports.requestTypes = {
  jobPost: {
    value: 'jobPost',
  },
  docAccess: {
    value: 'docAccess',
  },
  reviewsAccess: {
    value: 'reviewsAccess',
  },
  userData: {
    value: 'userData',
  },
  backgroundCheck: {
    value: 'backgroundCheck',
  },
  amlCheck: {
    value: 'amlCheck',
  },
  curpValidation: {
    value: 'curpValidation',
  },
  nssCheck: {
    value: 'nssCheck',
  },
};
