const Yup = require("yup");
const { validatorUtils } = require("../utils");

// CURP
function buildCurpSchema() {
    return Yup.object().shape({
        curp: Yup.string()
            .required("CURP es requerido")
            .length(18, "CURP debe tener exactamente 18 caracteres")
            .matches(
                /^([A-Z][AEIOUX][A-Z]{2}\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])[HM](?:AS|B[CS]|C[CLMSH]|D[FG]|G[TR]|HG|JC|M[CNS]|N[ETL]|OC|PL|Q[TR]|S[PLR]|T[CSL]|VZ|YN|ZS)[B-DF-HJ-NP-TV-Z]{3}[A-Z\d])(\d)$/,
                "Formato de CURP inválido"
            ),
        id_conductor: Yup.string()
            .required("ID del conductor es requerido")
            .matches(
                /^[0-9a-fA-F]{24}$/,
                "ID del conductor debe ser un ObjectId válido (24 caracteres hexadecimales)"
            ),
        id_compania: Yup.string()
            .required("ID de la compania es requerido")
            .matches(
                /^[0-9a-fA-F]{24}$/,
                "ID de la compania debe ser un ObjectId válido (24 caracteres hexadecimales)"
            ),
    });
}
module.exports.validateCURP = (data) => {
    const schema = buildCurpSchema();
    return validatorUtils.validate(schema, data);
};

// Solo validación de CURP (sin ID de conductor)
function buildCurpOnlySchema() {
    return Yup.object().shape({
        curp: Yup.string()
            .required("CURP es requerido")
            .length(18, "CURP debe tener exactamente 18 caracteres")
            .matches(
                /^([A-Z][AEIOUX][A-Z]{2}\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])[HM](?:AS|B[CS]|C[CLMSH]|D[FG]|G[TR]|HG|JC|M[CNS]|N[ETL]|OC|PL|Q[TR]|S[PLR]|T[CSL]|VZ|YN|ZS)[B-DF-HJ-NP-TV-Z]{3}[A-Z\d])(\d)$/,
                "Formato de CURP inválido"
            ),
    });
}

module.exports.validateCurpOnly = (data) => {
    const schema = buildCurpOnlySchema();
    return validatorUtils.validate(schema, data);
};

// Validación que requiere CURP O ID Conductor (al menos uno)
function buildCurpOrIdConductorSchema() {
    return Yup.object()
        .shape({
            curp: Yup.string()
                .optional()
                .test(
                    "curp-format",
                    "Formato de CURP inválido",
                    function (value) {
                        if (!value) return true; // opcional
                        return (
                            value.length === 18 &&
                            /^([A-Z][AEIOUX][A-Z]{2}\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])[HM](?:AS|B[CS]|C[CLMSH]|D[FG]|G[TR]|HG|JC|M[CNS]|N[ETL]|OC|PL|Q[TR]|S[PLR]|T[CSL]|VZ|YN|ZS)[B-DF-HJ-NP-TV-Z]{3}[A-Z\d])(\d)$/.test(
                                value
                            )
                        );
                    }
                ),
            id_compania: Yup.string()
                .required("ID de la compania es requerido")
                .matches(
                    /^[0-9a-fA-F]{24}$/,
                    "ID de la compania debe ser un ObjectId válido (24 caracteres hexadecimales)"
                ),
            id_conductor: Yup.string()
                .optional()
                .test(
                    "id-format",
                    "ID del conductor debe ser un ObjectId válido (24 caracteres hexadecimales)",
                    function (value) {
                        if (!value) return true; // opcional
                        return /^[0-9a-fA-F]{24}$/.test(value);
                    }
                ),
        })
        .test(
            "at-least-one-required",
            "Se debe proporcionar al menos CURP o ID del conductor",
            function (value) {
                const hasCurp =
                    value && value.curp && value.curp.trim().length > 0;
                const hasIdConductor =
                    value &&
                    value.id_conductor &&
                    value.id_conductor.trim().length > 0;
                return hasCurp || hasIdConductor;
            }
        );
}

module.exports.validateCurpOrIdConductor = (data) => {
    const schema = buildCurpSchema();
    return validatorUtils.validate(schema, data);
};
module.exports.validateIdConductorIdCompany = (data) => {
    const schema = buildCurpOrIdConductorSchema();
    return validatorUtils.validate(schema, data);
};

// Antecedentes judiciales
function buildAntecedentesJudicialesSchema() {
    return Yup.object().shape({
        //ID de la compañia: requerido y debe ser un ObjectId válido
        id_compania: Yup.string()
            .required("El ID de la compania es obligatorio")
            .test(
                "id-format",
                "ID de la compania debe ser un ObjectId válido (24 caracteres hexadecimales)",
                function (value) {
                    if (!value) return false;
                    return /^[0-9a-fA-F]{24}$/.test(value);
                }
            ),
        // ID del conductor: requerido y debe ser un ObjectId válido
        id_conductor: Yup.string()
            .required("El ID del conductor es obligatorio")
            .test(
                "id-format",
                "ID del conductor debe ser un ObjectId válido (24 caracteres hexadecimales)",
                function (value) {
                    if (!value) return false;
                    return /^[0-9a-fA-F]{24}$/.test(value);
                }
            ),

        // Nombre de la persona física. Es requerido.
        nombre: Yup.string()
            .required("Nombre es requerido")
            .min(1, "Nombre no puede estar vacío"),

        // Apellido paterno de la persona física. Es requerido.
        paterno: Yup.string()
            .required("Apellido paterno es requerido")
            .min(1, "Apellido paterno no puede estar vacío"),

        // Apellido materno de la persona física.
        materno: Yup.string()
            .required(
                'Apellido materno es requerido (usar " " si no tiene apellido materno)'
            )
            .test(
                "materno-espacio",
                'Si no tiene apellido materno debe ser un espacio en blanco (" ")',
                (val) =>
                    typeof val === "string" &&
                    (val.trim().length > 0 || val === " ")
            ),

        // Detalle: booleano opcional
        detalle: Yup.boolean(),

        // Estado: Si es por Entidad se escribe la abreviatura, si es por Nacional se escribe "nacional".
        estado: Yup.string().test(
            "valid-estado",
            'Estado debe ser una abreviatura válida (2 letras mayúsculas) o "nacional"',
            (value) => {
                if (!value) return true;
                return value === "nacional" || /^[A-Z]{2}$/.test(value);
            }
        ),
    });
}
module.exports.validateAntecedentesJudiciales = (data) => {
    const schema = buildAntecedentesJudicialesSchema();
    return validatorUtils.validate(schema, data);
};

// AML
function buildAmlSchema() {
    return Yup.object().shape({
        id_compania: Yup.string()
            .required("ID de la compania es requerido")
            .matches(
                /^[0-9a-fA-F]{24}$/,
                "ID de la compania debe ser un ObjectId válido (24 caracteres hexadecimales)"
            ),
        id_conductor: Yup.string()
            .required("ID del conductor es requerido")
            .matches(
                /^[0-9a-fA-F]{24}$/,
                "ID del conductor debe ser un ObjectId válido (24 caracteres hexadecimales)"
            ),
        nombre_completo: Yup.string()
            .optional()
            .min(2, "Nombre completo debe tener al menos 2 caracteres")
            .max(100, "Nombre completo no puede exceder 100 caracteres"),
        primer_nombre: Yup.string()
            .optional()
            .max(50, "Primer nombre no puede exceder 50 caracteres"),
        segundo_nombre: Yup.string()
            .optional()
            .max(50, "Segundo nombre no puede exceder 50 caracteres"),
        apellidos: Yup.string()
            .optional()
            .max(100, "Apellidos no pueden exceder 100 caracteres"),
        fecha_nacimiento: Yup.string()
            .optional()
            .matches(
                /^(\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4})$/,
                "Formato de fecha inválido (YYYY-MM-DD o DD/MM/YYYY)"
            ),
        lugar_nacimiento: Yup.string()
            .optional()
            .max(100, "Lugar de nacimiento no puede exceder 100 caracteres"),
    });
}
module.exports.validateAML = (data) => {
    const schema = buildAmlSchema();
    return validatorUtils.validate(schema, data);
};

// NSS
function buildNssSchema() {
    return Yup.object().shape({
        curp: Yup.string()
            .required("CURP es requerido para consultar NSS")
            .length(18, "CURP debe tener exactamente 18 caracteres")
            .matches(
                /^[A-Z]{4}[0-9]{6}[HM][A-Z]{5}[0-9A-Z]{2}$/,
                "Formato de CURP inválido"
            ),
    });
}
module.exports.validateNSS = (data) => {
    const schema = buildNssSchema();
    return validatorUtils.validate(schema, data);
};

// Batch antecedentes judiciales
function buildBatchBackgroundCheckSchema() {
    return Yup.object().shape({
        personas: Yup.array()
            .of(
                Yup.object().shape({
                    ...buildAntecedentesJudicialesSchema().fields,
                    id_interno: Yup.string().optional(),
                })
            )
            .min(1, "Debe incluir al menos una persona")
            .max(10, "Máximo 10 personas por lote"),
    });
}
module.exports.validateBatchBackgroundCheck = (data) => {
    const schema = buildBatchBackgroundCheckSchema();
    return validatorUtils.validate(schema, data);
};

// Comprehensive check
function buildComprehensiveCheckSchema() {
    return Yup.object().shape({
        ...buildAntecedentesJudicialesSchema().fields,
        ...buildAmlSchema().fields,
        curp: buildCurpSchema().fields.curp,
        incluir_nss: Yup.boolean().optional().default(false),
        incluir_aml: Yup.boolean().optional().default(true),
        incluir_antecedentes: Yup.boolean().optional().default(true),
    });
}
module.exports.validateComprehensiveCheck = (data) => {
    const schema = buildComprehensiveCheckSchema();
    return validatorUtils.validate(schema, data);
};

// Historial Laboral Completo (Webhook)
function buildHistorialLaboralCompletoSchema() {
    return Yup.object().shape({
        status: Yup.string()
            .required("Status es requerido")
            .oneOf(
                ["success", "error", "pending"],
                "Status debe ser success, error o pending"
            ),
        code: Yup.number()
            .required("Code es requerido")
            .integer("Code debe ser un número entero"),
        message: Yup.string()
            .required("Message es requerido")
            .min(1, "Message no puede estar vacío"),
        data: Yup.object()
            .shape({
                numero_seguridad_social: Yup.string()
                    .required("Número de seguridad social es requerido")
                    .min(1, "NSS no puede estar vacío"),
                curp: Yup.string()
                    .required("CURP es requerido")
                    .length(18, "CURP debe tener exactamente 18 caracteres")
                    .matches(
                        /^([A-Z][AEIOUX][A-Z]{2}\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])[HM](?:AS|B[CS]|C[CLMSH]|D[FG]|G[TR]|HG|JC|M[CNS]|N[ETL]|OC|PL|Q[TR]|S[PLR]|T[CSL]|VZ|YN|ZS)[B-DF-HJ-NP-TV-Z]{3}[A-Z\d])(\d)$/,
                        "Formato de CURP inválido"
                    ),
                base64_semanas_cotizadas_nss: Yup.string().default(""),
                ocr: Yup.object()
                    .shape({
                        datos: Yup.object()
                            .shape({
                                nombre: Yup.string()
                                    .required("Nombre es requerido")
                                    .min(1, "Nombre no puede estar vacío"),
                                curp: Yup.string()
                                    .required("CURP en datos es requerido")
                                    .length(
                                        18,
                                        "CURP debe tener exactamente 18 caracteres"
                                    ),
                                nss: Yup.string()
                                    .required("NSS en datos es requerido")
                                    .min(1, "NSS no puede estar vacío"),
                                // Los siguientes campos son opcionales
                                fecha_emision: Yup.string().optional(),
                                semanas_cotizadas: Yup.number().optional(),
                                semanas_descontadas: Yup.number().optional(),
                                semanas_reintegradas: Yup.number().optional(),
                            })
                            .required("Datos OCR son requeridos"),
                        empleos: Yup.array()
                            .of(
                                Yup.object().shape({
                                    // Todos los campos de empleos son opcionales
                                    patron: Yup.string().optional(),
                                    registro_patronal: Yup.string().optional(),
                                    entidda_federativa: Yup.string().optional(),
                                    fecha_alta: Yup.string().optional(),
                                    fecha_baja: Yup.string().optional(),
                                    salario_base: Yup.string().optional(),
                                })
                            )
                            .default([]),
                    })
                    .required("OCR es requerido"),
            })
            .required("Data es requerido"),
    });
}
module.exports.validateHistorialLaboralCompleto = async (data) => {
    const schema = buildHistorialLaboralCompletoSchema();
    return await validatorUtils.validate(schema, data);
};

// Webhook NSS (Datos de Seguridad Social)
function buildWebhookNssSchema() {
    return Yup.object().shape({
        code: Yup.number()
            .required("Code es requerido")
            .integer("Code debe ser un número entero"),
        status: Yup.string().required("Status es requerido"),
        message: Yup.string().required("Message es requerido"),
        data: Yup.object()
            .shape({
                numero_seguridad_social: Yup.string()
                    .required("Número de seguridad social es requerido")
                    .min(1, "NSS no puede estar vacío"),
                curp: Yup.string()
                    .required("CURP es requerido")
                    .length(18, "CURP debe tener exactamente 18 caracteres")
                    .matches(
                        /^([A-Z][AEIOUX][A-Z]{2}\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])[HM](?:AS|B[CS]|C[CLMSH]|D[FG]|G[TR]|HG|JC|M[CNS]|N[ETL]|OC|PL|Q[TR]|S[PLR]|T[CSL]|VZ|YN|ZS)[B-DF-HJ-NP-TV-Z]{3}[A-Z\d])(\d)$/,
                        "Formato de CURP inválido"
                    ),
                nombres: Yup.string()
                    .required("Nombres es requerido")
                    .min(1, "Nombres no puede estar vacío"),
                // Los siguientes campos son opcionales
                apellido_paterno: Yup.string().optional(),
                apellido_materno: Yup.string().optional(),
                fecha_nacimiento: Yup.string().optional(),
                lugar_nacimiento: Yup.string().optional(),
                sexo: Yup.string().optional(),
                base64_tarjeta_nss: Yup.string().optional(),
                base64_comprobante_localizacion: Yup.string().optional(),
            })
            .required("Data es requerido"),
    });
}
module.exports.validateWebhookNss = async (data) => {
    const schema = buildWebhookNssSchema();
    return await validatorUtils.validate(schema, data);
};
