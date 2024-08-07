import { pluginInformation } from "./GlobalVars.js";

/**待释放配置文件 */
export const __inits = {
    /**配置文件 */
    config: {
        /**自动上线 */ AutomaticOnline: true,
        /**假人无敌 */ InterceptDamage: true,
        /**自动复活 */ AutomaticResurrection: true,
        /**日志配置*/ CsvLogger: {
            /**输出目录*/ Output: ".\\logs\\FP\\",
            /**输出文件*/ FileName: "FP_%Y%-%M%-%D%.csv",
        },
        /**最大在线时间 */ MaxOnline: {
            Time: 30,
            Enable: false,
        },
    },
};

/**文件路径 */
export const _filePath = `.\\Plugins\\${pluginInformation.name}\\`;

/**配置文件 */
export let Config = __inits.config;

export class ConfigOperation {
    private static configPath = _filePath + "Config.json";

    /**
     * 检查所有文件
     */
    private static checkFile() {
        if (!file.exists(this.configPath)) {
            file.writeTo(this.configPath, JSON.stringify(__inits.config, null, "\t"));
        }
    }

    /**
     * 读取所有文件
     */
    static initConfig() {
        this.checkFile();
        try {
            Config = JSON.parse(file.readFrom(this.configPath));
        } catch (err) {
            logger.error(`${err}\n${err.stack}`);
        }
    }

    static setConfig(newConfig: { [key: string]: any }) {
        // @ts-ignore
        Config = newConfig;
        return this;
    }

    /**
     * 保存所有文件
     * @returns
     */
    static saveConfig() {
        try {
            file.writeTo(this.configPath, JSON.stringify(Config, null, 4));
            this.initConfig();
            return true;
        } catch (err) {
            logger.error(`${err}\n${err.stack}`);
            return false;
        }
    }
}
