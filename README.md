# CSHTML Razor - a language grammar for [highlight.js](https://highlightjs.org/)

![version](https://badgen.net/npm/v/highlightjs-cshtml-razor) ![license](https://badgen.net/badge/license/CC0%201.0/blue)
![install size](https://badgen.net/packagephobia/install/highlightjs-cshtml-razor) ![minified size](https://badgen.net/bundlephobia/min/highlightjs-cshtml-razor)

CSHTML is a markup language created by Microsoft for ASP.NET MVC, ASP.NET Core and Blazor applications. It allows to create markup containing both C# and HTML code.

For more about the CSHTML Razor syntax here: https://docs.microsoft.com/en-us/aspnet/core/mvc/views/razor.

## Usage

Simply include the `Highlight.js` library in your webpage or Node app, then load this module.

### Static website or simple usage
Simply load the module after loading Highlight.js. You'll use the minified version found in the dist directory. This module is just a CDN build of the language, so it will register itself as the Javascript is loaded.

```html
<script type="text/javascript" src="/path/to/highlight.min.js"></script>
<script type="text/javascript" src="/path/to/highlightjs-cshtml-razor/dist/cshtml-razor.min.js"></script>
<script>
    hljs.highlightAll();
</script>
```

### Using directly from the UNPKG CDN

Add the following script tag in your page:

```html
<script type="text/javascript" src="https://unpkg.com/highlightjs-cshtml-razor/dist/cshtml-razor.min.js"></script>
```

### With Node or another build system

If you're using Node / Webpack / Rollup / Browserify, etc, simply require the language module, then register it with Highlight.js.
   
```javascript
var hljs = require('highlightjs');
var hljsRazor = require('highlightjs-cshtml-razor');

hljs.registerLanguage("highlightjs-cshtml-razor", hljsRazor);
hljs.initHighlightingOnLoad();
```

### License

[![License: CC0-1.0](https://img.shields.io/badge/License-CC0%201.0-lightgrey.svg)](http://creativecommons.org/publicdomain/zero/1.0/)