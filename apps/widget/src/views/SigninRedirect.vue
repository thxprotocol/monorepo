<template>
    <div class="d-flex justify-content-center align-items-center flex-grow-1">
        <b-spinner variant="light" />
    </div>
</template>

<script lang="ts">
import { useAccountStore } from '../stores/Account';
import { mapStores } from 'pinia';
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'SigninRedirect',
    components: {},
    data(): any {
        return {
            //
        };
    },
    computed: {
        ...mapStores(useAccountStore),
    },
    async mounted() {
        const url = new URL(window.location.href);
        if (url && url.searchParams.has('code')) {
            const url = new URL(location.href);
            const stateString = url.searchParams.get('state') as string;
            const state = JSON.parse(window.atob(stateString.split('%')[0]));
            const sessionStateKey = `thx.${state.id}`;
            const session = JSON.parse(localStorage.getItem(sessionStateKey) as string);
            const poolId = this.$route.params.poolId;

            this.accountStore.init({ poolId }).then(() => {
                const returnUrl = new URL(session.returnUrl);
                this.$router.push({ path: returnUrl.pathname });
            });
        }
    },
});
</script>
