<template>
    <b-form-group class="text-center">
        <!-- <b-form-file
            v-model="profileImgFile"
            accept="image/*"
            size="sm"
            class="d-none"
            capture="environment"
            @input="onChangeProfileImg"
        >
            <template #label> </template>
        </b-form-file> -->
        <input
            id="avatarUpload"
            ref="fileInput"
            class="d-none"
            type="file"
            accept="image/*"
            @change="onChangeProfileImg"
        />
        <label
            for="avatarUpload"
            class="cursor-pointer"
            style="touch-action: manipulation; -webkit-tap-highlight-color: transparent"
        >
            <b-avatar size="100" class="cursor-pointer gradient-border-xl" :src="profileImg" />
            <br />
            <div v-if="!isRemoveable" class="mt-2 cursor-pointer text-primary">Upload</div>
        </label>
        <br />
        <b-link v-if="isRemoveable" class="text-danger small" @click="onClickRemovePicture"> Remove </b-link>
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
            if (!this.accountStore.account) return '';
            return this.accountStore.account.profileImg || '';
        },
        isPlaceholder() {
            return this.profileImg.startsWith('https://api.dicebear.com');
        },
        isRemoveable() {
            return (this.profileImg && !this.isPlaceholder) || this.profileImgFile;
        },
    },
    methods: {
        async onChangeProfileImg(event: any) {
            const file = event.target.files[0];
            if (!file) return;

            const profileImg = await this.accountStore.upload(file);
            this.accountStore.update({ profileImg });

            event.target.value = '';
        },
        onClickRemovePicture() {
            this.accountStore.update({ profileImg: '' });

            const fileInput = this.$refs.fileInput as HTMLInputElement;
            if (fileInput) fileInput.value = '';
        },
        onClickUpload() {
            //
        },
        triggerFileInput() {
            (this.$refs.fileInput as HTMLInputElement)?.click();
        },
    },
});
</script>
