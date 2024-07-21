<template>
    <b-modal
        v-model="isShown"
        title="Select a token for your payment"
        centered
        hide-footer
        @hidden="$emit('hidden')"
        @show="onShow"
    >
        <b-list-group>
            <b-list-group-item
                v-for="t of tokens"
                class="d-flex align-items-center justify-content-between"
                button
                variant="primary"
                @click="$emit('change', t)"
            >
                <b-img :src="t.logoImgURL" :alt="`${t.symbol} icon`" width="20" height="20" class="me-3" />
                <div>
                    <div class="d-flex align-items-center">
                        <span style="font-size: 1rem">{{ t.symbol }}</span>
                        <b-link class="ms-1" @click.stop="openURL(`${chainInfo.blockExplorer}/token/${t.address}`)">
                            <i class="fas fa-external-link-alt text-white text-opaque small" />
                        </b-link>
                    </div>
                    <div class="text-opaque small">
                        Balance: {{ Number(formatUnits(t.balance, t.decimals)).toFixed(6) }}
                    </div>
                </div>
                <div class="ms-auto text-opaque me-2">
                    {{ toFiatPrice(t.value) }}
                </div>
            </b-list-group-item>
        </b-list-group>
    </b-modal>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { mapStores } from 'pinia';
import { useVeStore } from '../../stores/VE';
import { useWalletStore } from '../../stores/Wallet';
import { toFiatPrice } from '@thxnetwork/app/utils/price';
import { useLiquidityStore } from '@thxnetwork/app/stores/Liquidity';
import { contractNetworks } from '@thxnetwork/app/config/constants';
import { ChainId } from '@thxnetwork/common/enums';
import { chainList } from '@thxnetwork/app/utils/chains';
import { formatUnits } from 'ethers/lib/utils';

export default defineComponent({
    name: 'BaseModalTokenSelect',
    props: {
        show: Boolean,
        token: { type: Object as PropType<TToken>, required: true },
        tokens: { type: Object as PropType<TToken[]>, required: true },
    },
    data() {
        return {
            formatUnits,
            toFiatPrice,
            isShown: false,
            error: '',
        };
    },
    computed: {
        ...mapStores(useVeStore, useWalletStore, useLiquidityStore),
        chainInfo() {
            if (!this.walletStore.chainId) return chainList[ChainId.Polygon];
            return chainList[this.walletStore.chainId];
        },
        address() {
            if (!this.walletStore.chainId) return contractNetworks[ChainId.Polygon];
            return contractNetworks[this.walletStore.chainId];
        },
    },
    watch: {
        show(value) {
            this.isShown = value;
        },
    },
    methods: {
        onShow() {
            this.isShown = true;
        },
        openURL(path: string) {
            window.open(path, '_blank');
        },
    },
});
</script>
