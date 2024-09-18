import 'bootstrap-vue-next';

declare module 'bootstrap-vue-next/dist/src/types' {
    export interface BaseColorVariant {
        purple: unknown; // we use unknown type because it does not matter here
        darker: unknown; // darker color variant
    }
    export interface BaseButtonVariant {
        // there is no need to add "purple" (it inherits from BaseColorVariant)
        'outline-purple': unknown; // outline purple button
    }
    export interface BaseTextColorVariant {
        // there is no need to add "purple" (it inherits from BaseColorVariant)
    }
    export interface BaseSize {
        xl: unknown; // extra large
    }
}
