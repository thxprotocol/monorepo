<template>
    <b-modal
        :id="id"
        v-model="isShown"
        @hidden="$emit('hidden')"
        :title="perk.title"
        no-close-on-backdrop
        centered
        no-close-on-esc
    >
        <template #title>
            <i class="fas fa-gift me-2"></i>
            {{ perk.title }}
        </template>
        <div v-if="isLoading" class="text-center">
            <b-spinner show size="sm" />
        </div>
        <template v-else>
            <b-alert v-if="error" show variant="danger" class="p-2">
                <i class="fas fa-exclamation-circle me-2"></i>
                {{ error }}
            </b-alert>
            <p class="m-0">
                You are about to redeem <strong>{{ perk.pointPrice }} points</strong> for
                <strong>{{ perk.title }}</strong>
                . Are you sure?
            </p>
        </template>
        <template #footer>
            <b-button variant="primary" class="w-100 rounded-pill" :disabled="isLoading" @click="$emit('submit')">
                Redeem for {{ perk.pointPrice }} points
            </b-button>
        </template>
    </b-modal>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

export default defineComponent({
    name: 'BaseCardPerkPayment',
    data() {
        return { isShown: false };
    },
    props: {
        id: {
            type: String,
            required: true,
        },
        error: {
            type: String,
        },
        show: {
            type: Boolean,
        },
        isLoading: {
            type: Boolean,
        },
        perk: {
            type: Object as PropType<TPerk>,
            required: true,
        },
    },
    watch: {
        show(value) {
            this.isShown = value;
        },
    },
});
</script>
