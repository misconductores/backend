const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const DatosDocProbatorioSchema = new Schema(
    {
        entidadRegistro: { type: String, default: "" },
        tomo: { type: String, default: "" },
        claveMunicipioRegistro: { type: String, default: "" },
        anioReg: { type: String, default: "" },
        claveEntidadRegistro: { type: String, default: "" },
        foja: { type: String, default: "" },
        numActa: { type: String, default: "" },
        libro: { type: String, default: "" },
        municipioRegistro: { type: String, default: "" },
    },
    { _id: false }
);

const CurpDataSchema = new Schema(
    {
        parametro: { type: String, default: "" },
        fechaNacimiento: { type: String, required: true },
        docProbatorio: { type: Number, required: true },
        segundoApellido: { type: String, required: true },
        curp: { type: String, required: true },
        nombres: { type: String, required: true },
        primerApellido: { type: String, required: true },
        sexo: { type: String, required: true },
        claveEntidad: { type: String, required: true },
        statusCurp: { type: String, required: true },
        nacionalidad: { type: String, required: true },
        entidad: { type: String, required: true },
        datosDocProbatorio: { type: DatosDocProbatorioSchema, required: true },
        descriptionStatusCurp: { type: String, required: true },
    },
    { _id: false }
);

const IdentityRecordSchema = new Schema(
    {
        tipo_documento: { type: String, required: true, default: "curp" },
        id_conductor: { type: String, required: true },
        data: {
            gdata: { type: String, default: "" },
            curpdata: { type: [CurpDataSchema], default: [] },
            files: { type: Array, default: [] },
            guid: { type: String, required: true },
        },
    },
    {
        timestamps: true,
        toObject: { virtuals: true },
        toJSON: { virtuals: true },
    }
);

module.exports = mongoose.model("identity_records", IdentityRecordSchema);
