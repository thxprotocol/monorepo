<template>
    <BaseCardQuest
        :id="quest._id"
        :quest="quest"
        :visible="!!accountStore.isAuthenticated && quest.isAvailable"
        :loading="isSubmitting"
        :completing="isModalQuestEntryShown"
        :error="error"
        @modal-close="isModalQuestEntryShown = false"
    >
        <blockquote>
            <b-form-group label="Available On">
                <div v-for="contract of quest.contracts" class="d-inline-flex ms-2 align-items-center">
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
            <b-button-group class="w-100" block>
                <BaseButtonWalletConnect
                    :message="message"
                    :chain-id="chainId"
                    @signed="onSigned"
                    @chain-change="chainId = $event"
                    @error="error = $event"
                >
                    <span>
                        Claim <strong>{{ quest.amount }}</strong> points on {{ chainList[chainId].name }}
                    </span>
                </BaseButtonWalletConnect>
                <b-dropdown end variant="primary" no-caret toggle-class="pe-3">
                    <template #button-content>
                        <i class="fas fa-caret-down"></i>
                    </template>
                    <BDropdownItem v-for="contract of quest.contracts" @click="chainId = contract.chainId">
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
    </BaseCardQuest>
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
        ...mapStores(useAccountStore, useAuthStore, useQuestStore),
    },
    mounted() {
        if (!this.quest.isAvailable) return;
        this.chainId = this.quest.contracts[0].chainId;
        this.message = `This signature will be used to validate if the result of calling ${this.quest.methodName} on chain ${this.chainId} with the address used to sign this message is above the threshold of ${this.quest.threshold}.`;
    },
    methods: {
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
                this.error = (error as Error).message;
            } finally {
                this.isSubmitting = false;
            }
        },
    },
});
</script>
