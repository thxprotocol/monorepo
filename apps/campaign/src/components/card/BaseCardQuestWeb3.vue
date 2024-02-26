<template>
    <BaseCardCollapse
        @modal-close="isModalQuestEntryShown = false"
        :quest="quest"
        :id="quest._id"
        :loading="isSubmitting"
        :completing="isModalQuestEntryShown"
        :amount="quest.amount"
        :error="error"
        :image="quest.image"
        :info-links="quest.infoLinks"
        :visible="!!accountStore.isAuthenticated && quest.isAvailable"
    >
        <template #header>
            <div class="d-flex align-items-center justify-content-center" style="width: 25px">
                <i class="fab fa-ethereum me-2 text-primary"></i>
            </div>
            <div class="flex-grow-1 pe-2">{{ quest.title }}</div>
            <div class="text-accent fw-bold">{{ quest.amount }}</div>
        </template>

        <b-alert class="p-2" v-model="isAlertDangerShown" variant="danger">
            <i class="fas fa-exclamation-circle me-1"></i> {{ error }}
        </b-alert>

        <b-card-text v-if="quest.description" style="white-space: pre-line" v-html="quest.description" />

        <blockquote>
            <b-form-group label="Available On">
                <div class="d-inline-flex ms-2 align-items-center" v-for="contract of quest.contracts">
                    <b-img
                        :src="chainList[contract.chainId].logo"
                        width="12"
                        height="12"
                        :alt="chainList[contract.chainId].name"
                        class="me-2"
                    />

                    <b-link target="_blank" :href="getAddressURL(contract.chainId, contract.address)">
                        {{ chainList[contract.chainId].name }}
                    </b-link>
                </div>
            </b-form-group>
            <b-row>
                <b-col>
                    <b-form-group label="Method" class="mb-0">
                        <code>{{ quest.methodName }}</code>
                    </b-form-group>
                </b-col>
                <b-col>
                    <b-form-group label="Threshold" class="mb-0">
                        <code>{{ quest.threshold }}</code>
                    </b-form-group>
                </b-col>
            </b-row>
        </blockquote>

        <template #button>
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

            <BaseButtonQuestLocked v-else-if="quest.isLocked" :quest="quest" />

            <b-button-group v-else class="w-100" block>
                <BaseButtonWalletConnect :chainId="chainId" @signed="onSigned" @error="error = $event">
                    <b-img
                        :src="chainList[chainId].logo"
                        class="me-2"
                        width="18"
                        height="18"
                        :alt="chainList[chainId].name"
                    />
                    Claim <strong>{{ quest.amount }}</strong> points
                </BaseButtonWalletConnect>
                <b-dropdown end variant="primary" no-caret toggle-class="pe-3">
                    <template #button-content>
                        <i class="fas fa-caret-down"></i>
                    </template>
                    <BDropdownItem @click="chainId = contract.chainId" v-for="contract of quest.contracts">
                        <b-img
                            :src="chainList[contract.chainId].logo"
                            width="12"
                            height="12"
                            :alt="chainList[contract.chainId].name"
                            class="me-2"
                        />
                        {{ chainList[contract.chainId].name }}
                    </BDropdownItem>
                </b-dropdown>
            </b-button-group>
        </template>
    </BaseCardCollapse>
</template>

<script lang="ts">
import { mapStores } from 'pinia';
import { defineComponent, PropType } from 'vue';
import { useAccountStore } from '../../stores/Account';
import { useAuthStore } from '../../stores/Auth';
import { useQuestStore } from '../../stores/Quest';
import { chainList, getAddressURL } from '../../utils/chains';
import { ChainId } from '@thxnetwork/sdk/src/lib/types/enums/ChainId';

export default defineComponent({
    name: 'BaseCardQuestSocial',
    props: {
        quest: {
            type: Object as PropType<TQuestWeb3>,
            required: true,
        },
    },
    data() {
        return {
            error: '',
            message: '',
            isSubmitting: false,
            chainList,
            getAddressURL,
            chainId: ChainId.Polygon,
            isModalQuestEntryShown: false,
        };
    },
    computed: {
        ...mapStores(useAccountStore),
        ...mapStores(useAuthStore),
        ...mapStores(useQuestStore),
        isAlertDangerShown() {
            return !!this.error;
        },
    },
    mounted() {
        if (!this.quest.isAvailable) return;
        this.chainId = this.quest.contracts[0].chainId;
        this.message = `This signature will be used to validate if the result of calling ${this.quest.methodName} on chain ${this.chainId} with the address used to sign this message is above the threshold of ${this.quest.threshold}.`;
    },
    methods: {
        onClickSignin: function () {
            this.accountStore.signin();
        },
        async onSigned({ signature, message }: { signature: string; message: string }) {
            this.error = '';
            this.isSubmitting = true;
            try {
                await this.questStore.completeWeb3Quest(this.quest, {
                    signature,
                    message,
                    chainId: this.chainId,
                });

                this.isModalQuestEntryShown = true;
            } catch (error) {
                this.error = error as string;
            } finally {
                this.isSubmitting = false;
            }
        },
    },
});
</script>
