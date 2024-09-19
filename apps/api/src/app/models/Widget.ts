import mongoose from 'mongoose';

export type WidgetDocument = mongoose.Document & TWidget;

export const Widget = mongoose.model<WidgetDocument>(
    'Widget',
    new mongoose.Schema(
        {
            sub: String,
            slug: String,
            name: String,
            description: String,
            logoImgURL: String,
            backgroundImgURL: String,
            uuid: String,
            poolId: String,
            iconImg: String,
            align: String,
            message: String,
            domain: String,
            theme: String,
            cssSelector: String,
            active: { default: false, type: Boolean },
            isPublished: { type: Boolean, default: true },
        },
        { timestamps: true },
    ),
    'widget',
);
