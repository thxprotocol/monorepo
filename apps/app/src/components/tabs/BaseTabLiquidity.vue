<template>
    <BaseAlertErrorList :errors="errors" @close="errors.splice($event, 1)" />
    <b-button
        v-if="balanceBPT"
        class="rounded w-100 d-flex align-items-center justify-content-between"
        variant="primary"
        @click="onClickCollapse"
    >
        1. Add Liquidity
        <i
            class="fas ms-auto"
            :class="{
                'fa-chevron-down': isCollapseCreateLiquidityOpen,
                'fa-chevron-up': !isCollapseCreateLiquidityOpen,
            }"
        />
    </b-button>
    <b-collapse v-model="isCollapseCreateLiquidityOpen" class="pt-3">
        <BaseFormGroupInputTokenAmount
            :usd="liquidityStore.pricing['USDC']"
            :balance="balanceUSDC"
            :value="Number(amountUSDC)"
            :min="0"
            :max="balanceUSDC"
            class="mb-4"
            @update="amountUSDC = $event"
        >
            <template #label>
                <div class="d-flex align-items-center" style="width: 105px">
                    <b-img
                        src="https://assets.coingecko.com/coins/images/6319/standard/usdc.png"
                        alt="USDC icon"
                        width="20"
                        height="20"
                        class="me-2"
                    />
                    USDC.e
                    <b-link
                        :href="`${chainInfo.blockExplorer}/token/${address.USDC}`"
                        target="_blank"
                        class="text-white text-opaque small ms-2"
                    >
                        <i class="fas fa-external-link-alt" />
                    </b-link>
                </div>
            </template>
        </BaseFormGroupInputTokenAmount>
        <BaseFormGroupInputTokenAmount
            :usd="liquidityStore.pricing['THX']"
            :balance="balanceTHX"
            :value="Number(amountTHX)"
            :min="0"
            :max="balanceTHX"
            class="mb-4"
            @update="amountTHX = $event"
        >
            <template #label>
                <div class="d-flex align-items-center" style="width: 80px">
                    <b-img
                        src="https://assets.coingecko.com/coins/images/21323/standard/logo-thx-resized-200-200.png"
                        alt="THX icon"
                        width="20"
                        height="20"
                        class="me-2"
                    />
                    THX
                    <b-link
                        :href="`${chainInfo.blockExplorer}/token/${address.THX}`"
                        target="_blank"
                        class="text-white text-opaque small ms-2"
                    >
                        <i class="fas fa-external-link-alt" />
                    </b-link>
                </div>
            </template>
        </BaseFormGroupInputTokenAmount>
        <b-form-group label="Slippage" class="my-4">
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
        <b-button
            v-if="!accountStore.isAuthenticated"
            class="w-100"
            variant="primary"
            @click="authStore.isModalLoginShown = true"
        >
            Sign in &amp; Add Liquidity
        </b-button>
        <BaseButtonApprove
            v-else-if="!isSufficientUSDCAllowance"
            :token="{ address: address.USDC, decimals: 6 }"
            :spender="address.BalancerVault"
            :amount="amountUSDC"
            @error="onError"
        >
            Approve USDC
        </BaseButtonApprove>
        <BaseButtonApprove
            v-else-if="!isSufficientTHXAllowance"
            :token="{ address: address.THX, decimals: 18 }"
            :spender="address.BalancerVault"
            :amount="amountTHX"
            @error="onError"
        >
            Approve THX
        </BaseButtonApprove>
        <BaseButtonLiquidityCreate
            v-else
            :amounts="[parseUnits(amountUSDC, 6).toString(), parseUnits(amountTHX, 18).toString()]"
            :tokens="[address.USDC, address.THX]"
            :slippage="slippage"
            @success="onLiquidityCreate"
            @error="onError"
        >
            Add Liquidity
        </BaseButtonLiquidityCreate>
    </b-collapse>
    <template v-if="balanceBPT">
        <hr />
        <b-button
            class="rounded w-100 d-flex align-items-center justify-content-between"
            variant="primary"
            @click="onClickCollapse"
        >
            <span>
                2. Stake Liquidity
                <i
                    v-b-tooltip
                    class="fas fa-info-circle ms-1"
                    title="You have unstaked liquidity! You can only lock and obtain veTHX after staking the provided liquidity."
                />
            </span>
            <i
                class="fas ms-auto"
                :class="{
                    'fa-chevron-down': isCollapseStakeLiquidityOpen,
                    'fa-chevron-up': !isCollapseStakeLiquidityOpen,
                }"
            />
        </b-button>
        <b-collapse v-model="isCollapseStakeLiquidityOpen" class="pt-3">
            <BaseFormGroupInputTokenAmount
                :usd="liquidityStore.pricing['20USDC-80THX']"
                :balance="balanceBPT"
                :value="Number(amountStake)"
                :min="0"
                :max="balanceBPT"
                class="mb-4"
                @update="amountStake = $event"
            >
                <template #label>
                    <div class="d-flex align-items-center">
                        <b-img
                            src="https://assets.coingecko.com/coins/images/6319/standard/usdc.png"
                            alt="USDC icon"
                            width="20"
                            height="20"
                            class="me-2"
                        />
                        USDC <span class="text-opaque ms-1">20%</span>
                        <b-img
                            src="https://assets.coingecko.com/coins/images/21323/standard/logo-thx-resized-200-200.png"
                            alt="THX icon"
                            width="20"
                            height="20"
                            class="mx-2"
                        />
                        THX <span class="text-opaque ms-1">80%</span>
                    </div>
                </template>
            </BaseFormGroupInputTokenAmount>
            <BaseButtonApprove
                v-if="!isSufficientBPTAllowance"
                :token="{ address: address.BPT, decimals: 18 }"
                :spender="address.BPTGauge"
                :amount="amountStake"
                @error="onError"
            >
                Approve 20USDC-80THX
            </BaseButtonApprove>
            <BaseButtonLiquidityStake
                v-else
                :amount="parseUnits(amountStake, 18).toString()"
                @success="onLiquidityStake"
                @error="onError"
            >
                Stake Liquidity
            </BaseButtonLiquidityStake>
        </b-collapse>
    </template>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useAccountStore } from '../../stores/Account';
import { mapStores } from 'pinia';
import { useWalletStore } from '../../stores/Wallet';
import { useLiquidityStore } from '../../stores/Liquidity';
import { useVeStore } from '../../stores/VE';
import { contractNetworks } from '../../config/constants';
import { ChainId } from '@thxnetwork/sdk';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import { useAuthStore } from '@thxnetwork/app/stores/Auth';
import { chainList } from '@thxnetwork/app/utils/chains';
import { BigNumber } from 'ethers/lib/ethers';
import { parseError } from '@thxnetwork/app/utils/toast';

export default defineComponent({
    name: 'BaseTabLiquidity',
    data() {
        return {
            formatUnits,
            parseUnits,
            isCollapseCreateLiquidityOpen: true,
            isCollapseStakeLiquidityOpen: false,
            amountUSDC: '0',
            amountTHX: '0',
            amountStake: '0',
            errors: [] as string[],
            slippage: 0.5,
            slippageOptions: [
                { label: '0.5%', value: 0.5 },
                { label: '1.0%', value: 1 },
                { label: '2.0%', value: 2 },
            ],
        };
    },
    computed: {
        ...mapStores(useAccountStore, useAuthStore, useWalletStore, useVeStore, useLiquidityStore),
        chainInfo() {
            if (!this.walletStore.wallet) return chainList[ChainId.Polygon];
            return chainList[this.walletStore.wallet.chainId];
        },
        address() {
            if (!this.walletStore.wallet) return contractNetworks[ChainId.Polygon];
            return contractNetworks[this.walletStore.wallet.chainId];
        },
        isSufficientUSDCAllowance() {
            if (!this.walletStore.allowances[this.address.USDC]) return false;
            if (!this.walletStore.allowances[this.address.USDC][this.address.BalancerVault]) return false;
            const allowanceInWei = this.walletStore.allowances[this.address.USDC][this.address.BalancerVault];
            const amountInWei = parseUnits(this.amountUSDC, 6);
            return BigNumber.from(allowanceInWei).gte(amountInWei);
        },
        isSufficientTHXAllowance() {
            if (!this.walletStore.allowances[this.address.THX]) return false;
            if (!this.walletStore.allowances[this.address.THX][this.address.BalancerVault]) return false;
            const allowanceInWei = this.walletStore.allowances[this.address.THX][this.address.BalancerVault];
            const amountInWei = parseUnits(this.amountTHX, 18);
            return BigNumber.from(allowanceInWei).gte(amountInWei);
        },
        isSufficientBPTAllowance() {
            if (!this.walletStore.allowances[this.address.BPT]) return false;
            if (!this.walletStore.allowances[this.address.BPT][this.address.BPTGauge]) return false;
            const allowanceInWei = this.walletStore.allowances[this.address.BPT][this.address.BPTGauge];
            const amountInWei = parseUnits(this.amountStake, 18);
            return BigNumber.from(allowanceInWei).gte(amountInWei);
        },
        balanceUSDC() {
            if (!this.walletStore.balances[this.address.USDC]) return 0;
            return Number(formatUnits(this.walletStore.balances[this.address.USDC], 6)); // USDC.e has 6 decimals
        },
        balanceTHX() {
            if (!this.walletStore.balances[this.address.THX]) return 0;
            return Number(formatUnits(this.walletStore.balances[this.address.THX], 18)); // THX has 18 decimals
        },
        balanceBPT() {
            if (!this.walletStore.balances[this.address.BPT]) return 0;
            return Number(formatUnits(this.walletStore.balances[this.address.BPT], 18)); // BPT has 18 decimals
        },
    },
    watch: {
        'walletStore.wallet'(wallet) {
            if (!wallet) return;
            this.walletStore.getBalance(this.address.USDC).then(() => {
                this.amountUSDC = formatUnits(this.walletStore.balances[this.address.USDC], 6);
            });
            this.walletStore.getBalance(this.address.THX).then(() => {
                this.amountTHX = formatUnits(this.walletStore.balances[this.address.THX], 18);
            });
            this.walletStore.getBalance(this.address.BPT).then(() => {
                this.amountStake = formatUnits(this.walletStore.balances[this.address.BPT], 18);
            });
            this.walletStore.getApproval({ tokenAddress: this.address.USDC, spender: this.address.BalancerVault });
            this.walletStore.getApproval({ tokenAddress: this.address.THX, spender: this.address.BalancerVault });
            this.walletStore.getApproval({ tokenAddress: this.address.BPT, spender: this.address.BPTGauge });
        },
    },
    methods: {
        onClickCollapse() {
            this.isCollapseStakeLiquidityOpen = !this.isCollapseStakeLiquidityOpen;
            this.isCollapseCreateLiquidityOpen = !this.isCollapseCreateLiquidityOpen;
        },
        onLiquidityCreate() {
            this.amountUSDC = '0';
            this.amountTHX = '0';
            this.isCollapseCreateLiquidityOpen = false;
            this.isCollapseStakeLiquidityOpen = true;
            this.walletStore.getBalance(this.address.USDC);
            this.walletStore.getBalance(this.address.THX);
            this.walletStore.getBalance(this.address.BPT).then(() => {
                this.amountStake = formatUnits(this.walletStore.balances[this.address.BPT], 18);
            });
        },
        onLiquidityStake() {
            this.amountStake = '0';
            this.isCollapseCreateLiquidityOpen = true;
            this.isCollapseStakeLiquidityOpen = false;
            this.walletStore.getBalance(this.address.BPT);
            this.walletStore.getBalance(this.address.BPTGauge);
            this.$emit('change-tab', 1);
        },
        onError(error: Error) {
            this.errors.push(parseError(error));
        },
    },
});
</script>
