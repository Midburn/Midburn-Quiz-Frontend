// hide address bar
if (document.documentElement.scrollHeight < window.outerHeight / window.devicePixelRatio)
    document.documentElement.style.height = (window.outerHeight / window.devicePixelRatio) +
    'px';
setTimeout(window.scrollTo(1, 1), 0);
