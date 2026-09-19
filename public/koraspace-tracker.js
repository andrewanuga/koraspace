/**
 * Koraspace Web Telemetry & Growth Engine SDK (v1.0.0)
 * Feeds live website behavior and traffic directly into your Koraspace AI Agents.
 */
(function() {
  'use strict';

  if (window.__KORASPACE_LOADED__) return;
  window.__KORASPACE_LOADED__ = true;

  const currentScript = document.currentScript || document.querySelector('script[data-site-id]');
  const siteId = currentScript ? currentScript.getAttribute('data-site-id') : null;
  const endpoint = currentScript?.getAttribute('data-endpoint') || 'https://koraspace.site/api/v1/track';

  if (!siteId) {
    console.warn('[Koraspace] Missing data-site-id on tracker script.');
    return;
  }

  function sendEvent(eventType, metadata = {}) {
    const payload = JSON.stringify({
      site_id: siteId,
      event_type: eventType,
      path: window.location.pathname,
      referrer: document.referrer || null,
      metadata: {
        ...metadata,
        title: document.title,
        url: window.location.href,
        screen: `${window.innerWidth}x${window.innerHeight}`,
        timestamp: new Date().toISOString(),
      }
    });

    if (navigator.sendBeacon) {
      navigator.sendBeacon(endpoint, new Blob([payload], { type: 'application/json' }));
    } else {
      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
      }).catch(function() {});
    }
  }

  // Automatic Pageview
  sendEvent('pageview');

  // SPA Route Change Listener (History API)
  let lastPath = window.location.pathname;
  const observeUrlChange = () => {
    if (window.location.pathname !== lastPath) {
      lastPath = window.location.pathname;
      sendEvent('pageview');
    }
  };

  window.addEventListener('popstate', observeUrlChange);
  const originalPushState = history.pushState;
  if (originalPushState) {
    history.pushState = function() {
      originalPushState.apply(this, arguments);
      observeUrlChange();
    };
  }

  // Click & Interaction Tracker (Elements with data-kora-event)
  document.addEventListener('click', function(e) {
    const target = e.target.closest('[data-kora-event]');
    if (target) {
      const eventName = target.getAttribute('data-kora-event') || 'click';
      const label = target.getAttribute('data-kora-label') || target.innerText || target.tagName;
      sendEvent(eventName, { label: label.trim().slice(0, 100) });
    }
  }, true);

  // Public Koraspace SDK Window Object
  window.koraspace = {
    track: function(eventName, metadata) {
      sendEvent(eventName, metadata);
    },
    pageview: function(customPath) {
      sendEvent('pageview', customPath ? { customPath } : {});
    },
  };
})();
