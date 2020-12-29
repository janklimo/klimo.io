import hljs from "highlight.js/lib/core";

// Required by lightbox
import $ from "jquery";
import "magnific-popup/dist/jquery.magnific-popup";

import bash from "highlight.js/lib/languages/bash";
import css from "highlight.js/lib/languages/css";
import javascript from "highlight.js/lib/languages/javascript";
import ruby from "highlight.js/lib/languages/ruby";
import typescript from "highlight.js/lib/languages/typescript";
import yaml from "highlight.js/lib/languages/yaml";

import "normalize.css";
import "highlight.js/styles/zenburn.css";

// Ligthbox
import "magnific-popup/dist/magnific-popup.css";

import "../styles/index.scss";

hljs.registerLanguage("bash", bash);
hljs.registerLanguage("css", css);
hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("ruby", ruby);
hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("yaml", yaml);

hljs.initHighlightingOnLoad();

$(".app__thumbnail--link").magnificPopup({
  type: "image",
});
