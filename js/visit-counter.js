(function () {
  'use strict';

  var counter = document.querySelector('.site-visit-counter');
  if (!counter) return;

  var siteURL = new URL(counter.dataset.siteUrl);
  // Only the published origin records visits. Previews read the same counters.
  var recordVisit = counter.dataset.preview !== 'true' && window.location.origin === siteURL.origin;
  var prefix = siteURL.hostname;
  var dateParts = new Intl.DateTimeFormat('en', {
    timeZone: counter.dataset.timezone || 'Asia/Shanghai',
    year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(new Date()).reduce(function (parts, part) {
    parts[part.type] = part.value;
    return parts;
  }, {});
  var today = dateParts.year + '-' + dateParts.month + '-' + dateParts.day;

  async function updateMetric(id, key, increment) {
    var value = document.getElementById(id);
    var endpoint = new URL((increment ? 'hit/' : 'get/') + encodeURIComponent(key), counter.dataset.apiUrl);
    var controller = new AbortController();
    var timeout = window.setTimeout(function () { controller.abort(); }, 8000);
    try {
      var response = await fetch(endpoint.href, {
        cache: 'no-store', credentials: 'omit', signal: controller.signal
      });
      // A counter is absent until its first recorded visit.
      var data;
      if (!increment && response.status === 404) {
        data = { value: 0 };
      } else {
        if (!response.ok) throw new Error('Counter unavailable');
        data = await response.json();
      }
      if (!/^\d+$/.test(String(data.value))) throw new Error('Invalid count');
      var count = Number(data.value);
      if (!Number.isSafeInteger(count)) throw new Error('Invalid count');
      value.textContent = count.toLocaleString(document.documentElement.lang || 'en');
      return true;
    } catch (error) {
      value.textContent = '\u2014';
      value.title = 'Visit count temporarily unavailable';
      return false;
    } finally {
      window.clearTimeout(timeout);
    }
  }

  async function updateVisitors(allowRecording) {
    var storage;
    var totalMarker = prefix + '-browser-visitor-total';
    var dayMarker = prefix + '-browser-visitor-day';
    var countTotal = false;
    var countToday = false;
    if (allowRecording) {
      try {
        storage = window.localStorage;
        var probe = prefix + '-visitor-storage-check';
        storage.setItem(probe, '1');
        storage.removeItem(probe);
        countTotal = storage.getItem(totalMarker) !== '1';
        countToday = storage.getItem(dayMarker) !== today;
      } catch (error) {
        // Without persistent storage we cannot deduplicate browsers; only read.
        storage = null;
        countTotal = false;
        countToday = false;
      }
    }
    await Promise.all([
      updateMetric('site-visitors-total', prefix + '-site-visitors', countTotal)
        .then(function (success) {
          if (success && countTotal) {
            try { storage.setItem(totalMarker, '1'); } catch (error) { /* Storage unavailable. */ }
          }
        }),
      updateMetric('site-visitors-today', prefix + '-site-visitors-' + today, countToday)
        .then(function (success) {
          if (success && countToday) {
            try { storage.setItem(dayMarker, today); } catch (error) { /* Storage unavailable. */ }
          }
        })
    ]);
  }

  updateMetric('site-visit-count', prefix + '-site-visits', recordVisit);
  // Serialize visitor checks across tabs where the Web Locks API is available.
  if (recordVisit && navigator.locks) {
    navigator.locks.request(prefix + '-visitor-counter', function () {
      return updateVisitors(true);
    }).catch(function () { return updateVisitors(false); });
  } else {
    updateVisitors(recordVisit);
  }
}());
