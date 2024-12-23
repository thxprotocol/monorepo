import axios from 'axios';
import journeyImageDark from '@thxnetwork/app/assets/about-journey-dark.png';
import journeyImageLight from '@thxnetwork/app/assets/about-journey-light.png';
import underStandImageDark from '@thxnetwork/app/assets/about-rewards-dark.png';
import underStandImageLight from '@thxnetwork/app/assets/about-rewards-light.png';

import dashboardImageDark from '@thxnetwork/app/assets/about-navigating-dark.png';
import dashboardImageLight from '@thxnetwork/app/assets/about-navigating-light.png';
import rewardImageDark from '@thxnetwork/app/assets/about-claim-dark.png';
import rewardImageLight from '@thxnetwork/app/assets/about-claim-light.png';

import walletImageDark from '@thxnetwork/app/assets/about-wallet-dark.png';
import walletImageLight from '@thxnetwork/app/assets/about-wallet-light.png';
import importImageDark from '@thxnetwork/app/assets/about-import-dark.png';
import importImageLight from '@thxnetwork/app/assets/about-import-light.png';
export interface Section {
    name: string;
    shortName: string;
    ref: string;
    content: string;
}

export interface ContentGroup {
    header: string;
    sections: Section[];
}

export async function getAboutContent(theme: string): Promise<ContentGroup[]> {
    let inviteURL = '';
    const { data } = await axios('https://discord.com/api/guilds/997069800092225576/widget.json');
    inviteURL = data.instant_invite || inviteURL;
    const journeyImage = theme === 'dark' ? journeyImageDark : journeyImageLight;
    const underStandImage = theme === 'dark' ? underStandImageDark : underStandImageLight;
    const dashboardImage = theme === 'dark' ? dashboardImageDark : dashboardImageLight;
    const rewardImage = theme === 'dark' ? rewardImageDark : rewardImageLight;
    const walletImage = theme === 'dark' ? walletImageDark : walletImageLight;
    const importImage = theme === 'dark' ? importImageDark : importImageLight;

    return [
        {
            header: 'OVERVIEW',
            sections: [
                {
                    name: 'Starting Your Journey',
                    shortName: 'Starting Your Journey',
                    ref: 'journey',
                    content: `
                <h1>🚀 Starting Your Journey</h1>
                <h2>Rewards Dashboard Overview</h2>
                <h3>Welcome to Santa Rewards</h3>
                <p>We're all about making your web experiences richer and your online time more rewarding! This Rewards Dashboard is your go-to spot where you can oversee how your browser is working for you!</p>
                <h3>We’ve written this guide to help you get started and make the most out of your rewarding journey with us</h3>
                <p>Here’s how you can effortlessly keep track of your progress, jump into various quests, and redeem your rewards — all in one place.</p>
                
                <img src="${journeyImage}" alt="Rewards Overview" />
            `,
                },
                {
                    name: 'Understanding Your Dashboard',
                    shortName: '',
                    ref: 'dashboard',
                    content: `
                <h1>🌟 Understanding Your Dashboard</h1>
                <h3>Your dashboard is divided into several key sections, each designed to help you manage and enhance your rewarding experience</h3>
                <p>We're all about making your web experiences richer and your online time more rewarding! This Rewards Dashboard is your go-to spot where you can oversee how your browser is working for you!</p>
                <h3>Santa Points and Cash Rewards:</h3>
                    <ul>
                        <li><strong>Santa Points:</strong> Earn these through browser use and completing quests.</li>
                        <li><strong>Cash Rewards:</strong> Earned through shopping cashbacks and tasks.</li>
                    </ul>
                <p>(More reward redemption options, like gift cards, Santa tokens, exclusive merch and much more! — Coming soon)</p>
                <img src="${underStandImage}" alt="Reward System"/>
                <h3>What to Collect?</h3>
                <p>Both points and rewards can be exchanged for exciting items like USDT, gift cards, and exclusive merch. The choice is yours!</p>
            `,
                },
                {
                    name: 'Navigating the Dashboard',
                    shortName: '',
                    ref: 'navigating',
                    content: `
                <h1 style="margin-top: 65px">🗺️ Navigating the Dashboard</h1>
                <h2>Dashboard</h2>
                <h3>Here's how you can interact with each part:</h3>
                <ul>
                <li><strong>Quests:</strong> Dive into simple tasks and accumulate Santa Points.</li>
                <li><strong>Rewards:</strong> Exchange points and cash for rewards.</li>
                <li><strong>Leaderboard:</strong> Track your ranking.</li>
                <li><strong>Wallet:</strong> Manage your earnings.</li>
                <li><strong>Transactions:</strong> Monitor your claims and transfers.</li>
                </ul>
                <img src="${dashboardImage}" alt="Navigating Dashboard" />
            `,
                },
                {
                    name: 'Engaging with Quests',
                    shortName: 'Quests',
                    ref: 'quests',
                    content: `
                <h1>🔍 Engaging with Quests</h1>
                <h2>Quests</h2>
                <p>The Quests section of your Santa Rewards Dashboard is where simple online interactions can propel you towards fabulous rewards! This is where you can engage in various browser-related tasks, track your progress and start racking up those Santa Points!</p>
                
                <h3>What are Santa Quests?</h3>
                <p class="text-before-bullet">Santa Quests usually involve simple browser-related tasks that you can complete (both passively & actively) in order to earn Santa Points. Here's how each quest can make browsing more rewarding for you:</p>
                <ul>
                    <li><strong>First Quest:</strong> Completed by simply launching Santa Browser for the first time.</li>
                    <li><strong>Daily Checkin:</strong> Do a simple check-in daily and collect multiplying earnings for maintaining streaks. Resets at the end of every week.</li>
                    <li><strong>Daily Explorer:</strong> Completed by actively browsing on Santa for at least 1 hour. Can be claimed every day.</li>
                    <li><strong>Daily Navigator:</strong> Actively browse for at least 2 hours in 1 day. Claimable daily.</li>
                    <li><strong>Weekly Voyager:</strong> Earned by actively browsing a total of 5 hours across the week (Monday to Sunday). Can be claimed every week.</li>
                    <li><strong>Weekly Pioneer:</strong> Actively browse for at least 10 hours across the week. Can be claimed every week.</li>
                    <li><strong>Weekly Trailblazer:</strong> Show your dedication by actively browsing for a total of 20 hours across the week. Claimable every week.</li>
                    <li><strong>Monthly Marathoner:</strong> The biggest usage reward, earned by hitting 80 hours of active browsing over a month (between the first and last day of the calendar Month).</li>
                </ul>
                <p><b>Note:</b> Apart from the “First Quest” every other quest is repeatable indefinitely. Please also keep in mind that browser usage time for quest completion only counts while actively browsing. Which means that simply leaving the browser on, or letting it run in the background will not add any time towards your quest.</p>
                
                <h3>What are Social Quests?</h3>
                <p>Santa's social quests involve quick easy interactions on your favorite social media platforms. All to help you rack up rewards in no time.</p>
                <h3>Most quests require you to:</h3>
                <ul>
                    <li><strong>Link your account:</strong> (Only when doing a social quest for the first time on a platform. We store no data about your social media accounts or usage. In fact, we store no data about you in general)</li>
                    <li><strong>Complete the social task:</strong> (Make sure to follow any extra instructions provided in the quest. Like for example, using a specific hashtag in a quest with the objective of commenting on a particular social media post)</li>
                    <li>Start collecting Santa points!</li>
                </ul>
                
                <h3>Currently Social Quests include:</h3>
                <ul>
                    <li><strong>X/Twitter:</strong>
                        <ul>
                            <li><strong>Follow:</strong> Follow the channel tied to the quest from your linked account on X.</li>
                            <li><strong>Like:</strong> Earn points every day by liking related posts.</li>
                            <li><strong>Retweet:</strong> Spread the word and score points with every retweet.</li>
                            <li><strong>Comment:</strong> Jump into fun conversations linked daily from these quests.</li>
                        </ul>
                    </li>
                    <li><strong>YouTube:</strong>
                        <ul>
                            <li><strong>Subscribe:</strong> Discover channels with fun and informative content.</li>
                            <li><strong>Like:</strong> Earn points every day by liking a YouTube video.</li>
                            <li><strong>Comment:</strong> Comment on a video and earn points.</li>
                        </ul>
                    </li>
                    <li><strong>Discord:</strong>
                        <ul>
                            <li><strong>Join Server:</strong> Earn rewards for joining the Discord server of a vibrant project or community.</li>
                            <li><strong>Daily Engagement:</strong> Keep the points flowing by participating in daily discussions or polls.</li>
                        </ul>
                    </li>
                </ul>
                <p><b>Note:</b> Most social quests (except the ones that require you to follow/subscribe) are repeatable daily. Please ensure to follow any extra instructions provided in the quest, in order to ensure your entry is counted.</p>
                
                <h4>All this is cool but what are ‘Top Performing Offers’?</h4>
                <p>This is a dynamic quick access display aimed at helping you discover the most exciting opportunities to earn Cash Rewards! These keep changing from time to time and can have varying payout periods based on Playwall partner providers.
    Using this window, you can conveniently keep track of the highest earnings, available at the time of viewing, from the Santa Playwall. Unlike Quests which earn you Santa Points, completing these will reward you with Cash rewards.
    You can track your progress on these earnings by navigating to the history tab on your Santa Playwall.</p>
            `,
                },
                {
                    name: 'Claiming Your Rewards',
                    shortName: 'Rewards',
                    ref: 'rewards',
                    content: `
                    <h1>💰 Claiming Your Rewards</h1>
                    <h4>Simple Steps to Redeem Your Rewards.</h4>
                    <ul>
                        <li><strong>Step 1:</strong> Browse and complete quests to unlock various rewards.</li>
                        <li><strong>Step 2:</strong> Visit the Rewards section to see what’s available.</li>
                        <li><strong>Step 3:</strong> Click to redeem your points or cash for desired rewards.</li>
                    </ul>
                    <img src="${rewardImage}" alt="Claiming Rewards" />
                    `,
                },
                {
                    name: 'Linking Your Wallet',
                    shortName: 'Wallet',
                    ref: 'wallet',
                    content: `
                    <h1>🎒 Linking Your Wallet</h1>
                    <h3>For a seamless redemption process, you can link a digital wallet to your Santa Rewards:</h3>
                    <ul>
                        <li><strong>Supported Wallets:</strong> You're not just limited to the Santa Wallet; various popular wallets are compatible.</li>
                        <li><strong>Setting Up:</strong> Navigate to the Wallet section, choose your preferred wallet, and follow the setup instructions.</li>
                    </ul>
                    <img src="${walletImage}" alt="Wallet" />
                    <h3>Already have another Wallet?</h3>
                    <p>Santa supports a wide range of popular wallets, enabling you to manage your Web3 assets effortlessly. You can import your existing support wallets into your Santa Wallet and manage all your assetsfrom here.</p>
                    <img src="${importImage}" alt="Wallet Import" />
                    `,
                },
            ],
        },
        {
            header: 'HELP',
            sections: [
                {
                    name: 'Need Help?',
                    shortName: 'Help',
                    ref: 'help',
                    content: `
                <h1>Reach Out To Us</h1>
                <h2>Still confused or have a question left unanswered?</h2>
                <p>Reach out to a team member in a ‘help’ channel or consult the community on the official Santa Browser <a href="${inviteURL}" target=_blank>discord</a> server.</p>
            `,
                },
            ],
        },
    ];
}
