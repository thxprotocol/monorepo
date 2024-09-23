<template>
    <b-card
        variant="darker"
        class="mb-5"
        header-class="d-flex align-items-center py-3"
        footer-class="d-flex align-items-center"
    >
        <template #header>
            <h3 class="m-0">
                Profile
                <code>{{ profile._id }}</code>
            </h3>
            <b-button variant="light" size="sm" target="_blank" s :href="url" class="ms-auto">
                Open Wallet
                <BaseIcon icon="external-link-alt ms-1" />
            </b-button>
        </template>
        <b-alert v-model="isAlertDisabledShown" variant="warning" class="mb-3">
            <BaseIcon icon="exclamation-circle" class="me-2" />
            This profile is currently disabled and the wallet launcher is hidden on your domain.
        </b-alert>
        <b-row>
            <b-col md="6">
                <BaseFormGroup label="Name">
                    <b-form-input v-model="name" @change="update()" />
                </BaseFormGroup>
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
            <b-col md="6">
                <BaseFormGroup label="Published">
                    <b-button-group size="sm">
                        <b-button :variant="isPublished ? 'success' : 'dark'" @click="onUpdate({ isPublished: true })">
                            Enabled
                        </b-button>
                        <b-button :variant="!isPublished ? 'danger' : 'dark'" @click="onUpdate({ isPublished: false })">
                            Disabled
                        </b-button>
                    </b-button-group>
                </BaseFormGroup>
                <BaseFormGroup label="URL">
                    <b-form-input v-model="domain" @change="update()" />
                </BaseFormGroup>
                <BaseFormGroup label-class="d-flex align-items-center">
                    <template #label>
                        Embed Code
                        <b-button
                            v-clipboard:copy="decodeHTML(embedCode)"
                            v-clipboard:success="onCopySuccess"
                            class="ms-auto"
                            variant="dark"
                            size="sm"
                        >
                            Copy
                            <BaseIcon v-if="isCopySuccess" icon="check" class="ms-2" />
                        </b-button>
                    </template>
                    <pre
                        class="bg-dark rounded p-3 overflow-auto"
                    ><code class="language-javascript" v-html="embedCode" /></pre>
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
                        <b-navbar class="p-2 px-1" :style="{ backgroundColor: getElement('Navigation') }">
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
                    :style="{ width: '60px', height: '60px', backgroundColor: getElement('Launcher') }"
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
                        :style="{ color: getElement('Launcher Icon'), fontSize: '1.2rem' }"
                    />
                </div>
            </b-col>
        </b-row>
        <template #footer>
            <b-button
                variant="link"
                class="text-danger text-decoration-none ms-auto"
                @click="isModalRemoveShown = true"
            >
                <b-spinner v-if="isLoading" small />
                <template v-else> Remove </template>
            </b-button>
            <b-modal v-model="isModalRemoveShown" centered title="Remove Profile">
                <template #header>
                    <h3 class="m-0">Remove Profile</h3>
                    <b-button variant="link" class="text-white ms-auto" size="sm">
                        <BaseIcon icon="times" class="ms-1" />
                    </b-button>
                </template>
                <p class="m-0">Are you sure you want to remove this profile? This action cannot be undone.</p>
                <template #footer>
                    <b-button class="w-100" variant="danger" @click="onClickRemove">
                        <b-spinner v-if="isLoading" small />
                        <template v-else> Remove </template>
                    </b-button>
                </template>
            </b-modal>
        </template>
    </b-card>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { API_URL, WALLET_URL } from '@thxnetwork/studio/config/secrets';
import { mapStores } from 'pinia';
import { useAccountStore } from '@thxnetwork/studio/stores';
import { toast } from '@thxnetwork/studio/utils/toast';
import Imglogo from '@thxnetwork/studio/assets/logo.jpg';
import { decodeHTML } from '@thxnetwork/studio/utils/decode-html';

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
            decodeHTML,
            isModalRemoveShown: false,
            isCopySuccess: false,
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
            url: '',
            embedCode: '',
        };
    },
    computed: {
        ...mapStores(useAccountStore),
        isAlertDisabledShown() {
            return !this.isPublished;
        },
    },
    mounted() {
        this.isPublished = this.profile.isPublished;
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

        const walletURL = new URL(WALLET_URL);
        walletURL.pathname = this.profile._id;
        this.url = walletURL.toString();

        const apiURL = new URL(API_URL);
        apiURL.pathname = `v1/wallet/${this.profile._id}.js`;
        this.embedCode = `&lt;script src="${apiURL.toString()}"&gt;&lt;/script&gt;`;
    },
    methods: {
        getColor(label: string) {
            return Object.values(this.colors).find((color) => color.label === label)?.color;
        },
        getElement(label: string) {
            return Object.values(this.elements).find((element) => element.label === label)?.color;
        },
        onCopySuccess() {
            this.isCopySuccess = true;
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
        async onClickRemove() {
            try {
                this.isLoading = true;
                await this.accountStore.removeProfile(this.profile._id);
                await this.accountStore.getProfiles();

                this.isModalRemoveShown = false;
            } catch (error: any) {
                toast(error.message, 'light', 3000, () => {
                    return;
                });
            } finally {
                this.isLoading = false;
            }
        },
    },
});
</script>
