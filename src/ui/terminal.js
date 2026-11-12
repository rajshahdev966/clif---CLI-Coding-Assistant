import { Chalk } from "chalk";
import { stripVTControlCharacters } from "node:util";
import os from "node:os";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { COMPACT_WORDMARK, wordmarkRows } from "./branding.js";

// Presentation only: no settings, tool decisions, or graph state.
export function createTerminalUI({ output = process.stdout, env = process.env } = {}) {
    const interactive = Boolean(output.isTTY) && env.TERM !== "dumb";
    const level = !interactive || "NO_COLOR" in env || env.FORCE_COLOR === "0" ? 0
        : env.COLORTERM === "truecolor" || env.COLORTERM === "24bit" || env.WT_SESSION ? 3
        : env.TERM?.includes("256color") ? 2 : 1;
    const color = new Chalk({ level });
    const unicode = interactive && env.CLIFF_ASCII !== "1" &&
        (process.platform !== "win32" || Boolean(env.WT_SESSION || env.TERM_PROGRAM));
    const glyph = unicode ? { edge: "›", line: "─", bar: "│", arrow: "›", ok: "✓" }
        : { edge: ">", line: "-", bar: "|", arrow: ">", ok: "+" };
    const accent = color.hex("#A78BFA");
    const ink = color.hex("#E5E7EB");
    const muted = color.hex("#80899E");
    let prompting = false;
    let promptTail = Promise.resolve();
    let stopAnimation = () => {};
    let arrived = false;
    let initializing = false;
    let ready = false;
    const pending = [];
    const clean = (value) => stripVTControlCharacters(String(value ?? ""))
        .replace(/[\x00-\x08\x0b-\x1f\x7f-\x9f]/g, "");
    const single = (value) => clean(value).replace(/[\r\n\t]/g, " ");
    const width = () => Math.max(12, Math.min(output.columns || 80, 100));
    const fit = (value, limit) => {
        const text = single(value);
        return text.length <= limit ? text : text.slice(0, Math.max(0, limit - 3)) + "...";
    };
    const line = (value = "") => {
        stopAnimation();
        if (prompting) pending.push(value);
        else output.write(`${value}\n`);
    };
    const rule = () => line(muted(`  ${"-".repeat(Math.max(1, width() - 4))}`));
    const label = (title, detail = "") => line(`  ${accent(glyph.edge)} ${ink.bold(single(title))}${detail ? muted(`  ${single(detail)}`) : ""}`);
    const notice = (symbol, paint, message) => line(`  ${paint(symbol)} ${ink(clean(message))}`);
    const hints = () => line(`  ${muted("/help")}  ${muted("/changeAPI")}  ${muted("/changeModel")}  ${muted("/exit")}`);

    function renderLine(raw, inCode) {
        if (inCode) return line(`    ${muted(glyph.bar)} ${ink(raw)}`);
        line(`    ${ink(raw.replace(/^#{1,6}\s+(.+)$/, (_, heading) => color.bold(heading))
            .replace(/\*\*([^*]+)\*\*/g, (_, value) => color.bold(value))
            .replace(/`([^`]+)`/g, (_, value) => accent(value)))}`);
    }

    return {
        async welcome({ version, model, cwd = process.cwd() } = {}) {
            arrived = true;
            line(); label("ARRIVAL"); line();
            const rows = wordmarkRows(unicode);
            const logoWidth = Math.max(...rows.map((row) => row.length));
            const fullWidth = logoWidth + 4;
            const wideWidth = logoWidth + 26;
            const wide = width() >= wideWidth;
            const full = width() >= fullWidth;
            const animated = full && interactive && !prompting && env.CLIFF_NO_ANIMATION !== "1";
            const frame = (reveal) => rows.map((row, index) => {
                const brand = reveal === null ? ink(row)
                    : accent(row.slice(0, reveal)) + muted(row.slice(reveal));
                const detail = wide && index === 3 ? `    ${ink.bold("THE EDGE IS YOURS.")}`
                    : wide && index === 5 ? `    ${muted(`CLIFF v${single(version || "dev")}`)}` : "";
                return `  ${brand}${detail}`;
            });
            if (full) {
                for (const row of frame(animated ? 0 : null)) line(row);
                if (animated) {
                    let cancelled = false;
                    const stop = () => { cancelled = true; if (stopAnimation === stop) stopAnimation = () => {}; };
                    stopAnimation = stop;
                    try {
                        // Only the logo's own rows are redrawn. Input and other output cancel it.
                        for (let step = 1; step <= 24; step++) {
                            await delay(65);
                            if (cancelled || width() < (wide ? wideWidth : fullWidth)) break;
                            const reveal = Math.ceil(logoWidth * step / 24);
                            output.write(`\x1b[${rows.length}A` + frame(reveal).map((row) => `\r\x1b[2K${row}\n`).join(""));
                        }
                    } finally { stop(); }
                }
            } else label("CLIFF", `v${single(version || "dev")}`);
            if (!wide) line(`  ${ink.bold("THE EDGE IS YOURS.")}${full ? muted(`  v${single(version || "dev")}`) : ""}`);
            line(); rule();
            const home = os.homedir();
            const workspace = cwd === home ? "~" : cwd.startsWith(home + path.sep) ? "~" + cwd.slice(home.length) : cwd;
            line(`  ${muted("workspace")}  ${ink(single(workspace))}`);
            if (model) line(`  ${muted("model")}      ${ink(single(model))}`);
            line();
        },
        ready(model) {
            ready = true;
            line(); rule(); label("READY"); line();
            const detail = `${single(path.basename(process.cwd()))}  /  ${single(model)}  /  ready`;
            if (unicode && width() >= 70) {
                COMPACT_WORDMARK.forEach((row, index) => line(`  ${accent(row)}${index === 1 ? `   ${ink(detail)}` : ""}`));
            } else line(`  ${accent.bold("CLIFF_| ")} ${ink(detail)}`);
            line(); hints(); line();
        },
        success(message) { notice(glyph.ok, color.green, message); },
        warn(message) { notice("!", color.yellow, message); },
        error(message) { notice("!", color.red, message); },
        goodbye() { line(); label("Session closed", "THE EDGE IS YOURS."); line(); },
        help() {
            line(); label("COMMANDS", "Your next move"); rule();
            for (const [command, description] of [["/help", "Show this guide"], ["/changeAPI", "Update your Groq API key"], ["/changeModel", "Choose an AI model"], ["/exit", "Close CLIFF"]]) {
                line(`    ${accent(command.padEnd(15))} ${ink(description)}`);
            }
            line(); line(muted("  Ask naturally to read, list, create, or edit files."));
            line(muted("  File changes show a diff and ask for your approval.")); line();
        },
        models(models, current) {
            line(); label("MODEL", "Choose your model / enter its number"); rule();
            models.forEach((model, index) => {
                line(`  ${accent(String(index + 1).padStart(2))}  ${ink.bold(single(model.id))}${model.id === current ? accent("  [current]") : ""}`);
                line(muted(`      ${single(model.owned_by)}`));
            }); line();
        },
        // Keep one readline owner. Background receipts wait until input finishes.
        question(rl, kind = "task") {
            const labels = { task: "Describe your next change", api: "Groq API key", model: "Model number", approval: "Apply edit? y / N" };
            const ask = async () => {
                stopAnimation();
                if (kind === "task") { rule(); line(); }
                prompting = true;
                try { return await rl.question(`  ${accent(glyph.arrow)} ${ink(labels[kind] || single(kind))}${muted(": ")}`); }
                finally {
                    prompting = false;
                    for (const message of pending.splice(0)) line(message);
                }
            };
            const answer = promptTail.then(ask);
            promptTail = answer.catch(() => {});
            return answer;
        },
        async activity(message, operation) {
            if (arrived && !ready && !initializing) {
                initializing = true;
                label("INITIALIZING"); line();
            }
            notice(glyph.edge, accent, message);
            let stop = () => {};
            if (interactive && !prompting && env.CLIFF_NO_ANIMATION !== "1") {
                let frame = 0;
                let timer;
                stop = () => {
                    if (!timer) return;
                    clearInterval(timer); timer = undefined;
                    output.write("\r\x1b[2K");
                    if (stopAnimation === stop) stopAnimation = () => {};
                };
                stopAnimation = stop;
                const render = () => {
                    const cells = Math.min(18, Math.max(4, width() - 8));
                    const position = frame++ % (cells + 4);
                    const rail = Array.from({ length: cells }, (_, index) =>
                        index === position ? ">" : index < position && index >= position - 4 ? "=" : " "
                    ).join("");
                    output.write(`\r${accent(`  [${rail}]`)} ${muted(fit("working", Math.max(0, width() - cells - 8)))}`);
                };
                render();
                timer = setInterval(() => {
                    render();
                }, 90);
                timer.unref?.();
            }
            try { return await operation(); }
            finally { stop(); }
        },
        response() {
            let started = false, receivedTokens = false, code = false;
            let buffer = "";
            const begin = () => { if (!started) { line(); label("CLIFF"); line(); started = true; } };
            const emit = (raw) => {
                const text = clean(raw);
                if (text.trimStart().startsWith("```")) {
                    code = !code;
                    line(muted(`  ${glyph.bar} ${code ? text.trim().slice(3) || "code" : ""}`));
                } else renderLine(text, code);
            };
            return {
                token(token) {
                    if (!token) return;
                    receivedTokens = true; begin(); buffer += token;
                    let boundary;
                    while ((boundary = buffer.indexOf("\n")) !== -1) {
                        emit(buffer.slice(0, boundary)); buffer = buffer.slice(boundary + 1);
                    }
                },
                finish(text = "") {
                    if (receivedTokens) { if (buffer) emit(buffer); buffer = ""; }
                    else if (text) { begin(); for (const raw of String(text).split("\n")) emit(raw); }
                    if (started) line();
                }
            };
        },
        toolCalls(calls = []) {
            for (const call of calls) {
                const directPaths = Array.isArray(call?.args?.paths)
                    ? call.args.paths.filter((item) => typeof item === "string")
                    : [];
                const filePaths = Array.isArray(call?.args?.files)
                    ? call.args.files
                        .filter((item) => item && typeof item.path === "string")
                        .map((item) => item.path)
                    : [];
                const paths = directPaths.length ? directPaths : filePaths;
                const requestedName = call?.name;
                const name = { readFiles: "READ", listFiles: "LIST", createNewFile: "WRITE", editFile: "EDIT" }[requestedName] || requestedName;
                const target = paths.length ? ` ${ink(paths.map(single).join(", "))}` : "";
                line(`    ${muted(glyph.bar)} ${accent(single(name || "tool").padEnd(6))}${target} ${muted("/ requested")}`);
            }
        },
        toolResults(name, results) {
            for (const result of results) {
                const ok = result.status === "success";
                const detail = result.error || result.message;
                line(`    ${muted(glyph.bar)} ${(ok ? color.green : accent)(ok ? glyph.ok : "!")} ${accent(single(name).toUpperCase().padEnd(6))} ${ink(single(result.path))}  ${muted(`/ ${single(result.status)}`)}${detail ? ink(`: ${single(detail)}`) : ""}`);
            }
        },
        diff(filePath, patch) {
            line(); rule(); label("REVIEW CHANGE", path.relative(process.cwd(), filePath) || filePath); line();
            let added = 0, removed = 0;
            let oldLine = 0, newLine = 0, inHunk = false;
            for (const raw of clean(patch).split("\n")) {
                const hunk = raw.match(/^@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
                if (hunk) {
                    oldLine = Number(hunk[1]); newLine = Number(hunk[2]); inHunk = true;
                    line(`    ${muted(raw)}`);
                    continue;
                }
                if (!inHunk) continue;
                let paint = ink, number = "";
                if (raw.startsWith("+")) { paint = color.green; number = String(newLine++); added++; }
                else if (raw.startsWith("-")) { paint = color.red; number = String(oldLine++); removed++; }
                else if (raw.startsWith(" ")) { number = String(newLine++); oldLine++; }
                else { if (raw) line(`         ${muted(raw)}`); continue; }
                line(`  ${muted(number.padStart(4))} ${muted(glyph.bar)} ${paint(raw)}`);
            }
            line(); line(`  ${color.green(`+${added}`)} ${color.red(`-${removed}`)} ${muted("/ Only y approves. Any other answer declines.")}`); rule(); line();
        }
    };
}

export const ui = createTerminalUI();
