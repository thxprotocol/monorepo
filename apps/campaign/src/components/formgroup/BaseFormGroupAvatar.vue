<template>
    <b-form-group class="text-center">
        <b-form-file v-model="profileImgFile" @input="onChangeProfileImg" accept="image/*" size="sm" class="d-none">
            <template #label>
                <b-avatar size="100" class="cursor-pointer gradient-border-xl" :src="profileImg" variant="primary" />
            </template>
        </b-form-file>
        <br />
        <b-link
            v-if="!profileImg.includes('https://api.dicebear.com') || profileImgFile"
            @click="onClickRemovePicture"
            class="text-danger small"
        >
            Remove
        </b-link>
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
            profileImg: '',
            profileImgFile: null,
        };
    },
    computed: {
        ...mapStores(useAccountStore),
    },
    mounted() {
        this.profileImg = this.accountStore.account?.profileImg || '';
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
    },
});
</script>
