import JSONChecker from "../modules/JSONChecker.js";
import { Config, ConfigOperation, __inits } from "../utils/config.js";

export async function CheckConfigFile() {
    try {
        const j = new JSONChecker(__inits.config, Config, true);

        j.removeExtraProperties();
        const f = await j.removeExtraProperties();

        return ConfigOperation.setConfig(f).saveConfig();
    } catch (e) {
        return false;
    }
}
