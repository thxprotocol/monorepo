<template>
    <div ref="dropdown" class="form-group wallet-list-group">
        <p v-if="description" class="description">{{ description }}</p>
        <div class="d-flex align-items-stretch gap-1">
            <div class="wallet-list-header" @click="toggleDropdown">
                <span v-if="walletModel"> {{ walletModel.short }} ({{ walletModel.variant }}) </span>
                <span v-else class="d-flex align-items-center"> Choose a wallet... </span>
                <i class="fas fa-chevron-down"></i>
            </div>

            <ul v-if="dropdownVisible" class="wallet-list">
                <li class="disabled">
                    <span v-if="!walletModel">
                        <i class="fas fa-check"></i>
                    </span>
                    Choose a wallet...
                </li>
                <template v-if="!walletStore.isLoading">
                    <!-- Wallet options -->
                    <li
                        v-for="w in wallets"
                        :key="w.id || w.short"
                        :class="{ disabled: isDisabled(w), selected: walletModel && walletModel.address === w.address }"
                        @click="selectWallet(w)"
                    >
                        <span v-if="walletModel && walletModel.address === w.address">
                            <i class="fas fa-check"></i>
                        </span>
                        {{ w.short }} ({{ w.variant }})
                    </li>
                </template>
            </ul>

            <b-button variant="primary" class="rounded" style="padding: 0.75rem" @click="onClickAdd">
                <i class="fas fa-plus"></i>
            </b-button>
        </div>
    </div>
</template>

<script lang="ts">
import { mapStores } from 'pinia';
import { defineComponent, PropType } from 'vue';
import { chainList } from '../../utils/chains';
import { WalletVariant } from '../../types/enums/accountVariant';
import { useWalletStore } from '../../stores/Wallet';
import { ChainId } from '@thxnetwork/common/enums';

export default defineComponent({
    name: 'CustomWalletDropdown',
    props: {
        chainId: Number,
        description: String,
        modelValue: {
            type: Object as PropType<TWallet>,
            default: null,
        },
        variants: {
            type: Array,
            default: () => [WalletVariant.Safe, WalletVariant.WalletConnect],
        },
    },
    data() {
        return {
            chainList,
            WalletVariant,
            ChainId,
            dropdownVisible: false,
        };
    },
    computed: {
        ...mapStores(useWalletStore),
        walletModel: {
            get() {
                return this.modelValue;
            },
            set(value: TWallet) {
                this.$emit('update:modelValue', value);
            },
        },
        wallets() {
            return this.walletStore.wallets.filter((wallet: TWallet) => this.variants.includes(wallet.variant));
        },
    },
    mounted() {
        document.addEventListener('click', this.handleClickOutside);
        if (!this.walletStore.wallets.length && !this.walletStore.isLoading) {
            console.log('Wallets list is empty and not loading. Triggering list function.');
            this.walletStore.list();
        }
    },
    beforeUnmount() {
        document.removeEventListener('click', this.handleClickOutside);
    },
    methods: {
        toggleDropdown() {
            this.dropdownVisible = !this.dropdownVisible;
        },
        selectWallet(w: TWallet) {
            if (this.isDisabled(w)) {
                console.log('disabled');
                return;
            }
            this.walletModel = w;
            this.dropdownVisible = false;
        },
        isDisabled(w: TWallet): boolean {
            return (
                w.variant === this.WalletVariant.Safe ||
                (this.chainId == this.ChainId.Aptos && w.chainId !== this.ChainId.Aptos) ||
                (this.chainId !== this.ChainId.Aptos && w.chainId == this.ChainId.Aptos) ||
                (this.chainId == this.ChainId.Sui && w.chainId !== this.ChainId.Sui) ||
                (this.chainId !== this.ChainId.Sui && w.chainId == this.ChainId.Sui) ||
                (this.chainId == this.ChainId.Solana && w.chainId !== this.ChainId.Solana) ||
                (this.chainId !== this.ChainId.Solana && w.chainId == this.ChainId.Solana)
            );
        },
        onClickAdd() {
            this.walletStore.currentChainId = this.chainId;
            this.walletStore.isModalWalletCreateShown = true;
        },
        handleClickOutside(event: MouseEvent) {
            const dropdown = this.$refs.dropdown as HTMLElement;
            if (dropdown && !dropdown.contains(event.target as Node)) {
                this.dropdownVisible = false;
            }
        },
    },
});
</script>

<style scoped>
.wallet-list-group {
    position: relative;
    margin-bottom: 1rem;
}

.description {
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
    color: #666;
}

.d-flex {
    display: flex;
    align-items: center;
}

.wallet-list-header {
    background: var(--border-as-nav-color);
    border: 1px solid var(--nav-border-color);
    border-radius: 0.375rem;
    padding: 0.5rem;
    flex: 1;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.wallet-list {
    top: 0;
    position: absolute;
    left: 0;
    right: 150px;
    border: 1px solid var(--nav-border-color);
    border-radius: 0.375rem;
    max-height: 200px;
    width: calc(100% - 40px);
    overflow-y: auto;
    margin: 0;
    padding: 0;
    list-style: none;
    z-index: 1000;
    background: var(--wallet-select-bg);
}

.wallet-list li {
    padding: 0.5rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    opacity: 0.5;
    transition: background-color 0.2s ease, opacity 0.2s ease;
}

.wallet-list li.disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.wallet-list li.selected {
    background-color: var(--selected-wallet-bg);
    cursor: default;
    color: var(--selected-wallet-list-color);
    opacity: 1;
}

.wallet-list li:not(.disabled):not(.selected):hover {
    background-color: var(--selected-wallet-bg);
    cursor: pointer;
    color: var(--selected-wallet-list-color);
    opacity: 1;
}
.wallet-list li i {
    margin-right: 0.5rem;
}
</style>
