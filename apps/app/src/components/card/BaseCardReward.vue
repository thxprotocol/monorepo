<template>
    <b-card no-body class="gr-2 x-lg-0 card-wrapper h-100" :class="{ 'card-promoted': reward.isPromoted }">
        <b-card-body
            v-if="reward.poolId === CP_CAMPAIGN || reward.poolId === SANTA_CAMPAIGN"
            class="d-flex flex-column justify-content-between cp-campaign-card"
            :style="{ height: 'auto', background: !reward.isPromoted ? backgroundColor : '' }"
        >
            <b-button v-if="reward.isPromoted" class="d-flex align-items-center promoted-title" variant="success">
                Promoted
            </b-button>
            <b-card-title v-if="!reward.isPromoted" class="d-flex align-items-center reward-title px-2 pt-2">
                <i class="me-2 text-opaque small" :class="iconMap[reward.variant]" />
                <slot name="title" />
            </b-card-title>
            <div class="d-flex justify-content-center">
                <div
                    v-if="!image"
                    :class="!reward.isPromoted ? 'reward-image-placeholder' : 'reward-img-promoted-ph'"
                ></div>
                <img
                    v-else
                    :src="image"
                    alt="Image"
                    loading="lazy"
                    :class="!reward.isPromoted ? 'reward-image' : 'reward-img-promoted'"
                />
            </div>
            <b-card-title v-if="reward.isPromoted" class="d-flex align-items-center reward-title-promoted">
                <slot name="title" />
            </b-card-title>
            <div>
                <button
                    v-if="!accountStore.isAuthenticated"
                    class="w-100 my-btn"
                    variant="primary"
                    @click="authStore.isModalLoginShown = !authStore.isModalLoginShown"
                >
                    <template v-if="reward.pointPrice">
                        Pay <strong>{{ reward.pointPrice }} points</strong>
                    </template>
                    <strong v-else> Free! </strong>
                </button>
                <span v-else id="disabled-wrapper" class="d-block mx-3 mb-2" tabindex="0">
                    <button
                        v-b-modal="`modalRewardPayment${reward._id}`"
                        variant="primary"
                        block
                        :class="`w-100 position-relative mb-0 bg-red ${isInsufficientPoints ? 'locked' : 'my-btn'}`"
                        :disabled="isDisabled"
                    >
                        <div v-if="isInsufficientPoints">Locked</div>
                        <div
                            v-if="reward.pointPrice && !isInsufficientPoints"
                            class="d-flex align-items-center justify-content-center"
                        >
                            <span class="point me-1">{{ formattedPrice }}</span>
                            <img
                                v-if="reward.poolId === SANTA_CAMPAIGN"
                                :src="StarCoin"
                                alt="star"
                                loading="lazy"
                                height="13"
                                class="me-1"
                            />
                            <span v-if="reward.poolId === SANTA_CAMPAIGN" class="coins-text">Points</span>
                        </div>
                        <div v-if="!reward.pointPrice" class="d-flex align-items-center justify-content-center">
                            <span class="point me-1">Free!</span>
                        </div>
                        <b-progress
                            v-if="reward.limitProgress.max"
                            v-b-tooltip.bottom
                            :variant="limitVariant"
                            :title="`You can purchase this reward ${reward.limitProgress.max} times.`"
                            :value="reward.limitProgress.count"
                            :max="reward.limitProgress.max"
                            style="height: 6px"
                        />
                    </button>
                </span>
            </div>
        </b-card-body>
    </b-card>
    <BaseModalRewardPayment :id="`modalRewardPayment${reward._id}`" :reward="reward" />
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { format, formatDistance } from 'date-fns';
import { useAccountStore } from '../../stores/Account';
import { mapStores } from 'pinia';
import { RewardVariant } from '../../types/enums/rewards';
import { useAuthStore } from '@thxnetwork/app/stores/Auth';
import StarCoin from '../../assets/star-coin.png';
import { SANTA_CAMPAIGN, CP_CAMPAIGN } from '@thxnetwork/app/config/secrets';
export const iconMap = {
    [RewardVariant.Coin]: 'fas fa-coins',
    [RewardVariant.NFT]: 'fas fa-palette',
    [RewardVariant.Coupon]: 'fas fa-tags',
    [RewardVariant.Custom]: 'fas fa-gift',
    [RewardVariant.DiscordRole]: 'fab fa-discord',
} as { [variant: string]: string };

export default defineComponent({
    name: 'BaseCardReward',
    props: {
        image: String,
        reward: {
            type: Object as PropType<TReward & { isExpired: boolean; isStocked: boolean }>,
            required: true,
        },
    },
    data() {
        return {
            format,
            iconMap: {
                [RewardVariant.Coin]: 'fas fa-coins',
                [RewardVariant.NFT]: 'fas fa-palette',
                [RewardVariant.Coupon]: 'fas fa-tags',
                [RewardVariant.Custom]: 'fas fa-gift',
                [RewardVariant.DiscordRole]: 'fab fa-discord',
            } as { [variant: string]: string },
            StarCoin,
            SANTA_CAMPAIGN,
            CP_CAMPAIGN,
        };
    },
    computed: {
        ...mapStores(useAccountStore, useAuthStore),
        participantBalance() {
            const participant = this.accountStore.participants.find((p) => p.sub === this.accountStore.account?.sub);
            if (!participant) return 0;

            if (this.reward.poolId === SANTA_CAMPAIGN && participant.poolId === SANTA_CAMPAIGN) {
                return participant.balance || 0;
            } else if (this.reward.poolId === CP_CAMPAIGN && participant.poolId === CP_CAMPAIGN) {
                return participant.balance || 0;
            }

            return 0;
        },
        isInsufficientPoints() {
            return this.participantBalance < this.reward.pointPrice;
        },
        limitSupplyVariant() {
            if (this.limitSupplyPerct >= 0.9) return 'text-danger';
            if (this.limitSupplyPerct > 0.75 && this.limitSupplyPerct < 0.9) return 'text-warning';
            if (this.limitSupplyPerct >= 0 && this.limitSupplyPerct <= 0.75) return 'text-success';
        },
        limitVariant() {
            if (this.limitPerct >= 0.75) return 'danger';
            if (this.limitPerct > 0.5 && this.limitPerct < 0.75) return 'warning';
            if (this.limitPerct >= 0 && this.limitPerct <= 0.5) return 'success';
        },
        btnLabel() {
            if (this.reward.isLimitSupplyReached) {
                return 'Sold out';
            } else if (this.reward.isLimitReached) {
                return 'Limit reached';
            } else if (this.reward.isExpired) {
                return 'Expired';
            } else if (this.reward.isDisabled) {
                return 'Not available';
            } else if (this.reward.pointPrice) {
                // return `${this.reward.pointPrice} point${
                //     this.reward.pointPrice && this.reward.pointPrice > 1 ? 's' : ''
                // }`;
                return '';
            } else {
                return 'Free!';
            }
        },
        isDisabled() {
            return !this.reward.isAvailable;
        },
        limitSupplyPerct: function () {
            if (!this.reward.limitSupplyProgress.max) return 1;
            return this.reward.limitSupplyProgress.count / this.reward.limitSupplyProgress.max;
        },
        limitPerct: function () {
            if (!this.reward.limitProgress.max) return 1;
            return this.reward.limitProgress.count / this.reward.limitProgress.max;
        },
        expiryDate: function () {
            return !this.reward.isExpired && this.reward.expiry
                ? formatDistance(new Date(this.reward.expiry.date), new Date(this.reward.expiry.now), {
                      addSuffix: false,
                  })
                : 'expired';
        },
        formattedPrice() {
            if (this.reward.poolId === CP_CAMPAIGN) {
                const price = this.reward.pointPrice / 100;
                return Number.isInteger(price) ? `${price} $` : `${price.toFixed(2)} $`;
            } else {
                return this.reward.pointPrice;
            }
        },
        backgroundColor() {
            const lowerTitle = this.reward.title.toLowerCase();

            if (lowerTitle.includes('polygon')) {
                return 'linear-gradient(182deg, rgba(211, 30, 172, 0.16) 2.31%, rgba(42, 42, 42, 0.12) 81.91%)';
            } else if (lowerTitle.includes('sepolia')) {
                return 'linear-gradient(186deg, rgba(77, 162, 255, 0.20) -5.91%, rgba(42, 42, 42, 0.12) 71.01%)';
            } else if (lowerTitle.includes('optimism')) {
                return 'linear-gradient(186deg, rgba(255, 81, 81, 0.2) -5.91%, rgba(42, 42, 42, 0.12) 71.01%)';
            } else if (lowerTitle.includes('base')) {
                return 'linear-gradient(182deg, rgba(30, 81, 211, 0.16) 2.31%, rgba(42, 42, 42, 0.12) 81.91%)';
            }
        },
    },
});
</script>
<style lang="scss">
.card-img-overlay {
    bottom: auto !important;
}
.card-img {
    width: 100%;
    background: radial-gradient(transparent, var(--bs-primary));
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center center;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    border-top-left-radius: var(--bs-border-radius) !important;
    border-top-right-radius: var(--bs-border-radius) !important;

    .badge-expiry {
        position: absolute;
        top: 1rem;
        left: 1rem;
    }
}
.card-description {
    white-space: pre-line;
    display: block;
}
.btn {
    position: relative;

    .progress {
        bottom: 0;
        border-radius: 0;
        border-bottom-left-radius: 5px;
        border-bottom-right-radius: 5px;
        position: absolute;
        left: 0;
        right: 0;
        background: rgba(0, 0, 0, 0.25);
    }
}

.my-btn,
.locked {
    height: 32px;
    position: relative;
    border-radius: 15px;
    border: 1px solid rgba(78, 78, 78, 0.2);
    //background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.1) 100%);
    padding: 5px 0;
    transition: background 0.3s ease;
    z-index: 0;
}
.my-btn::before {
    content: '';
    position: absolute;
    border-radius: 15px;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, #b14646 0%, #722121 100%);
    opacity: 0;
    transition: opacity 0.6s ease;
    z-index: -1;
}
.h-200 {
    height: 200px;
    margin-top: 0 !important;
    margin-bottom: 0 !important;
}
.pipe {
    border-left: 1px solid rgba(255, 255, 255, 0.1);
    height: 20px;
    margin: 0 8px;
}
.reward-text {
    color: #bababa;
    font-size: 12px;
    font-style: normal;
    font-weight: 400;
    white-space: nowrap;
}
.point {
    color: #f5f5f5;
    font-size: 14px;
    font-weight: 600;
    line-height: 22px;
}
.coins-text {
    color: #fff;
    text-align: right;
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    line-height: 1rem;
}
.placeholder {
    background-color: #ccc;
    width: 75px;
    height: 75px;
    border-radius: 50%;
}
.card-wrapper {
    background: transparent !important;
}
.card-wrapper:hover .my-btn::before {
    opacity: 1;
}

.card-wrapper:hover .my-btn:not(.locked) {
    box-shadow: 0px 7px 12px 0px rgba(173, 40, 40, 0.14);
    border-color: #722121;
}

.card-wrapper:hover .reward-text {
    color: #fff;
    transition: color 0.6s ease;
}

.card-wrapper:hover .coins-text {
    color: #c8c8c8;
    transition: color 0.6s ease;
}
.card-wrapper .card-body {
    border-radius: 8px;
    border: 1px solid rgba(63, 63, 63, 0.2);
    background: linear-gradient(
        182deg,
        rgba(189, 189, 189, 0.2) -17.86%,
        rgba(81, 81, 81, 0.15) 36.23%,
        rgba(42, 42, 42, 0.18) 98.68%
    );
    //backdrop-filter: blur(12.5px);
    //box-shadow: inset rgb(115 59 74 / 42%) 0px -7px 20px 8px;
}

.c-quest-title div {
    margin-left: 10px;
    background: linear-gradient(90deg, #f5f5f5 0%, #8f8f8f 100%);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    //font-size: 14px !important;
    font-style: normal;
    font-weight: 500;
    line-height: 22px;
    // height: 60px;
    white-space: normal;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
}
.c-quest-title .fas {
    color: rgba(217, 217, 217, 0.2);
}

.locked {
    background: #4444444f;
    color: #ff6b6b;
}

.gr-2 {
    width: 100% !important;
    display: inline-block !important;
}

.bg-red {
    background: linear-gradient(180deg, #c54949 0%, #ae3232 100%);
}

.gr-2 .card-body.cp-campaign-card {
    height: auto;
    max-height: initial !important;
    padding: 0;
    overflow: hidden;
}
.promoted-title {
    position: absolute;
    color: #000;
    font-feature-settings: 'liga' off, 'clig' off;
    font-family: 'Poppins';
    font-size: 10px;
    font-style: normal;
    font-weight: 400;
    border-radius: 10px;
    padding: 3px 11px;
    margin: 5px;
}

.reward-title-promoted div {
    color: #e7e7e7;
    font-feature-settings: 'liga' off, 'clig' off;
    font-family: Poppins;
    font-size: 12px;
    font-style: normal;
    font-weight: 500;
    line-height: 16px;
    margin-left: 10px;
}

.reward-title div {
    color: #fff;
    font-feature-settings: 'liga' off, 'clig' off;
    font-family: 'Poppins';
    font-size: 13px;
    font-style: italic;
    font-weight: 700;
    line-height: 16px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
}

.reward-title i {
    color: rgba(217, 217, 217, 0.2);
    font-size: 16px;
}
.reward-image-placeholder {
    height: 92px;
    width: 92px;
    background-color: #000;
    border-radius: 50%;
}
.reward-img-promoted-ph {
    width: 100%;
    background-color: #000;
    height: 120px;
}
.reward-image {
    height: 92px;
    width: 92px;
    border-radius: 50%;
    object-fit: cover;
}
.reward-img-promoted {
    width: 100%;
    height: 120px;
    object-fit: cover;
}
</style>
