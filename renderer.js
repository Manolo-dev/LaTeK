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
 * * - Ne pas rouvrir de boite de dialog quand ctrl+s et ctrl+e
 *
 * @~ Terminer la gestion du menu
 */

/** @POST_TODO
 * @~ Créer une version artistique :
 * - IDE dans un écran de PC
 * - Clavier dont les touches s'allument quand on les tape (potentiellement clickable)
 * - Imprimante avec l'image compilée
 * - Livre de documentation avec des outils LaTeX (potentiellement une petite bibliothèque)
 *
 * @~ Le tout en 3D
 */


onload = function() {
    var t = document.querySelector("#latex").value = "";
}

var last_line = 0;
const {ipcRenderer} = require("electron");
const fs = require("fs");
const TeXToSVG = require("./tex-to-svg.js");

function count_line(target) {
    let value  = target.value,
        start  = target.selectionStart,
        syntax = document.querySelector("#syntax");

    let focused_line = [...value.substring(0, start).matchAll(/^/gm)].length,
        syntax_lines = syntax.children.length,
        latex_lines  = [...value.matchAll(/^/gm)].length;

    {
        let i = syntax_lines;
        while(i < latex_lines) {
            let line = document.createElement("div");
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

    let len_syntax  = syntax.children.length,
        counter     = document.querySelector("#counter"),
        len_counter = counter.children.length;

    while(len_counter < len_syntax) {
        let cell = document.createElement("div");
            cell.setAttribute("class", "cell");
        counter.appendChild(cell);
        len_counter++;
    }

    while(len_counter > len_syntax) {
        counter.removeChild(counter.children[counter.children.length - 1]);
        len_counter--;
    }
}

function adjust_caret_scroll(target, lines=1) {
    let value        = target.value,
        start        = target.selectionStart,
        scroll       = target.scrollTop,
        caret_scroll = [...value.substring(0, start).matchAll(/^/gm)].length
                     * parseInt(getComputedStyle(target).lineHeight)
                     - parseInt(getComputedStyle(target).height);
    if(caret_scroll >= scroll || caret_scroll <= 0)
        target.scrollTop = caret_scroll + parseInt(getComputedStyle(target).lineHeight)*lines;
}

function parenthesis(target, char) {
    chars = ['()', '{}', '[]'][char];
    let value = target.value,
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

function find_parenthesis_end(target, char) {
    chars     = ['()', '{}', '[]'][char];
    let value = target.value,
        start = target.selectionStart,
        end   = target.selectionEnd,
        level = 1,
        i     = start - 1;
    value     = value.substring(0, start - 1) + value.substring(start);
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

function _onkeydown(event) {
    let target = event.target;
    if(event.keyCode == 9) {
        let tab = '    ';
        let value = target.value,
            s = target.selectionStart,
            e = target.selectionEnd;
        if(s == e) {
            target.value = value.substring(0, s) + tab + value.substring(s);
            target.selectionStart = target.selectionEnd = s + tab.length;
        } else {
            let number_line = 1;
            let finded = [...value.matchAll(/^/gm)].map(a => a.index);
            let i = finded.length - 1;
            for(; i > 0; i--) {
                if(s < finded[i] && finded[i] < e) {
                    value = value.substring(0, finded[i]) + tab + value.substring(finded[i]);
                    number_line += 1;
                }
                if(finded[i] <= s)
                    break;
            }
            value = value.substring(0, finded[i]) + tab + value.substring(finded[i]);
            target.value          = value;
            target.selectionStart = s + tab.length;
            target.selectionEnd   = e + tab.length*number_line;
        }
        return false;
    }

    if(['(', '{', '['].includes(event.key)) {
        if(target.selectionStart < target.value.length)
            if(target.selectionStart == target.selectionEnd && !target.value[target.selectionStart].match(/\t|\n|\r|\s|,|;|:|\.|\)|\}|\]/))
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
        let value  = target.value,
            start  = target.selectionStart,
            end    = target.selectionEnd,
            scroll = target.scrollTop,
            count  = 0,
            index  = 0,
            text   = value.substring(value.substring(0, start).lastIndexOf('\n') + 1, start);
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

async function adjust_scroll(target) {
    let start    = target.selectionStart,
        end      = target.selectionEnd,
        value    = target.value,
        scroll   = target.scrollTop,
        scroll_x = target.scrollLeft,
        syntax   = document.querySelector("#syntax");

    document.querySelector("#counter").scrollTop = scroll;
    syntax.scrollTop  = scroll;
    syntax.scrollLeft = scroll_x;
}


function syntax_colorization(target, code) {
    code = code
        .replace(/(\\\\)/gim, "<span style=\"color: #f08;\">$1</span>")
        .replace(/(\\([a-z]+|\{|\}|\[|\]))/gim, "<span style=\"color: #0aa;\">$1</span>")
        .replace(/(\^|_)/gim, "<span style=\"color: #0a0;\">$1</span>");

    target.innerHTML = code;
}

function multiple_syntax_colorization(target) {
    let start      = target.selectionStart,
        end        = target.selectionEnd,
        value      = target.value,
        before     = value.substring(0, start),
        after      = value.substring(end),
        start_line = [...value.substring(0, start).matchAll(/^/gm)].length - 1,
        end_line   = [...value.substring(0, end).matchAll(/^/gm)].length - 1,
        syntax     = document.querySelector("#syntax"),
        code       = event.clipboardData.getData("Text").replace(/\r\n|\r|\n/gm, "\n"),
        code_lines = [...code.split(/^/gm)],
        scroll     = target.scrollTop,
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

async function focus_line(target) {
    let start           = target.selectionStart,
        end             = target.selectionEnd,
        value           = target.value,
        line            = [...value.substring(0, start).matchAll(/^/gm)].length - 1,
        counter         = document.querySelector("#counter"),
        lines_start_end = [...value.matchAll(/^.*$/gm)].map(a => a[0]),
        syntax          = document.querySelector("#syntax"),
        count_lines     = [...value.matchAll(/^/gm)].length;

    if(last_line < count_lines)
        syntax_colorization(syntax.children[last_line], lines_start_end[last_line]);
    syntax_colorization(syntax.children[line], lines_start_end[line]);

    if(line != last_line) {
        counter.children[last_line].style.removeProperty("--color");
        counter.children[last_line].style.removeProperty("--font-weight");
        counter.children[line].style.setProperty("--color", "#f000f0");
        counter.children[line].style.setProperty("--font-weight", 900);

        last_line = line;
        adjust_scroll(target);
    }
}

var fun_time;

async function compile(target) {
    actualise_img(target);
}

async function actualise_img(target) {
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
        let value      = target.value,
            start      = target.selectionStart,
            result     = document.querySelector("#result-box");

        let split_block = [],
            temp        = "",
            level       = 0;

        let begin_match = [...value.matchAll(/\\begin\{[^{}]*\}/gim)],
            begin_index = begin_match.map(a => a.index),
            begin_value = begin_match.map(a => a[0]),

            end_match   = [...value.matchAll(/\\end\{[^{}]*\}/gim)],
            end_index   = end_match.map(a => a.index),
            end_value   = end_match.map(a => a[0]);

        for(let i = 0; i < value.length; i++) {
            if(begin_index.includes(i)) {
                level++;

                if(level == 1) {
                    let begin_block = begin_value[begin_index.indexOf(i)];

                    split_block.push({ value: temp, type: "line" });
                    temp = "";
                }
            }

            if(end_index.includes(i)) {
                level--;

                if(level == 0) {
                    let end_block = end_value[end_index.indexOf(i)];

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

        let lines = [];

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
            let math_line = document.createElement("div");
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
                getData: type => data,
            }
        });

        document.querySelector("#latex").selectionStart = 0;
        document.querySelector("#latex").selectionEnd   = document.querySelector("#latex").value.length;
        document.querySelector("#latex").dispatchEvent(paste_event);
    });
});

ipcRenderer.on("import-file", (event, args) => {
    if(args.length == 0) return false;
    fs.readFile(args[0], "utf-8", (err, data) => {
        if(err) return false;

        const paste_event = Object.assign(new Event("paste", { bubbles: true, cancelable: true }), {
            clipboardData: {
                getData: type => data,
            }
        });

        document.querySelector("#latex").dispatchEvent(paste_event);
    });
});

ipcRenderer.on("save-file", (event, args) => {
    let data = document.querySelector("#latex").value;
    ipcRenderer.postMessage("save-file-value", data)
});

ipcRenderer.on("export-image", (event, args) => {
    const link    = document.createElement('a');
    link.href     = document.querySelector("#result").src;
    link.download = "LaTeX equation";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});

ipcRenderer.on("cut", (event, args) => {
    document.execCommand("cut");
    let textarea = document.getElementById("latex");
    actualise_img(textarea);
    console.log(textarea)
    syntax_colorization(textarea, textarea.value);
});

ipcRenderer.on("copy", (event, args) => {
    document.execCommand("copy");
});

ipcRenderer.on("paste", (event, args) => {
    document.execCommand("paste");
    let textarea = document.getElementById("latex");
    let syntax = document.querySelector("#syntax")
    actualise_img(textarea);
    syntax_colorization(syntax, textarea.value);
});