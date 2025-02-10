<template>
    <!-- <nav v-if="isVisible" class="header-nav"> -->

    <nav v-if="isVisible" class="header-nav d-flex w-100 justify-content-between">
        <!-- Your header content -->
        <!-- <h1>Header Navigation</h1> -->
        <div class="d-flex media-header">
            <div class="d-flex align-items-center gap-2 media-header-first rewards-navbar">
                <img :src="rewardsIcon" alt="rewards" width="40" height="40" />
                <h1 class="m-0 fs-3 fw-bold" :class="{ 'hide-on-small': !showHeaderTitle }">Rewards</h1>
            </div>
        </div>

        <div class="d-flex gap-3 align-items-center">
            <!-- <BaseCardWalletInfo @list-updated="updateHeaderVisibility" /> -->
            <!-- <BaseDropdownWallets /> -->
            <div class="d-flex gap-2 balance-wrap media-header-third">
                <div class="balance-box">
                    <h2>Referral <span class="d-block">Code</span></h2>
                    <div class="d-flex align-items-center">{{ accountStore.referralCode }}</div>
                </div>
                <div class="balance-box">
                    <h2>Santa <span class="d-block">Points</span></h2>
                    <div class="d-flex align-items-center">
                        <p>{{ numberWithCommas(formattedBalance(participantSantaState, SANTA_CAMPAIGN)) }}</p>
                        <img :src="imgStarCoin" alt="Star Coin" loading="lazy" width="24" class="ps-1" />
                    </div>
                </div>
                <div class="balance-box">
                    <h2>Cash <span class="d-block">Rewards</span></h2>
                    <p>${{ numberWithCommas(formattedBalance(participantCPState, CP_CAMPAIGN)) }}</p>
                </div>
            </div>
            <div
                class="d-flex align-items-center justify-content-between name-avatar media-header-second"
                @click="accountStore.isModalAccountShown = true"
            >
                <h2 class="username">
                    <template v-if="accountStore?.account?.username">
                        {{ accountStore.account.username }}
                    </template>
                    <template v-else>
                        <!-- <span class="typing-placeholder">{{ typingDots }}</span> -->
                    </template>
                </h2>
                <b-avatar class="b-avatar-header" size="24" :src="accountStore?.account?.profileImg" variant="dark" />
            </div>
        </div>
    </nav>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { useAccountStore } from '../stores/Account';
import { mapStores } from 'pinia';
import { SANTA_CAMPAIGN, CP_CAMPAIGN } from '../config/secrets';
import imgStarCoin from '../assets/star-coin.png';
import { useQuestStore } from '../stores/Quest';
import rewardsIcon from '../assets/rewards-icon.png';
import { useTrackPageview } from '../utils/snowplowTracker';
export default defineComponent({
    name: 'HeaderNav',
    props: {
        isVisible: {
            type: Boolean as PropType<boolean>,
            required: true,
        },
    },
    data() {
        return {
            SANTA_CAMPAIGN,
            CP_CAMPAIGN,
            imgStarCoin,
            showSantaDropdown: false,
            showCPDropdown: false,
            participantSantaState: null as any,
            participantCPState: null as any,
            dotCount: 0,
            typingInterval: undefined as ReturnType<typeof setInterval> | undefined,
            rewardsIcon,
            showHeaderTitle: true,
        };
    },
    computed: {
        ...mapStores(useAccountStore, useQuestStore),
        latestCompletedQuest() {
            const { quests } = this.questStore;
            return quests.find((quest: any) => !quest.isAvailable);
        },
        typingDots() {
            return '.'.repeat(this.dotCount);
        },
    },
    watch: {
        'accountStore.participants': {
            handler(newVal) {
                this.updateParticipants();
            },
            immediate: true,
        },
        'accountStore.account': {
            handler(newVal) {
                this.updateParticipants();
            },
            immediate: true,
        },
    },
    async created() {
        // await this.accountStore.getParticipants();
    },
    mounted() {
        useTrackPageview();
        this.startTypingAnimation();
    },
    beforeUnmount() {
        clearInterval(this.typingInterval);
    },
    methods: {
        updateParticipants() {
            if (!this.accountStore.account?.sub) {
                return;
            }
            this.participantSantaState = this.accountStore.participants.find(
                (p) => p.sub === this.accountStore.account?.sub && p.poolId === this.SANTA_CAMPAIGN,
            );
            this.participantCPState = this.accountStore.participants.find(
                (p) => p.sub === this.accountStore.account?.sub && p.poolId === this.CP_CAMPAIGN,
            );
        },
        balance(participant: TParticipant) {
            if (!participant) return 0;
            const balance = Number(participant.balance);
            return isNaN(balance) ? 0 : balance;
        },
        score(participant: TParticipant) {
            if (!participant) return 0;
            const score = Number(participant.score);
            return isNaN(score) ? 0 : score;
        },
        formattedScore(participant: TParticipant, campaignId: string) {
            if (campaignId === CP_CAMPAIGN) {
                const score = this.score(participant) / 100;
                return Number.isInteger(score) ? score : score.toFixed(2);
            }
            return this.score(participant);
        },
        formattedBalance(participant: TParticipant, campaignId: string) {
            if (campaignId === CP_CAMPAIGN) {
                const balance = this.balance(participant) / 100;
                return Number.isInteger(balance) ? balance : balance.toFixed(2);
            }
            return this.balance(participant);
        },
        numberWithCommas(x: number | string) {
            return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        },
        startTypingAnimation() {
            this.typingInterval = setInterval(() => {
                this.dotCount = (this.dotCount + 1) % 12;
            }, 100);
        },
        updateHeaderVisibility(isListEmpty: any) {
            this.showHeaderTitle = isListEmpty;
        },
    },
});
</script>

<style lang="scss" scoped>
.media-header-first h1 {
    color: var(--title-color);
}
.header-nav {
    position: relative;
    background: transparent;
    padding-right: 50px;
    padding-bottom: 10px;
    width: auto !important;
}

.header-nav h2 {
    color: var(--balance-box-color);
    font-feature-settings: 'clig' off, 'liga' off;
    font-size: 12px;
    font-style: italic;
    font-weight: 700;
    text-transform: uppercase;
    margin: 0;
    white-space: nowrap;
    line-height: 15px;
}

.header-nav p {
    color: var(--balance-box-amount-color);
    font-feature-settings: 'clig' off, 'liga' off;
    font-size: 15px;
    font-style: normal;
    font-weight: 600;
    line-height: 16px;
    margin: 0;
    padding-top: 1px;
}

.b-avatar-header {
    border: 2px dotted #064f17;
    margin-left: 2px;
}

.name-avatar {
    width: 100%;
    height: 32px;
    border-radius: 4px;
    border: 0.5px solid #834bc4;
    background: var(--avatar-background);
    min-width: 140px;
}

.name-avatar:hover h2 {
    text-decoration: underline;
    cursor: pointer;
}
.name-avatar {
    padding-right: 2px !important;
}
.username {
    color: #fff !important;
    padding-left: 10px;
    max-width: 160px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.dropdown-content {
    position: absolute;
    background-color: #000;
    /* min-width: 160px; */
    box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
    z-index: 1;
    border-radius: 20px;
    transform: translate(-10px, 43px);
    padding: 1em;
    border: 1px dotted #ffcd06;
    width: 100%;
    top: -1px;
    animation: fadeIn 0.5s ease-in-out;
}

.balance-box {
    position: relative;
    width: 190px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: var(--balance-box-bg);
    border-radius: 8px;
    padding: 0 12px;
    box-shadow: var(--balance-box-shadow);
    border: 0.5px solid var(--balance-box-border-color);
}
.balance-box::before {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    border: 1px solid rgba(255, 255, 255, 0.47);
    box-sizing: border-box;
    border-radius: 8px;
    mix-blend-mode: overlay;
}

.media-header {
    gap: 37px;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

.dropdown-content p {
    font-size: 12px;
}

.dropdown-content p span {
    color: #c1c1c1;
}

@media (min-width: 992px) {
    .rewards-navbar {
        justify-content: center;
    }
    .balance-wrap {
        margin-left: 47px;
    }
    .header-nav {
        margin-left: 15px;
    }
}

@media (max-width: 992px) {
    .header-nav {
        padding-right: 0;
        flex-direction: column;
        padding-bottom: 0;
        border-width: 0;
    }
    .b-avatar-header {
        position: relative;
        right: 0;
    }
    .name-avatar {
        padding-right: 10px !important;
    }
    .balance-wrap {
        width: 100% !important;
        box-sizing: border-box;
        padding-right: 8px;
    }
    .media-header {
        flex-direction: column;
        gap: 0.5rem;
    }
    .media-header-first {
        order: 1;
    }
    .media-header-second {
        order: 2;
        position: absolute;
        right: 0;
        top: 0;
        width: 100px;
    }
    .media-header-third {
        order: 3;
    }
    .balance-box {
        flex: 1 1 50%;
        box-sizing: border-box;
    }
    .balance-wrap {
        padding-right: 0;
        margin-top: 14px;
    }
}
@media (max-width: 527px) {
    .hide-on-small {
        display: none;
    }
}

@media (max-width: 320px) {
    .media-header-first h1 {
        display: none;
    }
}
.total-earnings p {
    font-size: 20px;
    text-align: right;
    display: block;
    width: 100%;
}
</style>
