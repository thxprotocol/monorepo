<template>
    <b-card
        class="w-100 d-flex flex-column h-100 position-relative"
        header-class="p-0"
        body-class="d-flex flex-column p-0"
        :class="{ 'card-collapsed': isVisible }"
        style="background: transparent"
    >
        <div
            v-if="error"
            variant="danger"
            class="p-2 alert alert-danger position-absolute top-0"
            style="margin: 10px; width: calc(100% - 20px)"
            @click="error = ''"
        >
            <i class="fas fa-exclamation-circle me-1"></i> {{ error }}
        </div>
        <b-collapse v-model="isVisible" class="h-100 d-flex flex-column">
            <img
                class="w-100"
                :src="refImg"
                alt="header image"
                loading="lazy"
                style="border-radius: 4px"
                height="173"
            />

            <div class="d-flex flex-column flex-grow-1 quest-info-wrap">
                <div class="quest-points-wrap">100/200 <span class="points-label"> pts</span></div>
                <div class="quest-desc-wrap d-flex align-items-center gap-1">
                    <div style="color: var(--body-text)">Your code:</div>
                    <div class="font-monospace invite-box d-flex align-items-center">
                        {{ accountStore.referralCode }}
                    </div>
                    <div
                        v-clipboard:copy="accountStore?.referralCode"
                        v-clipboard:success="onCopySuccess"
                        class="cursor-pointer"
                    >
                        <img v-if="!isCopied" :src="copyIcon" alt="copy" height="18" width="18" class="icon-shadow" />
                        <i v-else class="fas fa-check icon-shadow" style="font-size: 18px; color: green"></i>
                    </div>
                </div>
                <div class="quest-desc-wrap">
                    Get <span style="color: var(--body-text)"> 100 points: </span>
                    <span class="d-block">Enter friend's code and click Claim.</span>
                </div>
                <div class="quest-desc-wrap">
                    Earn <span style="color: var(--body-text)"> 200 points: </span>
                    <span class="d-block">Each time a friend uses your code.</span>
                </div>
                <slot></slot>
                <div class="d-flex align-items-center">
                    <template v-if="accountStore.inviter">
                        <b-button variant="primary" block class="w-100" disabled> Quest Completed </b-button>
                    </template>

                    <template v-else>
                        <div v-if="!isClaimMode" class="w-100 rounded-end position-relative">
                            <input
                                v-model="referralCode"
                                type="text"
                                placeholder="Enter code here"
                                class="quest-input py-2 px-3"
                                @focus="onInputFocus"
                                @blur="onInputBlur"
                            />
                            <div v-if="showArrow" class="position-absolute end-0 top-50 translate-middle-y h-100">
                                <button
                                    class="btn-primary rounded-0 rounded-end px-1 d-flex align-items-center h-100"
                                    type="button"
                                    @mousedown.prevent
                                    @click="activateClaimMode"
                                >
                                    <i class="fas fa-arrow-right color-white"></i>
                                </button>
                            </div>
                        </div>
                        <b-button
                            v-else
                            variant="primary"
                            block
                            class="w-100"
                            :disabled="isButtonDisabled || isSubmitting"
                            @click="onClickClaim"
                        >
                            <b-spinner v-if="isSubmitting" small />
                            <span v-else>Claim</span>
                        </b-button>
                    </template>
                </div>
            </div>
        </b-collapse>
    </b-card>
    <BaseModalQuestEntry :show="completing" :amount="100" @hidden="completing = false" />
</template>

<script lang="ts">
import { PropType, defineComponent } from 'vue';
import { format, formatDistance } from 'date-fns';
import { mapStores } from 'pinia';
import { useAccountStore } from '../../stores/Account';
import { useQuestStore } from '../../stores/Quest';
import { useAuthStore } from '../../stores/Auth';
import { decodeHTML } from '@thxnetwork/app/utils/decode-html';
import { QuestVariant } from '@thxnetwork/sdk/types/enums';
import { SANTA_CAMPAIGN, CP_CAMPAIGN } from '@thxnetwork/app/config/secrets';
import hrDivider from '../../assets/hr-line.png';
import refImg from '../../assets/referral.jpg';
import copyIcon from '../../assets/copy.png';
import BaseModalQuestEntry from '../modal/BaseModalQuestEntry.vue';
export default defineComponent({
    name: 'BaseCardQuestReferral',
    props: {
        referral: String,
        imageurl: String,
    },
    data() {
        return {
            format,
            decodeHTML,
            isVisible: false,
            iconMap: {
                [QuestVariant.Daily]: 'fas fa-calendar',
                [QuestVariant.Invite]: 'fas fa-comments',
                [QuestVariant.Discord]: 'fab fa-discord',
                [QuestVariant.Twitter]: 'fab fa-x-twitter',
                [QuestVariant.YouTube]: 'fab fa-youtube',
                [QuestVariant.Custom]: 'fas fa-flag',
                [QuestVariant.Web3]: 'fab fa-ethereum',
                [QuestVariant.Gitcoin]: 'fas fa-fingerprint',
                [QuestVariant.Webhook]: 'fas fa-globe',
            } as { [variant: string]: string },
            hrDivider,
            QuestVariant,
            copyButtonText: 'Copy Link',
            copyButtonIcon: 'fas fa-copy',
            copyInProgress: false,
            referralCode: '',
            SANTA_CAMPAIGN,
            refImg,
            completing: false,
            isClaimMode: false,
            showArrow: false,
            error: '',
            isSubmitting: false,
            copyIcon,
            isCopied: false,
        };
    },
    computed: {
        ...mapStores(useAccountStore, useAuthStore, useQuestStore),
        titleStyle() {
            const titleLength = 20;
            if (titleLength <= 20) {
                return { width: '100%' };
            } else if (titleLength <= 25) {
                return { width: '130px' };
            } else if (titleLength <= 30) {
                return { width: '170px' };
            } else {
                return { width: '100%' };
            }
        },
        isButtonDisabled() {
            return !this.referralCode.trim();
        },
    },
    watch: {
        visible(value: boolean) {
            this.isVisible = value;
        },
    },
    mounted() {
        this.isVisible = this.accountStore.isAuthenticated ? true : false;
    },
    methods: {
        onClickLink(url: string) {
            window.open(url, '_blank');
        },
        async onClickClaim() {
            this.isSubmitting = true;
            const { api } = useAccountStore();
            try {
                const data = await api.request.post('/v1/account/referral', {
                    data: {
                        inviter: this.referralCode,
                        poolId: SANTA_CAMPAIGN,
                    },
                });

                if (data?.success !== true) {
                    this.error = data?.reason;
                    throw new Error(data?.reason);
                }

                this.completing = true;
                this.referralCode = '';
            } catch (error: any) {
                const message = error.response?.data?.reason || error.message;
                console.error('Claim failed:', message);
                this.isClaimMode = false;
            } finally {
                this.isSubmitting = false;
            }
        },

        onInputFocus() {
            this.showArrow = true;
        },
        onInputBlur() {
            setTimeout(() => {
                this.showArrow = false;
            }, 200);
        },
        activateClaimMode() {
            if (!this.referralCode.trim()) return;
            this.isClaimMode = true;
        },
        onCopySuccess() {
            this.isCopied = true;
            setTimeout(() => {
                this.isCopied = false;
            }, 1000);
        },
    },
});
</script>

<style>
.quest-card-btns .btn {
    bottom: 0;
    border-radius: 5px;
    background: var(--btn-primary-santa);
    padding: 7px 0px;
}
.quest-title-main {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--body-text);
    text-align: left;
    line-height: 18px;
    font-size: 14px;
    opacity: 1;
}
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
.quest-input {
    border: none;
    width: 100%;
    border-radius: 5px;
    outline: 0;
    background: var(--input-ref-bg);
}
.invite-box {
    border-radius: 6px;
    background: var(--quest-daily-item-bg);
    padding: 5px 12px;
    color: var(--body-text);
}
</style>
