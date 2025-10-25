const {
    roleValidatorMiddleware,
    validatorMiddleware,
    authMiddleware,
} = require("../middleware");

const { catchAsync } = require("../utils");
const fs = require("fs");
const path = require("path");

const {
    roles,
    BODY_PROPERTY,
    QUERY_PROPERTY,
} = require("../constants/usersConstants");
const { backgroundCheckSchema } = require("../schemas");
const backgroundCheckController = require("../controllers/backgroundCheckController");
const router = require("express").Router();

const logMiddleware = (msg) => (req, res, next) => {
    console.log(msg);
    next();
};

// Ruta para consultar antecedentes judiciales
router.post(
    "/antecedentes-judiciales",
    authMiddleware,
    roleValidatorMiddleware({
        allowedRoles: [roles.admin.value, roles.company.value],
    }),

    validatorMiddleware(
        backgroundCheckSchema.validateAntecedentesJudiciales,
        BODY_PROPERTY
    ),
    catchAsync(backgroundCheckController.consultarAntecedentesJudiciales)
);

router.get(
    "/antecedentes-judiciales/resultados",
    authMiddleware,
    roleValidatorMiddleware({
        allowedRoles: [roles.admin.value, roles.company.value],
    }),
    validatorMiddleware(backgroundCheckSchema.validateCurpOrIdConductor, QUERY_PROPERTY),
    catchAsync(async (req, res) => {
        const { id_conductor } = req.query;
        if (!id_conductor) {
            return res.status(400).json({ error: "Falta el parámetro id_conductor" });
        }
        // Buscar antecedentes judiciales en la colección criminal_records usando el id_conductor
        const judicialRecord = await backgroundCheckController.getJudicialRecordByConductorId(id_conductor);
        if (!judicialRecord) {
            return res.status(404).json({ error: "No se encontró registro de antecedentes judiciales para el conductor" });
        }
        return res.json({ body: judicialRecord });
    })
);


// Ruta para consultar AML (Anti-Money Laundering)
router.post(
    "/aml",
    authMiddleware,
    roleValidatorMiddleware({
        allowedRoles: [roles.admin.value, roles.company.value],
    }),
    validatorMiddleware(backgroundCheckSchema.validateAML, BODY_PROPERTY),
    catchAsync(backgroundCheckController.consultarAML)
);

router.get(
    "/aml/resultados",
    authMiddleware,
    roleValidatorMiddleware({
        allowedRoles: [roles.admin.value, roles.company.value],
    }),
    validatorMiddleware(backgroundCheckSchema.validateCurpOrIdConductor, QUERY_PROPERTY),
    catchAsync(async (req, res) => {
        const { id_conductor } = req.query;
        if (!id_conductor) {
            return res.status(400).json({ error: "Falta el parámetro id_conductor" });
        }
        const amlRecord = await backgroundCheckController.getAMLByConductorId(id_conductor);
        if (!amlRecord) {
            return res.status(404).json({ error: "No se encontró registro AML para el conductor" });
        }
        return res.json({ body: amlRecord });
    })
);

// Ruta para validar CURP unicamente
router.post(
    "/curp",
    authMiddleware,
    roleValidatorMiddleware({
        allowedRoles: [roles.admin.value, roles.company.value],
    }),
    validatorMiddleware(backgroundCheckSchema.validateCURP, BODY_PROPERTY),
    catchAsync(backgroundCheckController.consultarCURP)
);

// Ruta para consultar NSS (Número de Seguridad Social) - Asíncrono
router.post("/nss", (req, res) => {
    console.log("Ruta consultada: /nss");
    res.json({
        message: "Consulta NSS recibida",
        data: req.body,
    });
});

// Este endpoint inicia la consulta de historial laboral
router.get(
    "/historial-laboral",
    authMiddleware,
    roleValidatorMiddleware({
        allowedRoles: [roles.company.value, roles.admin.value],
    }),
    validatorMiddleware(backgroundCheckSchema.validateIdConductorIdCompany, QUERY_PROPERTY),
    catchAsync(backgroundCheckController.consultarHistorialLaboralCurp)
);

router.post("/webhook/nss", catchAsync(backgroundCheckController.webhookNSS));

router.post(
    "/webhook/historial-laboral",
    validatorMiddleware(
        backgroundCheckSchema.validateHistorialLaboralCompleto,
        BODY_PROPERTY
    ),
    catchAsync(backgroundCheckController.webhookHistorialLaboral)
);

router.get(
    "/historial-laboral/resultados",
    authMiddleware,
    roleValidatorMiddleware({
        allowedRoles: [roles.company.value, roles.admin.value],
    }),
    validatorMiddleware(
        backgroundCheckSchema.validateCurpOrIdConductor,
        QUERY_PROPERTY
    ),
    catchAsync(backgroundCheckController.getHistorialLaboralCurp)
);

// Ruta para iniciar consulta INFONAVIT
router.post(
    "/infonavit",
    authMiddleware,
    roleValidatorMiddleware({
        allowedRoles: [roles.admin.value, roles.company.value],
    }),
    validatorMiddleware(
        backgroundCheckSchema.validateCurpOrIdConductor,
        BODY_PROPERTY
    ),
    catchAsync(backgroundCheckController.consultarCreditoInfonavit)
);

router.post(
    "/webhook/infonavit/:curp",
    // validatorMiddleware(
    //     backgroundCheckSchema.validateHistorialLaboralCompleto,
    //     BODY_PROPERTY
    // ),
    catchAsync(backgroundCheckController.webhookInfonavit)
);

router.get(
    "/infonavit",
    authMiddleware,
    roleValidatorMiddleware({
        allowedRoles: [roles.admin.value, roles.company.value],
    }),
    validatorMiddleware(
        backgroundCheckSchema.validateCurpOrIdConductor,
        QUERY_PROPERTY
    ),
    catchAsync(backgroundCheckController.consultarCreditoInfonavitResultado)
);

router.post('/back-check-completed', 
    backgroundCheckController.sendBackCheckCompletedEmail);

router.post('/send-email', backgroundCheckController.sendBackCheckSendEmail);

// Ruta para obtener todos los resultados de verificación agregados
router.get(
    "/resultados-agregados",
    authMiddleware,
    roleValidatorMiddleware({
        allowedRoles: [roles.admin.value, roles.company.value],
    }),
    validatorMiddleware(
        backgroundCheckSchema.validateIdConductorIdCompany,
        QUERY_PROPERTY
    ),
    catchAsync(backgroundCheckController.getAggregatedResults)
);

module.exports = router;
