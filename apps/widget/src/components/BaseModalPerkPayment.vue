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
                You are about to purchase <strong>{{ perk.title }}</strong>
                . Are you sure?
            </p>
            <div id="payment-element"></div>
        </template>
        <template #footer>
            <template v-if="perk.price > 0">
                <b-button
                    variant="success"
                    class="w-100 rounded-pill"
                    :disabled="isLoading"
                    :to="`/checkout/${perk.uuid}`"
                >
                    <b-spinner small variant="primary" v-if="isSubmitting" />
                    Pay {{ perk.price }} {{ perk.priceCurrency }}
                </b-button>
                <b-button
                    variant="primary"
                    class="w-100 rounded-pill"
                    :disabled="isLoading"
                    @click="$emit('submit-redemption')"
                >
                    Redeem for {{ perk.pointPrice }} pts
                </b-button>
            </template>
            <b-button
                v-else
                variant="success"
                class="w-100 rounded-pill"
                :disabled="isLoading"
                @click="$emit('submit-redemption')"
            >
                <b-spinner small variant="primary" v-if="isSubmitting" />
                Redeem for {{ perk.pointPrice }} pts
            </b-button>
        </template>
    </b-modal>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { mapStores } from 'pinia';
import { usePerkStore } from '../stores/Perk';

export default defineComponent({
    name: 'BaseCardPerkPayment',
    data() {
        return { isShown: false, isSubmitting: false };
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
    computed: {
        ...mapStores(usePerkStore),
    },
    methods: {
        onClickPayment() {
            this.isSubmitting = true;
            this.perksStore
                .createERC721Payment(this.perk.uuid)
                .then(async (r) => {
                    window.open(r.paymentLink.url, '_blank');
                })
                .catch((r) => {
                    console.log(r);
                    debugger;
                })
                .finally(() => {
                    this.isSubmitting = false;
                });
        },
    },
});
</script>
