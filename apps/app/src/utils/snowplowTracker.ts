import { newTracker, trackPageView, enableActivityTracking, BrowserTracker } from '@snowplow/browser-tracker';

let tracker: BrowserTracker | null | undefined;

const initializeTracker = (endpoint: string) => {
    tracker = newTracker('rewards', endpoint, {
        appId: 'rewards',
        plugins: [],
    });
    enableActivityTracking({
        minimumVisitLength: 5,
        heartbeatDelay: 5,
    });
};

const useTrackPageview = () => {
    if (tracker) {
        trackPageView();
    }
};

const isTrackerInitialized = () => tracker !== undefined;

export { tracker, initializeTracker, useTrackPageview, isTrackerInitialized };
