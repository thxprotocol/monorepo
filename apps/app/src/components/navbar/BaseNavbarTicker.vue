<template>
    <div class="p-1 px-2 ticker d-flex w-100 mb-0 border-0 bg-dark" style="border: 0; border-radius: 0">
        <div class="ticker-content me-auto align-items-center d-flex">
            <b-link
                class="text-white text-decoration-none"
                style="font-size: 0.8rem; color: gray !important"
                href="https://medium.com/thxprotocol/revolutionizing-gaming-with-thx-networks-new-vote-escrowed-tokenomics-18ef24239e46"
                target="_blank"
            >
                <i class="fas fa-bullhorn me-2" />
                <strong>Discover Staking Now 🎁</strong> Stake Your $THX on Balancer & Collect 70% of the Protocol Fees.
                Early Stakers Get Extra Rewards
            </b-link>
        </div>
        <BaseCardPrices />
    </div>
</template>

<style lang="scss">
.ticker {
    text-align: center;
    min-height: 40px;
    overflow: hidden;
    white-space: nowrap;

    .card-prices {
        display: none;
        font-size: 0.8rem;
    }
}

.ticker-content {
    display: inline-block;
    animation: tickerMove 13s linear infinite;
}

@media (min-width: 1500px) {
    .ticker {
        text-align: left;

        .ticker-content {
            animation: none;
        }

        .card-prices {
            display: flex;
        }
    }
}

@keyframes tickerMove {
    0% {
        transform: translateX(30%);
    }
    100% {
        transform: translateX(-100%);
    }
}
</style>
