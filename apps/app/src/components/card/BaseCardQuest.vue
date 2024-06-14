<template>
    <b-card
        class="mb-1 w-100"
        header-class="p-0"
        body-class="d-flex flex-column p-0"
        :class="{ 'card-collapsed': isVisible, 'card-promoted': quest.isPromoted }"
    >
        <template #header>
            <b-card-title
                class="d-flex p-3 m-0 align-items-center"
                style="cursor: pointer"
                @click="isVisible = !isVisible"
            >
                <div class="d-flex align-items-center justify-content-center" style="width: 25px">
                    <i class="me-2 text-primary" :class="iconMap[quest.variant]"></i>
                </div>
                <div class="flex-grow-1 pe-2">{{ decodeHTML(quest.title) }}</div>
                <div v-if="quest.amount" class="text-accent fw-bold">{{ quest.amount }}</div>
            </b-card-title>
        </template>

        <b-collapse v-model="isVisible">
            <img v-if="quest.image" class="img-fluid" :src="quest.image" alt="header image" />

            <div class="px-3 mt-3">
                <b-alert v-model="hasExpiry" variant="primary" class="px-2 py-1 flex-grow-1 mb-2">
                    <i class="fas fa-clock me-1" />
                    Quest ends in <strong>{{ expiryDate }} </strong>!
                </b-alert>
                <b-alert v-model="isAlertMinFollowersShown" variant="primary" class="px-2 py-1">
                    <i class="fab fa-twitter me-1" />
                    A minimum of <strong>{{ quest.contentMetadata.minFollowersCount }} followers</strong> is required.
                </b-alert>

                <b-alert v-model="isAlertDangerShown" variant="primary" class="p-2">
                    <i class="fas fa-exclamation-circle me-1"></i> {{ error }}
                </b-alert>

                <div class="d-flex align-items-start justify-content-between">
                    <b-card-text
                        v-if="quest.description"
                        class="flex-grow-1 mb-3"
                        style="white-space: pre-line"
                        v-html="decodeHTML(quest.description)"
                    />
                    <b-dropdown
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
                    </b-dropdown>
                </div>
                <slot></slot>

                <b-button
                    v-if="!accountStore.isAuthenticated"
                    v-b-modal="'modalLogin'"
                    variant="primary"
                    block
                    class="w-100"
                >
                    <template v-if="quest.amount">
                        Earn <strong>{{ quest.amount }} points</strong>
                    </template>
                    <strong v-else> Complete! </strong>
                </b-button>

                <b-button v-else-if="!quest.isAvailable" variant="primary" block class="w-100" disabled>
                    Quest Completed
                </b-button>

                <BaseButtonQuestLocked v-else-if="quest.isLocked" :id="quest._id" :locks="quest.locks" />
                <slot v-else name="button"></slot>

                <div class="d-flex align-items-center justify-content-between mt-2 pb-2" style="opacity: 0.5">
                    <div class="d-flex align-items-center text-opaque small">
                        <span v-if="quest.author" class="text-white me-1">
                            {{ quest.author.username }} &CenterDot;
                        </span>
                        <span>{{ format(new Date(quest.createdAt), 'MMMM do') }} </span>
                    </div>
                    <div class="d-flex align-items-center text-opaque small">
                        <i class="fas fa-users me-1" />
                        {{ quest.entryCount }}
                    </div>
                </div>
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
import { decodeHTML } from '@thxnetwork/app/utils/decode-html';
import { QuestVariant } from '@thxnetwork/sdk/types/enums';

export default defineComponent({
    name: 'BaseCardQuest',
    props: {
        id: String,
        visible: Boolean,
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
                [QuestVariant.Discord]: 'fab fa-discord',
                [QuestVariant.Twitter]: 'fab fa-twitter',
                [QuestVariant.YouTube]: 'fab fa-youtube',
                [QuestVariant.Custom]: 'fas fa-flag',
                [QuestVariant.Web3]: 'fab fa-ethereum',
                [QuestVariant.Gitcoin]: 'fas fa-fingerprint',
                [QuestVariant.Webhook]: 'fas fa-globe',
            } as { [variant: string]: string },
        };
    },
    computed: {
        ...mapStores(useAccountStore, useQuestStore),
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
    },
    watch: {
        visible(value: boolean) {
            this.isVisible = window.innerWidth > 768 || value;
        },
    },
    mounted() {
        this.isVisible = window.innerWidth > 768 || this.visible;
    },
    methods: {
        onClickLink(url: string) {
            window.open(url, '_blank');
        },
    },
});
</script>
