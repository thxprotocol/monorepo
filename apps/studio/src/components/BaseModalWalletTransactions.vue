<template>
    <b-modal :id="id" centered hide-footer size="xl" title="Transactions">
        <b-table show-empty hover :items="transactions" responsive="lg">
            <template #cell(created)="{ item }">
                <span v-b-tooltip :title="`Updated: ${item.created.updated}`" class="text-muted">
                    {{ item.created.created }}
                </span>
            </template>
            <template #cell(safeTxHash)="{ item }">
                {{ item.safeTxHash.label }}...
                <b-link v-if="item.safeTxHash.url" :href="item.safeTxHash.url" target="_blank">
                    <i class="fas fa-external-link-alt ml-1" />
                </b-link>
            </template>
            <template #cell(transactionHash)="{ item }">
                {{ item.transactionHash.label }}...
                <b-link v-if="item.transactionHash.url" :href="item.transactionHash.url" target="_blank">
                    <i class="fas fa-external-link-alt ml-1" />
                </b-link>
            </template>
            <template #head(state)="{}">
                State
                <i
                    v-b-tooltip
                    class="fas fa-info-circle ml-1 text-muted"
                    title="Queued, Confirmed, Sent, Mined, Failed"
                />
            </template>
            <template #cell(state)="{ item }">
                <b-badge :variant="item.state.variant" class="p-2">{{ item.state.label }}</b-badge>
            </template>
            <template #head(tx)="{}"> &nbsp; </template>
            <template #cell(tx)="{ item }">
                <b-dropdown size="sm" variant="link" end no-caret>
                    <template #button-content>
                        <i class="fas fa-ellipsis-h ml-0 text-muted" />
                    </template>
                    <b-dropdown-item @click="onClickDelete(item.tx)">Delete</b-dropdown-item>
                </b-dropdown>
            </template>
        </b-table>
    </b-modal>
</template>

<script lang="ts">
import { TransactionState } from '@thxnetwork/common/enums';
import { chainInfo } from '@thxnetwork/studio/utils/chains';
import { toast } from '@thxnetwork/studio/utils/toast';
import { format } from 'date-fns';
import { mapStores } from 'pinia';
import { defineComponent, PropType } from 'vue';
import { useAccountStore } from '../stores';

const stateVariantMap: any = {
    [TransactionState.Queued]: 'light',
    [TransactionState.Confirmed]: 'light',
    [TransactionState.Sent]: 'light',
    [TransactionState.Mined]: 'light',
    [TransactionState.Failed]: 'danger',
};

export default defineComponent({
    name: 'BaseModalWalletTransactions',
    props: {
        id: String,
        wallet: Object as PropType<TWallet>,
    },
    data() {
        return {
            TransactionState,
            isLoading: false,
        };
    },
    computed: {
        ...mapStores(useAccountStore),
        transactions() {
            if (!this.wallet) return [];

            return this.wallet.transactions.map((tx) => ({
                created: {
                    created: format(new Date(tx.createdAt), 'dd-MM-yyyy HH:mm:ss'),
                    updated: format(new Date(tx.updatedAt), 'dd-MM-yyyy HH:mm:ss'),
                },
                safeTxHash: {
                    label: tx.safeTxHash ? tx.safeTxHash.substring(0, 10) : 'Pending',
                    url:
                        tx.safeTxHash &&
                        `${chainInfo[this.wallet?.chainId].safeURL}/transactions/history?safe=${this.wallet?.address}`,
                },
                transactionHash: {
                    label: tx.transactionHash ? tx.transactionHash.substring(0, 10) : 'Pending',
                    url:
                        tx.transactionHash &&
                        `${chainInfo[this.wallet?.chainId].blockExplorer}/tx/${tx.transactionHash}`,
                },
                state: {
                    label: TransactionState[tx.state],
                    variant: stateVariantMap[tx.state],
                },
                tx,
            }));
        },
    },
    methods: {
        async onClickDelete(tx: TTransaction) {
            try {
                this.isLoading = true;
                await this.accountStore.removeTransaction(tx._id);
            } catch (error: any) {
                toast(error.message, 'light', 3000, () => {
                    return;
                });
            } finally {
                this.isLoading = false;
            }
        },
    },
});
</script>
