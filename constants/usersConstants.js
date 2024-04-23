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
};
