<template>
    <div ref="telegramLoginContainer"></div>
</template>

<script lang="ts">
import { defineComponent, onMounted, onUnmounted } from 'vue';
import { useAccountStore } from '../stores/Account';
import { AccountVariant } from '../types/enums/accountVariant';

export default defineComponent({
    name: 'BaseTelegramLogin',
    setup() {
        const accountStore = useAccountStore();

        const handleTelegramAuth = (user: any) => {
            accountStore.signInWithOAuth({ variant: AccountVariant.SSOTelegram });
        };

        onMounted(() => {
            // Load Telegram Login Widget script
            const script = document.createElement('script');
            script.src = 'https://telegram.org/js/telegram-widget.js?22';
            script.setAttribute('data-telegram-login', process.env.VUE_APP_TELEGRAM_BOT_NAME || '');
            script.setAttribute('data-size', 'large');
            script.setAttribute('data-onauth', 'handleTelegramAuth(user)');
            script.setAttribute('data-request-access', 'write');
            script.async = true;

            // Add the script to the container
            const container = document.querySelector('.telegram-login-container');
            if (container) {
                container.appendChild(script);
            }

            // Add the callback function to the window object
            // window.handleTelegramAuth = handleTelegramAuth;
        });

        onUnmounted(() => {
            // Clean up
            // delete window.handleTelegramAuth;
            const script = document.querySelector('script[src*="telegram-widget.js"]');
            if (script) {
                script.remove();
            }
        });
    },
});
</script>
