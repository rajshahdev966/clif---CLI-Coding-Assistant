// The original slash-and-cliff signature, enlarged beside the CLIFF wordmark.
const lettering = [
    " ██████╗██╗     ██╗███████╗███████╗",
    "██╔════╝██║     ██║██╔════╝██╔════╝",
    "██║     ██║     ██║█████╗  █████╗  ",
    "██║     ██║     ██║██╔══╝  ██╔══╝  ",
    "╚██████╗███████╗██║██║     ██║     ",
    " ╚═════╝╚══════╝╚═╝╚═╝     ╚═╝     "
];
const cliff = ["      /|", "     / |", "    /  |", "   /   |", "  /    |", " /_____| "];

export const WORDMARK = lettering.map((row, index) => `${cliff[index].padEnd(10)} ${row}`);
export const COMPACT_WORDMARK = [" /|  C L I F F", "/_|  THE EDGE IS YOURS."];

export function wordmarkRows(unicode) {
    if (unicode) return WORDMARK;
    return WORDMARK.map((row) => row.replaceAll("█", "#")
        .replace(/[╔╗╚╝]/g, "+").replaceAll("║", "|").replaceAll("═", "="));
}
