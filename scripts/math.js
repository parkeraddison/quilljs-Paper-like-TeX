/*
Alright here are some thoughts before I go to bed:

1. I really should move all of the TeX stuff (rendering/derendering) into the
same class.

2. I should not be calling my "init" function (which adds a selection listener)
for all existing MathBlots) every time I render a math blot.  These linger
around forever, and it leads to multiple triggers every single time there's a
selection change... not good practices.  Who knows, maybe this could help fix
the quill.off fiasco?

3. I realized that if I add content to a math blot while editing it, then the
right bound of the selection range is no longer in the same position!  An idea
I had is to convert the dollar signs (begin and end tokens) to blots so that I
can track their position using blot.offset()... but that might not be necessary

4. I should commit this work to a repository before I go ahead with major
changes which are likely to break things for a while!
*/

/*
I can use quill.getLine(range.index) to give me just a line to check for Math,
formatting, etc instead of the entire document.

Maybe I can even use quill.getLeaf(range.index) but I'm not yet sure what a
Leaf blot is!
*/




const Embed = Quill.import("blots/embed");


/*
Important to note:

```
mathelem = document.querySelector(".ql-math");
mathblot = Quill.find(mathelem);
mathblot.offset();
```

The offset is updated properly and return the correct value of the index of
the beginning of the blot!

On selection change, I can check if the selection is at that offset + 1
*/


/*
Alright, here's an idea:

When math is closed, insert a zero-width space after the embed.
This fixes the issue of the cursor not wanting to focus following an embed
at the end of the editor.

Now, when I want to see if I should expand math back into editable latex, I
can check if the cursor is immediately preceding the zero-width space.

This means that every math embed should have a render and de-render method.
*/

const mathSymbol = '\u200b';

class MathEmbed extends Embed {
    static create(value, displayMode = false) {
        let node = super.create(value);
        if (typeof value === 'string') {
            window.katex.render(value, node, {
                throwOnError: false,
                errorColor: '#f00',
                displayMode: displayMode,
            });
            node.setAttribute('data-value', value);
        }

        console.log(node);

        return node;
    }

    static derender(domNode) {
        return 
    }

    static value(domNode) {
        return domNode.getAttribute('data-value');
    }
}
MathEmbed.blotName = 'math';
MathEmbed.className = 'ql-math';
MathEmbed.tagName = 'SPAN';

class MathModule {

    constructor(quill, options) {

        this.quill = quill;
        this.options = options;
        this.container = document.querySelector(options.container);

        if (window.katex == null) {
            throw new Error('Formula module requires KaTeX.');
        }

        quill.on("text-change", this.checkMath.bind(this));

        // NOTE: LookBehinds are not yet fully supported :(
        // That being said, I also realized that I *do* want to escape the first
        // dollar sign, since I don't want to be prevented from using that symbol
        // in my normal writing!
        //
        // Lazy matches a pair of single dollar signs such that:
        // - Neither dollar sign is escaped (preceeded by a backslash)
        // - The first dollar sign is not followed by another dollar sign
        // - There's at least a single character inside the pair
        // const inlineMathPattern = /(?<![\\$])\$(?!\$).+?(?<![\\$])\$/;

        this.specialChar = '|';
        let special = this.specialChar.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        // Lazy matches a pair of single dollar signs such that:
        // - The first dollar sign is preceded by a special char
        // - The first dollar sign is not followed by another dollar sign
        // - There's at least a single character inside the pair
        // - There are no existing formulas (denoted by a special symbol) between the pair
        // - The last dollar sign is not escaped (preceded by a backslash)
        // - Captures the content between the pair
        this.inlineMathPattern = new RegExp(String.raw`${special}\${1}(?!\$)([^${mathSymbol}]+?[^\\])\${1}`, 'g');

        // Lazy matches a pair of double dollar signs similar to above.
        this.displayMathPattern = new RegExp(String.raw`${special}\${2}(?!\$)([^${mathSymbol}]+?[^\\])\${2}`, 'g');
    }

    renderHelper() {
        let text = getTextWithMath(this.quill);

        let inlineMatches = text.matchAll(this.inlineMathPattern);
        let displayMatches = text.matchAll(this.displayMathPattern);

        for (let match of inlineMatches) {
            this.renderMath(match, false);
        }
        for (let match of displayMatches) {
            this.renderMath(match, true);
        }
    }

    checkMath(delta, oldDelta, source) {

        if (source != "user") {
            return;
        }

        let insertedText = delta.ops[delta.ops.length - 1]["insert"];

        if (insertedText
            && typeof insertedText === "string"
            && (insertedText.includes('$') || insertedText.includes(this.specialChar))
        ) {
            this.renderHelper();
        } else {
            return;
        }

    }

    renderMath(match, display = False) {

        let embed = MathEmbed.create(match[1], display);

        this.quill.deleteText(match.index, match[0].length);
        this.quill.insertEmbed(match.index, embed, MathEmbed.value(embed));
        this.quill.insertText(match.index + 1, mathSymbol);

        this.quill.setSelection(match.index + 2, 0);
    }
}

/**
 * Inserts a symbol in place of MathEmbed in quill.getText so that indices will
 * stay correct.
 */
const getTextWithMath = function (quill) {

    return quill.getContents().filter(function (op) {
        return typeof op.insert === 'string' || op.insert.math;
    }).map(function (op) {
        if (op.insert.math) {
            return mathSymbol;
        }
        return op.insert;
    }).join('');
};

module.exports = { MathEmbed, MathModule };