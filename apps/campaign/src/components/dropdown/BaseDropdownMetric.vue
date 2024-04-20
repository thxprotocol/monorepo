<template>
    <b-dropdown no-caret variant="link" toggle-class="text-white text-decoration-none p-0" menu-class="p-0 rounded">
        <template #button-content>
            <div class="d-block-inline rounded fw-normal text-start" variant="primary">
                <div class="small text-opaque">
                    {{ label }}
                    <i class="fas fa-question-circle" />
                </div>
                <div class="lead fw-bold">
                    <span>{{ value }}</span>
                </div>
            </div>
        </template>
        <div style="width: 240px" class="small">
            <b-card v-for="metric of metrics" class="rounded-0" body-class="p-2" header-class="d-flex p-2">
                <template #header>
                    {{ metric.label }}
                    <b-link class="text-white text-opaque" :href="metric.url" target="_blank">
                        <i class="fas fa-external-link-alt ms-2" />
                    </b-link>
                    <span class="ms-auto text-accent">
                        {{ metric.badge }}
                    </span>
                </template>
                <div v-for="m of metric.data" class="d-flex">
                    <span class="text-opaque"> {{ m.label }} </span>
                    <span class="ms-auto"> {{ m.value }} </span>
                </div>
            </b-card>
        </div>
    </b-dropdown>
</template>

<script lang="ts">
import { PropType } from 'vue';
import { defineComponent } from 'vue';

type TMetric = {
    label: string;
    url: string;
    badge: string;
    data: { label: string; value: string }[];
};

export default defineComponent({
    name: 'BaseDropdownMetric',
    props: {
        label: String,
        value: String,
        metrics: { type: Object as PropType<TMetric[]>, required: true },
    },
});
</script>
