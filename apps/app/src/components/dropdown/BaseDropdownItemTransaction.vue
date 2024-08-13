<template>
    <div class="d-flex align-items-center">
        <b-spinner small class="me-2" />
        {{ tx.safeTxHash.substring(0, 8) }}...
        <b-button :href="tx.safeTxHash" target="_blank" variant="link">
            <i class="fas fa-external-link-alt small" />
        </b-button>
        <b-button size="sm" variant="link" @click.stop="onClickRefresh(tx._id)">
            <b-spinner v-if="isLoadingRefresh" small class="me-2" />
            <i v-else class="fas fa-sync-alt small" />
        </b-button>
        <b-button size="sm" variant="link" @click.stop="onClickRemove(tx)">
            <b-spinner v-if="isLoadingRemove" small class="me-2" />
            <i v-else class="fas fa-trash text-danger" />
        </b-button>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { mapStores } from 'pinia';
import { useWalletStore } from '../../stores/Wallet';
import { useAccountStore } from '../../stores/Account';
import { TransactionState } from '@thxnetwork/common/enums';

export default defineComponent({
    name: 'BaseDropdownItemTransaction',
    props: {
        tx: { type: Object as PropType<TTransaction>, required: true },
    },
    data() {
        return {
            isLoadingRefresh: false,
            isLoadingRemove: false,
            TransactionState,
        };
    },
    computed: {
        ...mapStores(useWalletStore, useAccountStore),
    },
    methods: {
        async onClickRefresh(transactionId: string) {
            this.isLoadingRefresh = true;
            try {
                await this.walletStore.getTransaction(transactionId);
            } catch (error: any) {
                console.error(error);
            } finally {
                this.isLoadingRefresh = false;
            }
        },
        async onClickRemove(tx: TTransaction) {
            this.isLoadingRemove = true;
            try {
                await this.walletStore.removeTransaction(tx);
            } catch (error) {
                console.error(error);
            } finally {
                this.isLoadingRemove = false;
            }
        },
    },
});
</script>
