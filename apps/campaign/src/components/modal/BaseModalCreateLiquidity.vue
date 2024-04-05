<template>
    <b-modal v-model="isShown" centered hide-footer @hidden="$emit('hidden')" @show="onShow">
        <template #header>
            <strong class="text-accent">Stake 20USDC-80THX @ Balancer</strong>
            <b-link class="btn-close" @click="$emit('hidden')">
                <i class="fas fa-times"></i>
            </b-link>
        </template>
        <b-alert v-model="isAlertInfoShown" variant="info" class="py-2 px-3">
            <i class="fas fa-exclamation-circle me-1"></i>
            {{ error }}
        </b-alert>
        <b-tabs v-model="tabIndex" pills justified content-class="mt-3" nav-wrapper-class="text-white">
            <b-tab v-if="Number(amounts[0])" :title="tabTitles.approveUSDC">
                <BaseTabApprove
                    :amount="amountApprovalUSDC"
                    :token="{ address: address.USDC, decimals: 6 }"
                    :spender="address.BalancerVault"
                    @update="amountApprovalUSDC = $event"
                    @approve="onApproveUSDC"
                    @ok="tabIndex = 1"
                />
            </b-tab>
            <b-tab v-if="Number(amounts[1])" :title="tabTitles.approveTHX">
                <BaseTabApprove
                    :amount="amountApprovalTHX"
                    :token="{ address: address.THX, decimals: 18 }"
                    :spender="address.BalancerVault"
                    @update="amountApprovalTHX = $event"
                    @approve="onApproveTHX"
                    @ok="tabIndex = 2"
                />
            </b-tab>
            <b-tab :title="tabTitles.addLiquidity">
                <b-form-group>
                    <div class="w-100 d-flex align-items-center justify-content-between">
                        <b-badge
                            class="p-2 d-flex align-items-center"
                            variant="primary"
                            style="font-size: 1rem; font-weight: normal"
                        >
                            <div class="d-flex align-items-center" style="width: 70px">
                                <b-img
                                    src="https://assets.coingecko.com/coins/images/6319/standard/usdc.png"
                                    alt="USDC icon"
                                    width="20"
                                    height="20"
                                    class="me-2"
                                />
                                USDC
                            </div>
                        </b-badge>
                        <b-form-input v-model="amountUSDC" disabled class="ms-3" type="number" />
                    </div>
                </b-form-group>
                <b-form-group>
                    <div class="w-100 d-flex align-items-center justify-content-between">
                        <b-badge
                            class="p-2 d-flex align-items-center"
                            variant="primary"
                            style="font-size: 1rem; font-weight: normal"
                        >
                            <div class="d-flex align-items-center" style="width: 70px">
                                <b-img
                                    src="https://assets.coingecko.com/coins/images/21323/standard/logo-thx-resized-200-200.png"
                                    alt="THX icon"
                                    width="20"
                                    height="20"
                                    class="me-2"
                                />
                                THX
                            </div>
                        </b-badge>
                        <b-form-input v-model="amountTHX" disabled class="ms-3" type="number" />
                    </div>
                </b-form-group>
                <b-form-group>
                    <template #label>
                        <span class="text-opaque me-1">Slippage</span>
                        <i
                            v-b-tooltip
                            class="fas fa-question-circle"
                            title="Market conditions can shift between when you place an order and when it's executed. Slippage tolerance sets the maximum price change you'll accept, guarding against front-running bots and miner extractable value (MEV)."
                        />
                    </template>
                    <div class="d-flex justify-content-between">
                        <b-button
                            v-for="{ label, value } of slippageOptions"
                            size="sm"
                            variant="primary"
                            class="me-2 rounded"
                            style="width: 100px"
                            :disabled="slippage === value"
                            @click="slippage = value"
                        >
                            {{ label }}
                        </b-button>
                        <b-input-group size="sm" class="flex-grow-0" style="width: 100px">
                            <template #append>
                                <div class="d-flex align-items-center justify-content-between px-2">
                                    <strong>%</strong>
                                </div>
                            </template>
                            <b-form-input v-model="slippage" size="sm" />
                        </b-input-group>
                    </div>
                </b-form-group>
                <b-button variant="success" class="w-100 mt-3" :disabled="isPolling" @click="onClickCreateLiquidity">
                    <b-spinner v-if="isPolling" small />
                    <template v-else>Create Liquidity</template>
                </b-button>
            </b-tab>
        </b-tabs>
        <p v-if="walletStore.wallet?.variant === WalletVariant.Safe" class="text-muted text-center mt-3 mb-0">
            ❤️ We sponsor the transaction costs of your <b-link href="" class="text-white">Safe Multisig</b-link>!
        </p>
    </b-modal>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { mapStores } from 'pinia';
import { useVeStore } from '../../stores/VE';
import { useWalletStore } from '../../stores/Wallet';
import { useLiquidityStore } from '../../stores/Liquidity';
import { BALANCER_POOL_ID, contractNetworks } from '../../config/constants';
import { parseUnits } from 'ethers/lib/utils';
import { ChainId } from '@thxnetwork/sdk';
import { WalletVariant } from '@thxnetwork/campaign/types/enums/accountVariant';
import { BalancerSDK, Network } from '@balancer-labs/sdk';
import { POLYGON_RPC } from '@thxnetwork/campaign/config/secrets';

export default defineComponent({
    name: 'BaseModalCreateLiquidity',
    props: {
        show: Boolean,
        amounts: { type: Array as PropType<string[]>, required: true }, // amounts[0] = USDC, amounts[1] = THX
    },
    data() {
        return {
            WalletVariant,
            isShown: false,
            error: '',
            isPolling: false,
            tabIndex: 0,
            amountUSDC: '0',
            amountTHX: '0',
            amountApprovalUSDC: '0',
            amountApprovalTHX: '0',
            slippage: 0.5,
            slippageOptions: [
                { label: '0.5%', value: 0.5 },
                { label: '1.0%', value: 1 },
                { label: '2.0%', value: 2 },
            ],
        };
    },
    computed: {
        ...mapStores(useWalletStore, useVeStore, useLiquidityStore),
        tabTitles() {
            const titles: { [key: string]: string } = {};
            if (Number(this.amountUSDC) > 0) {
                titles['approveUSDC'] = `${Object.values(titles).length + 1}. Approve USDC`;
            }
            if (Number(this.amountTHX) > 0) {
                titles['approveTHX'] = `${Object.values(titles).length + 1}. Approve THX`;
            }
            titles['addLiquidity'] = `${Object.values(titles).length + 1}. Create Liquidity`;
            return titles;
        },
        address() {
            if (!this.walletStore.wallet) return contractNetworks[ChainId.Polygon];
            return contractNetworks[this.walletStore.wallet.chainId];
        },
        isAlertInfoShown() {
            return !!this.error;
        },
    },
    watch: {
        show(show: boolean) {
            this.isShown = show;
        },
        tabIndex() {
            this.error = '';
        },
    },
    methods: {
        async onShow() {
            this.amountApprovalUSDC = this.amounts[0];
            this.amountApprovalTHX = this.amounts[1];

            this.amountUSDC = this.amounts[0];
            this.amountTHX = this.amounts[1];

            this.walletStore.getApproval({ tokenAddress: this.address.USDC, spender: this.address.BalancerVault });
            this.walletStore.getApproval({ tokenAddress: this.address.THX, spender: this.address.BalancerVault });
        },
        onApproveUSDC() {
            this.amountUSDC = this.amountApprovalUSDC;
            this.tabIndex = 1;
        },
        onApproveTHX() {
            this.amountTHX = this.amountApprovalTHX;
            this.tabIndex = 2;
        },
        async onClickCreateLiquidity() {
            try {
                if (!this.walletStore.wallet) throw new Error('Please select a wallet');

                this.isPolling = true;

                // Values to send
                const usdcAmountInWei = parseUnits(this.amountUSDC.toString(), 6);
                const thxAmountInWei = parseUnits(this.amountTHX.toString(), 18);

                // Create Balancer SDK here in favor of code splitting on /earn
                const balancer = new BalancerSDK({
                    network: Network.POLYGON,
                    rpcUrl: POLYGON_RPC,
                });
                const pool = await balancer.pools.find(BALANCER_POOL_ID);
                if (!pool) throw new Error('Liquidity pool not found');

                // Create liquidity
                const data = {
                    usdcAmountInWei: usdcAmountInWei.toString(),
                    thxAmountInWei: thxAmountInWei.toString(),
                    slippage: String(Number(this.slippage.toFixed(2)) * 100),
                    pool,
                };
                await this.liquidityStore.createLiquidity(this.walletStore.wallet, data);

                // Wait for BPTGauge balance to increase
                await this.liquidityStore.waitForLiquidity(this.walletStore.wallet, data);

                // Hide modal (or cast "submit" and switch parent tab to withdrawal/rewards)
                this.$emit('submit');
            } catch (response) {
                this.onError(response);
            } finally {
                this.isPolling = false;
            }
        },
        onError(response: any) {
            this.error = response && response.error ? response.error.message : response.message;
        },
    },
});
</script>
