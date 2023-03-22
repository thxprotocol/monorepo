<template>
    <div v-if="accountStore.isAuthenticated" class="flex-grow-1 overflow-auto">
        <b-card class="m-2">
            <template v-if="error">
                <b-alert show variant="danger" class="px-2 p-1">
                    <i class="fas fa-exclamation-triangle mr-2"></i>
                    {{ error }}
                </b-alert>
                <p>Something went wrong during your checkout process and you were redirected to this page.</p>
                <b-button variant="success" block class="w-100" :to="`/checkout/${uuid}`">Try again</b-button>
            </template>
            <template v-if="perk && !error">
                <b-alert show variant="success" class="px-2 p-1">
                    <i class="fas fa-check-circle mr-2"></i>
                    Your payment has been received!
                </b-alert>
                <div class="mt-1" v-if="perk.image">
                    <img :src="perk.image" width="auto" class="img-fluid w-auto rounded-2 mb-3" />
                </div>
                <b-card-title class="d-flex">
                    <div class="flex-grow-1">{{ perk.title }}</div>
                    <div class="text-success fw-bold">{{ perk.erc721.symbol }}</div>
                </b-card-title>
                <b-card-text> {{ perk.description }} </b-card-text>
                <b-button variant="success" block class="w-100" @click="toWallet">View Wallet</b-button>
            </template>
        </b-card>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapStores } from 'pinia';
import { usePerkStore } from '../stores/Perk';
import { useAccountStore } from '../stores/Account';
import { useWalletStore } from '../stores/Wallet';

export default defineComponent({
    name: 'Checkout',
    components: {},
    data: function (): {
        uuid: string;
        error: string;
        isLoading: boolean;
    } {
        return { uuid: '', error: '', isLoading: true };
    },
    async mounted() {
        const status = this.$route.query.status as string;
        if (status === 'failed') {
            this.error = 'Your payment has failed.';
        }
        this.uuid = this.$route.params.uuid as string;
        this.isLoading = false;
    },
    computed: {
        ...mapStores(useAccountStore),
        ...mapStores(usePerkStore),
        ...mapStores(useWalletStore),
        perk: function (): TPerk {
            return this.perksStore.perks.filter((p) => p.uuid === this.uuid)[0];
        },
    },
    methods: {
        toWallet() {
            this.walletStore.list();
            this.$router.push('/wallet');
        },
    },
});
</script>
