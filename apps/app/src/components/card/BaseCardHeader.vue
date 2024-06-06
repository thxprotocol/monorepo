<template>
    <b-container
        class="mt-4"
        :style="{
            backgroundSize: 'cover',
            backgroundImage: `url(${imgSrc || imgBgOverlay})`,
            borderRadius: '15px',
        }"
    >
        <b-row :class="rowClass">
            <b-col lg="4" offset-lg="1" class="pb-0 pt-4 pt-lg-0 text-white brand-intro align-items-center d-flex">
                <div class="py-5">
                    <slot name="primary" />
                </div>
            </b-col>
            <b-col
                lg="5"
                offset-lg="1"
                class="py-4 py-lg-0"
                :style="{
                    backgroundImage: `url(${imgEnd})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center top',
                }"
            >
                <slot name="secondary" />
            </b-col>
        </b-row>
    </b-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import imgBgOverlay from '../../assets/bg-overlay.png';

export default defineComponent({
    name: 'BaseCardHeader',
    props: {
        rowClass: {
            type: String,
            default: 'py-md-5',
        },
        imgSrc: {
            type: String,
            default: '',
        },
    },
    data(): any {
        return {
            imgBgOverlay,
        };
    },
});
</script>
