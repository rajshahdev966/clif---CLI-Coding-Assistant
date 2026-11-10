

export function replaceOccurence(oldContent, index, oldText, newText) {
    if (index === -1) {
        return oldContent + newText;
    }

    if (!oldText) {
        throw new Error("oldText cannot be empty.");
    }

    const parts = oldContent.split(oldText);

    const totalMatches = parts.length - 1;

    if (
        !Number.isInteger(index) ||
        index < 0 ||
        index >= totalMatches
    ) {
        throw new Error(
            `Invalid index. Found ${totalMatches} occurrences.`
        );
    }

    let updatedContent = parts[0];

    for (let i = 1; i < parts.length; i++) {
        updatedContent +=
            (i - 1 === index ? newText : oldText) +
            parts[i];
    }

    return updatedContent;
}
