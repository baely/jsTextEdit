const elementToObject = function(element) {
    if (element.jquery)
        element = element.get()[0];
    let children = [];
    for (let child of element.children) {
        children.push(elementToObject(child));
    }
    return {
        'tag': element.tagName,
        'text': element.textContent,
        'children': children,
    };
};

class Editor {
    _logo = {"type":"text","value":"PageIt"};
    // _styles = [
    //     {"action":"insertParagraph","display":"Normal","value":"p"},
    //     {"action":"formatBlock","argument":"h1","display":"Heading 1","value":"h1"},
    //     {"action":"formatBlock","argument":"h2","display":"Heading 2","value":"h2"},
    //     {"action":"formatBlock","argument":"h3","display":"Heading 3","value":"h3"}
    // ];
    // _tools = [
    //     {"action":"bold","display":"B"},
    //     {"action":"italic","display":"I"},
    //     {"action":"underline","display":"U"}
    // ];
    // _lists = [
    //     {"action":"insertUnorderedList","display":"*."},
    //     {"action":"insertOrderedList","display":"1."}
    // ]
    // _file = [
    //     {"action":"publish","display":"Publish"},
    //     {"action":"save","display":"Save"}
    // ];
    _tools = [
        {"name":"Styles","type":"dropdown","list":[
                {"action":"insertParagraph","display":"Normal","value":"p"},
                {"action":"formatBlock","argument":"h1","display":"Heading 1","value":"h1"},
                {"action":"formatBlock","argument":"h2","display":"Heading 2","value":"h2"},
                {"action":"formatBlock","argument":"h3","display":"Heading 3","value":"h3"}
            ]},
        {"name":"Fonts","type":"buttons","list":[
                {"action":"bold","display":"B"},
                {"action":"italic","display":"I"},
                {"action":"underline","display":"U"}
            ]},
        {"name":"Lists","type":"buttons","list":[
                {"action":"insertUnorderedList","display":"*."},
                {"action":"insertOrderedList","display":"1."}
            ]},
        {"name":"Files","type":"buttons","list":[
                {"action":"publish","display":"Publish"},
                {"action":"save","display":"Save"}
            ]},
    ];
    constructor(editor, page) {
        this._doc = document;
        this._editor = $(editor);
        this._page = page;
        this._pageId = null;
        this._published = false;

        this._loadToolBar();
        this._loadDocument();
        this._document.focus();
    }

    getContents() {
        return elementToObject(this._document.get()[0]);
    }

    _docExecComm(button) {
        const tag = button.tagName;

        const element = tag === "SELECT" ? $(button).find(":selected") : $(button);

        if (element.is("[data-value]"))
            this._doc.execCommand(element.attr("data-action"), false, element.attr("data-value"));
        else
            this._doc.execCommand(element.attr("data-action"), false);

    }

    _fileAction(action) {
        switch(action) {
            case "publish":
                this._page.publish();
                break;
            case "save":
                this._page.save();
                break;
            default:
                throw Error("Invalid file action");
        }
    }

    _toolbarButtonSection(sectionParent, tools) {
        const self = this;
        const section = $("<ul></ul>")
            .addClass("toolbar-section")
            .appendTo(sectionParent);
        for (let tool of tools) {
            const cont = $("<li></li>")
                .appendTo(section)
                .append($("<button></button>")
                    .addClass("toolbar-tool")
                    .attr("data-action",tool.action)
                    .attr("data-value",tool.value)
                    .click(function(){
                        self._docExecComm(this);
                    })
                    .text(tool.display));
        }
        return section;
    }

    _toolbarDropdownSection(sectionParent, defaultTitle, options) {
        const self = this;
        const sectionContainer = $("<div></div>")
            .addClass("toolbar-section")
            .appendTo(sectionParent);
        const section = $("<select></select>")
            .addClass("toolbar-tool")
            .change(function(){
                self._docExecComm(this);
                section.val(-1);
            })
            .appendTo(sectionContainer)
            .append($("<option>"+defaultTitle+"</option>").val(-1));
        for (let option of options) {
            const cont = $("<option></option>")
                .attr("data-action",option.action)
                .attr("data-value",option.value)
                .text(option.display)
                .appendTo(section);
        }
    }

    _loadToolBar() {
        const self = this;
        if (!this._toolbar) {
            this._toolbar = $("<div></div>")
                .addClass("toolbar")
                .appendTo(this._editor);
            $("<a></a>")
                .addClass("logo toolbar-section")
                .attr("href","/")
                .text(this._logo.value)
                .appendTo(this._toolbar);

            const self = this;

            this._tools.forEach(function(section) {
                console.log([section, self, this]);
                switch (section.type) {
                    case "dropdown":
                        self._toolbarDropdownSection(self._toolbar,section.name,section.list);
                        break;
                    case "buttons":
                        self._toolbarButtonSection(self._toolbar,section.list);
                        break;
                    default:
                        break;
                }
            });
        }
    }

    _loadDocument() {
        if (!this._document) {
            this._document = $("<div></div>")
                .addClass("document")
                .attr("contenteditable", "true")
                .appendTo(this._editor);
        }
    }

    _getStyle(style) {
        return this._styles.filter(_style => {return _style.value===style})[0];
    }
}
