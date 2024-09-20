<template>
    <b-card variant="darker" class="mb-5">
        <h3 class="d-flex align-items-center">
            Profile
            <b-button variant="dark" target="_blank" s :href="url" class="ms-auto">
                <BaseIcon icon="external-link-alt" />
            </b-button>
        </h3>

        <b-row>
            <b-col md="6">
                <BaseFormGroup label="Name">
                    <b-form-input v-model="name" @change="update()" />
                </BaseFormGroup>
                <BaseFormGroup label="Slug">
                    <b-form-input v-model="slug" @change="update()" />
                </BaseFormGroup>
                <BaseFormGroup label="URL">
                    <b-form-input v-model="domain" @change="update()" />
                </BaseFormGroup>
            </b-col>
            <b-col md="6">
                <BaseFormGroup label="Logo">
                    <BaseFormInputFile
                        :image-src="logoImgURL"
                        :is-loading="isLoadingLogo"
                        @loading="isLoadingLogo = true"
                        @remove="onUpdate({ logoImgURL: '' })"
                        @done="onUpdate({ logoImgURL: $event })"
                    />
                </BaseFormGroup>
                <BaseFormGroup label="Background">
                    <BaseFormInputFile
                        :image-src="backgroundImgURL"
                        :is-loading="isLoadingBackground"
                        @loading="isLoadingBackground = true"
                        @remove="onUpdate({ backgroundImgURL: '' })"
                        @done="onUpdate({ backgroundImgURL: $event })"
                    />
                </BaseFormGroup>
            </b-col>
        </b-row>

        <b-row>
            <b-col>
                <h4 class="my-3">Elements</h4>
                <b-row>
                    <b-col v-for="element of elements" class="d-flex mb-2 align-items-center" md="4">
                        <b-form-input v-model="element.color" type="color" class="me-3" @change="onUpdate" />
                        <span class="text-opaque">{{ element.label }}</span>
                    </b-col>
                </b-row>
                <h4 class="my-3">Colors</h4>
                <b-row>
                    <b-col v-for="c of colors" class="d-flex mb-2 align-items-center" md="4">
                        <b-form-input v-model="c.color" type="color" class="me-3" @change="onUpdate" />
                        <span class="text-opaque">{{ c.label }}</span>
                    </b-col>
                </b-row>
            </b-col>
            <b-col
                class="d-flex flex-column"
                :class="{
                    'align-items-start': align === 'left',
                    'align-items-end': align === 'right',
                }"
            >
                <b-card
                    header-class="p-0"
                    class="mt-5"
                    :style="{ backgroundColor: getElement('Background'), color: getElement('Text'), maxWidth: '380px' }"
                >
                    <template #header>
                        <b-navbar
                            class="p-2 px-1"
                            :style="{
                                backgroundColor: getElement('Navigation'),
                            }"
                        >
                            <b-navbar-brand href="#">
                                <b-img :src="logoImgURL || Imglogo" width="40" height="40"></b-img>
                            </b-navbar-brand>
                            <b-button
                                size="sm"
                                variant="primary"
                                class="border-0 p-2 px-3"
                                :style="{
                                    backgroundColor: getElement('Navigation Button'),
                                    color: getElement('Navigation Button Text'),
                                }"
                            >
                                Login
                                <BaseIcon icon="sign-in-alt" class="ms-2" />
                            </b-button>
                        </b-navbar>
                    </template>
                    <div class="alert border-0 p-2" :style="{ backgroundColor: getColor('Success') }">
                        <BaseIcon icon="info-circle" class="mx-2" />
                        Lorem ipsum dolor sit amet
                    </div>
                    <div class="alert border-0 p-2" :style="{ backgroundColor: getColor('Danger') }">
                        <BaseIcon icon="exclamation-circle" class="mx-2" />
                        Lorem ipsum dolor sit amet
                    </div>
                    <p :style="{ color: getElement('Text') }">Lorem ipsum dolor sit amet.</p>
                    <b-card
                        :style="{ backgroundColor: getElement('Card') }"
                        img-src="https://placehold.co/600x300?text=Collectible&font=Manrope"
                    >
                        <p :style="{ color: getElement('Card Text') }">Lorem ipsum dolor sit amet</p>
                        <b-button
                            class="border-0 w-100"
                            :style="{ backgroundColor: getElement('Button'), color: getElement('Button Text') }"
                        >
                            Collect
                        </b-button>
                    </b-card>
                </b-card>
            </b-col>
        </b-row>
        <b-row>
            <b-col md="6">
                <h4 class="my-3">Launcher</h4>
                <BaseFormGroup label="Message">
                    <b-form-input v-model="message" @change="update()" />
                </BaseFormGroup>
                <BaseFormGroup label="Alignment">
                    <b-form-select v-model="align" @change="update()">
                        <b-form-select-option v-for="label of ['Right', 'Left']" :value="label.toLowerCase()">
                            {{ label }}
                        </b-form-select-option>
                    </b-form-select>
                </BaseFormGroup>
                <BaseFormGroup label="Icon">
                    <BaseFormInputFile
                        :image-src="iconImg"
                        :is-loading="isLoadingIcon"
                        @loading="isLoadingIcon = true"
                        @remove="onUpdate({ iconImg: '' })"
                        @done="onUpdate({ iconImg: $event })"
                    />
                </BaseFormGroup>
            </b-col>
            <b-col
                md="6"
                class="d-flex justify-content-end flex-column"
                :class="{
                    'align-items-start': align === 'left',
                    'align-items-end': align === 'right',
                }"
            >
                <div
                    style="max-width: 250px"
                    class="rounded bg-white text-dark d-flex align-items-center justify-content-center p-2 small"
                >
                    <p class="m-0">{{ message }}</p>
                </div>
                <div
                    class="rounded-circle d-flex my-3"
                    :style="{ width: '60px', height: '60px', backgroundColor: getElement('Button') }"
                >
                    <b-img
                        v-if="iconImg"
                        :src="iconImg"
                        class="m-auto"
                        style="max-width: 30px; max-height: 30px; width: auto; height: auto"
                    />
                    <BaseIcon
                        v-else
                        icon="wallet"
                        class="m-auto"
                        :style="{ color: getElement('Button Text'), fontSize: '1.2rem' }"
                    />
                </div>
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
import Imglogo from '@thxnetwork/studio/assets/logo.jpg';

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
            isLoadingIcon: false,
            isLoadingLogo: false,
            isLoadingBackground: false,
            Imglogo,
            iconImg: '',
            backgroundImgURL: '',
            logoImgURL: '',
            domain: '',
            name: '',
            slug: '',
            isPublished: true,
            message: 'Hi👋 Click me to view your collectibles!',
            align: 'right',
            elements: [] as { color: string; label: string }[],
            colors: [] as { color: string; label: string }[],
            color: '',
            bgColor: '',
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
        this.color = this.profile.color;
        this.bgColor = this.profile.bgColor;
        this.align = this.profile.align;
        this.iconImg = this.profile.iconImg;
        this.message = this.profile.message;

        const { elements, colors } = JSON.parse(this.profile.theme);
        this.elements = elements;
        this.colors = colors;
    },
    methods: {
        getColor(label: string) {
            return Object.values(this.colors).find((color) => color.label === label)?.color;
        },
        getElement(label: string) {
            return Object.values(this.elements).find((element) => element.label === label)?.color;
        },
        async update() {
            try {
                this.isLoading = true;
                await this.accountStore.updateProfile(this.profile._id, {
                    isPublished: this.isPublished,
                    logoImgURL: this.logoImgURL,
                    backgroundImgURL: this.backgroundImgURL,
                    name: this.name,
                    slug: this.slug,
                    domain: this.domain,
                    message: this.message,
                    align: this.align,
                    color: this.color,
                    bgColor: this.bgColor,
                    iconImg: this.iconImg,
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
        async onUpdate(update: any) {
            for (const key in update) {
                (this as any)[key] = update[key];
            }
            await this.update();
            this.isLoadingIcon = false;
            this.isLoadingLogo = false;
            this.isLoadingBackground = false;
        },
    },
});
</script>
