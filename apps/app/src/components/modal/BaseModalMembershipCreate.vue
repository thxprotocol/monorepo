<template>
    <b-modal
        v-model="isShown"
        size="lg"
        centered
        hide-footer
        content-class="gradient-shadow-xl"
        @hidden="$emit('hidden')"
        @show="onShow"
    >
        <template #header>
            <h5 class="modal-title">
                <i class="fas fa-user-plus me-2" />
                Become a member today!
            </h5>
            <b-link class="btn-close" @click="$emit('hidden')"><i class="fas fa-times"></i></b-link>
        </template>
        <BaseAlertErrorList :errors="errors" @close="errors.splice($event, 1)" />
        <b-row class="mb-3">
            <b-col>
                <div class="text-opaque">Liquidity estimate</div>
                {{ Number(amountInBPT).toFixed(6) }}
                <strong>({{ toFiatPrice(amountInUSD) }})</strong>
            </b-col>
            <b-col>
                <div class="text-opaque">Lock end date</div>
                <strong>{{ format(new Date(lockEnd), 'MMMM do yyyy hh:mm:ss') }}</strong>
            </b-col>
        </b-row>
        <BaseCardStatusCheck
            label="1. Add liquidity"
            :description="`Balance: ${Number(formatUnits(balances.BPT, 18)).toFixed(6)} 20USDC-80THX (${toFiatPrice(
                balanceBPTInUSD.toString(),
            )})`"
            :status="isLiquidityProvided"
        >
            <BaseButtonApprove
                v-if="!isAllowanceSufficient"
                size="sm"
                :amount="amount.toString()"
                :token="token"
                :spender="address.BalancerVault"
                @error="onError"
            >
                Approve <strong>{{ toFiatPrice(amountInUSD) }}</strong>
            </BaseButtonApprove>
            <BaseButtonLiquidityCreate
                v-else
                size="sm"
                :amounts="amounts"
                :tokens="[address.USDC, address.THX]"
                :slippage="0.5"
                @success="onLiquidityCreate"
                @error="onError"
            >
                Add <strong>{{ toFiatPrice(amountInUSD) }}</strong>
            </BaseButtonLiquidityCreate>
        </BaseCardStatusCheck>
        <BaseCardStatusCheck
            label="2. Stake liquidity"
            :description="`Balance: ${Number(formatUnits(balances.BPTGauge, 18)).toFixed(
                6,
            )} 20USDC-80THX (${toFiatPrice(balanceBPTGaugeInUSD)})`"
            :status="isLiquidityStaked"
        >
            <BaseButtonApprove
                v-if="!isAllowanceBPTSufficient"
                size="sm"
                :amount="formatUnits(amountInBPTInWei, 18).toString()"
                :token="{ address: address.BPT, decimals: 18 }"
                :spender="address.BPTGauge"
                @error="onError"
            >
                Approve
                <strong>
                    {{ toFiatPrice(amountInUSD) }}
                </strong>
            </BaseButtonApprove>
            <BaseButtonLiquidityStake
                v-else
                size="sm"
                :amount="amountInBPTInWei.toString()"
                @success="onLiquidityStake"
                @error="onError"
            >
                Stake
                <strong>
                    {{ toFiatPrice(amountInUSD) }}
                </strong>
            </BaseButtonLiquidityStake>
        </BaseCardStatusCheck>
        <BaseCardStatusCheck
            label="3. Lock liquidity"
            :description="`Balance: ${balances.VeTHX} veTHX`"
            :status="isLiquidityLocked"
        >
            <BaseButtonApprove
                v-if="!isAllowanceBPTGaugeSufficient"
                size="sm"
                :amount="formatUnits(amountInBPTInWei, 18).toString()"
                :token="{ address: address.BPTGauge, decimals: 18 }"
                :spender="address.VotingEscrow"
                @error="onError"
            >
                Approve
                <strong>
                    {{ toFiatPrice(amountInUSD) }}
                </strong>
            </BaseButtonApprove>

            <BaseButtonLiquidityLock
                v-else
                size="sm"
                :amount="amountInBPTInWei.toString()"
                :lock-end="lockEnd"
                @success="onLiquidityLock"
                @error="onError"
            >
                Lock
                <strong>
                    {{ toFiatPrice(amountInUSD) }}
                </strong>
            </BaseButtonLiquidityLock>
        </BaseCardStatusCheck>
        <b-button v-if="Number(balances.VeTHX)" to="/earn" variant="success" class="w-100">
            Update Membership
        </b-button>
    </b-modal>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { mapStores } from 'pinia';
import { useVeStore } from '../../stores/VE';
import { useWalletStore } from '../../stores/Wallet';
import { useLiquidityStore } from '../../stores/Liquidity';
import { contractNetworks } from '../../config/constants';
import { ChainId } from '@thxnetwork/sdk';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import { chainList } from '@thxnetwork/app/utils/chains';
import { BigNumber } from 'ethers/lib/ethers';
import { format } from 'date-fns';
import { roundDownFixed, toFiatPrice } from '@thxnetwork/app/utils/price';
import { parseError } from '@thxnetwork/app/utils/toast';

export default defineComponent({
    name: 'BaseModalDeposit',
    props: {
        show: Boolean,
        token: { type: Object as PropType<TToken>, required: true },
        amount: { type: String, required: true, default: '0' },
        lockEnd: { type: Date, required: true },
    },
    data() {
        return {
            format,
            BigNumber,
            toFiatPrice,
            parseUnits,
            formatUnits,
            tabIndexLiquidity: 0,
            tabIndexLock: 0,
            isPolling: false,
            isShown: false,
            amountLiquidity: 0,
            errors: [] as string[],
        };
    },
    computed: {
        ...mapStores(useVeStore, useWalletStore, useLiquidityStore),
        isAlertErrorShown() {
            return !!this.errors.length;
        },
        chainInfo() {
            if (!this.walletStore.wallet) return chainList[ChainId.Polygon];
            return chainList[this.walletStore.wallet.chainId];
        },
        address() {
            if (!this.walletStore.wallet) return contractNetworks[ChainId.Polygon];
            return contractNetworks[this.walletStore.wallet.chainId];
        },
        amounts() {
            const amountUSDCInWei = this.token.address === this.address.USDC ? this.amountInWei : BigNumber.from(0);
            const amountTHXInWei = this.token.address === this.address.THX ? this.amountInWei : BigNumber.from(0);
            return [amountUSDCInWei.toString(), amountTHXInWei.toString()];
        },
        usdPerBPTInWei() {
            if (!this.liquidityStore.pricing['20USDC-80THX']) return BigNumber.from(0);
            return parseUnits(this.liquidityStore.pricing['20USDC-80THX'].toString(), 18);
        },
        usdPerTokenInWei() {
            return parseUnits(this.token.price.toString(), 18);
        },
        bptPerUSD() {
            if (!this.liquidityStore.pricing['20USDC-80THX']) return 0;
            return Number(roundDownFixed(1 / this.liquidityStore.pricing['20USDC-80THX'], 0));
        },
        bptPerUSDCInWei() {
            return parseUnits(this.bptPerUSD.toString(), 18);
        },
        amountInUSD() {
            return formatUnits(this.amountInWei.mul(this.usdPerTokenInWei), 18 + this.token.decimals);
        },
        amountInWei() {
            return parseUnits(this.amount, this.token.decimals);
        },
        amountInBPTInWei() {
            const amountInUSD = this.amountInWei.mul(this.usdPerTokenInWei);
            const amount = formatUnits(amountInUSD.mul(this.bptPerUSD), 18 + this.token.decimals);
            return parseUnits(Number(amount).toFixed(18), 18);
        },
        amountInBPT() {
            return formatUnits(this.amountInBPTInWei, 18);
        },
        allowances() {
            return this.walletStore.allowances;
        },
        balances() {
            return {
                USDC: this.walletStore.balances[this.address.USDC] || '0',
                BPT: this.walletStore.balances[this.address.BPT] || '0',
                BPTGauge: this.walletStore.balances[this.address.BPTGauge] || '0',
                VeTHX: this.veStore.lock ? this.veStore.balance.toString() : '0',
            };
        },
        balanceBPTInWei() {
            return BigNumber.from(this.balances.BPT);
        },
        balanceBPTInUSD() {
            const valueInUSDInWei = BigNumber.from(this.balances.BPT).mul(this.usdPerBPTInWei);
            return formatUnits(valueInUSDInWei, 18 * 2); // Decimals * 2 because of both the balance and price conversion to wei
        },
        balanceBPTGaugeInWei() {
            return BigNumber.from(this.balances.BPTGauge);
        },
        balanceBPTGaugeInUSD() {
            const valueInUSDInWei = BigNumber.from(this.balances.BPTGauge).mul(this.usdPerBPTInWei);
            return formatUnits(valueInUSDInWei, 18 * 2); // Decimals * 2 because of both the balance and price conversion to wei
        },
        isAllowanceSufficient() {
            if (!this.allowances[this.token.address]) return false;
            if (!this.allowances[this.token.address][this.address.BalancerVault]) return false;
            const allowanceInWei = this.allowances[this.token.address][this.address.BalancerVault];
            return BigNumber.from(allowanceInWei).gte(this.amountInWei);
        },
        isAllowanceBPTSufficient() {
            if (!this.balances.BPT || BigNumber.from(this.balances.BPT).eq(0)) return false;
            if (!this.allowances[this.address.BPT]) return false;
            if (!this.allowances[this.address.BPT][this.address.BPTGauge]) return false;
            const allowanceInWei = this.allowances[this.address.BPT][this.address.BPTGauge];
            return BigNumber.from(allowanceInWei).gte(this.amountInBPTInWei);
        },
        isAllowanceBPTGaugeSufficient() {
            if (!this.allowances[this.address.BPTGauge]) return false;
            if (!this.allowances[this.address.BPTGauge][this.address.VotingEscrow]) return false;
            const allowanceInWei = this.allowances[this.address.BPTGauge][this.address.VotingEscrow];
            return BigNumber.from(allowanceInWei).gte(this.amountInBPTInWei);
        },
        isBalanceBPTSufficient() {
            return this.balanceBPTInWei.gte(this.amountInBPTInWei);
        },
        isBalanceBPTGaugeSufficient() {
            return this.balanceBPTGaugeInWei.gte(this.amountInBPTInWei);
        },
        isLiquidityProvided() {
            return this.isBalanceBPTSufficient;
        },
        isLiquidityStaked() {
            return this.isBalanceBPTGaugeSufficient;
        },
        isLiquidityLocked() {
            if (!this.veStore.lock) return false;
            return BigNumber.from(this.veStore.lock.amount).gt(0);
        },
    },
    watch: {
        show(show: boolean) {
            this.isShown = show;
        },
    },
    methods: {
        async onShow() {
            const wallet = this.walletStore.wallet;
            if (!wallet) return;

            await Promise.all([
                this.walletStore.getBalance(this.address.USDC),
                this.walletStore.getBalance(this.address.THX),
                this.walletStore.getBalance(this.address.BPT),
                this.walletStore.getBalance(this.address.BPTGauge),
                this.walletStore.getApproval({ tokenAddress: this.address.USDC, spender: this.address.BalancerVault }),
                this.walletStore.getApproval({ tokenAddress: this.address.BPT, spender: this.address.BPTGauge }),
                this.walletStore.getApproval({
                    tokenAddress: this.address.BPTGauge,
                    spender: this.address.VotingEscrow,
                }),
                this.veStore.getLocks(wallet),
            ]);
        },
        async onLiquidityCreate() {
            await Promise.all([
                this.walletStore.getBalance(this.address.USDC),
                this.walletStore.getBalance(this.address.THX),
                this.walletStore.getBalance(this.address.BPT),
            ]);
        },
        async onLiquidityStake() {
            await Promise.all([
                this.walletStore.getBalance(this.address.BPT),
                this.walletStore.getBalance(this.address.BPTGauge),
            ]);
        },
        async onLiquidityLock() {
            const wallet = this.walletStore.wallet;
            if (!wallet) return;
            await Promise.all([this.walletStore.getBalance(this.address.BPTGauge), this.veStore.getLocks(wallet)]);
        },
        onError(error: Error) {
            this.errors.push(parseError(error));
        },
    },
});
</script>
