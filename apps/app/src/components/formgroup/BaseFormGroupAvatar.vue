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
            class="cursor-pointer"
            style="touch-action: manipulation; -webkit-tap-highlight-color: transparent"
            @click.prevent="triggerFileInput"
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
        async onChangeProfileImg(event: Event) {
            console.log('YU!!! Change event triggered', event);
            const input = event.target as HTMLInputElement;

            try {
                console.log('YU!!! Original files list:', input.files);

                // First try standard webview file access
                const file = await this.webviewFileWorkaround(input);
                console.log('YU!!! File after workaround:', file);

                if (!file) {
                    console.warn('YU!!! No file found after workaround');

                    // Android webview fallback with blob handling
                    if (input.value) {
                        console.log('YU!!! Trying blob fallback with input value:', input.value);
                        const blob = await this.readFileBlob(input.value);

                        if (blob) {
                            console.log('YU!!! Blob obtained from fallback:', blob);
                            return await this.handleBlobUpload(blob);
                        }
                    }
                    return;
                }

                console.log('YU!!! Proceeding with standard file upload');
                const profileImg = await this.accountStore.upload(file);
                this.accountStore.update({ profileImg });
            } catch (error) {
                console.error('YU!!! Upload error:', error);
            } finally {
                input.value = '';
                console.log('YU!!! Input reset completed');
            }
        },

        async handleBlobUpload(blob: Blob) {
            console.log('YU!!! Starting blob upload handling');
            try {
                // Convert blob to File with dummy filename
                const file = new File([blob], 'webview-image.jpg', {
                    type: blob.type || 'image/jpeg',
                    lastModified: Date.now(),
                });

                console.log('YU!!! Created File from blob:', file);
                const profileImg = await this.accountStore.upload(file);
                this.accountStore.update({ profileImg });
                console.log('YU!!! Blob upload successful');
            } catch (error) {
                console.error('YU!!! Blob upload failed:', error);
                throw new Error('Failed to process webview file');
            }
        },

        async readFileBlob(filePath: string): Promise<Blob | null> {
            console.log('YU!!! Reading file blob from path:', filePath);
            try {
                const response = await fetch(filePath);
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                return await response.blob();
            } catch (e) {
                console.error('YU!!! File blob read error:', e);
                return null;
            }
        },

        async webviewFileWorkaround(input: HTMLInputElement): Promise<File | null> {
            console.log('YU!!! Starting webview workaround');

            // Immediate check for files
            if (input.files?.[0]) {
                console.log('YU!!! File found in initial check');
                return input.files[0];
            }

            console.log('YU!!! No files found, starting event listener workaround');

            return new Promise((resolve) => {
                const timeout = setTimeout(() => {
                    console.warn('YU!!! Webview workaround timeout');
                    resolve(null);
                }, 1500); // Increased timeout for slow devices

                const listener = (e: Event) => {
                    const target = e.target as HTMLInputElement;
                    console.log('YU!!! Workaround change event received', target.files);
                    clearTimeout(timeout);
                    resolve(target.files?.[0] || null);
                    input.removeEventListener('change', listener);
                };

                input.addEventListener('change', listener);
                console.log('YU!!! Added temporary change listener');
            });
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
