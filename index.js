
import chalk from "chalk";
import os from "node:os";
import path from "node:path";
import { main } from "./src/main.js";

const logo = [
  " ██████╗██╗     ██╗███████╗███████╗",
  "██╔════╝██║     ██║██╔════╝██╔════╝",
  "██║     ██║     ██║█████╗  █████╗",
  "██║     ██║     ██║██╔══╝  ██╔══╝",
  "╚██████╗███████╗██║██║     ██║",
  " ╚═════╝╚══════╝╚═╝╚═╝     ╚═╝"
];

const shades = [
  "#DDD6FE", "#C4B5FD", "#A78BFA",
  "#8B5CF6", "#7C3AED", "#6D28D9"
];

const accent = chalk.hex("#A78BFA");
const muted = chalk.hex("#80899E");
const white = chalk.hex("#E5E7EB");

export function showWelcome({ model, version = "0.1.0" }) {
  const cwd = process.cwd();
  const home = os.homedir();

  const workspace = cwd === home
    ? "~"
    : cwd.startsWith(home + path.sep)
      ? "~" + cwd.slice(home.length)
      : cwd;

  console.log();

  logo.forEach((line, index) => {
    console.log(chalk.hex(shades[index])(line));
  });

  console.log(accent("              ━━━━━━━━━━━━━╮"));
  console.log(accent("                           ╰━━━━╮"));
  console.log(accent("                                ╰────"));

  console.log(
    `\n  ${chalk.bold("THE EDGE IS YOURS.")} ${muted(`v${version}`)}`
  );

  console.log(muted("\n  ──────────────────────────────────────"));

//   console.log(
//     `  ${muted("◈ Workspace")}  ${white(workspace)}`
//   );
//   console.log(
//     `  ${muted("◈ Model")}      ${white(model)}`
//   );
//   console.log(
//     `  ${muted("◈ Status")}     ${chalk.green("● Ready to build")}`
//   );

//   console.log(muted("\n  ──────────────────────────────────────"));
//   console.log(muted("  /help  /model  /clear  /exit"));


main()
}


showWelcome({ model: "gpt-4" });