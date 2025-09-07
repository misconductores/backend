// services/nufiService.js
const axios = require("axios");

module.exports = class NufiService {
    /**
     * Consulta antecedentes judiciales de una persona física a través de la API de NUFI
     *
     * @param {Object} params - Parámetros para la consulta
     * @param {string} params.nombre - Nombre de la persona física (requerido si no se especifica apellido)
     * @param {string} params.paterno - Apellido paterno de la persona física (requerido)
     * @param {string} params.materno - Apellido materno de la persona física (requerido, usar " " si no tiene)
     * @param {boolean} [params.detalle] - Determina si se mostrarán los acuerdos de cada expediente
     * @param {string} [params.estado] - Abreviatura de entidad o "nacional" para búsqueda nacional
     * @returns {Promise} Respuesta de la API con los antecedentes judiciales
     */
    static async consultarAntecedentesJudicialesPersonaFisica({
        nombre,
        paterno,
        materno,
        detalle,
        estado,
    }) {
        try {
            const data = {
                nombre,
                paterno,
                materno,
                ...(detalle !== undefined && { detalle }),
                ...(estado && { estado }),
            };

            const response = await axios.post(
                `${process.env.NUFI_API_URL}/antecedentes_judiciales/v2/persona_fisica_nacional`,
                data,
                {
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                        // "NUFI-API-KEY":
                        //     process.env.NUFI_SUBSCRIPTION_KEY_PREMIUM,
                    },
                }
            );

            return response.data;
        } catch (error) {
            console.error(
                "Error al consultar antecedentes judiciales:",
                error.response?.data || error.message
            );
            throw error;
        }
    }

    /**
     * Consulta y valida un CURP a través de la API de NUFI
     * Para validar un CURP:
     * - El campo "tipo_busqueda" deberá ser "curp"
     * - Datos obligatorios: "tipo_busqueda", "curp"
     *
     * @param {string} curp - CURP a validar (ejemplo: "AUVA500107HMNGLL10")
     * @returns {Promise} Respuesta de la API con los datos del CURP
     */
    static async consultarCURP(curp) {
        try {
            const data = {
                tipo_busqueda: "curp",
                curp: curp,
            };

            const response = await axios.post(
                `${process.env.NUFI_API_URL}/curp/v1/consulta`,
                data,
                {
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                        "Ocp-Apim-Subscription-Key":
                            process.env.NUFI_SUBSCRIPTION_KEY_OCP,
                    },
                }
            );

            return response.data;
        } catch (error) {
            console.error(
                "Error al consultar CURP:",
                error.response?.data || error.message
            );
            throw error;
        }
    }

    /**
     * Consulta el Número de Seguridad Social (NSS) de forma asíncrona a través de la API de NUFI
     * Servicio que consulta NSS de la base de datos oficial del IMSS
     * La respuesta será enviada al webhook configurado
     *
     * @param {string} curp - CURP válido de la persona (18 caracteres, ej: "GOBA920329HCLMRL04")
     * @param {string} webhook - URL del webhook donde se enviarán los resultados
     * @returns {Promise} Respuesta de la API con el UUID de la solicitud
     */
    static async consultarNumeroSeguridadSocial(curp, webhook) {
        try {
            const data = {
                curp: curp,
                webhook: webhook,
            };

            console.log("🔍 DEBUG: Consultando NSS con datos:", data);
            const response = await axios.post(
                `${process.env.NUFI_API_URL}/numero_seguridad_social/v2/consultar`,
                data,
                {
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                        "NUFI-API-KEY": process.env.NUFI_API_KEY,
                    },
                }
            );

            return response.data;
        } catch (error) {
            console.error(
                "Error al consultar Número de Seguridad Social:",
                error.response?.data || error.message
            );
            throw error;
        }
    }

    /**
     * Consulta AML (antecedentes penales)
     * Servicio para validar personas contra listas de prevención de lavado de dinero
     *
     * @param {Object} params - Parámetros para la consulta AML
     * @param {string} params.nombre_completo - Nombre completo de la persona
     * @param {string} [params.primer_nombre] - Primer nombre de la persona
     * @param {string} [params.segundo_nombre] - Segundo nombre de la persona
     * @param {string} [params.apellidos] - Apellidos de la persona
     * @param {string} [params.fecha_nacimiento] - Fecha de nacimiento de la persona
     * @param {string} [params.lugar_nacimiento] - Lugar de nacimiento de la persona
     * @returns {Promise} Respuesta de la API con los resultados del perfilamiento AML
     */
    static async consultarAML({
        nombre_completo,
        primer_nombre,
        segundo_nombre,
        apellidos,
        fecha_nacimiento,
        lugar_nacimiento,
    }) {
        try {
            const data = {
                nombre_completo,
                primer_nombre: primer_nombre || "",
                segundo_nombre: segundo_nombre || "",
                apellidos: apellidos || "",
                fecha_nacimiento: fecha_nacimiento || "",
                lugar_nacimiento: lugar_nacimiento || "",
            };

            const response = await axios.post(
                `${process.env.NUFI_API_URL}/perfilamiento/v1/aml`,
                data,
                {
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                        "NUFI-API-KEY": process.env.NUFI_SUBSCRIPTION_KEY_INT,
                    },
                }
            );

            return response.data;
        } catch (error) {
            console.error(
                "Error al consultar AML (Prevención de Lavado de Dinero):",
                error.response?.data || error.message
            );
            throw error;
        }
    }

    /**
     * Consulta el historial laboral de una persona a través del NSS de forma asíncrona a través de la API de NUFI
     * Servicio que consulta el historial laboral completo de la base de datos oficial del IMSS
     * La respuesta será enviada al webhook configurado
     *
     * @param {string} curp - CURP válido de la persona (18 caracteres, ej: "BABA980828MOCTTB00")
     * @param {string} nss - Número de Seguridad Social (ej: "21149804235")
     * @param {string} webhook - URL del webhook donde se enviarán los resultados
     * @returns {Promise} Respuesta de la API con el UUID de la solicitud
     */
    static async consultarHistorialLaboral(curp, nss, webhook) {
        try {
            const params = new URLSearchParams({
                curp: curp,
                nss: nss,
                webhook: webhook,
            });

            const response = await axios.get(
                `${process.env.NUFI_API_URL}/numero_seguridad_social/v2/consultar_historial?${params}`,
                {
                    headers: {
                        Accept: "application/json",
                        "NUFI-API-KEY": process.env.NUFI_API_KEY,
                    },
                }
            );

            return response.data;
        } catch (error) {
            console.error(
                "Error al consultar historial laboral:",
                error.response?.data || error.message
            );
            throw error;
        }
    }

    /**
     * Consulta el crédito INFONAVIT de una persona a través del NSS de forma asíncrona a través de la API de NUFI
     * Servicio que consulta información de crédito INFONAVIT de la base de datos oficial
     * La respuesta será enviada al webhook configurado
     *
     * @param {string} nss - Número de Seguridad Social (ej: "90170182138")
     * @param {string} webhook - URL del webhook donde se enviarán los resultados
     * @returns {Promise} Respuesta de la API con el UUID de la solicitud
     */
    static async consultarCreditoInfonavit(nss, webhook) {
        try {
            console.log("🔍 DEBUG: Consultando crédito INFONAVIT con datos:", {
                nss,
                webhook,
            });

            const data = {
                info_persona: {
                    nss: nss,
                },
                webhook: webhook,
            };

            const response = await axios.post(
                `${process.env.NUFI_API_URL}/credito_infonavit/v1/credito_infonavit`,
                data,
                {
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                        "NUFI-API-KEY": process.env.NUFI_API_KEY,
                    },
                }
            );
            console.log(
                "🔍 DEBUG: Respuesta de NUFI crédito INFONAVIT:",
                response.data
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Consulta el estado de una solicitud de crédito INFONAVIT por UUID
     * Servicio que obtiene los resultados de una consulta previa de crédito INFONAVIT
     *
     * @param {string} uuid - UUID de la solicitud previa (ej: "aeb1266f-cb45-44d2-b825-ed0d23c40570")
     * @returns {Promise} Respuesta de la API con los datos del crédito INFONAVIT
     */
    static async consultarEstadoCreditoInfonavit(uuid) {
        try {
            const data = {
                uuid: uuid,
            };

            const response = await axios.post(
                `${process.env.NUFI_API_URL}/credito_infonavit/v1/consulta`,
                data,
                {
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                        "NUFI-API-KEY": process.env.NUFI_API_KEY,
                    },
                }
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};
