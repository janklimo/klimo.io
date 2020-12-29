// Required by lightbox
import $ from "jquery";
import "magnific-popup/dist/jquery.magnific-popup";

import "normalize.css";

// Ligthbox
import "magnific-popup/dist/magnific-popup.css";
import "../styles/index.scss";

$(".app__thumbnail--link").magnificPopup({
  type: "image",
});
