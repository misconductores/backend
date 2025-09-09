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

// Subschema para resultados dentro de data
const resultadoSchema = new Schema(
    {
        entidad: { type: String, required: false },
        expedientes: { type: [expedienteSchema], default: [] },
    },
    { _id: false }
);

// Subschema de data principal
const dataSchema = new Schema(
    {
        numero_resultados: { type: Number, required: false },
        homonimia: { type: String, required: false },
        resultados: { type: [resultadoSchema], default: [] },
    },
    { _id: false }
);

// Esquema principal
const consultaSchema = new Schema(
    {
        code: { type: Number, required: true },
        status: { type: String, required: true },
        message: { type: String, required: true },
        data: { type: dataSchema, required: false },
    },
    {
        timestamps: true,
        toObject: { virtuals: true },
        toJSON: { virtuals: true },
    }
);

module.exports = mongoose.model("criminal_records", consultaSchema);
