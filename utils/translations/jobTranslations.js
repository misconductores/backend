/**
 * Traducciones para datos de trabajos del inglés al español
 */

const vehicleTypeTranslations = {
  fifthWheeler: 'Quinta Rueda',
  BoxTruck: 'Camión de Caja',
  car: 'Automóvil',
  motorcycle: 'Motocicleta',
};

const experienceTranslations = {
  student: 'Estudiante',
  beginner: 'Principiante',
  intermediate: 'Intermedio',
  advance: 'Avanzado',
};

const equipmentTranslations = {
  dryBox: 'Caja Seca',
  specialized: 'Especializado (Hazmat, Tanque, entre otros)',
  refrigerated: 'Refrigerado',
  platform: 'Plataforma',
  others: 'Otros',
};

const licenseTranslations = {
  A: 'Tipo A',
  B: 'Tipo B',
  C: 'Tipo C',
  D: 'Tipo D',
  E: 'Tipo E',
};

/**
 * Traduce el tipo de vehículo al español
 */
function translateVehicleType(vehicleType) {
  return vehicleTypeTranslations[vehicleType] || vehicleType;
}

/**
 * Traduce un array de experiencias al español
 */
function translateExperience(experiences) {
  if (!experiences || !Array.isArray(experiences)) {
    return 'No especificada';
  }
  
  const translatedExperiences = experiences.map(
    exp => experienceTranslations[exp] || exp
  );
  
  return translatedExperiences.join(', ');
}

/**
 * Traduce un array de equipos al español
 */
function translateEquipment(equipment) {
  if (!equipment || !Array.isArray(equipment)) {
    return 'No especificado';
  }
  
  const translatedEquipment = equipment.map(
    eq => equipmentTranslations[eq] || eq
  );
  
  return translatedEquipment.join(', ');
}

/**
 * Traduce un array de licencias al español
 */
function translateLicenses(licenses) {
  if (!licenses || !Array.isArray(licenses)) {
    return 'No especificadas';
  }
  
  const translatedLicenses = licenses.map(
    license => licenseTranslations[license] || license
  );
  
  return translatedLicenses.join(', ');
}

/**
 * Traduce todos los datos de un trabajo para el email
 */
function translateJobForEmail(job) {
  return {
    vehicleType: translateVehicleType(job.vehicleType),
    experience: translateExperience(job.experience),
    handledEquipment: translateEquipment(job.handledEquipment),
    federalLicenseTypes: translateLicenses(job.federalLicenseTypes),
    stateLicenseTypes: translateLicenses(job.stateLicenseTypes),
    title: job.title,
    city: job.city,
    postalCode: job.postalCode,
    description: job.description,
    responsibility: job.responsibility,
  };
}

module.exports = {
  translateVehicleType,
  translateExperience,
  translateEquipment,
  translateLicenses,
  translateJobForEmail,
  vehicleTypeTranslations,
  experienceTranslations,
  equipmentTranslations,
  licenseTranslations,
};
