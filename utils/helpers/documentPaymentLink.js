const config = require('config');
const ServiceModel = require('../../models/ServiceModel');

/**
 * Mapea el nombre del documento a un documentType
 * @param {string} documentName - Nombre del documento (ej: "VISA", "FAST", "Licencia federal (A)")
 * @returns {string|null} - Tipo de documento o null si no se puede mapear
 */
function mapDocumentNameToType(documentName) {
  const normalizedName = documentName.toLowerCase().trim();
  
  // Mapeo directo de nombres de documentos a tipos
  if (normalizedName.includes('visa')) {
    return 'visa';
  }
  
  if (normalizedName.includes('fast')) {
    return 'fast';
  }
  
  // Para licencias federales, puede incluir el tipo (A, B, C, E)
  if (normalizedName.includes('licencia federal') || normalizedName.includes('federal license')) {
    return 'federalLicense';
  }
  
  // Para licencias estatales, puede incluir el tipo (A, B, C, D)
  if (normalizedName.includes('licencia estatal') || normalizedName.includes('state license')) {
    return 'stateLicense';
  }
  
  return null;
}

/**
 * Obtiene el paymentLink de Stripe para un documento específico
 * Si existe un servicio relacionado con el documento, devuelve su paymentLink
 * Si no existe, devuelve la URL del frontend
 * 
 * @param {string} documentName - Nombre del documento (ej: "VISA", "FAST", "Licencia federal (A)")
 * @returns {Promise<string>} - URL de pago o URL del frontend
 */
module.exports.getDocumentPaymentLink = async (documentName) => {
  try {
    // Mapear el nombre del documento a un documentType
    const documentType = mapDocumentNameToType(documentName);
    
    let service = null;
    
    // Si tenemos un documentType, buscar por ese campo (más preciso)
    if (documentType) {
      service = await ServiceModel.findOne({
        documentType: documentType,
        paymentLink: { $exists: true, $ne: null, $ne: '' }
      });
    }
    
    // Si no encontramos por documentType, intentar búsqueda por título como fallback
    if (!service) {
      const normalizedDocumentName = documentName.toLowerCase().trim();
      const {specificKeywords, generalKeywords} = extractDocumentKeywords(normalizedDocumentName);
      
      // Buscar por keywords específicas
      if (specificKeywords.length > 0) {
        const specificQuery = {
          $or: specificKeywords.map(keyword => ({
            title: { $regex: keyword, $options: 'i' }
          })),
          paymentLink: { $exists: true, $ne: null, $ne: '' }
        };
        
        service = await ServiceModel.findOne(specificQuery);
      }
      
      // Si no encontramos con keywords específicas, buscar con keywords generales
      if (!service && generalKeywords.length > 0) {
        const generalQuery = {
          $or: generalKeywords.map(keyword => ({
            title: { $regex: keyword, $options: 'i' }
          })),
          paymentLink: { $exists: true, $ne: null, $ne: '' }
        };
        
        service = await ServiceModel.findOne(generalQuery);
      }
    }
    
    // Si encontramos un servicio con paymentLink, lo devolvemos
    if (service && service.paymentLink) {
      return service.paymentLink;
    }
    
    // Si no encontramos servicio, devolvemos la URL del frontend
    return config.get('frontendURL') || 'http://localhost:3000';
  } catch (error) {
    console.error('Error getting document payment link:', error);
    // En caso de error, devolver la URL del frontend
    return config.get('frontendURL') || 'http://localhost:3000';
  }
};

/**
 * Extrae palabras clave del nombre del documento para buscar servicios relacionados
 * @param {string} documentName - Nombre del documento normalizado
 * @returns {Object} - Objeto con specificKeywords y generalKeywords
 */
function extractDocumentKeywords(documentName) {
  const specificKeywords = [];
  const generalKeywords = [];
  
  // Mapeo de documentos a palabras clave
  // Buscar VISA
  if (documentName.includes('visa')) {
    specificKeywords.push('visa');
  }
  
  // Buscar FAST
  if (documentName.includes('fast')) {
    specificKeywords.push('fast');
  }
  
  // Buscar licencias federales
  if (documentName.includes('licencia federal') || documentName.includes('federal license')) {
    specificKeywords.push('licencia federal', 'federal license');
    generalKeywords.push('federal');
  } else if (documentName.includes('federal')) {
    generalKeywords.push('federal');
  }
  
  // Buscar licencias estatales
  if (documentName.includes('licencia estatal') || documentName.includes('state license')) {
    specificKeywords.push('licencia estatal', 'state license');
    generalKeywords.push('estatal', 'state');
  } else if (documentName.includes('estatal') || documentName.includes('state')) {
    generalKeywords.push('estatal', 'state');
  }
  
  // Si no encontramos keywords específicas, usar el nombre completo del documento
  if (specificKeywords.length === 0 && generalKeywords.length === 0) {
    // Extraer palabras significativas del nombre del documento
    const words = documentName.split(/\s+/).filter(word => word.length > 2);
    generalKeywords.push(...words);
  }
  
  return {specificKeywords, generalKeywords};
}
