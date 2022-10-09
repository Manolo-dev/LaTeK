//  o  burp °  __v____ o °  O o ° o
//   O °  o\  '       \ ° _° o O °
//  ° O  ° o | _o      `-'_>  ° o °
//    o ° o   .         .-.> o O °
//   O   o ° o `-------' °  o ° O o

/** @TODO
 * @~ Créer une nouvelle image pour chaque ligne (\\)
 * - scroll auto vers la ligne concernée
 *
 * @~ Créer un gestionnaire de préférences
 * - Créer des variables CSS
 *
 * @~ Trouver un meilleur moyen de choisir les paramètres LaTeX
 * - Format de l'image pendant l'enregistrement
 * * - Ne pas rouvrir de boite de dialog quand ctrl+start et ctrl+end
 *
 * @~ Terminer la gestion du menu
 */

/** @POST_TODO
 * @~ Créer une version artistique :
 * - IDE dans un écran de PC
 * - Clavier dont les touches start'allument quand on les tape (potentiellement clickable)
 * - Imprimante avec l'image compilée
 * - Livre de documentation avec des outils LaTeX (potentiellement une petite bibliothèque)
 *
 * @~ Le tout en 3D
 */

let last_line = 0;
import { ipcRenderer } from "electron";
import * as fs from 'fs';

import { mathjax } from 'mathjax-full/js/mathjax';
import { TeX } from 'mathjax-full/js/input/tex';
import { SVG } from 'mathjax-full/js/output/svg';
import { liteAdaptor } from 'mathjax-full/js/adaptors/liteAdaptor';
import { RegisterHTMLHandler } from 'mathjax-full/js/handlers/html';
import { AssistiveMmlHandler } from 'mathjax-full/js/a11y/assistive-mml';
import { LiteElement } from 'mathjax-full/js/adaptors/lite/Element'

import { AllPackages } from 'mathjax-full/js/input/tex/AllPackages';


const DEFAULT_OPTIONS = {
    width: 1280,
    ex: 8,
    em: 16,
}

function TeXToSVG(str:string, opts:JSON = null) {
    const options = opts ? { ...DEFAULT_OPTIONS, ...opts } : DEFAULT_OPTIONS;

    const ASSISTIVE_MML = false, FONT_CACHE = true, INLINE = false, CSS = false, packages = AllPackages.sort();

    const adaptor = liteAdaptor();
    const handler = RegisterHTMLHandler(adaptor);
    if (ASSISTIVE_MML) AssistiveMmlHandler(handler);

    const tex = new TeX({ packages });
    const svg = new SVG({ fontCache: (FONT_CACHE ? 'local' : 'none') });
    const html = mathjax.document('', { InputJax: tex, OutputJax: svg });

    const node = html.convert(str, {
        display: !INLINE,
        em: options.em,
        ex: options.ex,
        containerWidth: options.width
    });

    const svgString = CSS ? adaptor.textContent(svg.styleSheet(html) as LiteElement) : adaptor.outerHTML(node);

    return svgString.replace(
        /<mjx-container.*?>(.*)<\/mjx-container>/gi,
        "$1"
    );
}

// import { TeXToSVG } from './tex-to-svg';

function count_line(target: HTMLTextAreaElement) {
    const value  = target.value,
          start  = target.selectionStart,
          syntax = document.querySelector("#syntax");

    const focused_line = Array.from(value.substring(0, start).matchAll(/^/gm)).length,
          syntax_lines = syntax.children.length,
          latex_lines  = Array.from(value.matchAll(/^/gm)).length;

    {
        let i = syntax_lines;
        while(i < latex_lines) {
            const line = document.createElement("div");
                line.setAttribute("class", "line");
            syntax.insertBefore(line, syntax.children[focused_line - 1]);
            i++;
        }
    }

    {
        let i = syntax_lines;
        while(i > latex_lines) {
            syntax.removeChild(syntax.children[focused_line]);
            i--;
        }
    }

    const len_syntax  = syntax.children.length,
          counter     = document.querySelector("#counter");
    let   len_counter = counter.children.length;

    while(len_counter < len_syntax) {
        const cell = document.createElement("div");
            cell.setAttribute("class", "cell");
        counter.appendChild(cell);
        len_counter++;
    }

    while(len_counter > len_syntax) {
        counter.removeChild(counter.children[counter.children.length - 1]);
        len_counter--;
    }
}

function adjust_caret_scroll(target: HTMLTextAreaElement, lines=1) {
    const value        = target.value,
          start        = target.selectionStart,
          scroll       = target.scrollTop,
          caret_scroll = Array.from(value.substring(0, start).matchAll(/^/gm)).length
                       * parseInt(getComputedStyle(target).lineHeight)
                       - parseInt(getComputedStyle(target).height);
    if(caret_scroll >= scroll || caret_scroll <= 0)
        target.scrollTop = caret_scroll + parseInt(getComputedStyle(target).lineHeight)*lines;
}

function parenthesis(target: HTMLTextAreaElement, char: number) {
    const chars = ['()', '{}', '[]'][char];
    const value = target.value,
          start = target.selectionStart,
          end   = target.selectionEnd;
    if(start == end) {
        target.value          = value.substring(0, start) + chars + value.substring(start);
        target.selectionStart = target.selectionEnd
                              = start + 1;
    } else {
        target.value          = value.substring(0, start) + chars[0] + value.substring(start, end) + chars[1] + value.substring(end);
        target.selectionStart = start + 1;
        target.selectionEnd   = end + 1;
    }
}

function find_parenthesis_end(target: HTMLTextAreaElement, char: number) {
    const chars     = ['()', '{}', '[]'][char];
    const start     = target.selectionStart;
    let   value     = target.value,
          i         = start - 1,
          level     = 1;
    
    value = value.substring(0, start - 1) + value.substring(start);

    while(i <= value.length && level != 0) {
        if(value[i] == chars[0]) {
            level++;
        }
        if(value[i] == chars[1]) {
            level--;
        }
        i++;
    }

    target.value          = value.substring(0, i - 1) + value.substring(i);
    target.selectionStart = target.selectionEnd
                          = start - 1;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function _onkeydown(event: KeyboardEvent) {
    const target = event.target;

    if(!(target instanceof HTMLTextAreaElement)) return;

    if(event.keyCode == 9) {
        const tab   = '    ';
        let   value = target.value;
        const start = target.selectionStart,
              end   = target.selectionEnd;
        if(start == end) {
            target.value = value.substring(0, start) + tab + value.substring(start);
            target.selectionStart = target.selectionEnd = start + tab.length;
        } else {
            let number_line = 1;
            const finded = Array.from(value.matchAll(/^/gm)).map(a => a.index);
            let i = finded.length - 1;
            for(; i > 0; i--) {
                if(start < finded[i] && finded[i] < end) {
                    value = value.substring(0, finded[i]) + tab + value.substring(finded[i]);
                    number_line += 1;
                }
                if(finded[i] <= start)
                    break;
            }
            value = value.substring(0, finded[i]) + tab + value.substring(finded[i]);
            target.value          = value;
            target.selectionStart = start + tab.length;
            target.selectionEnd   = end + tab.length*number_line;
        }
        return false;
    }

    if(['(', '{', '['].includes(event.key)) {
        if(target.selectionStart < target.value.length)
            if(target.selectionStart == target.selectionEnd && !target.value[target.selectionStart].match(/\t|\n|\r|\start|,|;|:|\.|\)|\}|\]/))
                return true;
        event.preventDefault();
        parenthesis(target, ['(', '{', '['].indexOf(event.key));
        return false;
    }

    if([')', '}', ']'].includes(event.key)) {
        if(target.selectionStart == target.selectionEnd) {
            if(target.selectionStart <= target.value.length) {
                if(target.value[target.selectionStart] == event.key) {
                    event.preventDefault();
                    target.selectionStart += 1;
                    return false;
                }
            }
        }
    }

    if(event.keyCode == 8) {
        if(['(', '{', '['].includes(target.value[target.selectionStart - 1])) {
            event.preventDefault();
            find_parenthesis_end(target, ['(', '{', '['].indexOf(target.value[target.selectionStart - 1]));
            return false;
        }
    } else if(event.keyCode == 46) {
        if(['(', '{', '['].includes(target.value[target.selectionStart])) {
            event.preventDefault();
            find_parenthesis_end(target, ['(', '{', '['].indexOf(target.value[target.selectionStart]));
            return false;
        }
    }

    if(event.keyCode == 13) {
        const value  = target.value,
              start  = target.selectionStart,
              end    = target.selectionEnd,
              text   = value.substring(value.substring(0, start).lastIndexOf('\n') + 1, start);
        let count    = 0,
            index    = 0;
        while (text.charAt(index++) == ' ') {
            count++;
        }
        target.value          = value.substring(0, start) + '\n' + ' '.repeat(count) + value.substring(end);
        target.selectionStart = target.selectionEnd
                              = start + count + 1;

        adjust_caret_scroll(target);

        return false;
    }

    Promise.resolve().then(_ => {
        setTimeout(focus_line, 1, target);
        setTimeout(count_line, 1, target);
    });

    return true;
}

async function adjust_scroll(target: HTMLTextAreaElement) {
    const scroll   = target.scrollTop,
          scroll_x = target.scrollLeft,
          syntax   = document.querySelector("#syntax");

    document.querySelector("#counter").scrollTop = scroll;
    syntax.scrollTop  = scroll;
    syntax.scrollLeft = scroll_x;
}


function syntax_colorization(target:Element, code: string) {
    code = code
        .replace(/(\\\\)/gim, "<span style=\"color: #f08;\">$1</span>")
        .replace(/(\\([a-z]+|\{|\}|\[|\]))/gim, "<span style=\"color: #0aa;\">$1</span>")
        .replace(/(\^|_)/gim, "<span style=\"color: #0a0;\">$1</span>");

    target.innerHTML = code;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function multiple_syntax_colorization(target: HTMLTextAreaElement) {
    if (!(event instanceof ClipboardEvent)) return;
    const start      = target.selectionStart,
        end        = target.selectionEnd,
        value      = target.value,
        before     = value.substring(0, start),
        after      = value.substring(end),
        start_line = Array.from(value.substring(0, start).matchAll(/^/gm)).length - 1,
        syntax     = document.querySelector("#syntax"),
        code       = event.clipboardData.getData("Text").replace(/\r\n|\r|\n/gm, "\n"),
        code_lines = Array.from(code.split(/^/gm)),
        len_line   = code_lines.length;

    event.preventDefault();

    target.value = before + after;
    target.selectionStart = start;
    count_line(target);


    target.value = before + code + after;
    target.selectionStart = start;
    count_line(target);

    for(let i = 0; i < len_line; i++) {
        syntax_colorization(syntax.children[start_line + i], code_lines[i]);
    }

    target.selectionStart = target.selectionEnd = start + code.length;

    adjust_caret_scroll(target, len_line);
}

async function focus_line(target: HTMLTextAreaElement) {
    const start           = target.selectionStart,
        value             = target.value,
        line              = Array.from(value.substring(0, start).matchAll(/^/gm)).length - 1,
        counter           = document.querySelector("#counter"),
        lines_start_end   = Array.from(value.matchAll(/^.*$/gm)).map(a => a[0]),
        syntax            = document.querySelector("#syntax"),
        count_lines       = Array.from(value.matchAll(/^/gm)).length;

    if(last_line < count_lines)
        syntax_colorization(syntax.children[last_line], lines_start_end[last_line]);
    syntax_colorization(syntax.children[line], lines_start_end[line]);

    if(line != last_line) {
        (counter.children[last_line] as HTMLElement).style.removeProperty("--color");
        (counter.children[last_line] as HTMLElement).style.removeProperty("--font-weight");
        (counter.children[line] as HTMLElement).style.setProperty("--color", "#f000f0");
        (counter.children[line] as HTMLElement).style.setProperty("--font-weight", "900");

        last_line = line;
        adjust_scroll(target);
    }
}

let fun_time: number;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function compile(target: HTMLTextAreaElement) {
    actualise_img(target);
}

async function actualise_img(target: HTMLTextAreaElement) {
    clearInterval(fun_time);

    // fun_time = setTimeout(() => {
    //     let value = target.value;
    //     let url   = `https://latex.codecogs.com/gif.latex?\\dpi{300} \\\\${encodeURI(value)}`;
    //     if(value == "") {
    //         url = "";
    //     }
    //     // document.querySelector("#result").src = url;
    // }, 333, event);

    fun_time = setTimeout(() => {
        const value       = target.value,
              start       = target.selectionStart,
              split_block = [],
              result      = document.querySelector("#result-box");

        let temp          = "",
            level         = 0;

        const begin_match = Array.from(value.matchAll(/\\begin\{[^{}]*\}/gim)),
            begin_index = begin_match.map(a => a.index),
            begin_value = begin_match.map(a => a[0]),

            end_match   = Array.from(value.matchAll(/\\end\{[^{}]*\}/gim)),
            end_index   = end_match.map(a => a.index),
            end_value   = end_match.map(a => a[0]);

        for(let i = 0; i < value.length; i++) {
            if(begin_index.includes(i)) {
                level++;

                if(level == 1) {
                    split_block.push({ value: temp, type: "line" });
                    temp = "";
                }
            }

            if(end_index.includes(i)) {
                level--;

                if(level == 0) {
                    const end_block = end_value[end_index.indexOf(i)];

                    split_block.push({ value: temp + end_block, type: "block" });
                    temp = "";
                    i += end_block.length;
                }
            }

            if(i < value.length)
                temp += value[i];
        }

        if(temp != "")
            split_block.push({ value: temp, type: "line" });

        const lines = [];

        for(let i = 0; i < split_block.length; i++) {
            if(split_block[i].type == "line") {
                lines.push(...split_block[i].value.split(/(?<=\\\\)/gm));
            } else {
                lines.push(split_block[i].value);
            }
        }

        let start_line_block   = 0,
            start_line = 0;
        for(let i = 0; i < lines.length; i++) {
            start_line_block += lines[i].length;
            if(start < start_line_block) {
                start_line = i;
                break;
            }
        }



        let i = result.children.length;
        while(i <= start_line) {
            const math_line = document.createElement("div");
            math_line.setAttribute("class", "math-line");
            result.appendChild(math_line);
            i++;
        }

        while(i > lines.length) {
            result.removeChild(result.children[result.children.length - 1]);
            i--;
        }

        console.log(lines[start_line]);
        const SVGeq = TeXToSVG(lines[start_line]);
        result.children[start_line].innerHTML = SVGeq;
    }, 333, event);
}

ipcRenderer.on("open-file", (event, args) => {
    if(args.length == 0) return false;
    fs.readFile(args[0], "utf-8", (err, data) => {
        if(err) return false;

        const paste_event = Object.assign(new Event("paste", { bubbles: true, cancelable: true }), {
            clipboardData: {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                getData: (type: any) => data,
            }
        });
        const element = document.querySelector("#latex") as HTMLTextAreaElement;
        element.selectionStart = 0;
        element.selectionEnd   = element.value.length;
        element.dispatchEvent(paste_event);
    });
});

ipcRenderer.on("import-file", (event, args) => {
    if(args.length == 0) return false;
    fs.readFile(args[0], "utf-8", (err, data) => {
        if(err) return false;

        const paste_event = Object.assign(new Event("paste", { bubbles: true, cancelable: true }), {
            clipboardData: {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                getData: (type: any) => data,
            }
        });

        document.querySelector("#latex").dispatchEvent(paste_event);
    });
});

ipcRenderer.on("save-file", () => {
    const data = (document.querySelector("#latex") as HTMLTextAreaElement).value;
    ipcRenderer.postMessage("save-file-value", data)
});

ipcRenderer.on("export-image", () => {
    const link    = document.createElement('a');
    link.href     = (document.querySelector("#result") as HTMLImageElement).src;
    link.download = "LaTeX equation";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});

ipcRenderer.on("cut", () => {
    document.execCommand("cut");
    const textarea = document.getElementById("latex") as HTMLTextAreaElement;
    actualise_img(textarea);
    syntax_colorization(textarea, textarea.value);
});

ipcRenderer.on("copy", () => {
    document.execCommand("copy");
});

ipcRenderer.on("paste", () => {
    document.execCommand("paste");
    const textarea = document.getElementById("latex") as HTMLTextAreaElement;
    const syntax = document.querySelector("#syntax");
    actualise_img(textarea);
    syntax_colorization(syntax, textarea.value);
});