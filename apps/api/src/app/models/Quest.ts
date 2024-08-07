export const questSchema = {
    uuid: String,
    poolId: String,
    variant: Number,
    title: String,
    description: String,
    image: String,
    index: Number,
    expiryDate: Date,
    infoLinks: [{ label: String, url: String }],
    isPublished: { type: Boolean, default: false },
    locks: { type: [{ questId: String, variant: Number }], default: [] },
};

export const questEntrySchema = {
    poolId: String,
    questId: String,
    sub: String,
    amount: Number,
    ip: String,
};
