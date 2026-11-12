import { readFileSync } from "node:fs";
import { main } from "./src/main.js";
import { ui } from "./src/ui/terminal.js";

const { version } = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8"));

export async function showWelcome({ model, version: displayVersion = version } = {}) {
    await ui.welcome({ model, version: displayVersion });
    return main();
}

showWelcome().catch((error) => {
    ui.error(error.message);
    process.exit(1);
});
