<template>
    <div class="p-2 transaction-wrap">
        <div class="quest-group-title p-2">
            Transactions
            <span class="reward-info-wrap ms-1">
                <i class="fas fa-info-circle fs-6" style="opacity: 0.35"></i>
                <span class="tooltip-text"
                    >A reliable historic record of all your reward claims and any similar transfers/redemptions.</span
                >
            </span>
        </div>

        <b-list-group
            v-if="isTransLoading && (!transactions || !transactions.length)"
            class="transaction-table skeleton-loader flex-grow-0 flex-shrink-0"
            style="flex-basis: auto"
        >
            <div class="skeleton-item d-flex p-3 align-items-center">
                <div class="skeleton-username"></div>
            </div>
            <div v-for="n in 10" :key="n" class="skeleton-item d-flex p-1 align-items-center">
                <div class="skeleton-avatar"></div>
                <div class="skeleton-username"></div>
            </div>
        </b-list-group>

        <div v-else-if="!transactions || !transactions.length" class="m-auto text-opaque text-muted empty-message">
            No transactions found.
        </div>

        <div v-else class="transaction-table">
            <div class="table-header">
                <div class="t-image-column"></div>
                <div>Chain</div>
                <div>Amount</div>
                <div>Token</div>
                <div>Hash</div>
                <div>Date</div>
                <div></div>
            </div>
            <div v-for="tx in transactions" :key="tx._id" class="table-row">
                <div class="d-flex justify-content-center t-image-column">
                    <div v-if="getChainName(tx.chainId) === 'Aptos'" class="chain-image"></div>
                </div>
                <div class="chain-name">
                    {{ getChainName(tx.chainId) }}
                </div>
                <div class="chain-amount">{{ (tx.amount / 1000000).toFixed(2) }}</div>
                <div class="chain-token">{{ parseTokenNameFromTo(tx.to) }}</div>
                <div class="chain-hash">
                    <a
                        :href="`https://explorer.aptoslabs.com/txn/${tx.transactionHash}?network=mainnet`"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="hash-link"
                    >
                        {{ truncateHash(tx.transactionHash) }}
                    </a>
                </div>
                <div class="chain-date">{{ formatDate(tx.createdAt) }}</div>

                <div></div>
            </div>
        </div>
    </div>
</template>

<script>
import { defineComponent } from 'vue';
import { useWalletStore } from '@thxnetwork/app/stores/Wallet';
import { mapStores } from 'pinia';
import aptosLogo from '@thxnetwork/app/assets/aptos-logo.png';

export default defineComponent({
    name: 'Transactions',
    data() {
        return {
            // transactions: [
            //     {
            //         _id: '1',
            //         chainId: 1000000001,
            //         amount: 1234567,
            //         to: 'user::asset::TokenA',
            //         createdAt: '2024-12-27T10:00:00Z',
            //         transactionHash: '0x79add2e46ba630ec8fbd44570be4dff74b15e2afd40314c52fb648955465c400',
            //     },
            //     {
            //         _id: '2',
            //         chainId: 1000000001,
            //         amount: 9876543,
            //         to: 'user::asset::TokenB',
            //         createdAt: '2024-12-26T14:30:00Z',
            //         transactionHash: '0x79add2e46ba630ec8fbd44570be4dff74b15e2afd40314c52fb648955465c400',
            //     },
            //     {
            //         _id: '3',
            //         chainId: 1000000001,
            //         amount: 4567890,
            //         to: 'user::asset::TokenC',
            //         createdAt: '2024-12-25T18:45:00Z',
            //         transactionHash: '0x79add2e46ba630ec8fbd44570be4dff74b15e2afd40314c52fb648955465c400',
            //     },
            // ],
            transactions: [],
            isTransLoading: true,
            checkWalletInterval: null,
            aptosLogo,
            windowWidth: window.innerWidth,
        };
    },
    computed: {
        ...mapStores(useWalletStore),
    },
    watch: {
        'walletStore.isLoading': {
            handler(newVal) {
                if (!newVal) {
                    this.fetchTransactions();
                }
            },
            immediate: true,
        },
    },
    mounted() {
        window.addEventListener('resize', this.updateWindowWidth);
        this.checkWalletInterval = setInterval(() => {
            if (this.walletStore && !this.walletStore.isLoading) {
                clearInterval(this.checkWalletInterval);
                this.fetchTransactions();
            }
        }, 100);
    },
    beforeUnmount() {
        if (this.checkWalletInterval) {
            clearInterval(this.checkWalletInterval);
        }
        window.removeEventListener('resize', this.updateWindowWidth);
    },
    methods: {
        async fetchTransactions() {
            try {
                if (!this.transactions || !this.transactions.length) {
                    this.isTransLoading = true;
                }
                const newTransactions = await this.walletStore.getTransactions();
                this.transactions = newTransactions;
            } catch (error) {
                console.error('Error fetching transactions:', error);
                this.transactions = [];
            } finally {
                this.isTransLoading = false;
            }
        },

        formatDate(dateString) {
            if (!dateString) return '';
            const date = new Date(dateString);
            if (this.windowWidth <= 400) {
                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const year = String(date.getFullYear()).slice(-2);
                const hours = String(date.getHours()).padStart(2, '0');
                const minutes = String(date.getMinutes()).padStart(2, '0');
                return `${day}/${month}/${year} ${hours}:${minutes}`;
            }

            const options = {
                month: 'short',
                day: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
            };
            return date.toLocaleString('en-US', options);
        },

        getChainName(chainId) {
            const chainMap = {
                1000000001: 'Aptos',
            };
            return chainMap[chainId] || `Chain ID ${chainId}`;
        },
        parseTokenNameFromTo(toField) {
            if (!toField) return '';
            const parts = toField.split('::asset::');
            return parts.length > 1 ? parts[1] : toField;
        },
        truncateHash(hash) {
            if (!hash) return '';
            if (this.windowWidth <= 780) {
                return `${hash.substring(0, 6)}...`;
            } else if (this.windowWidth <= 992) {
                return `${hash.substring(0, 6)}...${hash.substring(hash.length - 6)}`;
            }
            return `${hash.substring(0, 6)}...${hash.substring(hash.length - 6)}`;
        },
        updateWindowWidth() {
            this.windowWidth = window.innerWidth;
        },
    },
});
</script>

<style scoped>
.transaction-table {
    display: grid;
    grid-template-columns: repeat(1, 1fr);
    overflow: hidden;
    max-width: 950px;
}

.table-header {
    display: grid;
    grid-template-columns: 10% repeat(5, 1fr) 10%;
    background-color: var(--quest-item-bg);
    font-weight: bold;
    text-align: left;
    border-radius: 5px;
    margin-bottom: 6px;
    color: var(--transaction-header-color);
    font-size: 12px;
    font-style: normal;
    font-weight: 400;
    line-height: 21px;
    padding: 10px 0;
}

.table-row {
    display: grid;
    grid-template-columns: 10% repeat(5, 1fr) 10%;
    text-align: left;
    color: var(--transaction-chain-color);
    padding: 10px 0;
    align-items: center;
}

.table-row:nth-child(even) {
    background-color: var(--quest-item-bg);
}

.table-row:nth-child(odd) {
    background-color: var(--main-content-bg);
}

.table-row:last-child {
    border-bottom: none;
}

.chain-name {
    font-size: 14px;
    font-style: normal;
    font-weight: 500;
    line-height: 18px;
}
.chain-amount,
.chain-token,
.chain-hash {
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    line-height: 21px;
}

.chain-date {
    color: var(--transaction-header-color);
    font-size: 12px;
    font-style: normal;
    font-weight: 400;
    line-height: 21px;
}
.transaction-table-skeleton {
    display: grid;
    grid-template-columns: 1fr;
    width: 740px;
}

.skeleton {
    border-radius: 4px;
    background-color: #f2f2f2;
    animation: skeleton-loading 1.5s infinite ease-in-out;
}

.table-header-skeleton {
    height: 40px;
    margin-bottom: 8px;
}

.table-row-skeleton {
    height: 40px;
    margin-bottom: 8px;
}
.chain-image {
    background-image: url('../../assets/aptos-logo.png');
    width: 34px;
    height: 29px;
    filter: invert(1);
    background-size: cover;
}
[data-theme='dark'] .chain-image {
    filter: invert(0);
}
.transaction-wrap {
    display: flex;
    flex-direction: column;
    height: 100%;
}
.transaction-table {
    flex: 1;
    overflow-y: auto;
    scrollbar-width: none;
}
.hash-link {
    color: var(--transaction-chain-color);
    text-decoration: none;
    cursor: pointer;
}
.hash-link:hover {
    text-decoration: underline;
}

@media (max-width: 450px) {
    .table-row {
        grid-template-columns: 10% 40px 45px 55px repeat(1, 1fr) repeat(1, 1fr);
        gap: 5px;
    }
    .table-header {
        grid-template-columns: 10% 40px 45px 55px repeat(1, 1fr) repeat(1, 1fr);
        gap: 5px;
    }
}
@media (max-width: 390px) {
    .chain-amount,
    .chain-token,
    .chain-hash,
    .chain-name {
        font-size: 12px;
    }
}
@media (max-width: 350px) {
    .transaction-table {
        overflow: auto;
    }
}
@keyframes skeleton-loading {
    0% {
        background-color: #f0f0f0;
    }
    50% {
        background-color: #a7a4a4;
    }
    100% {
        background-color: #f0f0f0;
    }
}
</style>
