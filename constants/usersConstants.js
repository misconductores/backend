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
  underInspection: {
    value: 'underInspection',
  },
};

module.exports.SENDGRID_EMAIL = 'mitodo.oficios@gmail.com';
module.exports.SENDGRID_EMAIL_NAME = 'Desol Int.';
module.exports.PARAMS_PROPERTY = 'params';
module.exports.QUERY_PROPERTY = 'query';

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
};

module.exports.restrictedUserData =
  '-federalLicenses.federalLicenseNo -stateLicenses.stateLicenseNo -visaNumber -fastNumber -password';

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
};
