const mongoose = require("mongoose");
const { Schema } = mongoose;

/** Sub-esquemas reutilizables **/
const SourceSchema = new Schema(
    {
        source_name: { type: String, default: "" },
        source_full_name: { type: String, default: "" },
        source_version: { type: String, default: "" },
    },
    { _id: false }
);

const AkaSchema = new Schema(
    {
        name: { type: String, default: "" },
        original: { type: String, default: "" },
        type: { type: String, default: "" },
    },
    { _id: false }
);

const AttributeSchema = new Schema(
    {
        key: { type: String, default: "" },
        value: { type: String, default: "" },
    },
    { _id: false }
);

const SanctionEntrySchema = new Schema(
    {
        found: {
            type: String,
            enum: ["exact", "fuzzy", "alias", "unknown", ""],
            default: "unknown",
        },
        id: { type: Number },
        name: { type: String, index: true },
        addresses: { type: [Schema.Types.Mixed], default: [] },
        akas: { type: [AkaSchema], default: [] },
        nationality: { type: String, default: "" },
        country: { type: String, default: "" },
        program: { type: String, default: "" },
        source: { type: SourceSchema, default: () => ({}) },
        attributes: { type: [AttributeSchema], default: [] },
        birth_precision: { type: String, default: "" },
        birth_date: { type: String, default: "" },
        birth_place: { type: String, default: "" },
        mother_name: { type: String, default: "" },
        id_number: { type: String, default: "" },
        id_type: { type: String, default: "" },
        first_seen: { type: Date },
        last_seen: { type: Date },
    },
    { _id: false }
);

const ResultPayloadSchema = new Schema(
    {
        searched_at: { type: Date },
        sanctionlist_sources: { type: [SourceSchema], default: [] },
        crimelist_entries: { type: [Schema.Types.Mixed], default: [] },
        watchlist_entries: { type: [Schema.Types.Mixed], default: [] },
        sanctionlist_entries: { type: [SanctionEntrySchema], default: [] },
        pep_entries: { type: [Schema.Types.Mixed], default: [] },
    },
    { _id: false }
);

const BlackListSchema = new Schema(
    {
        id_conductor: { type: String, required: true },
        id_compania: { type: String, required: true },
        data: {
            has_crimelist_match: { type: Boolean, default: false },
            has_pep_match: { type: Boolean, default: false },
            has_watchlist_match: { type: Boolean, default: false },
            has_sanction_match: { type: Boolean, default: false },
            result_payload: { type: ResultPayloadSchema, default: () => ({}) },
        },
    },
    {
        timestamps: true,
        toObject: { virtuals: true },
        toJSON: { virtuals: true },
    }
);

BlackListSchema.index({ "data.result_payload.sanctionlist_entries.name": 1 });
BlackListSchema.index({ "data.result_payload.sanctionlist_entries.id": 1 });

module.exports = mongoose.model("black_lists", BlackListSchema, "black_lists");
