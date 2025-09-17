const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const {
    GeneralResponsesFactory,
    GeneralErrorsFactory,
} = require("../factories");

const IdentityRecordSchema = require("../models/IdentityRecordModel");
const EmploymentHistorySchema = require("../models/EmploymentHistoryModel");
const CriminalRecordSchema = require("../models/CriminalRecordModel");
const InfonavitRecordSchema = require("../models/InfonavitRecord");
const BlackListSchema = require("../models/BlackListModel");
const NufiService = require("../integrations/backgroundCheckServices");
const fs = require("fs");
const path = require("path");
const { userBlockedSuccessfully } = require("../factories/responses/users");
const getAMLByConductorId = async (id_conductor, id_compania) => {
    if (!id_conductor) return null;
    try { // Se añade el filtro por id_compania
        const amlRecord = await BlackListSchema.findOne({
            id_conductor: id_conductor,
            id_compania: id_compania
        }).sort({ createdAt: -1 }).lean();
        return amlRecord;
    } catch (error) {
        console.error("ERROR en getAMLByConductorId:", error);
        return null;
    }
}
const getJudicialRecordByConductorId = async (id_conductor, id_compania) => {
    if (!id_conductor) return null;
    try { // Se añade el filtro por id_compania
        const judicialRecord = await CriminalRecordSchema.findOne({
            id_conductor: id_conductor,
            id_compania: id_compania,
        }).sort({ createdAt: -1 }).lean();
        return judicialRecord;
    } catch (error) {
        console.error("ERROR en getJudicialRecordByConductorId:", error);
        return null;
    }
}

module.exports = class backgroundCheckController {
    /**
     * Buscar antecedentes judiciales por id_conductor
     * @param {string} id_conductor
     * @returns {Promise<Object|null>}
     */
    static async getJudicialRecordByConductorId(id_conductor) {
        // Este método ahora es obsoleto y se ha corregido para usar el contexto de la petición.
        // Se recomienda llamar a la versión no estática que recibe `req`.
        console.error("Llamada a método estático obsoleto: getJudicialRecordByConductorId. Usar la versión del controlador de ruta.");
        return null;
    }
    /**
     * Endpoint para consultar antecedentes judiciales
     * POST /api/background-check/antecedentes-judiciales
     */
    static async consultarAntecedentesJudiciales(req, res, next) {
        try {
            const {
                nombre,
                paterno,
                materno,
                detalle,
                estado,
                id_conductor,
                id_compania,
            } = req.body;

            // Normaliza strings básicos para evitar fallos por espacios/uppercases
            const norm = (s) => (typeof s === "string" ? s.trim() : s);

            const params = {
                nombre: norm(nombre),
                paterno: norm(paterno),
                materno: norm(materno),
                detalle: norm(detalle),
                estado: norm(estado),
            };

            // 1) Intenta buscar por id_conductor primero (si viene)
            if (id_conductor) {
                const existingById = await CriminalRecordSchema.findOne({
                    id_conductor,
                    id_compania,
                })
                    .sort({ createdAt: -1 })
                    .lean();

                if (existingById) {
                    return next(
                        GeneralResponsesFactory.dataRetrievedSuccessfully({
                            data: {
                                criminal_record: existingById,
                                nufi_response: null,
                                source: "database",
                            },
                            key: "antecedentesJudiciales",
                            message:
                                "Datos obtenidos desde la base de datos (por id_conductor)",
                        })
                    );
                }
            }

            // 2) Sin id_conductor o no se encontró: intenta por parámetros de búsqueda (si los tienes)
            const providedParams = Object.fromEntries(
                Object.entries(params).filter(
                    ([_, v]) =>
                        v !== undefined && v !== null && String(v).trim() !== ""
                )
            );

            if (hasAllParams) {
                const existingByParams = await CriminalRecordSchema.findOne({
                    "search_params.nombre": params.nombre,
                    "search_params.paterno": params.paterno,
                    "search_params.materno": params.materno,
                    "search_params.detalle": params.detalle || null,
                    "search_params.estado": params.estado,
                })
                    .sort({ createdAt: -1 })
                    .lean();

                if (existingByParams) {
                    return next(
                        GeneralResponsesFactory.dataRetrievedSuccessfully({
                            data: {
                                criminal_record: existingByParams,
                                nufi_response: null,
                                source: "database",
                            },
                            key: "antecedentesJudiciales",
                            message:
                                "Datos obtenidos desde la base de datos (por search_params)",
                        })
                    );
                }
            }

            // 3) Si no hay en DB, consulta la API
            const result =
                await NufiService.consultarAntecedentesJudicialesPersonaFisica({
                    nombre: params.nombre,
                    paterno: params.paterno,
                    materno: params.materno,
                    detalle: params.detalle,
                    estado: params.estado,
                });

            // 4) Persiste la respuesta en DB (mejor esfuerzo)
            let criminalRecord = null;
            try {
                const recordData = {
                    code: result?.code ?? 200,
                    status: result?.status ?? "success",
                    message: result?.message ?? "Consulta exitosa",
                    data: {
                        numero_resultados: result?.data?.numero_resultados ?? 0,
                        homonimia: result?.data?.homonimia ?? "0",
                        resultados: result?.data?.resultados ?? [],
                    },
                    id_conductor: id_conductor || null,
                    search_params: Object.keys(providedParams).length
                        ? providedParams
                        : null,
                };

                criminalRecord = await CriminalRecordSchema.create(recordData);
            } catch (dbError) {
                console.error("ERROR al guardar en DB:", dbError);
            }

            return next(
                GeneralResponsesFactory.dataRetrievedSuccessfully({
                    data: {
                        criminal_record: criminalRecord || result, // por si falló el insert
                        nufi_response: result,
                        source: "nufi_api",
                    },
                    key: "antecedentesJudiciales",
                    message: "Datos obtenidos desde la API de NUFI",
                })
            );
        } catch (error) {
            if (error.response?.status === 401) {
                return next(
                    GeneralErrorsFactory.unauthorizedErr(
                        "API Key inválida o expirada"
                    )
                );
            }
            if (error.response?.status === 400) {
                return next(
                    GeneralErrorsFactory.badRequestErr(
                        "Datos inválidos enviados a la API"
                    )
                );
            }
            if (error.response?.status === 429) {
                return next(
                    GeneralErrorsFactory.tooManyRequestsErr(
                        "Límite de requests excedido"
                    )
                );
            }

            return next(
                GeneralErrorsFactory.internalServerErr(
                    "Error al consultar antecedentes judiciales"
                )
            );
        }
    }

    /**
     * Endpoint para consultar AML (Anti-Money Laundering)
     * POST /api/background-check/aml
     */
    static async consultarAML(req, res, next) {
        try {
            const {
                id_compania,
                id_conductor,
                nombre_completo,
                primer_nombre,
                segundo_nombre,
                apellidos,
                fecha_nacimiento,
                lugar_nacimiento,
            } = req.body;

            const existingRecord = await BlackListSchema.findOne({
                id_conductor: id_conductor,
                id_compania: id_compania,
            }).sort({ createdAt: -1 });

            if (existingRecord) {
                console.log(
                    "Registro AML encontrado en DB:",
                    existingRecord._id
                );
                return next(
                    GeneralResponsesFactory.dataRetrievedSuccessfully({
                        data: {
                            blacklist_record: existingRecord,
                            nufi_response: null,
                            source: "database",
                        },
                        key: "amlCheck",
                        message: "Datos AML obtenidos desde la base de datos",
                    })
                );
            }

            const result = await NufiService.consultarAML({
                nombre_completo,
                primer_nombre,
                segundo_nombre,
                apellidos,
                fecha_nacimiento,
                lugar_nacimiento,
            });

            let blackListRecord;
            try {
                const recordData = {
                    data: {
                        has_crimelist_match:
                            result.data?.has_crimelist_match || false,
                        has_pep_match: result.data?.has_pep_match || false,
                        has_watchlist_match:
                            result.data?.has_watchlist_match || false,
                        has_sanction_match:
                            result.data?.has_sanction_match || false,
                        result_payload: {
                            searched_at:
                                result.data?.result_payload?.searched_at ||
                                new Date(),
                            sanctionlist_sources:
                                result.data?.result_payload
                                    ?.sanctionlist_sources || [],
                            crimelist_entries:
                                result.data?.result_payload
                                    ?.crimelist_entries || [],
                            watchlist_entries:
                                result.data?.result_payload
                                    ?.watchlist_entries || [],
                            sanctionlist_entries:
                                result.data?.result_payload
                                    ?.sanctionlist_entries || [],
                            pep_entries:
                                result.data?.result_payload?.pep_entries || [],
                        },
                    },
                    id_compania: id_compania,
                    id_conductor: id_conductor,
                    search_params: {
                        nombre_completo,
                        primer_nombre,
                        segundo_nombre,
                        apellidos,
                        fecha_nacimiento,
                        lugar_nacimiento,
                    },
                };

                blackListRecord = await BlackListSchema.create(recordData);
                console.log(
                    "Nuevo registro AML guardado en DB:",
                    blackListRecord._id
                );
            } catch (dbError) {
                console.error("ERROR al guardar registro AML en DB:", dbError);
            }

            next(
                GeneralResponsesFactory.dataRetrievedSuccessfully({
                    data: {
                        blacklist_record: blackListRecord || result,
                        nufi_response: result,
                        source: "nufi_api",
                    },
                    key: "amlCheck",
                })
            );
        } catch (error) {
            console.error("ERROR en consultarAML:", {
                message: error.message,
                stack: error.stack,
                response: error.response?.data,
                status: error.response?.status,
            });

            if (error.response?.status === 400) {
                return next(
                    GeneralErrorsFactory.badRequestErr(
                        "Datos inválidos para consulta AML"
                    )
                );
            }

            if (error.response?.status === 401) {
                return next(
                    GeneralErrorsFactory.unauthorizedErr(
                        "API key inválida o expirada"
                    )
                );
            }

            if (error.response?.status === 429) {
                return next(
                    GeneralErrorsFactory.tooManyRequestsErr(
                        "Límite de requests excedido"
                    )
                );
            }

            next(
                GeneralErrorsFactory.internalServerErr("Error al consultar AML")
            );
        }
    }

    /**
     * Buscar registro AML por id_conductor
     * @param {string} id_conductor
     * @returns {Promise<Object|null>}
     */
    static async getAMLByConductorId(id_conductor) {
        // Este método ahora es obsoleto y se ha corregido para usar el contexto de la petición.
        console.error("Llamada a método estático obsoleto: getAMLByConductorId. Usar la versión del controlador de ruta.");
        return null;
    }

    /**
     * Endpoint para consultar CURP
     * POST /api/background-check/curp
     */
    static async consultarCURP(req, res, next) {
        try {
            const { curp, id_conductor } = req.body;

            const existingCurpDB = await IdentityRecordSchema.findOne({
                "data.curpdata.curp": curp,
            });

            if (existingCurpDB) {
                return next(
                    GeneralResponsesFactory.dataRetrievedSuccessfully({
                        data: existingCurpDB,
                        key: "curpValidation",
                    })
                );
            }

            let curpData;

            try {
                curpData = await NufiService.consultarCURP(curp);
            } catch (nufiError) {
                console.error("ERROR: Falló la consulta a NUFI:", {
                    message: nufiError.message,
                    response: nufiError.response?.data,
                    status: nufiError.response?.status,
                });

                if (nufiError.response?.status === 401) {
                    return next(
                        GeneralErrorsFactory.unauthorizedErr(
                            "Subscription Key inválida o expirada"
                        )
                    );
                }
                if (nufiError.response?.status === 400) {
                    return next(
                        GeneralErrorsFactory.badRequestErr("CURP inválido")
                    );
                }

                return next(
                    GeneralErrorsFactory.internalServerErr(
                        "No se pudo obtener datos de NUFI"
                    )
                );
            }

            const newRegister = {
                data: curpData,
                id_conductor,
                tipo_documento: "curp",
            };

            let identityRecord;
            try {
                identityRecord = await IdentityRecordSchema.create(newRegister);
            } catch (dbError) {
                return next(
                    GeneralErrorsFactory.internalServerErr(
                        "Error al guardar en la base de datos"
                    )
                );
            }

            // 4️) Responder al cliente
            return next(
                GeneralResponsesFactory.dataRetrievedSuccessfully({
                    data: identityRecord,
                    key: "curpValidation",
                })
            );
        } catch (error) {
            console.error("ERROR general en consultarCURP:", error);
            return next(
                GeneralErrorsFactory.internalServerErr(
                    "Error al consultar CURP"
                )
            );
        }
    }

    /**
     * Endpoint para consultar Historial Laboral mediante CURP o ID Conductor
     * En mongodb
     * GET /api/v1/background-check/historial-laboral
     */
    static async getHistorialLaboralCurp(req, res, next) {
        try {
            const { curp, id_conductor, id_compania } = req.query;

            let searchFilter = {};

            if (id_conductor) {
                searchFilter.id_conductor = id_conductor;
            } else if (curp) {
                searchFilter.curp = curp;
            }

            searchFilter.id_compania = id_compania;
            // Buscar el documento (el más reciente por fecha)
            const employmentHistory = await EmploymentHistorySchema.findOne(
                searchFilter
            ).sort({ createdAt: -1 });

            if (!employmentHistory) {
                const searchBy = id_conductor
                    ? `ID conductor: ${id_conductor}`
                    : `CURP: ${curp}`;
                return next(
                    GeneralErrorsFactory.notFoundErr(
                        `No se encontró historial laboral para ${searchBy}`
                    )
                );
            }

            next(
                GeneralResponsesFactory.dataRetrievedSuccessfully({
                    data: employmentHistory,
                    key: "historialLaboral",
                    message: "Historial laboral obtenido exitosamente",
                })
            );
        } catch (error) {
            console.error("ERROR en getHistorialLaboralCurp:", {
                message: error.message,
                stack: error.stack,
            });

            next(
                GeneralErrorsFactory.internalServerErr(
                    "Error al obtener historial laboral"
                )
            );
        }
    }

    /**
     * Endpoint para obtener historial laboral por CURP
     * GET /api/v1/background-check/historial-laboral/:curp
     */
    static async obtenerHistorialLaboralPorCurp(req, res, next) {
        try {
            const { curp } = req.params;

            if (!curp) {
                return next(
                    GeneralErrorsFactory.badRequestErr(
                        "CURP es requerido para obtener historial laboral"
                    )
                );
            }

            // Buscar el documento por CURP (el más reciente)
            const employmentHistory = await EmploymentHistorySchema.findOne({
                curp: curp,
            }).sort({ createdAt: -1 });

            if (!employmentHistory) {
                return next(
                    GeneralErrorsFactory.notFoundErr(
                        `No se encontró historial laboral para el CURP: ${curp}`
                    )
                );
            }

            next(
                GeneralResponsesFactory.dataRetrievedSuccessfully({
                    data: employmentHistory,
                    key: "historialLaboral",
                    message: "Historial laboral obtenido exitosamente",
                })
            );
        } catch (error) {
            console.error("ERROR en obtenerHistorialLaboralPorCurp:", {
                message: error.message,
                stack: error.stack,
            });

            next(
                GeneralErrorsFactory.internalServerErr(
                    "Error al obtener historial laboral"
                )
            );
        }
    }

    /**
     * Webhook para recibir datos de Historial Laboral de NUFI
     * POST /api/v1/background-check/webhook/historial-laboral
     */
    static async webhookHistorialLaboral(req, res, next) {
        try {
            const { status, code, message, data } = req.body;

            const curp = data.curp;

            console.log("Webhook de historial laboral recibido:", req.body);

            const employmentHistory = await EmploymentHistorySchema.findOne({
                curp: curp,
            }).sort({ createdAt: -1 });

            const updateData = {
                request_status: "Completed",
                ocr: data.ocr || {},
            };

            updateData.webhook_historial_response = {
                status,
                code,
                message,
                received_at: new Date().toISOString(),
            };

            const updatedDocument =
                await EmploymentHistorySchema.findByIdAndUpdate(
                    employmentHistory._id,
                    updateData,
                    { new: true, runValidators: false }
                );

            try {
                const ConnectionsModel = require("../models/ConnectionsModel");
                const NotificationsServices = require("../services/notificationsServices");
                const {
                    notificationTypes,
                } = require("../constants/usersConstants");
                const connection = await ConnectionsModel.findOne({
                    driverId: employmentHistory.id_conductor,
                }).sort({ createdAt: -1 });
                if (connection && connection.companyId) {
                    await NotificationsServices.createNotification({
                        userId: connection.companyId,
                        relatedUserId: employmentHistory.id_conductor,
                        type: notificationTypes.verification_progress.value,
                    });
                }
            } catch (notifyError) {
                console.error(
                    "Error enviando notificación de progreso de verificación:",
                    notifyError
                );
            }

            res.status(200).json({
                success: true,
                message: "Webhook de historial laboral procesado correctamente",
            });
        } catch (error) {
            console.error("ERROR en webhookHistorialLaboral:", {
                message: error.message,
                stack: error.stack,
            });

            res.status(500).json({
                error: "Error interno del servidor al procesar webhook de historial laboral",
                message: error.message,
            });
        }
    }

    /**
     * Webhook para recibir resultados de la consulta de NSS
     * POST /api/v1/check-background/webhook/historial-laboral/
     */
    static async webhookNSS(req, res, next) {
        try {
            const { code, status, message, data } = req.body;

            const curp = req.body.data.curp;

            // Buscar el documento por CURP (el más reciente)
            const employmentHistory = await EmploymentHistorySchema.findOne({
                curp: curp,
            }).sort({ createdAt: -1 });

            if (!employmentHistory) {
                return res.status(404).json({
                    error: `No se encontró solicitud de historial laboral para CURP: ${curp}`,
                });
            }

            const webhook = `${process.env.URL_NUFI_WEBHOOK}/api/v1/check-background/webhook/historial-laboral`;

            const sentRecordReq = await NufiService.consultarHistorialLaboral(
                req.body.data.curp,
                req.body.data.numero_seguridad_social,
                webhook
            );

            const updateData = {
                request_status: "Waiting Employment History",
                numero_seguridad_social:
                    req.body.data.numero_seguridad_social || "",
                request_history_id: sentRecordReq.data?.uuid || "",
            };

            if (data.base64_tarjeta_nss) {
                updateData.base64_semanas_cotizadas_nss =
                    data.base64_tarjeta_nss;
            }

            const additionalData = {
                nombres: data.nombres || "",
                apellido_paterno: data.apellido_paterno || "",
                apellido_materno: data.apellido_materno || "",
                fecha_nacimiento: data.fecha_nacimiento || "",
                lugar_nacimiento: data.lugar_nacimiento || "",
                sexo: data.sexo || "",
                base64_comprobante_localizacion:
                    data.base64_comprobante_localizacion || "",
                webhook_response: {
                    code,
                    status,
                    message,
                    received_at: new Date().toISOString(),
                },
            };

            updateData.ocr = additionalData;

            const updatedDocument =
                await EmploymentHistorySchema.findByIdAndUpdate(
                    employmentHistory._id,
                    updateData,
                    { new: true, runValidators: false }
                );

            res.status(200).json({
                success: true,
                message: "Webhook procesado correctamente",
                request_id: employmentHistory.request_id,
                updated_status: "Waiting Employment History",
            });
        } catch (error) {
            res.status(500).json({
                error: "Error interno del servidor al procesar webhook",
                message: error.message,
            });
        }
    }

    /**
     * POST para solicitar consulta INFONAVIT
     * POST /api/v1/check-background/infonavit
     */
    static async consultarCreditoInfonavit(req, res, next) {
        try {
            const { curp, id_conductor, id_compania } = req.body;

            const webhook = `${process.env.URL_NUFI_WEBHOOK}/api/v1/background-check/webhook/infonavit`;

            // -------------------------------
            // 1) Armar filtro de búsqueda
            // -------------------------------
            let searchFilter = {};
            if (id_conductor) {
                searchFilter.id_conductor = id_conductor; // prioridad
            } else if (curp) {
                searchFilter.curp = curp;
            }
            searchFilter.id_compania = id_compania;

            // Validación mínima: debe venir al menos uno
            if (Object.keys(searchFilter).length === 0) {
                return next(
                    GeneralErrorsFactory.badRequestErr(
                        "Debes proporcionar id_conductor o CURP."
                    )
                );
            }

            // ---------------------------------------------------------
            // 2) Buscar PRIMERO en la DB el registro de INFONAVIT existente
            // ---------------------------------------------------------
            const infonavitFromDB = await InfonavitRecordSchema.findOne(
                searchFilter
            ).sort({ createdAt: -1 });

            if (infonavitFromDB) {
                // Si existe en DB, devolvemos eso (requisito del usuario)
                return next(
                    GeneralResponsesFactory.dataRetrievedSuccessfully({
                        data: infonavitFromDB,
                        key: "creditoInfonavit",
                        message:
                            "Crédito INFONAVIT recuperado desde la base de datos",
                    })
                );
            }

            // --------------------------------------------------------------------
            // 3) No existe INFONAVIT en DB → obtener NSS desde historial laboral
            // --------------------------------------------------------------------
            const employmentHistory = await EmploymentHistorySchema.findOne(
                searchFilter
            ).sort({ createdAt: -1 });

            if (!employmentHistory) {
                const searchBy = id_conductor
                    ? `ID conductor: ${id_conductor}`
                    : `CURP: ${curp}`;
                return next(
                    GeneralErrorsFactory.notFoundErr(
                        `No se encontró historial laboral para ${searchBy}. Es necesario consultar/registrar el NSS antes de solicitar crédito INFONAVIT.`
                    )
                );
            }

            if (!employmentHistory.numero_seguridad_social) {
                return next(
                    GeneralErrorsFactory.badRequestErr(
                        "El historial laboral encontrado no tiene Número de Seguridad Social (NSS). Completa primero el proceso de NSS."
                    )
                );
            }

            const nss = employmentHistory.numero_seguridad_social;

            // ----------------------------------------------------
            // 4) Llamar API externa de NUFI para crédito Infonavit
            // ----------------------------------------------------
            const infonavitData = await NufiService.consultarCreditoInfonavit(
                nss,
                webhook
            );

            // ----------------------------------------------------
            // 5) Persistir un nuevo registro 'pending' con el uuid
            // ----------------------------------------------------
            let infonavitRecord;
            try {
                const recordData = {
                    id_request: infonavitData?.data?.uuid || "",
                    status: "pending",
                    numero_seguro_social: nss,
                    curp: employmentHistory.curp,
                    id_conductor: employmentHistory.id_conductor,
                    id_compania: employmentHistory.id_compania,
                    data: {
                        estatus_credito: "",
                        producto_credito: "",
                        numero_credito: "",
                        fecha_otorgamiento: "",
                    },
                };

                infonavitRecord = await InfonavitRecordSchema.create(
                    recordData
                );
            } catch (dbError) {
                console.error("ERROR al guardar en DB INFONAVIT:", dbError);
                // No bloqueamos la respuesta al cliente si falló el guardado,
                // pero dejamos trazabilidad en logs.
            }

            return next(
                GeneralResponsesFactory.dataRetrievedSuccessfully({
                    data: {
                        infonavit_request_uuid: infonavitData?.data?.uuid || "",
                        nss_used: nss,
                        record_id: infonavitRecord?._id || null,
                    },
                    key: "creditoInfonavit",
                    message:
                        "Solicitud de crédito INFONAVIT enviada a NUFI exitosamente",
                })
            );
        } catch (error) {
            console.error("ERROR en consultarCreditoInfonavit:", {
                message: error.message,
                stack: error.stack,
                error,
            });

            if (error.response?.status === 401) {
                return next(
                    GeneralErrorsFactory.unauthorizedErr(
                        "API Key inválida o expirada"
                    )
                );
            }
            if (error.response?.status === 400) {
                return next(
                    GeneralErrorsFactory.badRequestErr(
                        "Datos inválidos para consulta de crédito INFONAVIT"
                    )
                );
            }
            if (error.response?.status === 429) {
                return next(
                    GeneralErrorsFactory.tooManyRequestsErr(
                        "Límite de requests excedido"
                    )
                );
            }

            return next(
                GeneralErrorsFactory.internalServerErr(
                    "Error al consultar crédito INFONAVIT"
                )
            );
        }
    }

    /**
     * Endpoint para consultar resultados de crédito INFONAVIT por CURP o ID Conductor
     * GET /api/v1/background-check/credito-infonavit/resultado
     */
    static async consultarCreditoInfonavitResultado(req, res, next) {
        try {
            const { curp, id_conductor, id_compania } = req.query;

            let searchFilter = {};

            if (id_conductor) {
                searchFilter.id_conductor = id_conductor;
            } else if (curp) {
                searchFilter.curp = curp;
            }

            searchFilter.id_compania = id_compania;

            // Buscar el documento en InfonavitRecord (el más reciente por fecha)
            const infonavitRecord = await InfonavitRecordSchema.findOne(
                searchFilter
            ).sort({ createdAt: -1 });

            if (!infonavitRecord) {
                const searchBy = id_conductor
                    ? `ID conductor: ${id_conductor}`
                    : `CURP: ${curp}`;
                return next(
                    GeneralErrorsFactory.notFoundErr(
                        `No se encontró registro de crédito INFONAVIT para ${searchBy}`
                    )
                );
            }

            next(
                GeneralResponsesFactory.dataRetrievedSuccessfully({
                    data: infonavitRecord,
                    key: "infonavitRecord",
                    message:
                        "Registro de crédito INFONAVIT obtenido exitosamente",
                })
            );
        } catch (error) {
            console.error("ERROR en consultarCreditoInfonavitResultado:", {
                message: error.message,
                stack: error.stack,
            });

            next(
                GeneralErrorsFactory.internalServerErr(
                    "Error al obtener resultados de crédito INFONAVIT"
                )
            );
        }
    }
    /*
     * Webhook para recibir datos de crédito INFONAVIT de NUFI
     * POST /api/v1/background-check/webhook/infonavit/[curp]
     */
    static async webhookInfonavit(req, res, next) {
        try {
            const { curp } = req.params;

            console.log("Webhook de crédito INFONAVIT recibido:");
            console.log("CURP desde parámetros de ruta:", curp);
            console.log(
                "Body completo del webhook:",
                JSON.stringify(req.body, null, 2)
            );

            // Buscar el documento InfonavitRecord por CURP (el más reciente)
            const infonavitRecord = await InfonavitRecordSchema.findOne({
                curp: curp,
            }).sort({ createdAt: -1 });

            if (!infonavitRecord) {
                console.log(
                    `No se encontró registro de INFONAVIT para CURP: ${curp}`
                );
                return res.status(404).json({
                    error: `No se encontró registro de INFONAVIT para CURP: ${curp}`,
                    curp: curp,
                });
            }

            const { status, code, message, data } = req.body;

            const updateData = {
                status: status === 200 ? "completed" : "failed",
            };

            if (data) {
                updateData.data = {
                    estatus_credito: data.estatus_credito || "",
                    producto_credito: data.producto_credito || "",
                    numero_credito: data.numero_credito || "",
                    fecha_otorgamiento: data.fecha_otorgamiento || "",
                };
            }

            const updatedDocument =
                await InfonavitRecordSchema.findByIdAndUpdate(
                    infonavitRecord._id,
                    updateData,
                    { new: true, runValidators: false }
                );

            console.log("Documento INFONAVIT actualizado:", updatedDocument);

            res.status(200).json({
                success: true,
                message: "Webhook de crédito INFONAVIT procesado correctamente",
                curp: curp,
                record_id: infonavitRecord._id,
            });
        } catch (error) {
            console.error("ERROR en webhookInfonavit:", {
                message: error.message,
                stack: error.stack,
            });

            // Responder con error al webhook
            res.status(500).json({
                error: "Error interno del servidor al procesar webhook de crédito INFONAVIT",
                message: error.message,
                curp: req.params.curp || "no disponible",
            });
        }
    }

    /**
     * Endpoint para consultar Historial Laboral mediante CURP
     * GET /api/background-check/historial-laboral
     */
    static async consultarHistorialLaboralCurp(req, res, next) {
        try {
            // 1) Normalizar entradas (ya están validadas antes de llegar aquí)
            const { curp, id_conductor, id_compania } = req.query;
            const curpNorm = String(curp).trim().toUpperCase();
            const idConductorNorm = String(id_conductor).trim();
            const idCompaniaNorm = String(id_compania).trim();

            // 2) Filtro fijo (siempre llegan ambos)
            const searchFilter = {
                id_compania: idCompaniaNorm,
                id_conductor: idConductorNorm,
                curp: curpNorm,
            };

            // 3) Buscar el registro más reciente en DB (
            const existingRecord = await EmploymentHistorySchema.findOne(
                searchFilter
            )
                .sort({ createdAt: -1 })
                .lean();

            if (existingRecord) {
                console.log(
                    "Registro de historial laboral encontrado en DB:",
                    existingRecord._id
                );
                return next(
                    GeneralResponsesFactory.dataRetrievedSuccessfully({
                        data: {
                            employment_history: existingRecord,
                            source: "database",
                        },
                        key: "historialLaboralRequest",
                        message:
                            "Historial laboral obtenido desde la base de datos",
                    })
                );
            }

            // 4) Preparar webhook y consultar NUFI (sin validar result.data?.uuid)
            const webhook = `${process.env.URL_NUFI_WEBHOOK}/api/v1/check-background/webhook/nss`;

            const result = await NufiService.consultarNumeroSeguridadSocial(
                curpNorm,
                webhook
            );

            // Nota: a petición tuya, NO se valida result.data?.uuid
            const requestId = result?.data?.uuid;

            // 5) Guardar en base de datos con los datos iniciales
            try {
                const employmentHistory = await EmploymentHistorySchema.create({
                    id_conductor: idConductorNorm,
                    id_compania: idCompaniaNorm,
                    curp: curpNorm,
                    request_id: requestId, // puede ser undefined; si el esquema lo requiere estrictamente, fallará y caerá en este catch
                    request_status: "Waiting NSS",
                    numero_seguridad_social: "",
                    base64_semanas_cotizadas_nss: "",
                    // ocr se llenará cuando llegue el webhook
                });

                console.log(
                    "Nuevo registro de historial laboral guardado en DB:",
                    employmentHistory._id
                );
            } catch (dbError) {
                console.error("ERROR al guardar en DB:", dbError);
                return next(
                    GeneralErrorsFactory.internalServerErr(
                        "Error al guardar solicitud en la base de datos"
                    )
                );
            }

            // 6) Responder al cliente
            return next(
                GeneralResponsesFactory.dataRetrievedSuccessfully({
                    data: {
                        request_id: requestId ?? null,
                        status: "Waiting NSS",
                        source: "nufi_api",
                        message:
                            "Solicitud de historial laboral procesada. Los resultados se enviarán al webhook configurado.",
                    },
                    key: "historialLaboralRequest",
                })
            );
        } catch (error) {
            console.error("ERROR en consultarHistorialLaboralCurp:", {
                message: error.message,
                stack: error.stack,
                response: error.response?.data,
                status: error.response?.status,
            });

            // Manejo específico de errores de la API de NUFI
            if (error.response?.status === 401) {
                return next(
                    GeneralErrorsFactory.unauthorizedErr(
                        "API Key inválida o expirada"
                    )
                );
            }
            if (error.response?.status === 400) {
                return next(
                    GeneralErrorsFactory.badRequestErr(
                        "CURP inválido o webhook mal configurado"
                    )
                );
            }
            if (error.response?.status === 429) {
                return next(
                    GeneralErrorsFactory.tooManyRequestsErr(
                        "Límite de requests excedido"
                    )
                );
            }

            return next(
                GeneralErrorsFactory.internalServerErr(
                    "Error al solicitar consulta de historial laboral"
                )
            );
        }
    }

    /** Hook para enviar el correo de verificacion completado */

    static async sendBackCheckCompletedEmail(req, res, next) {
        try {
            const { user, verifyUrl } = req.body;
            const backCheckCompleted = require("../utils/email/processes/backChechkCompleted");
            await backCheckCompleted({ user, verifyUrl });
            res.status(200).json({
                statusCode: 200,
                success: true,
                message: "Correo enviado correctamente.",
            });
        } catch (error) {
            if (
                error.response &&
                error.response.body &&
                error.response.body.errors
            ) {
                const sendGridErrors = error.response.body.errors
                    .map((e) => e.message)
                    .join("; ");
                return res.status(500).json({
                    statusCode: 500,
                    success: false,
                    message: "Error al enviar correo: " + sendGridErrors,
                });
            }
            return res.status(500).json({
                statusCode: 500,
                success: false,
                message: "Error interno al enviar correo",
                error: error.message,
            });
        }
    }
    /* envio de correo con el reporte adjunto */
    static async sendBackCheckSendEmail(req, res, next) {
        try {
            console.log(
                "--- [backgroundCheckController.sendBackCheckSendEmail] INICIO ---"
            );
            let pdfBase64 = undefined;
            let fileName = undefined;
            if (req.file) {
                fileName = req.file.originalname;
                pdfBase64 = req.file.buffer.toString("base64");
                console.log(
                    "[DEBUG] Archivo recibido por multipart:",
                    fileName,
                    "size:",
                    req.file.size
                );
            } else {
                pdfBase64 = req.body.pdfBase64;
                fileName = req.body.fileName;
                console.log(
                    "[DEBUG] pdfBase64:",
                    typeof pdfBase64 === "string"
                        ? pdfBase64.slice(0, 100)
                        : pdfBase64
                );
                console.log("[DEBUG] fileName:", fileName);
            }
            let user = req.body.user
                ? typeof req.body.user === "string"
                    ? JSON.parse(req.body.user)
                    : req.body.user
                : undefined;
            const verifyUrl = req.body.verifyUrl;
            const backCheckSendEmail = require("../utils/email/processes/backCheckSendEmail");
            await backCheckSendEmail({
                user,
                verifyUrl,
                pdfBase64,
                fileName,
            });
            console.log(
                "--- [backgroundCheckController.sendBackCheckSendEmail] FIN (correo enviado) ---"
            );
            res.status(200).json({
                statusCode: 200,
                success: true,
                message: "Correo con archivo adjunto enviado correctamente.",
            });
        } catch (error) {
            console.error(
                "--- [backgroundCheckController.sendBackCheckSendEmail] ERROR ---"
            );
            console.error("Error en sendBackCheckSendEmail:", error);
            if (
                error.response &&
                error.response.body &&
                error.response.body.errors
            ) {
                const sendGridErrors = error.response.body.errors
                    .map((e) => e.message)
                    .join("; ");
                return res.status(500).json({
                    statusCode: 500,
                    success: false,
                    message: "Error al enviar correo: " + sendGridErrors,
                });
            }
            if (
                error instanceof RangeError &&
                error.message.includes("Invalid status code")
            ) {
                return res.status(500).json({
                    statusCode: 500,
                    success: false,
                    message:
                        "Error interno: status code inválido. Revisa el middleware de respuesta final.",
                    error: error.message,
                });
            }
            return res.status(500).json({
                statusCode: 500,
                success: false,
                message: "Error interno al enviar correo",
                error: error.message,
            });
        }
    }

    static async getAggregatedResults(req, res, next) {
        try {
            const { id_conductor, id_compania } = req.query;
            

            if (!id_conductor || !id_compania) {
                return next(GeneralErrorsFactory.badRequestErr("Faltan IDs de conductor o compañía."));
            }

            const [employmentHistory, infonavitCredit, judicialRecord, amlRecord] = await Promise.all([
                EmploymentHistorySchema.findOne({ id_conductor, id_compania }).sort({ createdAt: -1 }).lean(),
                InfonavitRecordSchema.findOne({ id_conductor, id_compania }).sort({ createdAt: -1 }).lean(),
                getJudicialRecordByConductorId(id_conductor, id_compania),
                getAMLByConductorId(id_conductor, id_compania)
            ]);

            const results = {
                employmentHistory: employmentHistory || null,
                infonavitCredit: infonavitCredit || null,
                judicialRecord: judicialRecord || null,
                lastAmlDirect: amlRecord ? (amlRecord.data?.result_payload?.sanctionlist_sources || []) : null,
            };

            const hasData = Object.values(results).some(value => value && (Array.isArray(value) ? value.length > 0 : Object.keys(value).length > 0));

            return next(GeneralResponsesFactory.dataRetrievedSuccessfully({ data: hasData ? results : null, key: 'aggregatedResults' }));
        } catch (error) {
            next(GeneralErrorsFactory.internalServerErr("Error al obtener resultados agregados."));
        }
    }
};
