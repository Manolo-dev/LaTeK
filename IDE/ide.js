const keyBind = {
        'A'          : 'a',
        'B'          : 'b',
        'C'          : 'c',
        'D'          : 'd',
        'E'          : 'e',
        'F'          : 'f',
        'G'          : 'g',
        'H'          : 'h',
        'I'          : 'i',
        'J'          : 'j',
        'K'          : 'k',
        'L'          : 'l',
        'M'          : 'm',
        'N'          : 'n',
        'O'          : 'o',
        'P'          : 'p',
        'Q'          : 'q',
        'R'          : 'r',
        'S'          : 's',
        'T'          : 't',
        'U'          : 'u',
        'V'          : 'v',
        'W'          : 'w',
        'X'          : 'x',
        'Y'          : 'y',
        'Z'          : 'z',
        'F1'         : 'f1',
        'F2'         : 'f2',
        'F3'         : 'f3',
        'F4'         : 'f4',
        'F5'         : 'f5',
        'F6'         : 'f6',
        'F7'         : 'f7',
        'F8'         : 'f8',
        'F9'         : 'f9',
        'F10'        : 'f10',
        'F11'        : 'f11',
        'F12'        : 'f12',
        '+'          : 'plus',
        ' '          : 'space',
        'ArrowLeft'  : 'left',
        'ArrowUp'    : 'up',
        'ArrowRight' : 'right',
        'ArrowDown'  : 'down',
        'Shift'      : 'shift',
        'CapsLock'   : 'capslock',
        'Alt'        : 'alt',
        'AltGraph'   : 'altgr',
        'Backspace'  : 'backspace',
        'Delete'     : 'delete',
        'Tab'        : 'tab',
        'Escape'     : 'escape',
        'End'        : 'end',
        'Dead'       : 'dead',
        'Control'    : 'ctrl',
        'Insert'     : 'insert',
        'Enter'      : 'enter',
        'Meta'       : 'meta',
        'Home'       : 'home',
        'OS'         : 'home',
        'Pause'      : 'break',
        'PageUp'     : 'pageup',
        'PageDown'   : 'pagedown',
        'NumLock'    : 'numlock',
        'Cancel'     : 'cancel',
        'Clear'      : 'clear'},


    deadKeys = ['f1',
        'f2',
        'f3',
        'f4',
        'f5',
        'f6',
        'f7',
        'f8',
        'f9',
        'f10',
        'f11',
        'f12',
        'left',
        'up',
        'right',
        'down',
        'shift',
        'capslock',
        'alt',
        'altgr',
        'backspace',
        'delete',
        'tab',
        'escape',
        'end',
        'dead',
        'ctrl',
        'insert',
        'enter',
        'meta',
        'home',
        'break',
        'pageup',
        'pagedown',
        'numlock',
        'cancel',
        'clear'],


    commandActions = {
        "ctrl+r": (area, event) => window.location.reload(),

        "ctrl+v": (area, event) => {
            navigator.clipboard.readText().then(data => {
                let allCaret = area.querySelectorAll("ide-caret");

                allCaret.forEach(caret => {
                    [...data].forEach(char => {
                        if(caret.innerHTML != "")
                            cleanContent(caret);
                        caret.insertAdjacentHTML("beforebegin",
                            char);
                    });
                });
            });
        },


        "left": (area, event) => {
            area.querySelectorAll("ide-caret").forEach(caret => {
                if(caret.previousSibling != null) {
                    if(caret.innerHTML == "")
                        area.insertBefore(caret,
                            caret.previousSibling);
                }
                if(caret.innerHTML != "") {
                    outContent(caret,
                        "afterend");
                }
            });
        },


        "right": (area, event) => {
            area.querySelectorAll("ide-caret").forEach(caret => {
                if(caret.nextSibling != null) {
                    if(caret.innerHTML == "")
                        area.insertBefore(caret.nextSibling,
                            caret);
                }
                if(caret.innerHTML != "") {
                    outContent(caret,
                        "beforebegin");
                }
            });
        },


        "up": (area, event) => {
            area.querySelectorAll("ide-caret").forEach(caret => {
                if(caret.classList.contains("right"))
                    outContent(caret,
                        "beforebegin");
                else
                    outContent(caret,
                        "afterend");
            });

            area.querySelectorAll("ide-caret").forEach(caret => {
                if(caret.previousSibling == null)
                    return ["column"];

                if(!caret.hasAttribute("column")) {
                    setColumn(caret);
                }

                let currentNode = caret,

                    enterLvl    = 0;

                while(currentNode.previousSibling != null) {
                    if(currentNode.textContent == "\n")
                        enterLvl++;
                    if(enterLvl == 2)
                        break;
                    currentNode = currentNode.previousSibling;
                }

                if(enterLvl == 0) {
                    return ["column"];
                }

                if(enterLvl == 1)
                    area.insertBefore(caret,
                        currentNode);

                if(enterLvl == 2) {
                    area.insertBefore(caret,
                        currentNode);
                    area.insertBefore(currentNode,
                        caret);
                }

                let column = 0,

                    maxColumn = parseInt(caret.getAttribute("column"));

                while(caret.nextSibling != null) {
                    if(caret.nextSibling.textContent == "\n")
                        break;
                    if(column == maxColumn)
                        break;
                    if(caret.nextSibling != null && caret.nextSibling.tagName == "IDE-CARET")
                        column--;
                    area.insertBefore(caret.nextSibling,
                        caret);
                    column++;
                }
            });

            return ["column"];
        },


        "down": (area,
            event) => {
            [...area.querySelectorAll("ide-caret")].reverse().forEach(caret => {
                if(caret.classList.contains("right"))
                    outContent(caret,
                        "beforebegin");
                else
                    outContent(caret,
                        "afterend");
            });

            [...area.querySelectorAll("ide-caret")].reverse().forEach(caret => {
                if(caret.nextSibling == null)
                    return ["column"];

                if(!caret.hasAttribute("column")) {
                    setColumn(caret);
                }

                let currentNode = caret,

                    enterLvl    = 0;

                while(currentNode.nextSibling != null) {
                    if(currentNode.textContent == "\n")
                        enterLvl++;
                    if(enterLvl == 1)
                        break;
                    currentNode = currentNode.nextSibling;
                }

                if(enterLvl == 0) {
                    return ["column"];
                }

                if(enterLvl == 1) {
                    area.insertBefore(caret,
                        currentNode);
                    area.insertBefore(currentNode,
                        caret);
                }

                if(enterLvl == 2) {
                    area.insertBefore(caret,
                        currentNode);
                }

                let column = 0,

                    maxColumn = parseInt(caret.getAttribute("column"));

                while(caret.nextSibling != null) {
                    if(caret.nextSibling.textContent == "\n")
                        break;
                    if(column == maxColumn)
                        break;
                    if(caret.nextSibling != null && caret.nextSibling.tagName == "IDE-CARET")
                        column--;
                    area.insertBefore(caret.nextSibling,
                        caret);
                    column++;
                }
            });

            return ["column"];
        },


        "shift+left": (area,
            event) => {
            area.querySelectorAll("ide-caret").forEach(caret => {
                if(caret.innerHTML == "")
                    caret.className = "left";

                if(caret.classList.contains("left")) {
                    if(caret.previousSibling != null) {
                        if(caret.previousSibling.tagName == "IDE-CARET") {
                            while(caret.previousSibling.lastChild) {
                                let clonedChild = caret.previousSibling.lastChild.textContent;

                                caret.previousSibling.removeChild(caret.previousSibling.lastChild);
                                caret.insertAdjacentHTML("afterbegin",
                                    clonedChild);
                            }
                            area.removeChild(caret.previousSibling);
                        } else {
                            let clonedSibling = caret.previousSibling.textContent;

                            area.removeChild(caret.previousSibling);
                            caret.insertAdjacentHTML("afterbegin",
                                clonedSibling);
                        }
                    }
                }

                if(caret.classList.contains("right")) {
                    if(caret.lastChild != null) {
                        let clonedChild = caret.lastChild.textContent;

                        caret.removeChild(caret.lastChild);
                        caret.insertAdjacentHTML("afterend",
                            clonedChild);
                    }
                }
            });
        },


        "shift+right": (area,
            event) => {
            [...area.querySelectorAll("ide-caret")].reverse().forEach(caret => {
                if(caret.innerHTML == "")
                    caret.className = "right";

                if(caret.classList.contains("right")) {
                    if(caret.nextSibling != null) {
                        if(caret.nextSibling.tagName == "IDE-CARET") {
                            while(caret.nextSibling.firstChild) {
                                let clonedChild = caret.nextSibling.firstChild.textContent;

                                caret.nextSibling.removeChild(caret.nextSibling.firstChild);
                                caret.insertAdjacentHTML("beforeend",
                                    clonedChild);
                            }
                            area.removeChild(caret.nextSibling);
                        } else {
                            let clonedChild = caret.nextSibling.textContent;

                            area.removeChild(caret.nextSibling);
                            caret.insertAdjacentHTML("beforeend",
                                clonedChild);
                        }
                    }
                }

                if(caret.classList.contains("left")) {
                    if(caret.firstChild != null) {
                        let clonedFirstChild = caret.firstChild.textContent;

                        caret.removeChild(caret.firstChild);
                        caret.insertAdjacentHTML("beforebegin",
                            clonedFirstChild);
                    }
                }
            });
        },


        "enter": (area,
            event) => {
            area.querySelectorAll("ide-caret").forEach(caret => {
                let findEnter = caret,

                    tab       = [];

                while(findEnter.previousSibling != null) {
                    findEnter = findEnter.previousSibling;
                    if(findEnter.textContent == "\n") {
                        findEnter = findEnter.nextSibling;
                        break;
                    }
                }

                while(findEnter != null
                && findEnter != caret
                && findEnter.textContent.replaceAll(/ /gi,
                    "").length == 0) {
                    tab.push(findEnter.textContent);
                    findEnter = findEnter.nextSibling;
                }

                cleanContent(caret);
                caret.insertAdjacentHTML("beforebegin",
                    "\n");
                tab.forEach(t => {
                    caret.insertAdjacentHTML("beforebegin",
                        t);
                });
            });
        },


        "shift+enter": (area,
            event) => {
            area.querySelectorAll("ide-caret").forEach(caret => {
                let findEnter = caret,

                    tab       = [];

                while(findEnter.previousSibling != null) {
                    findEnter = findEnter.previousSibling;
                    if(findEnter.textContent == "\n") {
                        findEnter = findEnter.nextSibling;
                        break;
                    }
                }

                while(findEnter != null
                && findEnter != caret
                && findEnter.textContent.replaceAll(/ /gi,
                    "").length == 0) {
                    tab.push(findEnter.textContent);
                    findEnter = findEnter.nextSibling;
                }

                caret.insertAdjacentHTML("beforebegin",
                    "\n");
                tab.forEach(t => {
                    caret.insertAdjacentHTML("beforebegin",
                        t);
                });
            });
        },


        "tab": (area,
            event) => {
            area.querySelectorAll("ide-caret").forEach(caret => {
                if(caret.previousSibling != null
                && caret.previousSibling.textContent == "\n") {

                    let findEnter = caret.previousSibling,

                        tab       = [];

                    while(findEnter.previousSibling != null) {
                        findEnter = findEnter.previousSibling;
                        if(findEnter.textContent == "\n") {
                            findEnter = findEnter.nextSibling;
                            break;
                        }
                    }

                    while(findEnter != null
                    && findEnter != caret
                    && findEnter.textContent.replaceAll(/ /gi,
                        "").length == 0) {
                        tab.push(findEnter.textContent);
                        findEnter = findEnter.nextSibling;
                    }

                    tab.forEach(t => {
                        caret.insertAdjacentHTML("beforebegin",
                            t);
                    });

                    if(tab.length == 0)
                        caret.insertAdjacentHTML("beforebegin",
                            " ".repeat(area.parentNode.parentNode.lenTab));

                } else {
                    caret.insertAdjacentHTML("beforebegin",
                        " ".repeat(area.parentNode.parentNode.lenTab));
                }
            });
        },


        "shift+tab": (area,
            event) => {

        },


        "backspace": (area,
            event) => {
            area.querySelectorAll("ide-caret").forEach(caret => {
                if(caret.previousSibling != null && caret.innerHTML == "")
                    area.removeChild(caret.previousSibling);
                else if(caret.innerHTML != "")
                    cleanContent(caret);
            });
        },


        "delete": (area,
            event) => {
            area.querySelectorAll("ide-caret").forEach(caret => {
                if(caret.nextSibling != null && caret.innerHTML == "")
                    area.removeChild(caret.nextSibling);
                else if(caret.innerHTML != "")
                    cleanContent(caret);
            });
        },


        'rclick': (area,
            event) => {
            const caret = document.createElement("ide-caret");

            let allCaret = area.querySelectorAll("ide-caret");

            allCaret.forEach(caret => {
                outContent(caret,
                    "beforebegin");
                area.removeChild(caret);
            });

            area.focus();

            if(window.getSelection) {
                let select = window.getSelection();

                if(select.type == "Caret") {
                    if(area.contains(select.focusNode)) {
                        if(select.focusNode == area)
                            area.appendChild(caret);
                        else {
                            area.insertBefore(caret,
                                select.focusNode);
                            if(select.anchorOffset > 0)
                                area.insertBefore(select.focusNode,
                                    caret);
                        }
                    }
                }
            }

            if(event.ctrlKey) {
                allCaret.forEach(async caret => {
                    clearSiblingCaret(caret);
                });
            }
        },


        'ctrl+rclick': (area,
            event) => {
            const caret = document.createElement("ide-caret");

            area.focus();

            if(window.getSelection) {
                let select = window.getSelection();

                if(select.type == "Caret") {
                    if(area.contains(select.focusNode)) {
                        if(select.focusNode == area)
                            area.appendChild(caret);
                        else {
                            area.insertBefore(caret,
                                select.focusNode);
                            if(select.anchorOffset > 0)
                                area.insertBefore(select.focusNode,
                                    caret);
                        }
                    }
                }
            }

            if(event.ctrlKey) {
                area.querySelectorAll("ide-caret").forEach(async caret => {
                    clearSiblingCaret(caret);
                });
            }
        }
    };

class Caret extends HTMLSpanElement {
    constructor() {
        super();
    }
}

function setColumn(caret) {
    let findEnter = caret,

        column    = 0;

    while(1) {
        findEnter = findEnter.previousSibling;
        if(findEnter == null) {
            lastEnter = findEnter;
            break;
        }
        if(findEnter.tagName == "IDE-CARET")
            continue;
        if(findEnter.textContent == "\n") {
            lastEnter = findEnter;
            break;
        }
        column += findEnter.textContent.length;
    }

    caret.setAttribute("column",
        column);
}

function cleanContent(caret) {
    caret.innerHTML = '';
}

function outContent(caret,
    lr) {
    if(lr == "beforebegin")
        while(caret.firstChild) {
            let clonedSibling = caret.firstChild.textContent;

            caret.insertAdjacentHTML(lr,
                clonedSibling);
            caret.removeChild(caret.firstChild);
        }
    else if(lr == "afterend")
        while(caret.lastChild) {
            caret.insertAdjacentHTML(lr,
                caret.lastChild.textContent);
            caret.removeChild(caret.lastChild);
        }
}

function clearSiblingCaret(caret) {
    if(caret.nextSibling != null && caret.nextSibling.tagName == "IDE-CARET") {
        if(caret.nextSibling.innerHTML == "") {
            outContent(caret.nextSibling,
                "beforebegin");
            caret.parentNode.removeChild(caret.nextSibling);
        }
    }
}

function keyBindCommand(event) {
    let keys = [];

    if(event.ctrlKey)
        keys.push("ctrl");
    if(event.altKey)
        keys.push("alt");
    if(event.shiftKey)
        keys.push("shift");
    if(event.metaKey)
        keys.push("meta");

    if(event instanceof KeyboardEvent) {
        let key = keyBind[event.key];

        if(key != undefined) {
            if(!keys.includes(key))
                keys.push(key);
        } else
            keys.push(event.key);
    }

    if(event instanceof MouseEvent) {
        keys.push([null,
            'r',
            'm',
            'l'][event.which] + 'click' + (event.detail > 1 ? event.detail % 3 : ''));
    }

    let command = keys.join("+");

    if(command in commandActions) {
        let attrs = commandActions[command](event.target,
            event);

        event.target.querySelectorAll("ide-caret").forEach(caret => {
            [...caret.attributes].forEach(attr => {
                if(attr.name != "class") {
                    if(attrs == null)
                        caret.removeAttribute(attr.name);
                    else if(attr.name in attrs)
                        caret.removeAttribute(attr.name);
                }
            });
        });
        return true;
    }

    event.target.querySelectorAll("ide-caret").forEach(caret => {
        [...caret.attributes].forEach(attr => {
            if(attr.name != "class")
                caret.removeAttribute(attr.name);
        });
    });

    return keys.every(e => deadKeys.includes(e));
}

class IDE extends HTMLElement {
    constructor() {
        super();

        this.lenTab = 4;
    }

    connectedCallback() {
        const counter = document.createElement("div");

        counter.setAttribute("id",
            "ide-counter");

        const cell = document.createElement("div");

        cell.setAttribute("class",
            "ide-cell");
        cell.style.setProperty("--color",
            "#f000f0");
        cell.style.setProperty("--font-weight",
            "900");

        counter.appendChild(cell);
        this.appendChild(counter);

        const textarea = document.createElement("div");

        textarea.setAttribute("id",
            "ide-textarea");

        const syntax = document.createElement("div");

        syntax.setAttribute("id",
            "ide-syntax");

        const line = document.createElement("div");

        line.setAttribute("class",
            "ide-line");

        syntax.appendChild(line);
        textarea.appendChild(syntax);

        const area = document.createElement("div");

        area.setAttribute("tabindex",
            0);
        area.setAttribute("id",
            "ide-area");

        this.lineHeight = parseInt(window.getComputedStyle(area).getPropertyValue("line-height"));

        area.addEventListener("mouseup",
            (event) => {
                event.preventDefault();

                keyBindCommand(event);
            });

        area.addEventListener("focusout",
            async event => {
                area.classList.add("focusout");
            });

        area.addEventListener("focus",
            async event => {
                area.classList.remove("focusout");
            });

        area.addEventListener("keydown",
            event => {
                event.preventDefault();

                let allCaret = area.querySelectorAll("ide-caret"),

                    action   = keyBindCommand(event);

                if(!action) allCaret.forEach(caret => {
                    cleanContent(caret);
                    caret.insertAdjacentHTML("beforebegin",
                        event.key);
                });

                (async () => {
                    let allCaret = area.querySelectorAll("ide-caret");

                    allCaret.forEach(caret => {
                        clearSiblingCaret(caret);
                    });
                })();
            });

        textarea.appendChild(area);
        this.appendChild(textarea);
    }
}

customElements.define('ide-caret',
    Caret,
    {extends: "span"});
customElements.define('ide-area',
    IDE);