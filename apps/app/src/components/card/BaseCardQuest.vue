<template>
    <b-card
        class="w-100 d-flex flex-column h-100"
        header-class="p-0"
        body-class="d-flex flex-column p-0"
        :class="{ 'card-collapsed': isVisible, 'card-promoted': quest.isPromoted }"
        style="background: transparent"
    >
        <!-- <template #header>
            <b-card-title
                class="d-flex p-3 m-0 align-items-center"
                style="cursor: pointer; background-color: #0e0f19"
                @click="isVisible = !isVisible"
            >
                <div class="d-flex align-items-center justify-content-center" style="width: 25px">
                    <i class="me-2 text-primary" :class="iconMap[quest.variant]"></i>
                </div>
                <div
                    class="flex-grow-1 pe-2"
                    style="
                        overflow: hidden;
                        text-overflow: ellipsis;
                        display: -webkit-box;
                        -webkit-line-clamp: 1;
                        -webkit-box-orient: vertical;
                    "
                >
                    {{ decodeHTML(quest.title) }}
                </div>
                <div v-if="quest.amount" class="text-primary fw-bold">{{ quest.amount }}</div>
            </b-card-title>
        </template> -->

        <b-collapse v-model="isVisible" class="h-100 d-flex flex-column position-relative z-1">
            <div class="quest-img-wrap">
                <img
                    v-if="quest.image"
                    class="w-100"
                    :src="quest.image"
                    alt="header image"
                    loading="lazy"
                    style="border-radius: 4px"
                    height="173"
                />
            </div>

            <div class="d-flex flex-column flex-grow-1 quest-info-wrap">
                <!-- <b-alert v-model="hasExpiry" variant="primary" class="px-2 py-1 flex-grow-1 mb-2">
                    <i class="fas fa-clock me-1" />
                    Quest ends in <strong>{{ expiryDate }} </strong>!
                </b-alert>
                <b-alert v-model="isAlertMinFollowersShown" variant="primary" class="px-2 py-1">
                    <i class="fab fa-x-twitter me-1" />
                    A minimum of
                    <strong>{{
                        quest.contentMetadata.minFollowersCount === '1'
                            ? '1 follower'
                            : quest.contentMetadata.minFollowersCount + ' followers'
                    }}</strong>
                    is required.
                </b-alert>
                <b-alert v-model="isAlertDangerShown" variant="primary" class="p-2">
                    <i class="fas fa-exclamation-circle me-1"></i> {{ error }}
                </b-alert>
                <b-alert v-model="isAlertEntriesPendingReviewShown" variant="primary" class="p-2">
                    <i class="fas fa-info-circle me-1"></i> You have
                    <strong>{{ quest.entriesPendingReview.length }}</strong> entries pending a review.
                </b-alert> -->

                <b-card-text
                    v-if="quest.title"
                    class="quest-title-main"
                    :style="titleStyle"
                    v-html="decodeHTML(quest.title)"
                />
                <div class="quest-points-wrap">
                    {{
                        quest.pendingCount
                            ? `${pendingCount} x
                    ${formattedAmount}`
                            : quest.amount
                    }}<span class="points-label">pts</span>
                </div>
                <div class="flex-grow-1">
                    <div class="quest-desc-wrap">{{ quest.description }}</div>
                    <slot></slot>
                </div>

                <div class="quest-card-btns">
                    <b-button
                        v-if="!accountStore.isAuthenticated"
                        variant="primary"
                        block
                        class="w-100"
                        @click="authStore.isModalLoginShown = true"
                    >
                        <template v-if="quest.amount">
                            Earn <strong>{{ quest.amount }} Pts</strong>
                        </template>
                        <strong v-else> Complete! </strong>
                    </b-button>

                    <b-button
                        v-else-if="(!quest.isAvailable && quest.variant !== QuestVariant.Daily) || quest.isCompleted"
                        variant="primary"
                        block
                        class="w-100"
                        disabled
                    >
                        Quest Completed
                    </b-button>

                    <BaseButtonQuestLocked
                        v-else-if="quest.isLocked"
                        :id="quest._id"
                        :locks="quest.locks"
                        :amount="quest.amount"
                    />
                    <slot v-else name="button"></slot>
                    <!-- <b-dropdown
                        v-if="quest.infoLinks.length"
                        variant="primary"
                        size="sm"
                        no-caret
                        toggle-class="py-1 ms-2 "
                        style="float: right"
                        end
                    >
                        <template #button-content>
                            <i class="fas fa-ellipsis-v ml-0 text-muted"></i>
                        </template>
                        <b-dropdown-item
                            v-for="(link, key) of quest.infoLinks"
                            :key="key"
                            link-class="d-flex align-items-center justify-content-between"
                            @click="onClickLink(link.url)"
                        >
                            <div>
                                {{ link.label }}
                            </div>
                            <i class="fas fa-caret-right text-opaque ms-3"></i>
                        </b-dropdown-item>
                    </b-dropdown> -->
                </div>

                <!-- <div class="d-flex align-items-center justify-content-between mt-2 pb-2" style="opacity: 0.5"> -->
                <!-- <div class="d-flex align-items-center text-opaque small">
                        <span v-if="quest.author" class="text-white me-1">
                            {{ quest.author.username }} &CenterDot;
                        </span>
                        <span>{{ format(new Date(quest.createdAt), 'MMMM do') }} </span>
                    </div>
                    <div class="d-flex align-items-center text-opaque small">
                        <i class="fas fa-users me-1" />
                        {{ quest.entryCount }}
                    </div> -->
                <!-- </div> -->
            </div>
            <!-- <div v-if="quest.variant !== QuestVariant.Daily" class="d-flex justify-content-center mb-1">
                <img :src="hrDivider" alt="hr divider" width="72" height="2" />
            </div> -->
        </b-collapse>
    </b-card>
    <BaseModalQuestEntry
        :id="id"
        :quest="quest"
        :loading="loading"
        :show="completing"
        :amount="quest.amount"
        :error="error"
        @hidden="$emit('modal-close')"
    />
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
import { CP_CAMPAIGN } from '@thxnetwork/app/config/secrets';
export default defineComponent({
    name: 'BaseCardQuest',
    props: {
        id: String,
        // visible: Boolean,
        loading: Boolean,
        completing: Boolean,
        error: String,
        quest: { required: true, type: Object as PropType<TBaseQuest & any> },
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
                [QuestVariant.Telegram]: 'fab fa-telegram',
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
        expiryDate() {
            if (!this.quest.expiryDate) return '';
            return formatDistance(new Date(this.quest.expiryDate), new Date(), {
                addSuffix: false,
            });
        },
        isAlertMinFollowersShown() {
            return this.quest.contentMetadata && !!Number(this.quest.contentMetadata.minFollowersCount);
        },
        hasExpiry() {
            return !!this.expiryDate;
        },
        isAlertDangerShown() {
            return !!this.error;
        },
        isAlertEntriesPendingReviewShown() {
            return this.quest.entriesPendingReview.length > 0;
        },
        titleStyle() {
            // const titleLength = this.quest.title.length;
            // if (titleLength <= 20) {
            //     return { width: '100%' };
            // } else if (titleLength <= 25) {
            //     return { width: '130px' };
            // } else if (titleLength <= 30) {
            //     return { width: '170px' };
            // } else {
            //     return { width: '100%' };
            // }
        },
        pendingCount() {
            // If there is a limit subtract the amount of entries from the amount of events
            if (this.quest.limit > 0) return this.quest.events.length - this.quest.entries.length;
            // Else return the amount of events
            const pending = this.quest.events.length - this.quest.entries.length;
            // In case it's less than 0 return 0
            return pending < 0 ? 0 : pending;
        },
        formattedAmount() {
            if (this.quest.poolId === CP_CAMPAIGN) {
                const amount = this.quest.amount / 100;
                return amount % 1 === 0 ? `$${amount.toFixed(0)}` : `$${amount.toFixed(2)}`;
            }
            return `${this.quest.amount}`;
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
    },
});
</script>

<style lang="scss">
.quest-card-btns .btn {
    bottom: 0;
    border-radius: 6px;
    background: var(--btn-primary-santa);
    padding: 7px 0px;
    box-shadow: var(--balance-box-shadow);
}
.quest-card-btns .btn:focus-visible {
    outline: none;
}
.quest-title-main {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--body-text);
    text-align: left;
    line-height: 20px;
    font-size: 16px;
    opacity: 1;
    font-style: normal;
    font-weight: 600;
    margin-bottom: 10px;
}
.quest-info-wrap {
    position: relative;
    margin-top: -28px;
    background: var(--quest-info-wrap-bg);
    backdrop-filter: blur(4px);
    justify-content: space-between;
    border-radius: 12px;
    z-index: 1;
    padding: 20px 15px 15px 15px;
    filter: var(--quest-info-wrap-shadow);
}
.quest-img-wrap {
    position: relative;
    display: inline-block;
}

.quest-img-wrap::before {
    content: '';
    position: absolute;
    bottom: -20px;
    left: 0;
    right: 0;
    height: 70px;
    background: rgba(0, 0, 0, 0.8);
    filter: blur(15px);
    z-index: 1;
    pointer-events: none;
}

.quest-points-wrap {
    position: absolute;
    right: 10px;
    top: -15px;
    border-radius: 8px;
    padding: 2.5px 16px 4.5px 16px;
    background: var(--quest-points-wrap-bg);
    box-shadow: var(--quest-points-wrap-shadow);
    color: var(--quest-points-wrap-color);
    font-size: 13px;
    font-style: normal;
    font-weight: 500;
    line-height: 24px;
    letter-spacing: 0.91px;
    span {
        color: var(--quest-points-wrap-span-color);
        font-size: 11px;
        font-style: normal;
        font-weight: 500;
        line-height: 24px;
        letter-spacing: 0.77px;
        padding-left: 1px;
    }
}
.quest-desc-wrap {
    display: -webkit-box;
    -webkit-line-clamp: 5;
    -webkit-box-orient: vertical;
    overflow: hidden;
    color: #757575;
    font-size: 12px;
    font-style: normal;
    font-weight: 400;
    line-height: 16px;
    margin-bottom: 10px;
}
</style>
