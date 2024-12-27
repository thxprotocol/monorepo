<template>
    <b-card no-body class="gr-2 x-lg-0 card-wrapper h-100" :class="{ 'card-promoted': reward.isPromoted }">
        <b-card-body
            v-if="reward.poolId === CP_CAMPAIGN || reward.poolId === SANTA_CAMPAIGN"
            class="d-flex flex-column justify-content-between cp-campaign-card"
            :style="{ height: '100%', background: !reward.isPromoted ? backgroundColor : '' }"
        >
            <b-button v-if="reward.isPromoted" class="d-flex align-items-center promoted-title" variant="success">
                Promoted
            </b-button>

            <div :class="`d-flex justify-content-center ${reward.isPromoted ? 'mt-0' : 'mt-1 mx-1'}`">
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
            <b-card-title
                v-if="!reward.isPromoted"
                class="d-flex align-items-center reward-title px-2 flex-grow-1 pb-3"
            >
                <!-- <i class="me-2 text-opaque small" :class="iconMap[reward.variant]" /> -->
                <slot name="title" />
            </b-card-title>

            <!-- <b-progress
                v-if="reward.limitProgress.max"
                v-b-tooltip.bottom
                :variant="limitVariant"
                :title="`You can purchase this reward ${reward.limitProgress.max} time${
                    reward.limitProgress.max > 1 ? 's' : ''
                }.`"
                :value="reward.limitProgress.count"
                :max="reward.limitProgress.max"
                style="height: 6px"
                class="mb-2 mx-3"
            /> -->

            <div
                :class="`d-flex ${
                    !reward.isPromoted && !reward.limitSupplyProgress.max
                        ? 'justify-content-end'
                        : 'justify-content-between'
                }`"
            >
                <b-card-title v-if="reward.isPromoted" class="d-flex align-items-center reward-title-promoted">
                    <slot name="title" />
                </b-card-title>
                <div
                    v-if="reward.limitSupplyProgress.max && !reward.isPromoted"
                    :class="[
                        'd-flex align-items-center',
                        accountStore.isMobile ? 'justify-content-center' : 'justify-content-end',
                        'ps-2 pb-2',
                    ]"
                    style="color: var(--body-text)"
                >
                    <span class="me-1" style="color: var(--reward-supply-text)"> Supply: </span>
                    <div>
                        <span :class="limitSupplyVariant" style="color: var(--green-highlight-color) !important">
                            {{ reward.limitSupplyProgress.max - reward.limitSupplyProgress.count }}
                        </span>
                        <span style="color: var(--reward-supply-limit)">/{{ reward.limitSupplyProgress.max }}</span>
                    </div>
                </div>
                <button
                    v-if="!accountStore.isAuthenticated"
                    class="w-100 my-reward-btn"
                    variant="primary"
                    @click="authStore.isModalLoginShown = !authStore.isModalLoginShown"
                >
                    <template v-if="reward.pointPrice">
                        Pay <strong>{{ reward.pointPrice }} points</strong>
                    </template>
                    <strong v-else> Free! </strong>
                </button>
                <span v-else id="disabled-wrapper" :class="`d-block me-2 mb-2 `" tabindex="0">
                    <button
                        v-b-modal="`modalRewardPayment${reward._id}`"
                        block
                        :class="`position-relative mb-0 px-5 py-1 ${
                            isInsufficientPoints || reward.isLimitSupplyReached || !reward.isAvailable
                                ? 'locked-btn'
                                : ' btn-primary'
                        }`"
                        :disabled="isDisabled || !reward.isAvailable"
                    >
                        <div v-if="!reward.isAvailable">Completed</div>
                        <div v-else-if="reward.isLimitSupplyReached">Sold out</div>
                        <div v-else-if="isInsufficientPoints">Locked</div>
                        <div
                            v-else-if="reward.pointPrice && !isInsufficientPoints"
                            class="d-flex align-items-center justify-content-center"
                        >
                            <span class="point me-1">Buy now</span>
                            <!-- <span class="point me-1">{{ formattedPrice }}</span>
                            <img
                                v-if="reward.poolId === SANTA_CAMPAIGN"
                                :src="StarCoin"
                                alt="star"
                                loading="lazy"
                                height="13"
                                class="me-1"
                            />
                            <span v-if="reward.poolId === SANTA_CAMPAIGN" class="coins-text">Points</span> -->
                        </div>
                        <div v-else-if="!reward.pointPrice" class="d-flex align-items-center justify-content-center">
                            Free!
                        </div>
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
            const participant = this.accountStore.participants.find(
                (p) => p.sub === this.accountStore.account?.sub && p.poolId === this.reward.poolId,
            );
            if (!participant) return 0;
            return participant.balance || 0;
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

            // if (lowerTitle.includes('polygon')) {
            //     return 'linear-gradient(182deg, rgba(211, 30, 172, 0.16) 2.31%, rgba(42, 42, 42, 0.12) 81.91%)';
            // } else if (lowerTitle.includes('sepolia')) {
            //     return 'linear-gradient(186deg, rgba(77, 162, 255, 0.20) -5.91%, rgba(42, 42, 42, 0.12) 71.01%)';
            // } else if (lowerTitle.includes('optimism')) {
            //     return 'linear-gradient(186deg, rgba(255, 81, 81, 0.2) -5.91%, rgba(42, 42, 42, 0.12) 71.01%)';
            // } else if (lowerTitle.includes('base')) {
            //     return 'linear-gradient(182deg, rgba(30, 81, 211, 0.16) 2.31%, rgba(42, 42, 42, 0.12) 81.91%)';
            // }
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

.my-reward-btn,
.locked {
    width: 100%;
    height: 32px;
    position: relative;
    border-radius: 5px;
    background: linear-gradient(290deg, #b13030 30.17%, #de5947 97.55%);
    border: 1px solid rgba(78, 78, 78, 0.2);
    //background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.1) 100%);
    padding: 5px 0;
    transition: background 0.3s ease;
    z-index: 0;
}
//.my-reward-btn::before {
//    content: '';
//    position: absolute;
//    border-radius: 5px;
//    top: 0;
//    left: 0;
//    right: 0;
//    bottom: 0;
//    opacity: 0;
//    transition: opacity 0.6s ease;
//    z-index: -1;
//}
//.h-200 {
//    height: 200px;
//    margin-top: 0 !important;
//    margin-bottom: 0 !important;
//}
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
    color: #fff;
    font-style: normal;
    font-weight: 500;
    letter-spacing: -0.14px;
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
//.card-wrapper:hover .my-btn::before {
//  opacity: 1;
//}

//.card-wrapper:hover .my-btn:not(.locked) {
//    box-shadow: 0px 7px 12px 0px rgba(173, 40, 40, 0.14);
//    border-color: #722121;
//}

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
    background: var(--reward-item-bg);
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
    opacity: 0.3;
    pointer-events: none;
}

.gr-2 {
    width: 100% !important;
    display: inline-block !important;
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
    color: var(--body-text);
    font-feature-settings: 'liga' off, 'clig' off;
    font-family: Poppins;
    font-size: 12px;
    font-style: normal;
    font-weight: 500;
    line-height: 16px;
    margin-left: 10px;
}

.reward-title div {
    color: var(--reward-title-color);
    font-feature-settings: 'liga' off, 'clig' off;
    font-family: 'Poppins';
    font-size: 14px;
    font-weight: 500;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    font-style: normal;
    line-height: 18px;
    margin-top: 10px;
}

.reward-title i {
    color: rgba(217, 217, 217, 0.2);
    font-size: 16px;
}
.reward-image-placeholder {
    height: 98px;
    width: 100px;
    background-color: #000;
    border-radius: 50%;
}
.reward-img-promoted-ph {
    width: 100%;
    background-color: #000;
    height: 120px;
}
.reward-image {
    height: 98px;
    width: 100%;
    object-fit: cover;
    border-radius: 10px 10px 0 0;
}
.reward-img-promoted {
    width: 100%;
    height: 120px;
    object-fit: cover;
}
.promoted-reward-btn {
    width: 112px;
}
.progress {
    background-color: var(--nav-link-bg);
}
</style>
