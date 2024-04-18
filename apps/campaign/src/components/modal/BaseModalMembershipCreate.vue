<template>
    <b-modal v-model="isShown" size="lg" centered hide-footer @hidden="$emit('hidden')" @show="onShow">
        <template #header>
            <h5 class="modal-title">
                <i class="fas fa-user-plus me-2" />
                Become a member today
            </h5>
            <b-link class="btn-close" @click="$emit('hidden')"><i class="fas fa-times"></i></b-link>
        </template>
        <b-row class="mb-3">
            <b-col>
                <div class="text-opaque">Amount</div>
                <strong>{{ toFiatPrice(Number(amount)) }}</strong>
            </b-col>
            <b-col>
                <div class="text-opaque">Lock end date</div>
                <strong>{{ format(new Date(lockEnd), 'MMMM do yyyy hh:mm:ss') }}</strong>
            </b-col>
        </b-row>
        <BaseCardStatusCheck
            label="Provided liquidity"
            :description="`${formatUnits(balances.BPT, 18)} 20USDC-80THX`"
            :status="isLiquidityProvided"
        >
            <BaseButtonApprove
                v-if="!isAllowanceUSDCSufficient"
                :amount="amount.toString()"
                :token="{ address: address.USDC, decimals: 6 }"
                :spender="address.BalancerVault"
                @success="onApproveLiquidityCreate"
            />
            <BaseButtonLiquidityCreate
                v-else
                :amounts="[parseUnits(amount, 6).toString(), '0']"
                :tokens="[address.USDC, address.THX]"
                :slippage="0.5"
                @success="onLiquidityCreate"
            />
        </BaseCardStatusCheck>
        <BaseCardStatusCheck
            label="Staked liquidity"
            :description="`${formatUnits(balances.BPTGauge, 18)} 20USDC-80THX`"
            :status="isLiquidityStaked"
        >
            <BaseButtonApprove
                v-if="!isAllowanceBPTSufficient"
                :amount="formatUnits(amountBPT, 18).toString()"
                :token="{ address: address.BPT, decimals: 18 }"
                :spender="address.BPTGauge"
                @success="onApproveLiquidityStake"
            />
            <BaseButtonLiquidityStake v-else :amount="amountBPT.toString()" @success="onLiquidityStake" />
        </BaseCardStatusCheck>
        <BaseCardStatusCheck
            v-if="!Number(balances.VeTHX)"
            label="locked liquidity"
            :description="`${balances.VeTHX} veTHX`"
            :status="isLiquidityLocked"
        >
            <BaseButtonApprove
                v-if="!isAllowanceBPTGaugeSufficient"
                :amount="formatUnits(amountBPTGauge, 18).toString()"
                :token="{ address: address.BPTGauge, decimals: 18 }"
                :spender="address.VotingEscrow"
                @success="onApproveLiquidityLock"
            />
            <BaseButtonLock v-else :amount="amountBPTGauge.toString()" :lock-end="lockEnd" @success="onLiquidityLock" />
        </BaseCardStatusCheck>
        <b-button v-if="Number(balances.VeTHX)" to="/earn" variant="success" class="w-100"> Your Membership </b-button>
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
import { toFiatPrice } from '@thxnetwork/campaign/utils/price';

enum CollapseStep {
    Liquidity = 'liquidity',
    Lock = 'lock',
}

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
            CollapseStep,
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
        balances() {
            return {
                USDC: this.walletStore.balances[this.address.USDC] || '0',
                BPT: this.walletStore.balances[this.address.BPT] || '0',
                BPTGauge: this.walletStore.balances[this.address.BPTGauge] || '0',
                VeTHX: this.veStore.lock ? this.veStore.balance.toString() : '0',
            };
        },
        amountBPT() {
            if (!this.balances.BPT) return BigNumber.from(0);
            return BigNumber.from(this.balances.BPT);
        },
        amountBPTGauge() {
            if (!this.balances.BPTGauge) return BigNumber.from(0);
            return BigNumber.from(this.balances.BPTGauge);
        },
        allowances() {
            return this.walletStore.allowances;
        },
        amountInWei() {
            return parseUnits(this.amount, 6);
        },
        isBalanceUSDCSufficient() {
            if (!this.balances.USDC) return;
            return BigNumber.from(this.balances.USDC).gte(this.amountInWei);
        },
        isAllowanceUSDCSufficient() {
            if (!this.allowances[this.address.USDC]) return false;
            if (!this.allowances[this.address.USDC][this.address.BalancerVault]) return false;
            return BigNumber.from(this.allowances[this.address.USDC][this.address.BalancerVault]).gte(this.amountInWei);
        },
        isBalanceBPTSufficient() {
            if (!this.balances.BPT) return false;
            if (!this.liquidityStore.pricing['20USDC-80THX']) return false;
            // Checks if BPT gauge balance has a value greater than 3 USD
            // Dollar price for bpt and bpt-gauge is equal
            const bptUSDPriceInWei = parseUnits(this.liquidityStore.pricing['20USDC-80THX'].toString(), 18);
            return BigNumber.from(this.balances.BPT).gte(bptUSDPriceInWei.mul(3));
        },
        isAllowanceBPTSufficient() {
            if (!this.balances.BPT || BigNumber.from(this.balances.BPT).eq(0)) return false;
            if (!this.allowances[this.address.BPT]) return false;
            if (!this.allowances[this.address.BPT][this.address.BPTGauge]) return false;
            const allowanceInWei = this.allowances[this.address.BPT][this.address.BPTGauge];
            return BigNumber.from(allowanceInWei).gte(this.balances.BPT);
        },
        isBalanceBPTGaugeSufficient() {
            if (!this.balances.BPTGauge) return false;
            if (!this.liquidityStore.pricing['20USDC-80THX']) return false;
            // Checks if BPT gauge balance has a value greater than 3 USD
            // Dollar price for bpt and bpt-gauge is equal
            const bptUSDPriceInWei = parseUnits(this.liquidityStore.pricing['20USDC-80THX'].toString(), 18);
            console.log(this.balances.BPTGauge, bptUSDPriceInWei.mul(3).toString());
            return BigNumber.from(this.balances.BPTGauge).gte(bptUSDPriceInWei.mul(3));
        },
        isAllowanceBPTGaugeSufficient() {
            if (!this.allowances[this.address.BPTGauge]) return false;
            if (!this.allowances[this.address.BPTGauge][this.address.VotingEscrow]) return false;
            return BigNumber.from(this.allowances[this.address.BPTGauge][this.address.VotingEscrow]).gte(
                this.balances.BPTGauge,
            );
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
        onApproveLiquidityCreate() {
            this.walletStore.getApproval({ tokenAddress: this.address.USDC, spender: this.address.BalancerVault });
        },
        onLiquidityCreate() {
            this.walletStore.getBalance(this.address.USDC);
            this.walletStore.getBalance(this.address.BPT);
        },
        onApproveLiquidityStake() {
            this.walletStore.getApproval({ tokenAddress: this.address.BPT, spender: this.address.BPTGauge });
        },
        onLiquidityStake() {
            this.walletStore.getBalance(this.address.BPT);
            this.walletStore.getBalance(this.address.BPTGauge);
        },
        onApproveLiquidityLock() {
            this.walletStore.getApproval({
                tokenAddress: this.address.BPTGauge,
                spender: this.address.VotingEscrow,
            });
        },
        onLiquidityLock() {
            const wallet = this.walletStore.wallet;
            if (!wallet) return;

            this.walletStore.getBalance(this.address.BPTGauge);
            this.veStore.getLocks(wallet);
        },
    },
});
</script>
