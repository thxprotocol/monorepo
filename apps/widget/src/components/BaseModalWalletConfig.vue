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
            <h5 class="modal-title"><i class="fas fa-bell me-2"></i> Wallet Config</h5>
            <b-link class="btn-close" @click="$emit('hidden')"> <i class="fas fa-times"></i> </b-link>
        </template>
        <div v-if="isLoading" class="text-center">
            <b-spinner show size="sm" />
        </div>
        <template v-else>
            <b-tabs justified content-class="mt-3">
                <b-tab title="User">
                    OAuthShare: {{ accountStore.isAuthenticated }}<br />
                    Device Share: {{ accountStore.isDeviceShareAvailable }} <br />
                    Security Q: {{ accountStore.securityQuestion }} <br />
                    Private Key: <code>0x{{ accountStore.privateKey }}</code>
                    <b-button
                        class="w-100"
                        variant="danger"
                        @click="onSubmitResetAccount"
                        v-if="accountStore.oAuthShare"
                    >
                        <b-spinner variant="light" v-if="isLoadingPasswordChange" />
                        <template v-else> Reset Account </template>
                    </b-button>
                </b-tab>
                <b-tab title="Create Q&A" v-if="!accountStore.securityQuestion && accountStore.isDeviceShareAvailable">
                    <b-form-group>
                        <b-form-input v-model="question" placeholder="Question" />
                    </b-form-group>
                    <b-form-group>
                        <b-form-input v-model="password" type="password" placeholder="Answer" />
                    </b-form-group>
                    <b-button
                        :disabled="!accountStore.securityQuestion.length"
                        class="w-100"
                        variant="primary"
                        @click="onSubmitDeviceSharePasswordCreate"
                    >
                        <b-spinner variant="light" v-if="isLoadingPasswordChange" />
                        <template v-else> Create Password </template>
                    </b-button>
                </b-tab>
                <b-tab title="Update Q&A" v-if="accountStore.securityQuestion && accountStore.isDeviceShareAvailable">
                    <b-form-group :label="accountStore.securityQuestion">
                        <b-form-input v-model="password" type="password" placeholder="Answer" />
                    </b-form-group>
                    <b-button class="w-100" variant="primary" @click="onSubmitDeviceSharePasswordUpdate">
                        <b-spinner variant="light" v-if="isLoadingPasswordChange" />
                        <template v-else> Update Password </template>
                    </b-button>
                </b-tab>
                <b-tab
                    title="Recover"
                    active
                    v-if="accountStore.securityQuestion && !accountStore.isDeviceShareAvailable"
                >
                    <b-form-group :label="accountStore.securityQuestion">
                        <b-form-input v-model="passwordRecovery" type="password" placeholder="Password Recovery" />
                    </b-form-group>
                    <b-button
                        class="w-100"
                        variant="primary"
                        @click="onSubmitDeviceShareRecovery"
                        :disabled="accountStore.isDeviceShareAvailable"
                    >
                        <b-spinner variant="light" v-if="isLoadingPasswordChange" />
                        <template v-else> Recover Password </template>
                    </b-button>
                </b-tab>
                <!-- <b-tab title="Mnemonic">
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
                </b-tab> -->
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
    name: 'BaseModalWalletAccess',
    data() {
        return {
            isShown: false,
            question: 'test',
            password: '',
            passwordRecovery: '',
            mnemonic: '',
            isLoadingMnemonic: false,
            isLoadingReset: false,
            isLoadingPasswordRecovery: false,
            isLoadingPasswordCreate: false,
            isLoadingPasswordChange: false,
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
        async onSubmitResetAccount() {
            this.isLoadingReset = true;
            await this.accountStore.reset();
            this.isLoadingReset = false;
        },
        async onSubmitDeviceShareRecovery() {
            this.isLoadingPasswordRecovery = true;
            await this.accountStore.recoverDeviceShare(this.passwordRecovery);
            this.isLoadingPasswordRecovery = false;
        },
        async onSubmitDeviceSharePasswordCreate() {
            const { isAuthenticated, isDeviceShareAvailable, createDeviceShare } = this.accountStore;
            if (!isAuthenticated || !isDeviceShareAvailable) return;

            this.isLoadingPasswordCreate = true;
            await createDeviceShare(this.question, this.password);
            this.isLoadingPasswordCreate = false;
        },
        async onSubmitDeviceSharePasswordUpdate() {
            const { isAuthenticated, isDeviceShareAvailable, updateDeviceShare } = this.accountStore;
            if (!isAuthenticated || !isDeviceShareAvailable) return;

            this.isLoadingPasswordChange = true;
            await updateDeviceShare(this.password);
            this.isLoadingPasswordChange = false;
        },
        // async onSubmitCreateMnemonic() {
        //     this.isLoadingMnemonic = true;
        //     const newShare = await tKey.generateNewShare();
        //     this.mnemonic = (await tKey.outputShare(newShare.newShareIndex, 'mnemonic')) as string;
        //     this.isLoadingMnemonic = false;
        // },
    },
});
</script>
