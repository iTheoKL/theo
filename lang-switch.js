(function () {
  function init() {
    var widgets = document.querySelectorAll('.lang-switch');
    widgets.forEach(function (widget) {
      var toggle = widget.querySelector('.lang-switch-toggle');
      if (!toggle) return;
      toggle.addEventListener('click', function (e) {
        e.stopPropagation();
        var isOpen = widget.classList.toggle('open');
        toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      });
    });
    document.addEventListener('click', function () {
      widgets.forEach(function (widget) {
        widget.classList.remove('open');
        var toggle = widget.querySelector('.lang-switch-toggle');
        if (toggle) toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
