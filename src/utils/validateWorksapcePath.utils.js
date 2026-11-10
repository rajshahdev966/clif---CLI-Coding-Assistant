import { path } from "path"

export default async function validateWorkspacePath(userRelativePath) {
    if (
        typeof userRelativePath !== "string" ||
        !userRelativePath.trim() ||
        path.isAbsolute(userRelativePath)
    ) {
        return false;
    }

    const fullPath = path.resolve(process.cwd(), userRelativePath);

    const relativePath = path.relative(process.cwd(), fullPath);

    if (
        relativePath === ".." ||
        relativePath.startsWith(`..${path.sep}`) ||
        path.isAbsolute(relativePath)
    ) {
        return false
    }
    return true
}