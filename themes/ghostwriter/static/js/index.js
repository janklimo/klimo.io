import jQuery from "jquery";

import "../styles/index.scss";

console.log("awesome!");

jQuery(function($) {
  /* ============================================================ */
  /* Scroll To Top */
  /* ============================================================ */

  $(".js-jump-top").on("click", function(e) {
    e.preventDefault();

    $("html, body").animate({ scrollTop: 0 });
  });
});

hljs.initHighlightingOnLoad();
