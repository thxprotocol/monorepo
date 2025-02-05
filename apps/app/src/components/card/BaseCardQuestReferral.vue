<template>
    <b-card
        class="w-100 d-flex flex-column h-100"
        header-class="p-0"
        body-class="d-flex flex-column p-0"
        :class="{ 'card-collapsed': isVisible }"
        style="background: transparent"
    >
        <b-collapse v-model="isVisible" class="h-100 d-flex flex-column">
            <img
                v-if="imageurl"
                class="w-100"
                :src="imageurl"
                alt="header image"
                loading="lazy"
                style="border-radius: 4px"
                :style="{ height: '' }"
            />
            <div></div>

            <div class="d-flex flex-column flex-grow-1 quest-info-wrap">
                <div class="d-flex align-items-start"></div>
                <slot></slot>
                <div class="quest-card-btns">
                    <transition name="fade">
                        <b-button variant="primary" block class="w-100" :disabled="copyInProgress" @click="onClickCopy">
                            {{ copyButtonText }}
                            <i :class="copyButtonIcon" aria-hidden="true"></i>
                        </b-button>
                    </transition>
                </div>
            </div>
        </b-collapse>
    </b-card>
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
import hrDivider from '../../assets/hr-line.png';
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
        onClickCopy() {
            navigator.clipboard.writeText(this.referral || 'https://santabrowser.com').then(() => {
                // Change button to "Copied!"
                this.copyButtonText = 'Copied';
                this.copyButtonIcon = 'fas fa-check';
                this.copyInProgress = true;
                // Revert after 2 seconds
                setTimeout(() => {
                    this.copyButtonText = 'Copy Link';
                    this.copyButtonIcon = 'fas fa-copy';
                    this.copyInProgress = false;
                }, 2000);
            });
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
</style>
