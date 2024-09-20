<template>
    <div class="d-flex align-items-start flex-column">
        <div class="d-flex w-100">
            <div v-if="isLoading" class="d-flex align-items-center px-2">
                <b-spinner variant="primary" small />
            </div>
            <b-link v-else-if="imageSrc" :href="imageSrc">
                <img
                    :src="imageSrc"
                    style="max-height: 47px; width: auto; height: auto; max-width: 100px"
                    class="me-2"
                    alt="Preview image"
                />
            </b-link>
            <b-input-group>
                <b-form-file :disabled="isLoading" accept="image/*" width="50%" @change="onFileChange" />
            </b-input-group>
        </div>
        <div v-if="imageSrc" class="d-flex w-100">
            <b-link target="_blank" :href="imageSrc" class="text-decoration-none">
                Download file
                <BaseIcon icon="external-link-alt" class="ms-1" />
            </b-link>
            <b-link class="text-decoration-none text-danger ms-auto" @click="$emit('remove')">Remove</b-link>
        </div>
    </div>
</template>

<script lang="ts">
import axios from 'axios';
import { defineComponent } from 'vue';
import { mapStores } from 'pinia';
import { useAuthStore } from '@thxnetwork/studio/stores';
import { API_URL } from '@thxnetwork/studio/config/secrets';

export default defineComponent({
    name: 'BaseFormInputFile',
    props: {
        isLoading: Boolean,
        imageSrc: String,
    },
    computed: {
        ...mapStores(useAuthStore),
    },
    watch: {
        file(file) {
            this.onFileChange(file);
        },
    },
    methods: {
        async onFileChange(event: any) {
            const file = event.target.files[0];
            const formData = new FormData();
            formData.append('file', file);

            this.$emit('loading', true);
            const { data } = await axios(API_URL + '/v1/upload', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${this.authStore.session?.access_token}`,
                    'Content-Type': 'multipart/form-data',
                },
                data: formData,
            });

            this.$emit('done', data.publicUrl);
            this.$emit('loading', false);
        },
    },
});
</script>
