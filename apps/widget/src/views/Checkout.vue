<template>
    <div v-if="accountStore.isAuthenticated" class="flex-grow-1 overflow-auto px-5">
        <div class="w-100 h-100 d-flex align-items-center justify-content-center flex-column">
            <div id="payment-element"></div>
            <div id="error-message"></div>
            <b-spinner v-if="isLoading" variant="primary" />
            <b-button v-else variant="primary" class="mt-3 w-100" @click="onClickPay">Pay</b-button>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapStores } from 'pinia';
import { usePerkStore } from '../stores/Perk';
import { useAccountStore } from '../stores/Account';
import { Stripe, StripeElements, loadStripe } from '@stripe/stripe-js';
import { STRIPE_PUBLISHABLE_KEY } from '../config/secrets';

export default defineComponent({
    name: 'Checkout',
    components: {},
    data: function (): {
        error: string;
        isLoading: boolean;
        stripe: Stripe | null;
        elements: StripeElements | null;
    } {
        return { error: '', isLoading: false, stripe: null, elements: null };
    },
    async mounted() {
        const uuid = this.$route.params.uuid as string;
        if (!uuid) return;
        this.isLoading = true;

        this.stripe = await loadStripe(STRIPE_PUBLISHABLE_KEY);
        if (!this.stripe) return;

        const { clientSecret } = await this.perksStore.createERC721Payment(uuid);
        this.elements = this.stripe.elements({
            clientSecret,
            appearance: {
                theme: 'flat',
                variables: {
                    fontFamily: 'Arial',
                    colorPrimary: '#5942c1',
                    colorBackground: '#31236D',
                    colorText: '#ffffff',
                    colorDanger: '#fc4b23',
                    spacingUnit: '0px',
                    borderRadius: '.375rem',
                },
            },
        });
        const paymentElement = this.elements.create('payment');
        paymentElement.mount('#payment-element');

        this.isLoading = false;
    },
    computed: {
        ...mapStores(useAccountStore),
        ...mapStores(usePerkStore),
    },
    methods: {
        async onClickPay() {
            if (!this.stripe) return;
            const { origin } = this.accountStore.getConfig(this.accountStore.poolId);
            const { error } = await this.stripe.confirmPayment({
                elements: this.elements as StripeElements,
                redirect: 'if_required',
                confirmParams: {
                    return_url: origin,
                },
            });

            if (error) {
                this.error = String(error.message);
            } else {
                this.$router.push('/checkout/' + this.$route.params.uuid + '/complete');
            }
        },
    },
});
</script>
