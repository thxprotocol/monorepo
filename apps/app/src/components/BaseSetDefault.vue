<template>
    <b-card v-if="!isDefault" class="bg-default">
        <div class="align-items-center">
            <div>
                <div class="default-text">
                    <h4>Set as Default</h4>
                    <span>
                        Hey it seems that Santa is not a default browser on your systems.
                        <strong>set as default browser and earn 30 pts now ! </strong>
                    </span>
                </div>
            </div>
            <div class="d-flex justify-content-end mt-2">
                <button class="set-button" @click="setAsDefault">Set as Default</button>
            </div>
        </div>
    </b-card>
</template>
<script>
export default {
    data() {
        return {
            isDefault: false,
            poller: null,
        };
    },
    mounted() {
        this.checkIfDefault();
    },
    beforeUnmount() {
        if (this.poller) {
            this.poller.stop();
        }
    },
    methods: {
        chromeSendMessage(message, callback) {
            if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
                const extensionId = 'ehlpnjcddkggjcbeonecfdfdbeiiopoh';
                chrome.runtime.sendMessage(extensionId, message, callback);
            } else {
                console.warn('chrome.runtime.sendMessage is not available.');
            }
        },
        checkIfDefault() {
            this.chromeSendMessage({ message: 'isDefaultBrowser' }, (response) => {
                if (response && response.isDefault) {
                    this.isDefault = true;
                    if (this.poller) {
                        this.poller.stop();
                    }
                }
            });
        },
        setAsDefault() {
            this.chromeSendMessage({ message: 'setAsDefaultBrowser' }, () => {
                this.startCheckingDefault();
            });
        },
        startCheckingDefault() {
            this.poller = new Poller({
                name: 'default-browser',
                timeout: 60000,
                interval: 2000,
                onUpdate: () => {
                    this.checkIfDefault();
                },
                onError: (error) => {
                    console.error('Polling error:', error);
                },
            });

            this.poller.poll(async () => {
                this.checkIfDefault();
            });
        },
    },
};
class Poller {
    constructor(options = {}) {
        this.options = {
            timeout: options.timeout || 60000,
            interval: options.interval || 2000,
            onUpdate:
                options.onUpdate ||
                (() => {
                    //empty arrow function no update needed
                }),
            onError: options.onError || console.error,
            name: options.name || 'unnamed-poll',
        };

        this.controller = null;
        this.isPolling = false;
    }

    async poll(checkFn) {
        if (this.isPolling) {
            console.warn(`Poller ${this.options.name} is already running`);
            return;
        }

        this.controller = new AbortController();
        const { signal } = this.controller;
        this.isPolling = true;
        const startTime = Date.now();

        try {
            while (!signal.aborted) {
                try {
                    if (Date.now() - startTime >= this.options.timeout) {
                        this.stop();
                        break;
                    }

                    await checkFn(signal);
                    await this.options.onUpdate();
                    await this.delay(this.options.interval, signal);
                } catch (error) {
                    if (error.name === 'AbortError') throw error;

                    this.options.onError(error);
                    await this.delay(this.options.interval, signal);
                }
            }
        } finally {
            this.cleanup();
        }
    }

    async delay(ms, signal) {
        return new Promise((resolve, reject) => {
            const timeoutId = setTimeout(resolve, ms);
            signal?.addEventListener(
                'abort',
                () => {
                    clearTimeout(timeoutId);
                    reject(new Error('AbortError'));
                },
                { once: true },
            );
        });
    }

    stop() {
        if (this.controller) {
            this.controller.abort();
        }
    }

    cleanup() {
        this.isPolling = false;
        this.controller = null;
    }
}
</script>

<style scoped>
.card {
    flex: 1 1 50%;
    color: #ffffff;
    border-radius: 15px;
}
.default-text h4 {
    color: #fff;
    font-size: 15px;
    font-style: italic;
    font-weight: 700;
    line-height: normal;
}

.default-text span {
    color: #ccffed;
    font-size: 13px;
    font-style: normal;
    font-weight: 400;
    line-height: 17px;
}
.set-button {
    width: fit-content;
    white-space: nowrap;
    color: #ffffff;
    text-align: center;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
    border-radius: 3px;
    background: #002934;
    border: none;
    padding: 5px 15px;
}

.bg-default {
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    background: linear-gradient(142deg, rgba(3, 129, 84, 0.85) 19.63%, rgba(3, 73, 112, 0.85) 83.01%);
    box-shadow: 0px 5px 20px 0px rgba(20, 127, 89, 0.38);
    backdrop-filter: blur(30px);
    margin: 15px;
}
</style>
