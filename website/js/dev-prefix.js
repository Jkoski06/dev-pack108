// dev-prefix.js
// Ensure all relative navigation stays under /dev by prefixing paths.
(function() {
  var PREFIX = '/dev';

  function shouldPrefix(href) {
    if (!href || href.indexOf('://') !== -1) return false; // absolute URL
    if (href.indexOf('#') === 0) return false; // anchor
    if (href.indexOf('mailto:') === 0) return false;
    if (href.indexOf('javascript:') === 0) return false;
    // Already prefixed
    if (href.indexOf(PREFIX + '/') === 0 || href === PREFIX) return false;
    // Root-relative (starts with /) should be prefixed as /dev/... unless already /dev
    if (href.indexOf('/') === 0) return true;
    // Relative paths (no leading slash) should be prefixed to become /dev/relative
    return true;
  }

  function prefixHref(href) {
    if (!shouldPrefix(href)) return href;
    if (href.indexOf('/') === 0) {
      // root-relative -> /dev/...
      return PREFIX + href;
    } else {
      // relative -> /dev/<path> (keep as absolute to ensure staying under /dev)
      return PREFIX + '/' + href;
    }
  }

  function rewriteAnchors() {
    var anchors = document.getElementsByTagName('a');
    for (var i = 0; i < anchors.length; i++) {
      var a = anchors[i];
      var href = a.getAttribute('href');
      if (!href) continue;
      var newHref = prefixHref(href);
      if (newHref !== href) a.setAttribute('href', newHref);
    }
  }

  function rewriteForms() {
    var forms = document.getElementsByTagName('form');
    for (var i = 0; i < forms.length; i++) {
      var f = forms[i];
      var action = f.getAttribute('action');
      if (!action) continue;
      var newAction = prefixHref(action);
      if (newAction !== action) f.setAttribute('action', newAction);
    }
  }

  function patchLocationAssigns() {
    // Wrap assign/replace to ensure explicit prefix when passed relative paths.
    var origAssign = window.location.assign.bind(window.location);
    var origReplace = window.location.replace.bind(window.location);
    window.location.assign = function(u) {
      if (typeof u === 'string' && shouldPrefix(u)) u = prefixHref(u);
      return origAssign(u);
    };
    window.location.replace = function(u) {
      if (typeof u === 'string' && shouldPrefix(u)) u = prefixHref(u);
      return origReplace(u);
    };
  }

  // On DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      rewriteAnchors(); rewriteForms(); patchLocationAssigns();
    });
  } else {
    rewriteAnchors(); rewriteForms(); patchLocationAssigns();
  }

})();
