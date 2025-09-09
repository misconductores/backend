const mongoose = require("mongoose");

const Schema = mongoose.Schema;

// Subschema para data
const creditoDataSchema = new Schema(
    {
        estatus_credito: { type: String, required: false },
        producto_credito: { type: String, required: false },
        numero_credito: { type: String, required: false },
        fecha_otorgamiento: { type: String, required: false },
    },
    { _id: false }
);

// Esquema principal
const infonavitRecordSchema = new Schema(
    {
        id_request: { type: String, required: true },
        status: { type: String, required: true },
        numero_seguro_social: { type: String, required: true },
        curp: { type: String, required: true },
        id_conductor: { type: String, required: true },
        data: { type: creditoDataSchema, required: false },
    },
    {
        timestamps: true,
        toObject: { virtuals: true },
        toJSON: { virtuals: true },
        collection: "infonavit_records",
    }
);

module.exports = mongoose.model("InfonavitRecord", infonavitRecordSchema);
