<template>
    <template v-if="accountStore.account">
        <b-container class="py-5 text-white">
            <h1>Account</h1>
            <p class="lead">Manage account and wallets used for executing transactions.</p>
        </b-container>
        <div class="bg-dark py-5 flex-grow-1">
            <b-container>
                <h3>Personal</h3>
                <b-card variant="darker" class="mb-5">
                    <BaseFormGroup label="E-mail">
                        {{ accountStore.account.email }}
                    </BaseFormGroup>
                    <BaseFormGroup label="Account ID">
                        {{ accountStore.account.sub }}
                    </BaseFormGroup>
                    <BaseFormGroup label="Created">
                        {{ accountStore.account.createdAt }}
                    </BaseFormGroup>
                </b-card>
                <h3>Wallets</h3>
                <b-card variant="darker" class="mb-5">
                    <b-table
                        :items="wallets"
                        align="middle"
                        variant="darker"
                        show-empty
                        hover
                        responsive="lg"
                        :busy="isLoading"
                    >
                        <template #cell(chain)="{ item }">
                            <b-img :src="chainInfo[item.wallet.chainId].logo" width="20" alt="" />
                        </template>
                        <template #cell(address)="{ item }">
                            <b-link
                                :href="`${chainInfo[item.chain].blockExplorer}/address/${item.address.full}`"
                                width="20"
                            >
                                {{ item.address.short }}
                            </b-link>
                        </template>
                        <template #cell(transactions)="{ item }">
                            <b-button v-b-modal="`modalWalletTransactions${item.wallet._id}`" variant="dark" size="sm">
                                <i class="fas fa-exchange-alt me-1 text-muted" />
                                {{ item.transactions.length }}
                            </b-button>
                            <BaseModalWalletTransactions
                                :id="`modalWalletTransactions${item.wallet._id}`"
                                :wallet="item.wallet"
                            />
                        </template>
                        <template #cell(created)="{ item }">
                            {{ item.created }}
                        </template>
                        <template #cell(wallet)="{ item }">
                            <b-dropdown no-caret size="sm" end variant="link">
                                <template #button-content>
                                    <BaseIcon icon="ellipsis-v text-light" />
                                </template>
                                <b-dropdown-item v-b-modal="`modalWalletRemove${item.wallet._id}`">
                                    Delete
                                </b-dropdown-item>
                            </b-dropdown>
                            <b-modal :id="`modalWalletRemove${item.wallet._id}`" centered title="Remove Wallet">
                                Are you sure you want to remove this wallet? This action cannot be undone.
                                <template #footer>
                                    <b-button class="w-100" variant="danger" @click="onClickDelete(item.wallet)">
                                        Remove Wallet
                                    </b-button>
                                </template>
                            </b-modal>
                        </template>
                    </b-table>
                </b-card>
            </b-container>
        </div>
    </template>
</template>

<script lang="ts">
import { useAccountStore } from '@thxnetwork/studio/stores';
import { shortenAddress } from '@thxnetwork/studio/utils/address';
import { chainInfo } from '@thxnetwork/studio/utils/chains';
import { toast } from '@thxnetwork/studio/utils/toast';
import { useModal } from 'bootstrap-vue-next';
import { format } from 'date-fns';
import { mapStores } from 'pinia';
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'Account',
    data() {
        return {
            isLoading: false,
            chainInfo,
        };
    },
    computed: {
        ...mapStores(useAccountStore),
        wallets() {
            return this.accountStore.wallets.map((w) => ({
                chain: w.chainId,
                address: {
                    short: shortenAddress(w.address as `0x${string}`),
                    full: w.address,
                },
                transactions: w.transactions,
                created: format(new Date(w.createdAt), 'yyyy-MM-dd HH:mm'),
                wallet: w,
            }));
        },
    },
    mounted() {
        this.accountStore.get();
        this.accountStore.listWallets();
    },
    methods: {
        async listWallets() {
            try {
                this.isLoading = true;
                await this.accountStore.listWallets();
            } catch (error: any) {
                toast(error.message, 'light', 3000, () => {
                    return;
                });
            } finally {
                this.isLoading = false;
            }
        },
        async onClickDelete(wallet: TWallet) {
            try {
                this.isLoading = true;
                await this.accountStore.removeWallet(wallet._id);
                useModal(`modalWalletRemove${wallet._id}`).hide();
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
