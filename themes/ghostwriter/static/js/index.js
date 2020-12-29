// Required by lightbox
import $ from "jquery";
import hljs from "./highlight.js";
import "magnific-popup/dist/jquery.magnific-popup";

import "normalize.css";
import "highlight.js/styles/zenburn.css";

// Ligthbox
import "magnific-popup/dist/magnific-popup.css";

import "../styles/index.scss";

hljs.initHighlightingOnLoad();

$(".app__thumbnail--link").magnificPopup({
  type: "image",
});
