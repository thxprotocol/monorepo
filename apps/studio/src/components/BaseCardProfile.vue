<template>
    <b-card variant="darker" class="mb-5">
        <h3 class="d-flex align-items-center">
            Profile
            <b-button variant="dark" :href="url" class="ms-auto">
                <BaseIcon icon="external-link-alt" />
            </b-button>
        </h3>
        <b-row>
            <b-col md="6">
                <BaseFormGroup label="Name">
                    <b-form-input v-model="name" />
                </BaseFormGroup>
                <BaseFormGroup label="Slug">
                    <b-form-input v-model="slug" />
                </BaseFormGroup>
                <BaseFormGroup label="URL">
                    <b-form-input v-model="domain" />
                </BaseFormGroup>
            </b-col>
            <b-col md="6">
                <BaseFormGroup label="Logo">
                    <BaseFormInputFile
                        :image-src="logoImgURL"
                        :is-loading="isLoadingLogo"
                        @loading="isLoadingLogo = true"
                        @done="onUpdate({ logoImgURL: $event })"
                    />
                </BaseFormGroup>
                <BaseFormGroup label="Background">
                    <BaseFormInputFile
                        :image-src="backgroundImgURL"
                        :is-loading="isLoadingBackground"
                        @loading="isLoadingBackground = true"
                        @done="onUpdate({ backgroundImgURL: $event })"
                    />
                </BaseFormGroup>
            </b-col>
        </b-row>

        <h4 class="my-3">Elements</h4>
        <b-row>
            <b-col v-for="element of elements" class="d-flex mb-2 align-items-center" md="2">
                <b-form-input v-model="element.color" type="color" class="me-3" />
                <span class="text-opaque">{{ element.label }}</span>
            </b-col>
        </b-row>

        <h4 class="my-3">Colors</h4>
        <b-row>
            <b-col v-for="element of colors" class="d-flex mb-2 align-items-center" md="2">
                <b-form-input v-model="element.color" type="color" class="me-3" />
                <span class="text-opaque">{{ element.label }}</span>
            </b-col>
        </b-row>
    </b-card>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { WALLET_URL } from '@thxnetwork/studio/config/secrets';
import { mapStores } from 'pinia';
import { useAccountStore } from '@thxnetwork/studio/stores';
import { toast } from '@thxnetwork/studio/utils/toast';

export default defineComponent({
    name: 'BaseCardProfile',
    props: {
        profile: {
            type: Object as PropType<TWidget>,
            required: true,
        },
    },
    data() {
        return {
            isLoading: false,
            isLoadingLogo: false,
            isLoadingBackground: false,
            logoImgURL: '',
            backgroundImgURL: '',
            domain: '',
            name: '',
            slug: '',
            elements: [] as { color: string; label: string }[],
            colors: [] as { color: string; label: string }[],
        };
    },
    computed: {
        ...mapStores(useAccountStore),
        url() {
            const url = new URL(WALLET_URL);
            url.pathname = this.profile._id;
            return url.toString();
        },
    },
    mounted() {
        this.logoImgURL = this.profile.logoImgURL;
        this.backgroundImgURL = this.profile.backgroundImgURL;
        this.domain = this.profile.domain;
        this.name = this.profile.name;
        this.slug = this.profile.slug;

        const { elements, colors } = JSON.parse(this.profile.theme);
        this.elements = elements;
        this.colors = colors;
    },
    methods: {
        async update() {
            try {
                this.isLoading = true;
                await this.accountStore.updateProfile(this.profile._id, {
                    logoImgURL: '',
                    backgroundImgURL: '',
                    name: this.name,
                    slug: this.slug,
                    domain: this.domain,
                    theme: JSON.stringify({ elements: this.elements, colors: this.colors }),
                });
            } catch (error: any) {
                toast(error.message, 'light', 3000, () => {
                    return;
                });
            } finally {
                this.isLoading = false;
            }
        },
        async onUpdate(update: Partial<TWidget>) {
            for (const key in update) {
                this[key] = update[key];
            }
            await this.update();
            this.isLoading = false;
        },
    },
});
</script>
