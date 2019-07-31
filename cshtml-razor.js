/*
 * Language: cshtml-razor
 * Requires: xml.js, cs.js
 * Author: Roman Resh <romanresh@live.com>
*/

var module = module ? module : {};

function getXmlBlocks(hljs, additional_blocks) {
    var xml_comment = hljs.COMMENT(
        '<!--',
        '-->',
        {
            relevance: 10
        }
    );
    var string = {
        className: 'string',
        variants: [
            { begin: /"/, end: /"/ },
            { begin: /'/, end: /'/ },
            { begin: /[^\s"'=<>`]+/ }
        ],
        contains: additional_blocks
    };
    var xml_tag_internal = {
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
            begin: /<\?(php)?/, end: /\?>/,
            subLanguage: 'php',
            contains: [
                { begin: '/\\*', end: '\\*/', skip: true },
                { begin: 'b"', end: '"', skip: true },
                { begin: 'b\'', end: '\'', skip: true },
                hljs.inherit(hljs.APOS_STRING_MODE, { illegal: null, className: null, contains: null, skip: true }),
                hljs.inherit(hljs.QUOTE_STRING_MODE, { illegal: null, className: null, contains: null, skip: true })
            ]
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
    ];
}
function hljsDefineCshtmlRazor(hljs) {
    var SPECIAL_SYMBOL_CLASSNAME = "built_in";
    var closed_brace = {
        begin: "}",
        className: SPECIAL_SYMBOL_CLASSNAME,
        endsParent: true
    };
    var braces = {
        begin: "{",
        end: "}",
        contains: [hljs.QUOTE_STRING_MODE, 'self']
    };
    var razor_inline_expresion = {
        begin: "@[a-zA-Z]+",
        returnBegin: true,
        end: "(\\r|\\n|<|\\s|\"|')",
        contains: [
            {
                begin: '@',
                className: SPECIAL_SYMBOL_CLASSNAME
            }
        ],
        returnEnd: true
    };
    var razor_text_block = {
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
                endsParent: true,
            }
        ]
    };
    var razor_escape_at = {
        variants: [
            { begin: "@@" },
            { begin: "[a-zA-Z]+@" }
        ],
        skip: true
    };

    var razor_parentheses_block = {
        begin: "@\\(",
        end: "\\)",
        returnBegin: true,
        returnEnd: true,
        subLanguage: 'cs',
        contains: [
            {
                begin: "@\\(",
                className: SPECIAL_SYMBOL_CLASSNAME
            },
            {
                begin: "\\(",
                end: "\\)",
                subLanguage: 'cs',
                contains: [hljs.QUOTE_STRING_MODE, 'self']
            },
            razor_text_block,
            {
                begin: "\\)",
                className: SPECIAL_SYMBOL_CLASSNAME,
                endsParent: true
            }
        ]
    };
    var xml_blocks = getXmlBlocks(hljs, [razor_inline_expresion, razor_parentheses_block]);
    var razor_directives = {
        begin: "^@(model|using|inherits|inject)[^\\r\\n{\\(]*$",
        end: "$",
        className: SPECIAL_SYMBOL_CLASSNAME,
        returnBegin: true,
        returnEnd: true,
        contains: [
            {
                begin: "@(model|using|inherits|inject)",
                className: SPECIAL_SYMBOL_CLASSNAME
            },
            {
                variants: [
                    { begin: "\\s+", end: "$", },
                    { begin: "$" }
                ],
                className: "type",
                endsParent: true
            }
        ]
    };
    var razor_block = {
        begin: "@\\{",
        returnBegin: true,
        returnEnd: true,
        end: "\\}",
        subLanguage: ['cshtml-razor', 'cs'],
        contains: [
            {
                begin: "@\\{",
                className: SPECIAL_SYMBOL_CLASSNAME
            },
            braces,
            closed_brace
        ]
    };
    var razor_code_block_variants = [
        { begin: "@for[\\s]*\\([^{]+[\\s]*{", end: "}" },
        { begin: "@if[\\s]*\\([^{]+[\\s]*{", end: "}" },
        { begin: "@switch[\\s]*\\([^{]+[\\s]*{", end: "}" },
        { begin: "@while[\\s]*\\([^{]+[\\s]*{", end: "}" },
        { begin: "@using[\\s]*\\([^{]+[\\s]*{", end: "}" },
        { begin: "@lock[\\s]*\\([^{]+[\\s]*{", end: "}" },
        { begin: "@foreach[\\s]*\\([^{]+[\\s]*{", end: "}" },
    ];
    var razor_code_block = {
        variants: razor_code_block_variants,
        returnBegin: true,
        returnEnd: true,
        end: "}",
        subLanguage: ['cshtml-razor', 'cs'],
        contains: [
            {
                variants: razor_code_block_variants.map(function (v) { return { begin: v.begin }; }),
                returnBegin: true,
                contains: [
                    { begin: "@", className: SPECIAL_SYMBOL_CLASSNAME },
                    {
                        variants: razor_code_block_variants.map(function (v) { return { begin: v.begin.substr(1, v.begin.length - 2) }; }),
                        subLanguage: "cs"
                    },
                    { begin: "{", className: SPECIAL_SYMBOL_CLASSNAME }
                ]
            },
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
                            { begin: "[\\s]*else\\sif[\\s]*\\([^{]+[\\s]*{", },
                            { begin: "[\\s]*else[\\s]*", }
                        ],
                        subLanguage: "cs"
                    },
                    {
                        begin: "{",
                        className: SPECIAL_SYMBOL_CLASSNAME
                    }
                ]
            },
            braces,
            closed_brace,
            razor_block
        ]
    };
    var section_begin = "@section[\\s]+[a-zA-Z0-9]+[\\s]*{";
    var razor_try_block = {
        begin: "@try[\\s]*{",
        end: "}",
        returnBegin: true,
        returnEnd: true,
        subLanguage: ["cs"],
        contains: [
            { begin: "@", className: SPECIAL_SYMBOL_CLASSNAME },
            { begin: "try[\\s]*{", subLanguage: "cs" },
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
                        subLanguage: "cs"
                    },
                    { begin: "{", className: SPECIAL_SYMBOL_CLASSNAME }
                ]
            },
            razor_text_block,
            braces,
            closed_brace
        ]
    };

    razor_try_block.contains = razor_try_block.contains.concat(xml_blocks);
    var razor_section_block = {
        begin: section_begin,
        returnBegin: true,
        returnEnd: true,
        end: "}",
        subLanguage: ['cshtml-razor'],
        contains: [
            {
                begin: section_begin,
                className: SPECIAL_SYMBOL_CLASSNAME
            },
            razor_code_block,
            razor_block,
            razor_try_block,
            braces,
            closed_brace
        ]
    };
    razor_section_block.contains = razor_section_block.contains.concat(xml_blocks);
    var rasor_await = {
        begin: "@await ",
        returnBegin: true,
        subLanguage: 'cs',
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
    var result = {
        aliases: ['cshtml'],
        contains: [
            razor_directives,
            razor_block,
            razor_code_block,
            razor_section_block,
            rasor_await,
            razor_try_block,
            razor_escape_at,
            razor_text_block,
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
        ]
    };
    result.contains = result.contains.concat(xml_blocks);
    return result;
}

module.exports = function (hljs) {
    hljs.registerLanguage('cshtml-razor', hljsDefineCshtmlRazor);
};

module.exports.definer = hljsDefineCshtmlRazor;
