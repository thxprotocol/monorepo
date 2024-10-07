<template>
    <b-card
        header-class="p-0"
        class="mt-5"
        :style="{
            backgroundColor: getElement(elements, 'Background'),
            color: getElement(elements, 'Text'),
            maxWidth: '380px',
        }"
    >
        <template #header>
            <b-navbar class="p-2 px-1" :style="{ backgroundColor: getElement(elements, 'Navigation') }">
                <b-navbar-brand href="#">
                    <b-img :src="logoImg" height="35"></b-img>
                </b-navbar-brand>
                <b-button
                    size="sm"
                    variant="primary"
                    class="border-0 p-2 px-3"
                    :style="{
                        backgroundColor: getElement(elements, 'Navigation Button'),
                        color: getElement(elements, 'Navigation Button Text'),
                    }"
                >
                    Login
                    <BaseIcon icon="sign-in-alt" class="ms-2" />
                </b-button>
            </b-navbar>
        </template>
        <div class="alert border-0 p-2" :style="{ backgroundColor: getColor(colors, 'Success') }">
            <BaseIcon icon="info-circle" class="mx-2" />
            Lorem ipsum dolor sit amet
        </div>
        <div class="alert border-0 p-2" :style="{ backgroundColor: getColor(colors, 'Danger') }">
            <BaseIcon icon="exclamation-circle" class="mx-2" />
            Lorem ipsum dolor sit amet
        </div>
        <p :style="{ color: getElement(elements, 'Text') }">Lorem ipsum dolor sit amet.</p>
        <b-card
            :style="{ backgroundColor: getElement(elements, 'Card') }"
            img-src="https://placehold.co/600x300?text=Collectible&font=Manrope"
        >
            <p :style="{ color: getElement(elements, 'Card Text') }">Lorem ipsum dolor sit amet</p>
            <b-button
                class="border-0 w-100"
                :style="{ backgroundColor: getElement(elements, 'Button'), color: getElement(elements, 'Button Text') }"
            >
                Collect
            </b-button>
        </b-card>
    </b-card>
</template>

<script lang="ts">
import { getColor, getElement } from '@thxnetwork/studio/utils/theme';
import { defineComponent, PropType } from 'vue';

export default defineComponent({
    name: 'BasePreviewLauncher',
    props: {
        colors: Object as PropType<any>,
        elements: Object as PropType<any>,
        logoImg: String,
    },
    data() {
        return {
            getElement,
            getColor,
        };
    },
});
</script>
