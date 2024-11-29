<template>
    <b-form-group label="Username" :state="isValidUsername" :invalid-feedback="String(error)" class="mb-0">
        <b-input-group>
            <b-form-input
                v-model="value"
                :state="isValidUsername"
                placeholder="JohnDoe123"
                style="border-radius: 0.375rem; padding-right: 40px"
                @input="onInput"
                @change="onChange"
            />
            <!-- <b-input-group-append v-if="isLoading">
                <b-button size="sm" variant="primary" class="px-3" :disabled="true">
                    <b-spinner small />
                </b-button>
            </b-input-group-append> -->
            <div v-if="isLoading" class="username-loader d-flex align-items-center px-2">
                <b-spinner small />
            </div>
        </b-input-group>
    </b-form-group>
</template>

<script lang="ts">
import { useAccountStore } from '../../stores/Account';
import { mapStores } from 'pinia';
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'BaseFormGroupUsername',
    props: {
        username: String,
    },
    data() {
        return {
            value: '',
            error: '',
            debounce: 0,
            isLoading: false,
        };
    },
    computed: {
        ...mapStores(useAccountStore),
        isInvalidInput() {
            return !this.value || !this.value.length || this.value.length < 3 || this.value.length > 15;
        },
        isValidUsername() {
            if (this.isInvalidInput || this.error.length) return false;
            return;
        },
    },
    mounted() {
        if (!this.accountStore.account) return;
        this.value = this.accountStore.account.username;
    },
    methods: {
        reset() {
            this.isLoading = false;
            if (!this.value || !this.value.length) {
                this.error = 'Username is required.';
            } else if (this.value.length < 3) {
                this.error = 'Username must be at least 3 characters long.';
            } else if (this.value.length > 15) {
                console.log(this.value.length);
                this.error = 'Username must not exceed 15 characters.';
            } else {
                this.error = '';
            }
        },
        onInput() {
            this.isLoading = true;
            clearTimeout(this.debounce);
            this.debounce = setTimeout(this.update, 1000) as any;
        },
        onChange() {
            this.update();
        },
        async update() {
            if (this.isInvalidInput) {
                this.reset();
                return;
            }
            try {
                await this.accountStore.update({ username: this.value });
                this.error = '';
            } catch (error) {
                this.error = 'This username is already in use.';
            } finally {
                this.$emit('error', this.error);
                this.isLoading = false;
            }
        },
    },
});
</script>
<style lang="scss" scoped>
.username-loader {
    position: absolute;
    right: -30px;
    top: 50%;
    transform: translateY(-50%);
}
.form-control:focus {
    box-shadow: none;
}
</style>
