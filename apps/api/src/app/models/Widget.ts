import mongoose from 'mongoose';

export type WidgetDocument = mongoose.Document & TWidget;

export const Widget = mongoose.model<WidgetDocument>(
    'Widget',
    new mongoose.Schema(
        {
            sub: String,
            uuid: String,
            poolId: String,
            // General
            name: String,
            description: String,
            slug: String,
            isPublished: { type: Boolean, default: true },
            domain: String,
            // Theme
            logoImgURL: String,
            backgroundImgURL: String,
            theme: String,
            // Launcher
            message: String,
            align: String,
            color: String,
            bgColor: String,
            iconImg: String,
            cssSelector: String,
            // Deprecated
            active: { default: false, type: Boolean },
        },
        { timestamps: true },
    ),
    'widget',
);
