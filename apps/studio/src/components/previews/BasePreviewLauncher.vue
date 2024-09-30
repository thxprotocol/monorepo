<template>
    <div
        style="max-width: 250px"
        class="rounded bg-white text-dark d-flex align-items-center justify-content-center p-2 small"
    >
        <p class="m-0">{{ message }}</p>
    </div>
    <div
        class="rounded-circle d-flex my-3"
        :style="{ width: '60px', height: '60px', backgroundColor: getElement(elements, 'Launcher') }"
    >
        <b-img
            v-if="iconImg"
            :src="iconImg"
            class="m-auto"
            style="max-width: 30px; max-height: 30px; width: auto; height: auto"
        />
        <BaseIcon
            v-else
            icon="wallet"
            class="m-auto"
            :style="{ color: getElement(elements, 'Launcher Icon'), fontSize: '1.2rem' }"
        />
    </div>
</template>

<script lang="ts">
import { getElement } from '@thxnetwork/studio/utils/theme';
import { defineComponent, PropType } from 'vue';

export default defineComponent({
    name: 'BasePreviewLauncher',
    props: {
        elements: Object as PropType<any>,
        iconImg: String,
        message: String,
    },
    data() {
        return {
            getElement,
        };
    },
});
</script>
