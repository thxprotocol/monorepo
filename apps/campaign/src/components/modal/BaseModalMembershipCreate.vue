<template>
    <b-modal v-model="isShown" size="lg" centered hide-footer @hidden="$emit('hidden')" @show="onShow">
        <template #header>
            <h5 class="modal-title">
                <i class="fas fa-user-plus me-2" />
                Become a member today!
            </h5>
            <b-link class="btn-close" @click="$emit('hidden')"><i class="fas fa-times"></i></b-link>
        </template>
        <b-row class="mb-3">
            <b-col>
                <div class="text-opaque">Liquidity estimate</div>
                {{ Number(amountBPT).toFixed(6) }}
                <strong>({{ toFiatPrice(Number(amount)) }})</strong>
            </b-col>
            <b-col>
                <div class="text-opaque">Lock end date</div>
                <strong>{{ format(new Date(lockEnd), 'MMMM do yyyy hh:mm:ss') }}</strong>
            </b-col>
        </b-row>
        <BaseCardStatusCheck
            label="Added liquidity"
            :description="`Balance: ${Number(formatUnits(balances.BPT, 18)).toFixed(6)} 20USDC-80THX (${toFiatPrice(
                balanceBPTInUSD.toString(),
            )})`"
            :status="isLiquidityProvided"
        >
            <BaseButtonApprove
                v-if="!isAllowanceUSDCSufficient"
                size="sm"
                :amount="amount.toString()"
                :token="{ address: address.USDC, decimals: 6 }"
                :spender="address.BalancerVault"
            >
                Approve <strong>{{ toFiatPrice(amount) }}</strong>
            </BaseButtonApprove>
            <BaseButtonLiquidityCreate
                v-else
                size="sm"
                :amounts="[parseUnits(amount, 6).toString(), '0']"
                :tokens="[address.USDC, address.THX]"
                :slippage="0.5"
                @success="onLiquidityCreate"
            >
                Add <strong>{{ toFiatPrice(amount) }}</strong>
            </BaseButtonLiquidityCreate>
        </BaseCardStatusCheck>
        <BaseCardStatusCheck
            label="Staked liquidity"
            :description="`Balance: ${Number(formatUnits(balances.BPTGauge, 18)).toFixed(
                6,
            )} 20USDC-80THX (${toFiatPrice(balanceBPTGaugeInUSD)})`"
            :status="isLiquidityStaked"
        >
            <BaseButtonApprove
                v-if="!isAllowanceBPTSufficient"
                size="sm"
                :amount="formatUnits(amountBPTInWei, 18).toString()"
                :token="{ address: address.BPT, decimals: 18 }"
                :spender="address.BPTGauge"
            >
                Approve
                <strong>
                    {{ toFiatPrice(amount) }}
                </strong>
            </BaseButtonApprove>
            <BaseButtonLiquidityStake v-else size="sm" :amount="amountBPTInWei.toString()" @success="onLiquidityStake">
                Stake
                <strong>
                    {{ toFiatPrice(amount) }}
                </strong>
            </BaseButtonLiquidityStake>
        </BaseCardStatusCheck>
        <BaseCardStatusCheck
            label="Locked liquidity"
            :description="`Balance: ${balances.VeTHX} veTHX`"
            :status="isLiquidityLocked"
        >
            <BaseButtonApprove
                v-if="!isAllowanceBPTGaugeSufficient"
                size="sm"
                :amount="formatUnits(amountBPTInWei, 18).toString()"
                :token="{ address: address.BPTGauge, decimals: 18 }"
                :spender="address.VotingEscrow"
            >
                Approve
                <strong>
                    {{ toFiatPrice(amount) }}
                </strong>
            </BaseButtonApprove>
            <BaseButtonLiquidityLock
                v-else
                size="sm"
                :amount="amountBPTInWei.toString()"
                :lock-end="lockEnd"
                @success="onLiquidityLock"
            >
                Lock
                <strong>
                    {{ toFiatPrice(amount) }}
                </strong>
            </BaseButtonLiquidityLock>
        </BaseCardStatusCheck>
        <b-button v-if="Number(balances.VeTHX)" to="/earn" variant="success" class="w-100">
            Update Membership
        </b-button>
    </b-modal>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapStores } from 'pinia';
import { useVeStore } from '../../stores/VE';
import { useWalletStore } from '../../stores/Wallet';
import { useLiquidityStore } from '../../stores/Liquidity';
import { contractNetworks } from '../../config/constants';
import { ChainId } from '@thxnetwork/sdk';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import { chainList } from '@thxnetwork/campaign/utils/chains';
import { BigNumber } from 'ethers/lib/ethers';
import { format } from 'date-fns';
import { roundDownFixed, toFiatPrice } from '@thxnetwork/campaign/utils/price';

export default defineComponent({
    name: 'BaseModalDeposit',
    props: {
        show: Boolean,
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
        };
    },
    computed: {
        ...mapStores(useVeStore, useWalletStore, useLiquidityStore),
        chainInfo() {
            if (!this.walletStore.wallet) return chainList[ChainId.Polygon];
            return chainList[this.walletStore.wallet.chainId];
        },
        address() {
            if (!this.walletStore.wallet) return contractNetworks[ChainId.Polygon];
            return contractNetworks[this.walletStore.wallet.chainId];
        },
        usdcPerBPT() {
            if (!this.liquidityStore.pricing['20USDC-80THX']) return 0;
            return this.liquidityStore.pricing['20USDC-80THX'];
        },
        usdcPerBPTInWei() {
            if (!this.liquidityStore.pricing['20USDC-80THX']) return BigNumber.from(0);
            return parseUnits(this.liquidityStore.pricing['20USDC-80THX'].toString(), 18);
        },
        bptPerUSD() {
            if (!this.liquidityStore.pricing['20USDC-80THX']) return 0;
            return Number(roundDownFixed(1 / this.liquidityStore.pricing['20USDC-80THX'], 0));
        },
        bptPerUSDCInWei() {
            return parseUnits(this.bptPerUSD.toString(), 18);
        },
        amountUSDCInWei() {
            return parseUnits(this.amount, 6);
        },
        amountBPTInWei() {
            const amount = formatUnits(this.amountUSDCInWei.mul(this.bptPerUSD), 6);
            return parseUnits(amount, 18);
        },
        amountBPT() {
            return formatUnits(this.amountBPTInWei, 18);
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
            const valueInUSDInWei = BigNumber.from(this.balances.BPT).mul(this.usdcPerBPTInWei);
            return formatUnits(valueInUSDInWei, 18 * 2); // Decimals * 2 because of both the balance and price conversion to wei
        },
        balanceBPTGaugeInWei() {
            return BigNumber.from(this.balances.BPTGauge);
        },
        balanceBPTGaugeInUSD() {
            const valueInUSDInWei = BigNumber.from(this.balances.BPTGauge).mul(this.usdcPerBPTInWei);
            return formatUnits(valueInUSDInWei, 18 * 2); // Decimals * 2 because of both the balance and price conversion to wei
        },
        isAllowanceUSDCSufficient() {
            if (!this.allowances[this.address.USDC]) return false;
            if (!this.allowances[this.address.USDC][this.address.BalancerVault]) return false;
            const allowanceInWei = this.allowances[this.address.USDC][this.address.BalancerVault];
            return BigNumber.from(allowanceInWei).gte(this.amountUSDCInWei);
        },
        isAllowanceBPTSufficient() {
            if (!this.balances.BPT || BigNumber.from(this.balances.BPT).eq(0)) return false;
            if (!this.allowances[this.address.BPT]) return false;
            if (!this.allowances[this.address.BPT][this.address.BPTGauge]) return false;
            const allowanceInWei = this.allowances[this.address.BPT][this.address.BPTGauge];
            return BigNumber.from(allowanceInWei).gte(this.amountBPTInWei);
        },
        isAllowanceBPTGaugeSufficient() {
            if (!this.allowances[this.address.BPTGauge]) return false;
            if (!this.allowances[this.address.BPTGauge][this.address.VotingEscrow]) return false;
            const allowanceInWei = this.allowances[this.address.BPTGauge][this.address.VotingEscrow];
            return BigNumber.from(allowanceInWei).gte(this.amountBPTInWei);
        },
        isBalanceBPTSufficient() {
            return this.balanceBPTInWei.gte(this.amountBPTInWei);
        },
        isBalanceBPTGaugeSufficient() {
            return this.balanceBPTGaugeInWei.gte(this.amountBPTInWei);
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
    },
});
</script>
