<template>
    <b-form-group class="text-center">
        <b-form-file v-model="profileImgFile" @input="onChangeProfileImg" accept="image/*" size="sm" class="d-none">
            <template #label>
                <b-avatar size="100" class="cursor-pointer gradient-border-xl" :src="profileImg" variant="primary" />
                <br />
                <b-link class="text-primary" v-if="!profileImg"> Upload </b-link>
            </template>
        </b-form-file>
        <br />
        <b-link v-if="isRemoveable" @click="onClickRemovePicture" class="text-danger small"> Remove </b-link>
    </b-form-group>
</template>

<script lang="ts">
import { useAccountStore } from '../../stores/Account';
import { mapStores } from 'pinia';
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'BaseFormGroupAvatar',
    data() {
        return {
            error: '',
            isLoading: false,
            profileImgFile: null,
        };
    },
    computed: {
        ...mapStores(useAccountStore),
        profileImg() {
            if (!this.accountStore.account) return;
            return this.accountStore.account.profileImg || '';
        },
        isRemoveable() {
            if (!this.accountStore.account) return;
            if (!this.accountStore.account.profileImg) return;
            return !this.accountStore.account.profileImg.includes('https://api.dicebear.com') || this.profileImgFile;
        },
    },
    methods: {
        async onChangeProfileImg(event: any) {
            const profileImg = await this.accountStore.upload(event.target.files[0]);
            this.accountStore.update({ profileImg });
            this.profileImg = profileImg;
            this.profileImgFile = null;
        },
        onClickRemovePicture() {
            this.accountStore.update({ profileImg: '' });
            this.profileImg = '';
            this.profileImgFile = null;
        },
        onClickUpload() {
            //
        },
    },
});
</script>
