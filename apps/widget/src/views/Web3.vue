<template>
    <div class="flex-grow-1 overflow-auto px-3 d-flex flex-column">
        <b-form-input v-model="value" />
        <hr />
        User:
        <pre>{{ accountStore.user }}</pre>
        OAuthShare:
        <pre>{{ accountStore.oAuthShare }}</pre>
        PrivateKey:
        <pre>{{ accountStore.privateKey }}</pre>
        <hr />
        <b-button variant="primary" @click="onSubmitCreateDevicveSharePassword">Generate Password Share</b-button>
        <b-button variant="primary" @click="onSubmitChangeDeviceSharePassword">Change Password Share</b-button>
        <b-button variant="primary" @click="onSubmitRecoverDeviceShare">Submit Password Share</b-button>
        <hr />
        <b-button variant="primary" @click="onSubmitCreateMnemonic">Generate Backup (Mnemonic)</b-button>
        <b-button variant="primary" @click="onSubmitRecoverAccount">Input Backup Share</b-button>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapStores } from 'pinia';
import { useAccountStore } from '../stores/Account';

export default defineComponent({
    name: 'Web3',
    components: {},
    data: function () {
        return { user: null, oAuthShare: null, value: '', privateKey: '' };
    },
    computed: {
        ...mapStores(useAccountStore),
    },
    methods: {},
});
</script>
<style scoped>
.btn {
    margin-bottom: 1rem;
}
</style>
