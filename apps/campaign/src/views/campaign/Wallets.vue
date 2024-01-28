<template>
    <b-container>
        <b-row>
            <b-col lg="6" offset-lg="3">
                <div v-if="walletStore.isLoading" class="d-flex justify-content-center py-5">
                    <b-spinner variant="primary" small />
                </div>
                <BaseCardRewards v-else />
            </b-col>
        </b-row>
    </b-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapStores } from 'pinia';
import { useWalletStore } from '../../stores/Wallet';

export default defineComponent({
    name: 'BaseCardRewardStore',
    computed: {
        ...mapStores(useWalletStore),
    },
});
</script>
