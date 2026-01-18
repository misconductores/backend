const mongoose = require("mongoose");

const Schema = mongoose.Schema;

// Subschema para acuerdos dentro de cada expediente
const acuerdoSchema = new Schema(
    {
        acuerdo: { type: String, required: false },
        fecha: { type: String, required: false },
    },
    { _id: false }
);

// Subschema para expedientes dentro de resultados
const expedienteSchema = new Schema(
    {
        expediente: { type: String, required: false },
        actor: { type: String, required: false },
        demandado: { type: String, required: false },
        entidad: { type: String, required: false },
        juzgado: { type: String, required: false },
        tipo: { type: String, required: false },
        fuero: { type: String, required: false },
        fecha: { type: String, required: false },
        acuerdos: { type: [acuerdoSchema], default: [] },
    },
    { _id: false }
);

const resultadoSchema = new Schema(
    {
        entidad: { type: String, required: false },
        expedientes: { type: [expedienteSchema], default: [] },
    },
    { _id: false }
);

const dataSchema = new Schema(
    {
        numero_resultados: { type: Number, required: false },
        homonimia: { type: String, required: false },
        resultados: { type: [resultadoSchema], default: [] },
    },
    { _id: false }
);

const searchParamsSchema = new Schema(
    {
        nombre: { type: String },
        paterno: { type: String },
        materno: { type: String },
        detalle: { type: String },
        estado: { type: String },
    },
    { _id: false }
);

const consultaSchema = new Schema(
    {
        code: { type: Number, required: true },
        status: { type: String, required: true },
        message: { type: String, required: true },
        data: { type: dataSchema, required: false },
        id_compania: {
            type: String,
            index: true,
            default: null,
            required: true,
        },
        id_conductor: {
            type: String,
            index: true,
            default: null,
            required: true,
        },
        search_params: { type: searchParamsSchema, default: null },
    },
    {
        timestamps: true,
        toObject: { virtuals: true },
        toJSON: { virtuals: true },
    }
);

consultaSchema.index({ id_conductor: 1, createdAt: -1 });

consultaSchema.index({
    "search_params.nombre": 1,
    "search_params.paterno": 1,
    "search_params.materno": 1,
    "search_params.detalle": 1,
    "search_params.estado": 1,
    createdAt: -1,
});

module.exports = mongoose.model("criminal_records", consultaSchema);
