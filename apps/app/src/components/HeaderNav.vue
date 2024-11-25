<template>
    <!-- <nav v-if="isVisible" class="header-nav"> -->

    <nav v-if="isVisible" class="header-nav d-flex w-100 justify-content-between">
        <!-- Your header content -->
        <!-- <h1>Header Navigation</h1> -->
        <div class="d-flex media-header">
            <div class="d-flex align-items-center gap-2 media-header-first">
                <img :src="rewardsIcon" alt="rewards" width="40" height="40" />
                <h1 class="m-0 fs-3 fw-bold">Rewards</h1>
            </div>

            <div class="d-flex gap-3 balance-wrap media-header-third">
                <div class="balance-box">
                    <h2>Santa <span class="d-block">Points</span></h2>
                    <div class="d-flex align-items-center">
                        <p>{{ numberWithCommas(formattedBalance(participantSantaState, SANTA_CAMPAIGN)) }}</p>
                        <img :src="imgStarCoin" alt="Star Coin" loading="lazy" width="24" />
                    </div>
                </div>
                <div class="balance-box">
                    <h2>Cash <span class="d-block">Rewards</span></h2>
                    <p>${{ numberWithCommas(formattedBalance(participantCPState, CP_CAMPAIGN)) }}</p>
                </div>
            </div>
        </div>

        <div class="d-flex gap-2 media-header-second">
            <BaseCardWalletInfo />
            <BaseDropdownWallets />
            <div
                class="d-flex align-items-center justify-content-between name-avatar"
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
    },
    async created() {
        // await this.accountStore.getParticipants();
    },
    mounted() {
        this.startTypingAnimation();
    },
    beforeUnmount() {
        clearInterval(this.typingInterval);
    },
    methods: {
        updateParticipants() {
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
}

.header-nav h2 {
    color: #f5f5f5;
    font-feature-settings: 'clig' off, 'liga' off;
    font-size: 12px;
    font-style: italic;
    font-weight: 700;
    text-transform: uppercase;
    margin: 0;
    white-space: nowrap;
}

.header-nav p {
    color: #f5f5f5;
    font-feature-settings: 'clig' off, 'liga' off;
    font-size: 20px;
    font-style: normal;
    font-weight: 600;
    line-height: 16px;
    margin: 0;
}

.b-avatar-header {
    border: 2px dotted #064f17;
}

.name-avatar {
    width: 100%;
    height: 32px;
    border-radius: 4px;
    border: 0.5px solid #834bc4;
    background: var(--avatar-background);
}

.name-avatar:hover h2 {
    text-decoration: underline;
    cursor: pointer;
}
.name-avatar {
    padding-right: 2px !important;
}
.username {
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
    width: 190px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: linear-gradient(290deg, #b13030 30.17%, #de5947 97.55%);
    border-radius: 5px;
    padding: 11px 10px;
}

.media-header {
    gap: 3rem;
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
@media (max-width: 992px) {
    .header-nav {
        padding-right: 0;
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
}

@media (max-width: 992px) {
    .header-nav {
        flex-direction: column;
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
        //margin-right: 1rem;
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
    }
}
@media (max-width: 527px) {
    .media-header-first h1 {
        display: none;
    }
}

@media (max-width: 426px) {
    .media-header-first img {
        display: none;
    }
    .media-header-third {
        margin-top: 40px;
    }
    .media-header-second > * {
        flex: 1 1 100%;
        max-width: 100%;
    }
    .media-header-second {
        width: 100%;
    }
    .username {
        display: none;
    }
    .name-avatar {
        padding-right: 0 !important;
        justify-content: center !important;
    }
}
.total-earnings p {
    font-size: 20px;
    text-align: right;
    display: block;
    width: 100%;
}
</style>
