(function () {
  'use strict';

  function setupResearchWorkCards() {
    var cards = Array.prototype.slice.call(document.querySelectorAll('.research-work-link'));
    if (!cards.length) return;

    function adjust(link) {
      var trigger = link.querySelector('.research-work-trigger');
      var card = link.querySelector('.research-work-card');
      if (!trigger || !card) return;

      link.classList.remove('research-work-link--below');
      card.style.maxHeight = '';
      card.scrollTop = 0;

      window.requestAnimationFrame(function () {
        var navbar = document.querySelector('.navbar');
        var navbarBottom = navbar ? navbar.getBoundingClientRect().bottom : 0;
        var triggerRect = trigger.getBoundingClientRect();
        var gap = 24;
        var availableAbove = Math.max(120, triggerRect.top - navbarBottom - gap);
        var availableBelow = Math.max(120, window.innerHeight - triggerRect.bottom - gap);
        var naturalHeight = card.scrollHeight;
        var fitsAbove = naturalHeight <= availableAbove;
        var fitsBelow = naturalHeight <= availableBelow;
        var openBelow;

        if (fitsBelow && !fitsAbove) {
          openBelow = true;
        } else if (fitsAbove && !fitsBelow) {
          openBelow = false;
        } else {
          openBelow = availableBelow > availableAbove;
        }

        link.classList.toggle('research-work-link--below', openBelow);
        card.style.maxHeight = Math.floor(openBelow ? availableBelow : availableAbove) + 'px';

        window.requestAnimationFrame(function () {
          var cardRect = card.getBoundingClientRect();
          var safeTop = navbarBottom + 12;
          var safeBottom = window.innerHeight - 12;
          var currentMaxHeight = parseFloat(card.style.maxHeight) || cardRect.height;

          if (!openBelow && cardRect.top < safeTop) {
            currentMaxHeight -= safeTop - cardRect.top;
          } else if (openBelow && cardRect.bottom > safeBottom) {
            currentMaxHeight -= cardRect.bottom - safeBottom;
          }

          card.style.maxHeight = Math.max(120, Math.floor(currentMaxHeight)) + 'px';
          card.scrollTop = 0;
        });
      });
    }

    cards.forEach(function (link) {
      link.addEventListener('mouseenter', function () { adjust(link); });
      link.addEventListener('focusin', function () { adjust(link); });
      link.addEventListener('touchstart', function () { adjust(link); }, { passive: true });
    });

    window.addEventListener('resize', function () {
      cards.forEach(function (link) {
        if (link.matches(':hover') || link.contains(document.activeElement)) adjust(link);
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupResearchWorkCards);
  } else {
    setupResearchWorkCards();
  }
})();
