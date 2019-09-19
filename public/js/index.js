import hljs from "highlight.js/lib/highlight";

import bash from "highlight.js/lib/languages/bash";
import css from "highlight.js/lib/languages/css";
import javascript from "highlight.js/lib/languages/javascript";
import ruby from "highlight.js/lib/languages/ruby";
import typescript from "highlight.js/lib/languages/typescript";
import yaml from "highlight.js/lib/languages/yaml";

import "highlight.js/styles/zenburn.css";
import "../styles/index.scss";

hljs.registerLanguage("bash", bash);
hljs.registerLanguage("css", css);
hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("ruby", ruby);
hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("yaml", yaml);

hljs.initHighlightingOnLoad();
