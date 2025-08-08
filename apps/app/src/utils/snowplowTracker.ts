



import {
  newTracker,
  trackPageView,
  BrowserTracker,
  setUserId,
  addGlobalContexts,
  trackSelfDescribingEvent,
} from '@snowplow/browser-tracker';

let tracker: BrowserTracker | null | undefined;

const initializeTracker = (endpoint: string, clid: string) => {
  tracker = newTracker('playwall', endpoint, { appId: 'playwall' });

  addGlobalContexts([
    {
      schema: 'iglu:com.santabrowser/user_context/jsonschema/1-0-0',
      data: {
        clid,
      },
    },
  ]);

  setUserId(clid);
};

const useTrackPageview = () => {
  if (tracker) {
    trackPageView();
  }
};

const useTrackSelfDescribingEvent = (clid: string, eventType: string) => {
  if (tracker) {
    trackSelfDescribingEvent({
      event: {
        schema: 'iglu:com.santabrowser/user_context/jsonschema/1-0-0',
        data: {
          clid,
          eventType,
        },
      },
    });
  }
};

const isTrackerInitialized = () => (tracker ? true : false);

export { tracker, initializeTracker, useTrackPageview, isTrackerInitialized, useTrackSelfDescribingEvent };

