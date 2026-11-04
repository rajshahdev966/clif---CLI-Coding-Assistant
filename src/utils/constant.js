import os from "os"
import path from "path"

export const HOME_DIR = os.homedir();
export const CONFIG_DIR = path.join(HOME_DIR, ".clif")
export const SETTINGS_FILE_PATH = path.join(CONFIG_DIR, "settings.json")