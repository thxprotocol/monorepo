<template>
    <b-card
        class="mb-1"
        header-class="p-0"
        body-class="d-flex flex-column p-0"
        :class="{ 'card-collapsed': isVisible, 'card-promoted': quest.isPromoted }"
    >
        <template #header>
            <b-card-title
                class="d-flex p-3 m-0 align-items-center"
                style="cursor: pointer"
                @click.stop="isVisible = !isVisible"
            >
                <div class="d-flex align-items-center justify-content-center" style="width: 25px">
                    <i class="me-2 text-primary" :class="iconMap[quest.variant]"></i>
                </div>
                <div class="flex-grow-1 pe-2">{{ decodeHTML(quest.title) }}</div>
                <div class="text-accent fw-bold">{{ quest.amount }}</div>
            </b-card-title>
        </template>

        <b-collapse v-model="isVisible">
            <img v-if="quest.image" class="img-fluid" :src="quest.image" alt="header image" />

            <div class="px-3 mt-3">
                <div class="d-flex align-items-center justify-content-end">
                    <b-badge v-if="expiryDate" variant="primary" class="text-opaque">
                        <i class="fas fa-clock me-1" />
                        Ends in {{ expiryDate }}
                    </b-badge>
                    <b-dropdown
                        v-if="quest.infoLinks.length"
                        variant="link"
                        size="sm"
                        no-caret
                        toggle-class="py-0 ms-2"
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
                            <i class="fas fa-caret-right text-opaque"></i>
                        </b-dropdown-item>
                    </b-dropdown>
                </div>

                <b-alert v-model="isAlertDangerShown" variant="primary" class="p-2">
                    <i class="fas fa-exclamation-circle me-1"></i> {{ error }}
                </b-alert>

                <b-card-text
                    v-if="quest.description"
                    style="white-space: pre-line"
                    v-html="decodeHTML(quest.description)"
                />
                <slot></slot>

                <b-button
                    v-if="!accountStore.isAuthenticated"
                    v-b-modal="'modalLogin'"
                    variant="primary"
                    block
                    class="w-100"
                >
                    Sign in &amp; claim <strong>{{ quest.amount }} points</strong>
                </b-button>

                <b-button v-else-if="!quest.isAvailable" variant="primary" block class="w-100" disabled>
                    Quest Completed
                </b-button>

                <BaseButtonQuestLocked v-else-if="quest.isLocked" :id="quest._id" :locks="quest.locks" />
                <slot v-else name="button"></slot>
                <div class="d-flex justify-content-between small text-opaque mt-2 pb-2" style="opacity: 0.3 !important">
                    <div>
                        <i class="fas fa-clock me-1" />
                        {{ format(new Date(quest.createdAt), 'MMMM do yyyy') }}
                    </div>
                    <div>
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
import { QuestVariant } from '@thxnetwork/sdk';
import { mapStores } from 'pinia';
import { useAccountStore } from '../../stores/Account';
import { useQuestStore } from '../../stores/Quest';
import { decodeHTML } from '@thxnetwork/campaign/utils/decode-html';

export default defineComponent({
    name: 'BaseCardCollapse',
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
