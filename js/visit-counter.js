(function () {
  'use strict';

  var counter = document.querySelector('.site-visit-counter');
  var value = document.getElementById('site-visit-count');
  if (!counter || !value) return;

  var siteURL = new URL(counter.dataset.siteUrl);
  // Only the published origin records a visit. Every preview reads the same key.
  var recordVisit = counter.dataset.preview !== 'true' && window.location.origin === siteURL.origin;
  var action = recordVisit ? 'hit' : 'get';
  var key = siteURL.hostname + '-site-visits';
  var endpoint = new URL(action + '/' + encodeURIComponent(key), counter.dataset.apiUrl);
  var controller = new AbortController();
  var timeout = window.setTimeout(function () { controller.abort(); }, 8000);

  fetch(endpoint.href, {
    cache: 'no-store',
    credentials: 'omit',
    signal: controller.signal
  })
    .then(function (response) {
      // A new counter starts at zero until the first published-site visit.
      if (!recordVisit && response.status === 404) return { value: 0 };
      if (!response.ok) throw new Error('Visit counter unavailable');
      return response.json();
    })
    .then(function (data) {
      if (!/^\d+$/.test(String(data.value))) throw new Error('Invalid visit count');
      var count = Number(data.value);
      if (!Number.isSafeInteger(count)) throw new Error('Invalid visit count');
      value.textContent = count.toLocaleString(document.documentElement.lang || 'en');
    })
    .catch(function () {
      value.textContent = '\u2014';
      value.title = 'Visit count temporarily unavailable';
    })
    .finally(function () { window.clearTimeout(timeout); });
}());
