/* eslint-disable no-useless-escape */
/*
 * Language: cshtml-razor
 * Requires: xml.js, csharp.js, css.js, javascript.js
 * Author: Roman Resh <romanresh@live.com>
*/

module.exports = function(hljs) {
  const SPECIAL_SYMBOL_CLASSNAME = "built_in";
  const CONTENT_REPLACER = {};
  const closedBrace = {
    begin: "}",
    className: SPECIAL_SYMBOL_CLASSNAME,
    endsParent: true
  };
  const braces = {
    begin: "{",
    end: "}",
    contains: [hljs.QUOTE_STRING_MODE, 'self']
  };
  const csbraces = { // allows to find exactly last closing brace in code blocks (to process codeblock content with "csharp" sub language)
    begin: "{",
    end: "}",
    contains: ['self'],
    skip: true
  };
  const quotes = { // allows to skip razor symbols/tags inside CS strings
    variants: [
      { begin: /"/, end: /"/, skip: true },
      { begin: /'/, end: /'/, skip: true }
    ],
    skip: true
  };
  const razorComment = hljs.COMMENT(
    '@\\*',
    '\\*@',
    {
      relevance: 10
    }
  );
  const razorInlineExpression = {
    begin: '@[A-Za-z0-9\\._:-]+',
    returnBegin: true,
    end: "(\\r|\\n|<|\\s|\"|')",
    subLanguage: 'csharp',
    contains: [
      {
        begin: '@',
        className: SPECIAL_SYMBOL_CLASSNAME
      },
      {
        begin: '\\[',
        end: '\\]',
        skip: true
      },
      {
        begin: '\\(',
        end: '\\)',
        skip: true
      }
    ],
    returnEnd: true
  };
  const razorTextBlock = {
    begin: "[@]{0,1}<text>",
    returnBegin: true,
    end: "</text>",
    returnEnd: true,
    subLanguage: "cshtml-razor",
    contains: [
      {
        begin: "[@]{0,1}<text>",
        className: SPECIAL_SYMBOL_CLASSNAME
      },
      {
        begin: "</text>",
        className: SPECIAL_SYMBOL_CLASSNAME,
        endsParent: true
      }
    ]
  };
  const razorEscapeAt = {
    variants: [
      { begin: "@@" },
      { begin: "[a-zA-Z]+@" }
    ],
    skip: true
  };

  const razorParenthesesBlock = {
    begin: "@\\(",
    end: "\\)",
    returnBegin: true,
    returnEnd: true,
    subLanguage: 'csharp',
    contains: [
      {
        begin: "@\\(",
        className: SPECIAL_SYMBOL_CLASSNAME
      },
      {
        begin: "\\(",
        end: "\\)",
        subLanguage: 'csharp',
        contains: [hljs.QUOTE_STRING_MODE, 'self', razorTextBlock]
      },
      razorTextBlock,
      {
        begin: "\\)",
        className: SPECIAL_SYMBOL_CLASSNAME,
        endsParent: true
      }
    ]
  };
  const xmlBlocks = getXmlBlocks(hljs, [razorInlineExpression, razorParenthesesBlock]);
  const razorDirectivesPrefix = "^\\s*@(page|model|using|inherits|inject|layout)";
  const razorDirectives = {
    begin: razorDirectivesPrefix + "[^\\r\\n{\\(]*$",
    end: "$",
    returnBegin: true,
    returnEnd: true,
    contains: [
      {
        begin: razorDirectivesPrefix,
        className: SPECIAL_SYMBOL_CLASSNAME
      },
      {
        variants: [
          { begin: "\\r|\\n", endsParent: true },
          { begin: "\\s[^\\r\\n]+", end: "$" },
          { begin: "$" }
        ],
        className: "type",
        endsParent: true
      }
    ]
  };
  const csCodeBlockVariants = [
    { begin: "@\\{", end: "}" },
    { begin: "@code\\s*\\{", end: "}" }
  ];
  const razorBlock = {
    variants: csCodeBlockVariants,
    returnBegin: true,
    returnEnd: true,
    subLanguage: 'csharp',
    contains: [
      {
        begin: "@(code\\s*)?\\{",
        className: SPECIAL_SYMBOL_CLASSNAME
      },
      CONTENT_REPLACER,
      csbraces,
      quotes,
      closedBrace
    ]
  };
  const razorHelperBlock = {
    begin: "^\\s*@helper\\s+[^{\\s]+(?:\\s+[^{\\s]+)*\\s*{",
    returnBegin: true,
    returnEnd: true,
    end: "}",
    subLanguage: "cshtml-razor",
    contains: [
      { begin: "@helper", className: SPECIAL_SYMBOL_CLASSNAME },
      { begin: "{", className: SPECIAL_SYMBOL_CLASSNAME },
      closedBrace
    ]
  };
  const razorCodeBlockVariants = ['for', 'if', 'switch', 'while', 'using', 'lock', 'foreach']
    .map(keyword => ({
      begin: `@${keyword}(?![\\w\\d])[^{]*\\{`,
      end: "}"
    }));
  const elseVariants = [
    { begin: "\\}\\s*else\\s*(if[^\\{]+|)\\{" }
  ];
  const razorCodeBlock = {
    variants: razorCodeBlockVariants,
    returnBegin: true,
    returnEnd: true,
    subLanguage: 'csharp',
    contains: [
      {
        variants: razorCodeBlockVariants.map(function(v) { return { begin: v.begin }; }),
        returnBegin: true,
        contains: [
          { begin: "@", className: SPECIAL_SYMBOL_CLASSNAME },
          {
            variants: razorCodeBlockVariants.map(function(v) { return { begin: `${v.begin}`.substring(1, v.begin.length - 2) }; }),
            subLanguage: 'csharp'
          },
          { begin: "{", className: SPECIAL_SYMBOL_CLASSNAME }
        ]
      },
      CONTENT_REPLACER,
      {
        variants: elseVariants,
        returnBegin: true,
        contains: [
          { begin: "}", className: SPECIAL_SYMBOL_CLASSNAME },
          {
            begin: elseVariants[0].begin.substring(2, elseVariants[0].begin.length - 2),
            subLanguage: 'csharp'
          },
          {
            begin: "{",
            className: SPECIAL_SYMBOL_CLASSNAME
          }
        ]
      },
      braces,
      closedBrace
    ]
  };
  const razorTryBlock = {
    begin: "@try\\s*{",
    end: "}",
    returnBegin: true,
    returnEnd: true,
    subLanguage: 'csharp',
    contains: [
      { begin: "@", className: SPECIAL_SYMBOL_CLASSNAME },
      { begin: "try\\s*{", subLanguage: 'csharp' },
      {
        variants: [
          { begin: "}\\s*catch\\s*\\([^\\)]+\\)\\s*{" },
          { begin: "}\\s*finally\\s*{" }
        ],
        returnBegin: true,
        contains: [
          { begin: "}", className: SPECIAL_SYMBOL_CLASSNAME },
          {
            variants: [
              { begin: "\\s*catch\\s*\\([^\\)]+\\)\\s*" },
              { begin: "\\s*finally\\s*" }
            ],
            subLanguage: 'csharp'
          },
          { begin: "{", className: SPECIAL_SYMBOL_CLASSNAME }
        ]
      },
      CONTENT_REPLACER,
      braces,
      closedBrace
    ]
  };
  const sectionBegin = "@section\\s+[a-zA-Z0-9]+\\s*{";
  const razorSectionBlock = {
    begin: sectionBegin,
    returnBegin: true,
    returnEnd: true,
    end: "}",
    subLanguage: 'cshtml-razor',
    contains: [
      {
        begin: sectionBegin,
        className: SPECIAL_SYMBOL_CLASSNAME
      },
      braces,
      closedBrace
    ]
  };
  const razorAwait = {
    begin: "@await ",
    returnBegin: true,
    subLanguage: 'csharp',
    end: "(\\r|\\n|<|\\s)",
    contains: [
      {
        begin: "@await ",
        className: SPECIAL_SYMBOL_CLASSNAME
      },
      {
        begin: "[<\\r\\n]",
        endsParent: true
      }
    ]
  };

  const contains = [
    razorDirectives,
    razorHelperBlock,
    razorBlock,
    razorCodeBlock,
    razorSectionBlock,
    razorAwait,
    razorTryBlock,
    razorEscapeAt,
    razorTextBlock,
    razorComment,
    razorParenthesesBlock,
    {
      className: 'meta',
      begin: '<!DOCTYPE',
      end: '>',
      relevance: 10,
      contains: [{ begin: '\\[', end: '\\]' }]
    },
    {
      begin: '<\\!\\[CDATA\\[',
      end: '\\]\\]>',
      relevance: 10
    }
  ].concat(xmlBlocks);
  [razorBlock, razorCodeBlock, razorTryBlock]
    .forEach(function(mode) {
      const razorModes = contains.filter(function(c) { return c !== mode; });
      const replacerIndex = mode.contains.indexOf(CONTENT_REPLACER);
      mode.contains.splice.apply(mode.contains, [replacerIndex, 1].concat(razorModes));
    });

  return {
    aliases: ['cshtml', 'razor', 'razor-cshtml', 'cshtml-razor'],
    contains
  };
};

function getXmlBlocks(hljs, additionalBlocks) {
  const xmlComment = hljs.COMMENT(
    '<!--',
    '-->',
    {
      relevance: 10
    }
  );
  const string = {
    className: 'string',
    variants: [
      { begin: /"/, end: /"/, contains: additionalBlocks },
      { begin: /'/, end: /'/, contains: additionalBlocks },
      { begin: /[^\s"'=<>`]+/ }
    ]
  };
  const xmlTagInternal = {
    endsWithParent: true,
    illegal: /</,
    relevance: 0,
    contains: [
      {
        className: 'attr',
        begin: '[A-Za-z0-9\\._:-]+',
        relevance: 0
      },
      {
        begin: /=\s*/,
        relevance: 0,
        contains: [string]
      }
    ]
  };
  return [
    {
      className: 'meta',
      begin: '<!DOCTYPE',
      end: '>',
      relevance: 10,
      contains: [{ begin: '\\[', end: '\\]' }]
    },
    xmlComment,
    {
      begin: '<\\!\\[CDATA\\[',
      end: '\\]\\]>',
      relevance: 10
    },
    {
      className: 'meta',
      begin: /<\?xml/,
      end: /\?>/,
      relevance: 10
    },
    {
      className: 'tag',
      begin: '<style(?=\\s|>|$)',
      end: '>',
      keywords: { name: 'style' },
      contains: [xmlTagInternal],
      starts: {
        end: '</style>',
        returnEnd: true,
        subLanguage: ['css', 'xml']
      }
    },
    {
      className: 'tag',
      begin: '<script(?=\\s|>|$)',
      end: '>',
      keywords: { name: 'script' },
      contains: [xmlTagInternal],
      starts: {
        end: '</script>',
        returnEnd: true,
        subLanguage: ['actionscript', 'javascript', 'handlebars', 'xml']
      }
    },
    {
      className: 'tag',
      begin: '</?',
      end: '/?>',
      contains: [
        {
          className: 'name', begin: /[^/><\s]+/, relevance: 0
        },
        xmlTagInternal
      ]
    }
  ].concat(additionalBlocks);
}
