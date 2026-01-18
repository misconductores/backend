const mongoose = require("mongoose");

const Schema = mongoose.Schema;

// Subschema para datos dentro de OCR
const ocrDatosSchema = new Schema(
    {
        nombre: { type: String, required: false },
        curp: { type: String, required: false },
        nss: { type: String, required: false },
        fecha_emision: { type: String, required: false },
        semanas_cotizadas: { type: Number, required: false },
        semanas_descontadas: { type: Number, required: false },
        semanas_reintegradas: { type: Number, required: false },
    },
    { _id: false }
);

// Subschema para empleos
const empleoSchema = new Schema(
    {
        patron: { type: String, required: false },
        registro_patronal: { type: String, required: false },
        entidda_federativa: { type: String, required: false },
        fecha_alta: { type: String, required: false },
        fecha_baja: { type: String, required: false },
        salario_base: { type: String, required: false },
    },
    { _id: false }
);

// Subschema OCR completo
const ocrSchema = new Schema(
    {
        datos: { type: ocrDatosSchema, required: false },
        empleos: { type: [empleoSchema], default: [] },
    },
    { _id: false }
);

// Esquema principal
const employmentHistorySchema = new Schema(
    {
        id_compania: { type: String, required: true },
        id_conductor: { type: String, required: true },
        request_id: { type: String, required: true },
        request_status: { type: String, required: true },
        request_history_id: { type: String, required: false },
        numero_seguridad_social: { type: String, required: false },
        curp: { type: String, required: true },
        base64_semanas_cotizadas_nss: { type: String, default: "" },
        ocr: { type: ocrSchema, required: false },
    },
    {
        timestamps: true,
        toObject: { virtuals: true },
        toJSON: { virtuals: true },
    }
);

module.exports = mongoose.model("EmploymentHistory", employmentHistorySchema);
