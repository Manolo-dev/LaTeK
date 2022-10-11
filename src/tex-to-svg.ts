import { mathjax } from 'mathjax-full/js/mathjax';
import { TeX } from 'mathjax-full/js/input/tex';
import { SVG } from 'mathjax-full/js/output/svg';
import { liteAdaptor } from 'mathjax-full/js/adaptors/liteAdaptor';
import { RegisterHTMLHandler } from 'mathjax-full/js/handlers/html';
import { AssistiveMmlHandler } from 'mathjax-full/js/a11y/assistive-mml';
import { LiteElement } from 'mathjax-full/js/adaptors/lite/Element';

import { AllPackages } from 'mathjax-full/js/input/tex/AllPackages';


const DEFAULT_OPTIONS = {
    width : 1280,
    ex    : 8,
    em    : 16,
};

export function TeXToSVG(str:string, opts:JSON = null) {
    const options     = opts ? { ...DEFAULT_OPTIONS, ...opts } : DEFAULT_OPTIONS,
        ASSISTIVE_MML = false,
        FONT_CACHE    = true,
        INLINE        = false,
        CSS           = false,
        packages      = AllPackages.sort(),

        adaptor       = liteAdaptor(),
        handler       = RegisterHTMLHandler(adaptor),
        tex           = new TeX({ packages }),
        svg           = new SVG({ fontCache: (FONT_CACHE ? 'local' : 'none') }),
        html          = mathjax.document('', { InputJax: tex, OutputJax: svg }),

        node          = html.convert(str, {
            display        : !INLINE,
            em             : options.em,
            ex             : options.ex,
            containerWidth : options.width
        }),

        svgString     = CSS ? adaptor.textContent(svg.styleSheet(html) as LiteElement) : adaptor.outerHTML(node);

    if(ASSISTIVE_MML) AssistiveMmlHandler(handler);
    return svgString.replace(
        /<mjx-container.*?>(.*)<\/mjx-container>/gi,
        "$1"
    );
}
