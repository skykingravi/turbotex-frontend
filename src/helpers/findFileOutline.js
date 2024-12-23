export const findFileOutline = (document) => {
    const chapterRegex = /(?<!\\)\\chapter\*?\{(.*?)\}/g;
    const sectionRegex = /(?<!\\)\\section\*?\{(.*?)\}/g;
    const subSectionRegex = /(?<!\\)\\subsection\*?\{(.*?)\}/g;
    const subSubSectionRegex = /(?<!\\)\\subsubsection\*?\{(.*?)\}/g;
    const paragraphRegex = /(?<!\\)\\paragraph\*?\{(.*?)\}/g;
    const subParagraphRegex = /(?<!\\)\\subparagraph\*?\{(.*?)\}/g;

    function getLineNumber(text, index) {
        return text.substring(0, index).split("\n").length;
    }

    function getMatchesWithIndex(regex, label, level) {
        let matches = [];
        let match;
        while ((match = regex.exec(document)) !== null) {
            const lineNumber = getLineNumber(document, match.index);
            matches.push({
                type: label,
                text: match[1],
                level: level,
                index: match.index,
                line: lineNumber,
            });
        }
        return matches;
    }

    let allMatches = [
        ...getMatchesWithIndex(chapterRegex, "Chapter", 1),
        ...getMatchesWithIndex(sectionRegex, "Section", 2),
        ...getMatchesWithIndex(subSectionRegex, "Sub-section", 3),
        ...getMatchesWithIndex(subSubSectionRegex, "Sub-sub-section", 4),
        ...getMatchesWithIndex(paragraphRegex, "Paragraph", 5),
        ...getMatchesWithIndex(subParagraphRegex, "Sub-Paragraph", 6),
    ];

    allMatches.sort((a, b) => a.index - b.index);

    let hierarchy = [];
    let stack = [{ node: hierarchy, level: 0 }];

    function pushToHierarchy(match) {
        const newNode = [
            { text: match.text, line: Math.max(0, match.line - 1) },
            [],
        ];

        if (match.level > stack[stack.length - 1].level) {
            stack[stack.length - 1].node.push(newNode);
        } else {
            while (match.level <= stack[stack.length - 1].level) {
                stack.pop();
            }
            stack[stack.length - 1].node.push(newNode);
        }

        stack.push({ node: newNode[1], level: match.level });
    }

    for (const match of allMatches) {
        pushToHierarchy(match);
    }

    return hierarchy;
};
