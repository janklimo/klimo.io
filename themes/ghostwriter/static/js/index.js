// Required by lightbox
import jQuery from "jquery";
window.jQuery = window.$ = jQuery;

import "magnific-popup/dist/jquery.magnific-popup";

import "normalize.css";

// Ligthbox
import "magnific-popup/dist/magnific-popup.css";
import "../styles/index.scss";

if ($(".app__thumbnail--link").length) {
  $(".app__thumbnail--link").magnificPopup({
    type: "image",
  });
}

// Smooth scroll to top
$(".js-jump-top").on("click", function (e) {
  e.preventDefault();
  jQuery("html, body").animate({ scrollTop: 0 }, 500);
});
