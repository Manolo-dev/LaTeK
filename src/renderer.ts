import { ipcRenderer } from 'electron';
import * as fs from 'fs';
import katex from 'katex';

let funTime: number,
    selectionCaret: number;

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

    switch(event.keyCode) {
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
            break;
        case 13: // Enter
            while(text.charAt(index++) == ' ') {
                count++;
            }
            target.value          = value.substring(0, start) + '\n' + ' '.repeat(count) + value.substring(end);
            target.selectionStart = target.selectionEnd
                                  = start + count + 1;

            // adjustCaretScroll(target);

            break;
        case 8: // Backspace
            if(['(', '{', '['].includes(target.value[target.selectionStart - 1])) {
                findParenthesisEnd(target, ['(', '{', '['].indexOf(target.value[target.selectionStart - 1]));
            } else {
                if(start != end) {
                    target.value        = value.substring(0, start) + value.substring(end);
                    target.selectionEnd = start;
                } else if(start > 0) {
                    target.value        = value.substring(0, start - 1) + value.substring(end);
                    target.selectionEnd = target.selectionStart = start - 1;
                }
            }
            break;
        case 46: // Delete
            if(['(', '{', '['].includes(target.value[target.selectionStart])) {
                findParenthesisEnd(target, ['(', '{', '['].indexOf(target.value[target.selectionStart]));
            } else {
                if(start != end) {
                    target.value        = value.substring(0, start) + value.substring(end);
                    target.selectionEnd = start;
                } else if(end < value.length) {
                    target.value        = value.substring(0, start) + value.substring(end + 1);
                    target.selectionEnd = target.selectionStart = start;
                }
            }
            break;
        case 37 :
            if(!event.shiftKey && start != end) {
                target.selectionEnd = start;
                selectionCaret      = 0;
            }
            else if(start > 0) {
                if(event.shiftKey) {
                    if(selectionCaret == 0)
                        selectionCaret = -1;
                    if(selectionCaret == 1)
                        target.selectionStart -= 1;
                    else
                        target.selectionEnd -= 1;
                }
                else
                    target.selectionEnd = target.selectionStart = target.selectionStart - 1;
            }
            break;
        case 39 :
            if(!event.shiftKey && start != end) {
                target.selectionStart = end;
                selectionCaret        = 0;
            }
            else if(start < value.length) {
                if(event.shiftKey) {
                    if(selectionCaret == 0)
                        selectionCaret = 1;
                    if(selectionCaret == 1)
                        target.selectionEnd += 1;
                    else
                        target.selectionStart += 1;
                }
                else
                    target.selectionEnd = target.selectionStart = target.selectionStart + 1;
            }
            break;
        default:
            if(!event.shiftKey && !event.ctrlKey && !event.altKey)
                target.value = value.substring(0, start) + event.key + value.substring(end);
    }

    // if(['(', '{', '['].includes(event.key)) {
    //     if(target.selectionStart < target.value.length)
    //         if(target.selectionStart == target.selectionEnd &&
    //             !target.value[target.selectionStart].match(/\t|\n|\r|\start|,|;|:|\.|\)|\}|\]/))
    //     event.preventDefault();
    //     parenthesis(target, ['(', '{', '['].indexOf(event.key));
    //     return false;
    // }

    // if([')', '}', ']'].includes(event.key)) {
    //     if(target.selectionStart == target.selectionEnd) {
    //         if(target.selectionStart <= target.value.length) {
    //             if(target.value[target.selectionStart] == event.key) {
    //                 event.preventDefault();
    //                 target.selectionStart += 1;
    //                 return false;
    //             }
    //         }
    //     }
    // }

    Promise.resolve().then(() => {
        // setTimeout(focusLine, 1, target);
        // setTimeout(countLine, 1, target);
    });

    return false;
}

async function adjustScroll(target: HTMLTextAreaElement) {
    const scroll = target.scrollTop,
        scrollX  = target.scrollLeft,
        syntax   = document.querySelector("#syntax");

    document.querySelector("#counter").scrollTop = scroll;
    syntax.scrollTop                             = scroll;
    syntax.scrollLeft                            = scrollX;
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
});

ipcRenderer.on("copy", () => {
    document.execCommand("copy");
});

ipcRenderer.on("paste", () => {
    document.execCommand("paste");
    const textarea = document.getElementById("latex") as HTMLTextAreaElement,
        syntax   = document.querySelector("#syntax");

    actualiseImg(textarea);
});