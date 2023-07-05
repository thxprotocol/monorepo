<template>
    <b-modal
        :id="id"
        v-model="isShown"
        @show="onShow"
        @hidden="$emit('hidden')"
        no-close-on-backdrop
        centered
        hide-footer
        no-close-on-esc
    >
        <template #header>
            <h5 class="modal-title"><i class="fas fa-bell me-2"></i> Wallet Recovery</h5>
            <b-link class="btn-close" @click="$emit('hidden')"> <i class="fas fa-times"></i> </b-link>
        </template>
        <div v-if="isLoading" class="text-center">
            <b-spinner show size="sm" />
        </div>
        <template v-else>
            <b-tabs justified content-class="mt-3">
                <b-tab title="Security Question">
                    <b-form-group>
                        <b-form-input v-model="question" placeholder="Question" />
                    </b-form-group>
                    <b-form-group>
                        <b-form-input v-model="password" type="password" placeholder="Answer" />
                    </b-form-group>
                    <b-button
                        :disabled="!password.length"
                        class="w-100"
                        variant="primary"
                        @click="onSubmitDeviceSharePasswordCreate"
                    >
                        <b-spinner variant="light" v-if="isLoadingPasswordCreate" />
                        <template v-else> Set Security Question </template>
                    </b-button>
                </b-tab>
                <b-tab title="Export Key">
                    <p>
                        Store the twelve word sequence somewhere safe and use it to recover access to your wallet
                        access.
                    </p>
                    <b-card bg-variant="dark">
                        <strong v-if="mnemonic" style="font-size: 1.3rem">{{ mnemonic }}</strong>
                        <strong v-else>...</strong>
                    </b-card>
                    <b-alert v-if="mnemonic" variant="warning">Do not store your mnemonic on this device!</b-alert>
                    <b-button class="w-100" variant="primary" @click="onSubmitCreateMnemonic">
                        <b-spinner variant="light" v-if="isLoadingMnemonic" />
                        <template v-else>Generate Backup</template>
                    </b-button>
                </b-tab>
            </b-tabs>
        </template>
    </b-modal>
</template>

<script lang="ts">
import { useAccountStore } from '../stores/Account';
import { mapStores } from 'pinia';
import { defineComponent } from 'vue';
import { tKey } from '../utils/tkey';

export default defineComponent({
    name: 'BaseModalWalletRecovery',
    data() {
        return {
            isShown: false,
            question: '',
            password: '',
            mnemonic: '',
            isLoadingMnemonic: false,
            isLoadingPasswordCreate: false,
        };
    },
    computed: {
        ...mapStores(useAccountStore),
        isSubmitDisabled: function () {
            return this.isLoading;
        },
    },
    props: {
        id: {
            type: String,
            required: true,
        },
        error: {
            type: String,
        },
        show: {
            type: Boolean,
        },
        isLoading: {
            type: Boolean,
        },
    },
    watch: {
        show(value) {
            this.isShown = value;
        },
    },
    methods: {
        async onShow() {
            this.password = '';
            this.mnemonic = '';

            this.question = this.accountStore.securityQuestion;
        },
        async onSubmitDeviceSharePasswordCreate() {
            const { isAuthenticated, isDeviceShareAvailable, createDeviceShare } = this.accountStore;
            if (!isAuthenticated || !isDeviceShareAvailable) return;

            this.isLoadingPasswordCreate = true;
            await createDeviceShare(this.question, this.password);
            this.isLoadingPasswordCreate = false;
        },
        async onSubmitCreateMnemonic() {
            this.isLoadingMnemonic = true;
            const newShare = await tKey.generateNewShare();
            this.mnemonic = (await tKey.outputShare(newShare.newShareIndex, 'mnemonic')) as string;
            this.isLoadingMnemonic = false;
        },
    },
});
</script>
