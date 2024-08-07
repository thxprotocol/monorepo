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
    locks: { type: [{ questId: String, variant: Number }], default: [] },
    isPublished: { type: Boolean, default: false },
    isIPLimitEnabled: { type: Boolean, default: false },
};

export const questEntrySchema = {
    poolId: String,
    questId: String,
    sub: String,
    amount: Number,
    ip: String,
};
