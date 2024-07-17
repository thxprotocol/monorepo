<template>
    <BaseFormGroupInputTokenAmount
        :usd="liquidityStore.pricing['20USDC-80THX']"
        :balance="balanceBPTGauge"
        :value="value"
        :min="0"
        :max="balanceBPTGauge"
        class="mb-4"
        @update="$emit('update', $event)"
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
</template>

<script lang="ts">
import { contractNetworks } from '@thxnetwork/app/config/constants';
import { useLiquidityStore } from '@thxnetwork/app/stores/Liquidity';
import { useVeStore } from '@thxnetwork/app/stores/VE';
import { useWalletStore } from '@thxnetwork/app/stores/Wallet';
import { ChainId } from '@thxnetwork/common/enums';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import { mapStores } from 'pinia';
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'BaseFormGroupLockAmount',
    props: {
        value: { type: Number, required: true },
    },
    data() {
        return {
            parseUnits,
            minBPTGValue: parseUnits('3', 'ether'),
        };
    },
    computed: {
        ...mapStores(useWalletStore, useVeStore, useLiquidityStore),
        address() {
            if (!this.walletStore.chainId) return contractNetworks[ChainId.Polygon];
            return contractNetworks[this.walletStore.chainId];
        },
        balanceBPTGauge() {
            if (!this.walletStore.balances[this.address.BPTGauge]) return 0;
            return Number(formatUnits(this.walletStore.balances[this.address.BPTGauge], 'ether'));
        },
        minAmount() {
            if (!this.liquidityStore.pricing['20USDC-80THX']) return 0;
            const bptPriceInWei = parseUnits(String(this.liquidityStore.pricing['20USDC-80THX']), 18);
            return Number(formatUnits(this.minBPTGValue.div(bptPriceInWei), 18));
        },
    },
});
</script>
<style scoped>
.form-control {
    border-color: var(--bs-primary);
}
</style>
