/*
 * Language: cshtml-razor
 * Requires: xml.js, csharp.js, css.js, javascript.js
 * Author: Roman Resh <romanresh@live.com>
*/

module.exports = function (hljs) {
    const SPECIAL_SYMBOL_CLASSNAME = "built_in";
    const CONTENT_REPLACER = {};
    const closed_brace = {
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
    const razor_comment = hljs.COMMENT(
        '@\\*',
        '\\*@',
        {
            relevance: 10
        }
    );
    const razor_inline_expresion = {
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
            }
            ,
            {
                begin: '\\(',
                end: '\\)',
                skip: true
            }
        ],
        returnEnd: true
    };
    const razor_text_block = {
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
    const razor_escape_at = {
        variants: [
            { begin: "@@" },
            { begin: "[a-zA-Z]+@" }
        ],
        skip: true
    };

    const razor_parentheses_block = {
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
                contains: [hljs.QUOTE_STRING_MODE, 'self', razor_text_block]
            },
            razor_text_block,
            {
                begin: "\\)",
                className: SPECIAL_SYMBOL_CLASSNAME,
                endsParent: true
            }
        ]
    };
    const xml_blocks = getXmlBlocks(hljs, [razor_inline_expresion, razor_parentheses_block]);
    const razor_directives_prefix = "^\\s*@(page|model|using|inherits|inject|layout)";
    const razor_directives = {
        begin: razor_directives_prefix + "[^\\r\\n{\\(]*$",
        end: "$",
        returnBegin: true,
        returnEnd: true,
        contains: [
            {
                begin: razor_directives_prefix,
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
    const cs_code_block_variants = [
        { begin: "@\\{", end: "}" },
        { begin: "@code\\s*\\{", end: "}" }
    ];
    const razor_block = {
        variants: cs_code_block_variants,
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
            closed_brace
        ]
    };
    const razor_helper_block = {
        begin: "^\\s*@helper[\\s]*[^{]+[\\s]*{",
        returnBegin: true,
        returnEnd: true,
        end: "}",
        subLanguage: "cshtml-razor",
        contains: [
            { begin: "@helper", className: SPECIAL_SYMBOL_CLASSNAME },
            { begin: "{", className: SPECIAL_SYMBOL_CLASSNAME },
            closed_brace
        ]
    };
    const razor_code_block_variants = [
        { begin: "@for[\\s]*\\([^{]+[\\s]*{", end: "}" },
        { begin: "@if[\\s]*\\([^{]+[\\s]*{", end: "}" },
        { begin: "@switch[\\s]*\\([^{]+[\\s]*{", end: "}" },
        { begin: "@while[\\s]*\\([^{]+[\\s]*{", end: "}" },
        { begin: "@using[\\s]*\\([^{]+[\\s]*{", end: "}" },
        { begin: "@lock[\\s]*\\([^{]+[\\s]*{", end: "}" },
        { begin: "@foreach[\\s]*\\([^{]+[\\s]*{", end: "}" }
    ];
    const razor_code_block = {
        variants: razor_code_block_variants,
        returnBegin: true,
        returnEnd: true,
        subLanguage: 'csharp',
        contains: [
            {
                variants: razor_code_block_variants.map(function (v) { return { begin: v.begin }; }),
                returnBegin: true,
                contains: [
                    { begin: "@", className: SPECIAL_SYMBOL_CLASSNAME },
                    {
                        variants: razor_code_block_variants.map(function (v) { return { begin: v.begin.substr(1, v.begin.length - 2) }; }),
                        subLanguage: 'csharp'
                    },
                    { begin: "{", className: SPECIAL_SYMBOL_CLASSNAME }
                ]
            },
            CONTENT_REPLACER,
            {
                variants: [
                    { begin: "}[\\s]*else\\sif[\\s]*\\([^{]+[\\s]*{" },
                    { begin: "}[\\s]*else[\\s]*{" }
                ],
                returnBegin: true,
                contains: [
                    { begin: "}", className: SPECIAL_SYMBOL_CLASSNAME },
                    {
                        variants: [
                            { begin: "[\\s]*else\\sif[\\s]*\\([^{]+[\\s]*{" },
                            { begin: "[\\s]*else[\\s]*" }
                        ],
                        subLanguage: 'csharp'
                    },
                    {
                        begin: "{",
                        className: SPECIAL_SYMBOL_CLASSNAME
                    }
                ]
            },
            braces,
            closed_brace
        ]
    };
    const razor_try_block = {
        begin: "@try[\\s]*{",
        end: "}",
        returnBegin: true,
        returnEnd: true,
        subLanguage: 'csharp',
        contains: [
            { begin: "@", className: SPECIAL_SYMBOL_CLASSNAME },
            { begin: "try[\\s]*{", subLanguage: 'csharp' },
            {
                variants: [
                    { begin: "}[\\s]*catch[\\s]*\\([^\\)]+\\)[\\s]*{" },
                    { begin: "}[\\s]*finally[\\s]*{" }
                ],
                returnBegin: true,
                contains: [
                    { begin: "}", className: SPECIAL_SYMBOL_CLASSNAME },
                    {
                        variants: [
                            { begin: "[\\s]*catch[\\s]*\\([^\\)]+\\)[\\s]*", },
                            { begin: "[\\s]*finally[\\s]*", },
                        ],
                        subLanguage: 'csharp'
                    },
                    { begin: "{", className: SPECIAL_SYMBOL_CLASSNAME }
                ]
            },
            CONTENT_REPLACER,
            braces,
            closed_brace
        ]
    };
    const section_begin = "@section[\\s]+[a-zA-Z0-9]+[\\s]*{";
    const razor_section_block = {
        begin: section_begin,
        returnBegin: true,
        returnEnd: true,
        end: "}",
        subLanguage: 'cshtml-razor',
        contains: [
            {
                begin: section_begin,
                className: SPECIAL_SYMBOL_CLASSNAME
            },
            braces,
            closed_brace
        ]
    };
    const rasor_await = {
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
        razor_directives,
        razor_helper_block,
        razor_block,
        razor_code_block,
        razor_section_block,
        rasor_await,
        razor_try_block,
        razor_escape_at,
        razor_text_block,
        razor_comment,
        razor_parentheses_block,
        {
            className: 'meta',
            begin: '<!DOCTYPE', end: '>',
            relevance: 10,
            contains: [{ begin: '\\[', end: '\\]' }]
        },
        {
            begin: '<\\!\\[CDATA\\[', end: '\\]\\]>',
            relevance: 10
        }
    ].concat(xml_blocks);
    [razor_block, razor_code_block, razor_try_block]
        .forEach(function (mode) {
            const razorModes = contains.filter(function (c) { return c !== mode; });
            const replacerIndex = mode.contains.indexOf(CONTENT_REPLACER);
            mode.contains.splice.apply(mode.contains, [replacerIndex, 1].concat(razorModes));
        });

    return {
        aliases: ['cshtml', 'razor', 'razor-cshtml', 'cshtml-razor'],
        contains: contains
    };
};

function getXmlBlocks(hljs, additional_blocks) {
    const xml_comment = hljs.COMMENT(
        '<!--',
        '-->',
        {
            relevance: 10
        }
    );
    const string = {
        className: 'string',
        variants: [
            { begin: /"/, end: /"/, contains: additional_blocks },
            { begin: /'/, end: /'/, contains: additional_blocks },
            { begin: /[^\s"'=<>`]+/ }
        ]
    };
    const xml_tag_internal = {
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
            begin: '<!DOCTYPE', end: '>',
            relevance: 10,
            contains: [{ begin: '\\[', end: '\\]' }]
        },
        xml_comment,
        {
            begin: '<\\!\\[CDATA\\[', end: '\\]\\]>',
            relevance: 10
        },
        {
            className: 'meta',
            begin: /<\?xml/, end: /\?>/, relevance: 10
        },
        {
            className: 'tag',
            begin: '<style(?=\\s|>|$)', end: '>',
            keywords: { name: 'style' },
            contains: [xml_tag_internal],
            starts: {
                end: '</style>', returnEnd: true,
                subLanguage: ['css', 'xml']
            }
        },
        {
            className: 'tag',
            begin: '<script(?=\\s|>|$)', end: '>',
            keywords: { name: 'script' },
            contains: [xml_tag_internal],
            starts: {
                end: '\<\/script\>', returnEnd: true,
                subLanguage: ['actionscript', 'javascript', 'handlebars', 'xml']
            }
        },
        {
            className: 'tag',
            begin: '</?', end: '/?>',
            contains: [
                {
                    className: 'name', begin: /[^\/><\s]+/, relevance: 0
                },
                xml_tag_internal
            ]
        }
    ].concat(additional_blocks);
}