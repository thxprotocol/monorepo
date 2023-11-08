<template>
    <b-container class="flex-grow-1 overflow-auto order-lg-1">
        <b-row>
            <b-col lg="10" offset-xl="1">
                <BaseQuestLeaderboard />
            </b-col>
        </b-row>
    </b-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapStores } from 'pinia';
import { useWalletStore } from '../../stores/Wallet';
import { useAuthStore } from '../../stores/Auth';
import { useAccountStore } from '../../stores/Account';

export default defineComponent({
    name: 'Ranking',
    data: function () {
        return { error: '', isSubmitting: false, isModalUpgradeShown: false };
    },
    computed: {
        ...mapStores(useWalletStore),
        ...mapStores(useAuthStore),
        ...mapStores(useAccountStore),
    },
});
</script>
