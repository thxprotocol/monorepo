<template>
    <div v-if="accountStore.isAuthenticated" class="flex-grow-1 overflow-auto">
        <b-alert show variant="success" class="m-2 px-2 p-1">
            <i class="fas fa-check-circle mr-2"></i>
            Your payment has been received!
        </b-alert>
        <b-card class="m-2">
            <div class="mt-1" v-if="perk.image">
                <img :src="perk.image" width="auto" class="img-fluid w-auto rounded-2 mb-3" />
            </div>
            <b-card-title class="d-flex">
                <div class="flex-grow-1">{{ perk.title }}</div>
                <div class="text-success fw-bold">{{ perk.erc721.symbol }}</div>
            </b-card-title>
            <b-card-text> {{ perk.description }} </b-card-text>
            <b-button variant="success" block class="w-100" to="/wallet">View Wallet</b-button>
        </b-card>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapStores } from 'pinia';
import { usePerkStore } from '../stores/Perk';
import { useAccountStore } from '../stores/Account';

export default defineComponent({
    name: 'Checkout',
    components: {},
    data: function (): {
        error: string;
        isLoading: boolean;
    } {
        return { error: '', isLoading: true };
    },
    async mounted() {
        const uuid = this.$route.params.uuid as string;
        await this.perksStore.getERC721Perk(uuid);
        // Start polling the payment intent for its status
        this.isLoading = false;
    },
    computed: {
        ...mapStores(useAccountStore),
        ...mapStores(usePerkStore),
        perk: function (): TPerk {
            const uuid = this.$route.params.uuid as string;
            return this.perksStore.perks.filter((p) => p.uuid === uuid)[0];
        },
    },
});
</script>
