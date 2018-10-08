`highlight.js` syntax definition for Razor CSHTML.

For more about highlight.js, see https://highlightjs.org/

CSHTML is a markup language created by Microsoft for ASP.NET MVC and ASP.NET Core applications. It allows to create markup containing both C# and HTML code. 

For more about the CSHTML Razor syntax here: https://docs.microsoft.com/en-us/aspnet/core/mvc/views/razor.

### Usage

Simply include the `highlight.js` script package in your webpage or node app, load up this module and apply it to `hljs`.

If you're not using a build system and just want to embed this in your webpage:

```html
<script type="text/javascript" src="/path/to/highlight.pack.js"></script>
<script type="text/javascript" src="/path/to/highlightjs-cshtml-razor/cshtml.js"></script>
<script type="text/javascript">
    hljs.registerLanguage('cshtml-razor', window.hljsDefineRazorCshtml);
    hljs.initHighlightingOnLoad();
</script>
```

If you're using webpack / rollup / browserify / node:
   
```javascript
var hljs = require('highlightjs');
var hljsDefineRazorCshtml = require('highlightjs-cshtml-razor');

hljsDefineRazorCshtml(hljs);
hljs.initHighlightingOnLoad();
```

### License

[![License: CC0-1.0](https://img.shields.io/badge/License-CC0%201.0-lightgrey.svg)](http://creativecommons.org/publicdomain/zero/1.0/)