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

            <div class="px-2 d-flex flex-column flex-grow-1 justify-content-end my-3">
                <div class="d-flex align-items-start">
                    <b-card-text
                        class="quest-title-main"
                        :style="titleStyle"
                        v-html="decodeHTML(referral || 'https://santabrowser.com')"
                    />
                </div>
                <slot></slot>
            </div>
            <div class="quest-card-btns">
                <b-button variant="primary" block class="w-100" @click="onClickCopy">
                    Copy Link<i class="fas fa-copy" aria-hidden="true"></i>
                </b-button>
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
            navigator.clipboard.writeText(this.referral || 'https://santabrowser.com');
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
</style>
