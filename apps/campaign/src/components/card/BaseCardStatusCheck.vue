<template>
    <b-card class="rounded mb-3" body-class="d-flex align-items-center p-0 py-2">
        <b-container>
            <b-row>
                <b-col class="d-flex align-items-center">
                    <i
                        class="fas fa-check-circle me-2"
                        :class="{ 'text-success fa-check-circle': status, 'text-danger fa-times-circle': !status }"
                    />
                    <div>
                        {{ label }}
                        <div class="small text-opaque">{{ description }}</div>
                    </div>
                </b-col>
                <b-col v-if="!status" lg="3" class="d-flex justify-content-end">
                    <slot />
                </b-col>
            </b-row>
        </b-container>
    </b-card>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'BaseCardStatusCheck',
    props: {
        status: Boolean,
        label: String,
        description: String,
    },
});
</script>
