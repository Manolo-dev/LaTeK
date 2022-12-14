import { ipcRenderer } from 'electron';
import * as fs from 'fs';
import katex from 'katex';



let lastLine = 0,
    funTime: number;

// Import { TeXToSVG } from './tex-to-svg';

function countLine(target: HTMLTextAreaElement) {
    const value = target.value,
        start = target.selectionStart,
        syntax = document.querySelector("#syntax"),

        focusedLine = Array.from(value.substring(0, start).matchAll(/^/gm)).length,
        syntaxLines = syntax.children.length,
        latexLines  = Array.from(value.matchAll(/^/gm)).length,
        lenSyntax = syntax.children.length,
        counter     = document.querySelector("#counter");

    {
        let i = syntaxLines;

        while(i < latexLines) {
            const line = document.createElement("div");

            line.setAttribute("class", "line");
            syntax.insertBefore(line, syntax.children[focusedLine - 1]);
            i++;
        }
    }

    {
        let i = syntaxLines;

        while(i > latexLines) {
            syntax.removeChild(syntax.children[focusedLine]);
            i--;
        }
    }

    let lenCounter = counter.children.length;

    while(lenCounter < lenSyntax) {
        const cell = document.createElement("div");

        cell.setAttribute("class", "cell");
        counter.appendChild(cell);
        lenCounter++;
    }

    while(lenCounter > lenSyntax) {
        counter.removeChild(counter.children[counter.children.length - 1]);
        lenCounter--;
    }
}

function adjustCaretScroll(target: HTMLTextAreaElement, lines = 1) {
    const value = target.value,
        start        = target.selectionStart,
        scroll       = target.scrollTop,
        caretScroll  = Array.from(value.substring(0, start).matchAll(/^/gm)).length
                     * parseInt(getComputedStyle(target).lineHeight)
                     - parseInt(getComputedStyle(target).height);

    if(caretScroll >= scroll || caretScroll <= 0)
        target.scrollTop = caretScroll + parseInt(getComputedStyle(target).lineHeight) * lines;
}

function parenthesis(target: HTMLTextAreaElement, char: number) {
    const chars = ['()', '{}', '[]'][char],
        value = target.value,
        start = target.selectionStart,
        end   = target.selectionEnd;

    if(start == end) {
        target.value          = value.substring(0, start) + chars + value.substring(start);
        target.selectionStart = target.selectionEnd
                              = start + 1;
    } else {
        // eslint-disable-next-line max-len
        target.value          = value.substring(0, start) + chars[0] + value.substring(start, end) + chars[1] + value.substring(end);
        target.selectionStart = start + 1;
        target.selectionEnd   = end + 1;
    }
}

function findParenthesisEnd(target: HTMLTextAreaElement, char: number) {
    const chars = ['()', '{}', '[]'][char],
        start = target.selectionStart;
    let value   = target.value,
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars, complexity
function _onkeydown(event: KeyboardEvent) {
    const target = event.target as HTMLTextAreaElement,
        tab   = '    ',
        start = target.selectionStart,
        end     = target.selectionEnd;

    let value = target.value,
        count = 0,
        index = 0;

    // eslint-disable-next-line one-var
    const text = value.substring(value.substring(0, start).lastIndexOf('\n') + 1, start);

    switch (event.keyCode) {
        case 9: // Tab
            if(start == end) {
                target.value          = value.substring(0, start) + tab + value.substring(start);
                target.selectionStart = target.selectionEnd = start + tab.length;
            } else {
                const finded   = Array.from(value.matchAll(/^/gm)).map(a => a.index);
                let numberLine = 1,
                    i          = finded.length - 1;

                for(; i > 0; i--) {
                    if(start < finded[i] && finded[i] < end) {
                        value       = value.substring(0, finded[i]) + tab + value.substring(finded[i]);
                        numberLine += 1;
                    }
                    if(finded[i] <= start) break;
                }
                value                 = value.substring(0, finded[i]) + tab + value.substring(finded[i]);
                target.value          = value;
                target.selectionStart = start + tab.length;
                target.selectionEnd   = end + tab.length * numberLine;
            }
            return false;
        case 13: // Enter
            while(text.charAt(index++) == ' ') {
                count++;
            }
            target.value          = value.substring(0, start) + '\n' + ' '.repeat(count) + value.substring(end);
            target.selectionStart = target.selectionEnd
                                  = start + count + 1;

            adjustCaretScroll(target);

            return false;
        case 8: // Backspace
            if(['(', '{', '['].includes(target.value[target.selectionStart - 1])) {
                event.preventDefault();
                findParenthesisEnd(target, ['(', '{', '['].indexOf(target.value[target.selectionStart - 1]));
                return false;
            }
            break;
        case 46: // Delete
            if(['(', '{', '['].includes(target.value[target.selectionStart])) {
                event.preventDefault();
                findParenthesisEnd(target, ['(', '{', '['].indexOf(target.value[target.selectionStart]));
                return false;
            }
    }

    if(['(', '{', '['].includes(event.key)) {
        if(target.selectionStart < target.value.length)
            if(target.selectionStart == target.selectionEnd &&
                !target.value[target.selectionStart].match(/\t|\n|\r|\start|,|;|:|\.|\)|\}|\]/))
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

    Promise.resolve().then(() => {
        setTimeout(focusLine, 1, target);
        setTimeout(countLine, 1, target);
    });

    return true;
}

async function adjustScroll(target: HTMLTextAreaElement) {
    const scroll = target.scrollTop,
        scrollX  = target.scrollLeft,
        syntax   = document.querySelector("#syntax");

    document.querySelector("#counter").scrollTop = scroll;
    syntax.scrollTop                             = scroll;
    syntax.scrollLeft                            = scrollX;
}


function syntaxColorization(target:Element, code: string) {
    code = code
        .replace(/(\\\\)/gim, "<span style=\"color: #f08;\">$1</span>")
        .replace(/(\\([a-z]+|\{|\}|\[|\]))/gim, "<span style=\"color: #0aa;\">$1</span>")
        .replace(/(\^|_)/gim, "<span style=\"color: #0a0;\">$1</span>");

    target.innerHTML = code;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function multipleSyntaxColorization(target: HTMLTextAreaElement) {
    if(!(event instanceof ClipboardEvent)) return;
    const start = target.selectionStart,
        end        = target.selectionEnd,
        value      = target.value,
        before     = value.substring(0, start),
        after      = value.substring(end),
        startLine = Array.from(value.substring(0, start).matchAll(/^/gm)).length - 1,
        syntax     = document.querySelector("#syntax"),
        code       = event.clipboardData.getData("Text").replace(/\r\n|\r|\n/gm, "\n"),
        codeLines = Array.from(code.split(/^/gm)),
        lenLine   = codeLines.length;

    event.preventDefault();

    target.value          = before + after;
    target.selectionStart = start;
    countLine(target);


    target.value          = before + code + after;
    target.selectionStart = start;
    countLine(target);

    for(let i = 0; i < lenLine; i++) {
        syntaxColorization(syntax.children[startLine + i], codeLines[i]);
    }

    target.selectionStart = target.selectionEnd = start + code.length;

    adjustCaretScroll(target, lenLine);
}

async function focusLine(target: HTMLTextAreaElement) {
    const start = target.selectionStart,
        value             = target.value,
        line              = Array.from(value.substring(0, start).matchAll(/^/gm)).length - 1,
        counter           = document.querySelector("#counter"),
        linesStartEnd   = Array.from(value.matchAll(/^.*$/gm)).map(a => a[0]),
        syntax            = document.querySelector("#syntax"),
        countLines       = Array.from(value.matchAll(/^/gm)).length;

    if(lastLine < countLines)
        syntaxColorization(syntax.children[lastLine], linesStartEnd[lastLine]);
    syntaxColorization(syntax.children[line], linesStartEnd[line]);

    if(line != lastLine) {
        if(lastLine in counter.children) {
            (counter.children[lastLine] as HTMLElement).style.removeProperty("--color");
            (counter.children[lastLine] as HTMLElement).style.removeProperty("--font-weight");
        }
        if(line in counter.children) {
            (counter.children[line] as HTMLElement).style.setProperty("--color", "#f000f0");
            (counter.children[line] as HTMLElement).style.setProperty("--font-weight", "900");
        }

        lastLine = line;
        adjustScroll(target);
    }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function compile(target: HTMLTextAreaElement) {
    actualiseImg(target);
}

async function actualiseImg(target: HTMLTextAreaElement) {
    clearInterval(funTime);

    // eslint-disable-next-line complexity
    funTime = setTimeout(() => {
        katex.render(target.value,
            document.querySelector("#result-box"), {
                displayMode  : true,
                throwOnError : false
            }
        );
    }, 333, event);
}

// IpcRenderer
ipcRenderer.on("open-file", (event, args) => {
    if(args.length == 0) return false;
    fs.readFile(args[0], "utf-8", (err, data) => {
        if(err) return false;

        const pasteEvent = Object.assign(new Event("paste", { bubbles: true, cancelable: true }), {
                clipboardData: {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    getData: (type: any) => data,
                }
            }),
            element      = document.querySelector("#latex") as HTMLTextAreaElement;

        element.selectionStart = 0;
        element.selectionEnd   = element.value.length;
        element.dispatchEvent(pasteEvent);
    });
});

ipcRenderer.on("import-file", (event, args) => {
    if(args.length == 0) return false;
    fs.readFile(args[0], "utf-8", (err, data) => {
        if(err) return false;

        const pasteEvent = Object.assign(new Event("paste", { bubbles: true, cancelable: true }), {
            clipboardData: {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                getData: (type: any) => data,
            }
        });

        document.querySelector("#latex").dispatchEvent(pasteEvent);
    });
});

ipcRenderer.on("save-file", () => {
    const data = (document.querySelector("#latex") as HTMLTextAreaElement).value;

    ipcRenderer.postMessage("save-file-value", data);
});

ipcRenderer.on("export-image", () => {
    const link = document.createElement('a');

    link.href     = (document.querySelector("#result") as HTMLImageElement).src;
    link.download = "LaTeX equation";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});

ipcRenderer.on("cut", () => {
    document.execCommand("cut");
    const textarea = document.getElementById("latex") as HTMLTextAreaElement;

    actualiseImg(textarea);
    syntaxColorization(textarea, textarea.value);
});

ipcRenderer.on("copy", () => {
    document.execCommand("copy");
});

ipcRenderer.on("paste", () => {
    document.execCommand("paste");
    const textarea = document.getElementById("latex") as HTMLTextAreaElement,
        syntax   = document.querySelector("#syntax");

    actualiseImg(textarea);
    syntaxColorization(syntax, textarea.value);
});