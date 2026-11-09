import { createPatch } from 'diff';

export function diffPatch(filePath, oldText, newText) {
    if (typeof filePath !== "string" || typeof oldText !== "string" || typeof newText !== "string") {
        throw new Error("Invalid file path or old text version or new text version");
    }

    const patch = createPatch(
        filePath,
        oldText,
        newText
    )

    return patch;
}
