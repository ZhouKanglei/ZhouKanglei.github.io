(function () {
  'use strict';
  var counter = document.querySelector('.site-visit-counter');
  if (!counter || !counter.dataset.shareUrl || !counter.dataset.apiUrl) return;
  var ids = ['site-visit-count', 'site-visitors-today', 'site-visitors-total'];
  var controller = new AbortController();
  var timeout = window.setTimeout(function () { controller.abort(); }, 12000);

  function formatMetric(id, metric) {
    // Umami v2 uses { value }; v3 returns numbers directly.
    var count = metric && typeof metric === 'object' ? metric.value : metric;
    if (!Number.isSafeInteger(count) || count < 0) throw new Error('Invalid count');
    return [document.getElementById(id), count.toLocaleString(document.documentElement.lang || 'en')];
  }

  async function readJSON(url, headers) {
    var response = await fetch(url.href, {
      headers: headers || {}, credentials: 'omit', cache: 'no-store', signal: controller.signal
    });
    if (!response.ok) throw new Error('Statistics unavailable');
    return response.json();
  }

  async function loadStats() {
    // Both /share/{code} and /analytics/{region}/share/{code} are supported.
    var match = new URL(counter.dataset.shareUrl).pathname.match(/\/share\/([^/]+)/);
    if (!match) throw new Error('Invalid public report URL');
    var share = await readJSON(new URL('share/' + match[1], counter.dataset.apiUrl));
    if (!share.token || share.websiteId !== counter.dataset.websiteId) throw new Error('Report website mismatch');
    var headers = { 'x-umami-share-token': share.token, 'x-umami-share-context': '1' };
    var now = new Date();
    var parts = new Intl.DateTimeFormat('en', {
      timeZone: counter.dataset.timezone || 'Asia/Shanghai',
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23'
    }).formatToParts(now).reduce(function (result, part) {
      result[part.type] = part.value;
      return result;
    }, {});
    var wallTime = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute, +parts.second);
    var offset = wallTime - Math.floor(now.getTime() / 1000) * 1000;
    var dayStart = Date.UTC(+parts.year, +parts.month - 1, +parts.day) - offset;
    function statsURL(startAt) {
      var url = new URL('websites/' + encodeURIComponent(share.websiteId) + '/stats', counter.dataset.apiUrl);
      url.searchParams.set('startAt', String(startAt));
      url.searchParams.set('endAt', String(now.getTime()));
      url.searchParams.set('timezone', counter.dataset.timezone || 'Asia/Shanghai');
      return url;
    }
    var stats = await Promise.all([
      readJSON(statsURL(0), headers), readJSON(statsURL(dayStart), headers)
    ]);
    var values = [
      formatMetric(ids[0], stats[0].pageviews),
      formatMetric(ids[1], stats[1].visitors),
      formatMetric(ids[2], stats[0].visitors)
    ];
    values.forEach(function (value) { value[0].textContent = value[1]; });
  }

  loadStats().catch(function () {
    ids.forEach(function (id) {
      var value = document.getElementById(id);
      value.textContent = '\u2014';
      value.title = 'Statistics temporarily unavailable; open the public report for details';
    });
  }).finally(function () { window.clearTimeout(timeout); });
}());
