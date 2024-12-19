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

        <b-collapse v-model="isVisible" class="h-100 d-flex flex-column">
            <img
                v-if="quest.image"
                class="w-100"
                :src="quest.image"
                alt="header image"
                loading="lazy"
                style="border-radius: 4px"
                :style="{ height: quest.variant === QuestVariant.Daily ? '130px' : '' }"
            />
            <div></div>

            <div
                class="px-2 d-flex flex-column flex-grow-1 justify-content-end"
                :class="quest.variant === QuestVariant.Daily ? 'my-0' : 'my-3'"
            >
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

                <div class="d-flex align-items-start">
                    <b-card-text
                        v-if="quest.title && quest.variant !== QuestVariant.Daily"
                        class="quest-title-main"
                        :style="titleStyle"
                        v-html="decodeHTML(quest.title)"
                    />
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
                <slot></slot>

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
            </div>
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
            const titleLength = this.quest.title.length;
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
