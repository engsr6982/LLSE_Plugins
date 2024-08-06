const pluginInformation = {
    name: "UMenu",
    introduce: "菜单插件",
    version: [1, 2, 0],
    author: "github/engsr6982  minebbs/Pengsr6982",
};

const Color = {
    /** 黑色 */
    black: "\x1b[30m",
    /** 红色 */
    red: "\x1b[31m",
    /** 绿色 */
    green: "\x1b[92m",
    /** 黄色 */
    yellow: "\x1b[33m",
    /** 蓝色 */
    blue: "\x1b[34m",
    /** 洋红色 */
    magenta: "\x1b[35m",
    /** 青色 */
    cyan: "\x1b[36m",
    /** 白色 */
    white: "\x1b[37m",
    /** 亮黑色 */
    brightBlack: "\x1b[90m",
    /** 亮红色 */
    brightRed: "\x1b[91m",
    /** 亮绿色 */
    // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values
    brightGreen: "\x1b[92m",
    /** 亮黄色 */
    brightYellow: "\x1b[93m",
    /** 亮蓝色 */
    brightBlue: "\x1b[94m",
    /** 亮洋红色 */
    brightMagenta: "\x1b[95m",
    /** 亮青色 */
    brightCyan: "\x1b[96m",
    /** 亮白色 */
    brightWhite: "\x1b[97m",
    /** 黑色背景 */
    bgBlack: "\x1b[40m",
    /** 红色背景 */
    bgRed: "\x1b[41m",
    /** 绿色背景 */
    bgGreen: "\x1b[42m",
    /** 黄色背景 */
    bgYellow: "\x1b[43m",
    /** 蓝色背景 */
    bgBlue: "\x1b[44m",
    /** 洋红色背景 */
    bgMagenta: "\x1b[45m",
    /** 青色背景 */
    bgCyan: "\x1b[46m",
    /** 白色背景 */
    bgWhite: "\x1b[47m",
    /** 粗体 */
    bold: "\x1b[1m",
    /** 下划线 */
    underline: "\x1b[4m",
    /** 重置 */
    reset: "\x1b[0m",
};

// =========================================================================== plugin start

let config: ConfigType = null;

class Utils {
    static isNumber(num: any): boolean {
        return !isNaN(parseFloat(num)) && isFinite(num);
    }
    static isFloat = (n: number): boolean => {
        return n % 1 !== 0;
    };
    static randomString = (len: number): string => {
        if (len <= 11) {
            return Math.random()
                .toString(36)
                .substring(2, 2 + len)
                .padEnd(len, "0");
        } else {
            return Utils.randomString(11) + Utils.randomString(len - 11);
        }
    };
    static randomArrayItem(arr: Array<string>) {
        return arr[Math.floor(Math.random() * arr.length)];
    }
    static hasKey(obj: object, key: string): boolean {
        return Object.prototype.hasOwnProperty.call(obj, key);
    }
    static getType(obj: any): `[object ${"String" | "Array" | "Object" | "Function"}]` {
        return Object.prototype.toString.call(obj);
    }
}

class VirtualEvent {
    private eventInst: string;

    constructor(event: string) {
        this.eventInst = event;
    }

    private static eventCall: {
        [key: string]: Array<{
            id: string;
            call: (...args: any) => boolean | void;
        }>;
    } = {};

    /**
     * 监听事件
     * @param event 事件名称
     * @param callback 回调函数
     * @returns 监听器ID
     */
    static on(event: string, callback: (...args: any) => boolean | void) {
        if (!Utils.hasKey(VirtualEvent.eventCall, event)) {
            VirtualEvent.eventCall[event] = [];
        }
        const random = Utils.randomString(8);
        VirtualEvent.eventCall[event].push({
            id: random,
            call: callback,
        });
        return random;
    }

    /**
     * 卸载一个事件监听器
     * @param event 事件名称
     * @param id 监听器ID
     * @returns 是否卸载成功
     */
    static off(event: string, id: string) {
        if (!Utils.hasKey(VirtualEvent.eventCall, event)) return false;
        if (VirtualEvent.eventCall[event].length === 0) return false;
        const index = VirtualEvent.eventCall[event].findIndex((i) => i.id === id);
        if (index === -1) return false;
        VirtualEvent.eventCall[event].splice(index, 1);
        return true;
    }

    /**
     * 触发事件（返回false代表拦截）
     * @param args 事件参数
     * @returns 是否拦截
     */
    emit(...args: any) {
        if (!Utils.hasKey(VirtualEvent.eventCall, this.eventInst)) return true; // 没有扩展监听此事件
        if (VirtualEvent.eventCall[this.eventInst].length === 0) return true;
        let isReturn = true; // 是否拦截
        for (const el of VirtualEvent.eventCall[this.eventInst]) {
            if (el.call(...args) === false) {
                isReturn = false;
                break; // 如果监听器返回false，则立即停止执行其他监听器
            }
        }
        return isReturn;
    }
}

class fileSystem {
    /*
    UMenu
        - extension     扩展文件夹
            cmd.js
        - eval          脚本文件夹
            eval.js
        - form          表单文件文件夹
            form1.json
        config.json     配置文件
    */
    private static pluginDir = `.\\plugins\\UMenu`;
    private static pluginformDir = `${this.pluginDir}\\form`;
    private static pluginEvalDir = `${this.pluginDir}\\Eval`;

    static initConfig() {
        const configPath = this.pluginDir + "\\config.json";
        if (!file.exists(configPath)) {
            file.writeTo(
                configPath,
                JSON.stringify(
                    {
                        entryFile: "main.json",
                        listen: {
                            enable: true,
                            listenItem: `minecraft:clock`,
                        },
                        command: {
                            command: "umenu",
                            describe: "",
                        },
                        money: {
                            enable: true,
                            moneyType: "llmoney",
                            scoreType: "",
                            moneyName: "金币",
                        },
                    },
                    null,
                    4,
                ),
            );
        }
        config = JSON.parse(file.readFrom(configPath));
        onConfigChange.emit(); // 触发事件
        return true;
    }
    static initDefaultEntry() {
        if (!file.exists(`${this.pluginformDir}\\${config.entryFile}`)) {
            file.writeTo(
                `${this.pluginformDir}\\${config.entryFile}`,
                JSON.stringify(
                    {
                        title: "UMenu表单模板",
                        content: ["你好 ${realName}", "玩家:${realName}"],
                        buttons: [
                            {
                                name: "cmd",
                                describe: "执行命令 消耗经济:#{money} ",
                                image: "textures/ui/color_plus",
                                money: 1,
                                permission: ["any", []],
                                type: "cmd",
                                run: "say 114514",
                            },
                            {
                                name: "Form",
                                describe: "一个普普通通按钮",
                                image: "",
                                money: 0,
                                permission: ["any", []],
                                type: "form",
                                run: "form1.json",
                            },
                            {
                                name: "Tell",
                                describe: "一个普普通通按钮",
                                image: "",
                                money: 0,
                                permission: ["any", []],
                                type: "tell",
                                run: "你好啊，陌生人",
                            },
                            {
                                name: "Eval",
                                describe: "一个普普通通按钮",
                                image: "",
                                money: 0,
                                permission: ["any", []],
                                type: "eval",
                                run: ".EvalTest.js",
                            },
                            {
                                name: "subform",
                                describe: "一个普普通通按钮",
                                image: "",
                                money: 0,
                                permission: ["any", []],
                                type: "subform",
                                run: {
                                    title: "",
                                    content: "${name}",
                                    buttons: [
                                        {
                                            name: "返回",
                                            describe: "#{name} ",
                                            image: "textures/ui/color_plus",
                                            money: 0,
                                            permission: ["any", []],
                                            type: "cmd",
                                            run: "umenu",
                                        },
                                    ],
                                },
                            },
                            {
                                name: "ModalForm",
                                describe: "一个普普通通按钮",
                                image: "",
                                money: 0,
                                permission: ["any", []],
                                type: "modalform",
                                run: {
                                    title: "UMenu 模式表单",
                                    content: "我是内容",
                                    button1: {
                                        name: "确认",
                                        money: 0,
                                        permission: ["any", []],
                                        type: "cmd",
                                        run: "msg @a 我点了确认",
                                    },
                                    button2: {
                                        name: "取消",
                                        money: 0,
                                        permission: ["any", []],
                                        type: "tell",
                                        run: "表单已放弃",
                                    },
                                },
                            },
                            {
                                name: "ContentForm",
                                describe: "一个普普通通按钮",
                                image: "",
                                money: 0,
                                permission: ["any", []],
                                type: "contentform",
                                run: {
                                    title: "UMenu ContentForm表单",
                                    content: "这是内容表单 玩家${name}",
                                    close: {
                                        money: 0,
                                        permission: ["any", []],
                                        type: "tell",
                                        run: "表单已放弃",
                                    },
                                    submit: {
                                        money: 0,
                                        permission: ["any", []],
                                        type: "tell",
                                        run: "表单提交成功",
                                    },
                                },
                            },
                            {
                                name: "Tag",
                                describe: "需要tag打开此功能",
                                image: "",
                                money: 0,
                                permission: ["any", []],
                                type: "tag",
                                run: {
                                    tag: "test",
                                    withtag: {
                                        type: "tell",
                                        run: "你拥有TAG：test",
                                    },
                                    notag: {
                                        type: "tell",
                                        run: "你没有TAG：test",
                                    },
                                },
                            },
                        ],
                    },
                    null,
                    4,
                ),
            );
        }
        return true;
    }

    static getEval(fileName: string): string {
        const readPath = `${this.pluginEvalDir}\\${fileName}`;
        if (!file.exists(readPath)) return null;
        return file.readFrom(readPath);
    }

    static getForm(fileName: string): FormJson | null {
        try {
            const readPath = `${this.pluginformDir}\\${fileName}`;
            if (!file.exists(readPath)) return null;
            return JSON.parse(file.readFrom(readPath));
        } catch (e) {
            logger.error(`${e}\n${e.stack}`);
        }
    }
}

class Extension {
    private static extPath = `.\\plugins\\UMenu\\Extension`;
    static extensions: Map<string, ExtensionExportInfo> = new Map();

    private static checkType(value: any, type: `[object ${"String" | "Array" | "Object" | "Function"}]`) {
        return Utils.getType(value) === type;
    }

    private static getExtensionPath(fileName: string) {
        return `${this.extPath}\\${fileName}`;
    }

    static loadExtension(fileName: string) {
        try {
            const extPath = this.getExtensionPath(fileName);
            if (!file.exists(extPath)) {
                throw new Error(`Unable to load the extension <${fileName}> because the file does not exist.`);
            }
            if (!fileName.endsWith(".js")) return false;

            // @ts-ignore
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const ext: ExtensionExportInfo = require(extPath);
            // 检查数据类型
            if (
                (this.checkType(ext, "[object Object]"),
                this.checkType(ext.name, "[object String]"),
                this.checkType(ext.introduce, "[object String]"),
                this.checkType(ext.version, "[object Array]"),
                this.checkType(ext.otherInformation, "[object Object]"),
                this.checkType(ext.type, "[object String]"),
                this.checkType(ext.entry, "[object Function]"))
            ) {
                // 检查重复加载
                if (this.extensions.has(ext.type) || this.extensions.has(ext.name)) {
                    throw new Error(`Extension [${fileName}] has been loaded`);
                }
                // 写入缓存
                ext.fileName = fileName;
                this.extensions.set(ext.type, ext);
                this.extensions.set(ext.name, ext);
                logger.info(`Loading extension [${fileName}] ${Color.green}succeeded${Color.reset}`);
                return true;
            } else throw new TypeError(`Extension data type error`);
        } catch (e) {
            logger.error(`Failed to load Extension: ${fileName}  Error: ${e}\n${e.stack}`);
            return false;
        }
    }

    static unloadExtension(name_or_type: string) {
        try {
            if (!this.extensions.has(name_or_type)) {
                throw new Error(`Extension [${name_or_type}] is not loaded`);
            }
            // 获取卸载必要参数
            const { name, type, fileName } = this.extensions.get(name_or_type);
            // 卸载扩展
            this.extensions.delete(type);
            this.extensions.delete(name);
            // @ts-ignore
            delete require.cache[this.getExtensionPath(fileName)]; // 清除require缓存
            logger.info(`Uninstalling extension [${name}] ${Color.green}succeeded${Color.reset}`);
            return true;
        } catch (e) {
            logger.error(`Failed to unload Extension: ${name_or_type}  Error: ${e}\n${e.stack}`);
            return false;
        }
    }

    static reloadExtension(name_or_type: string) {
        try {
            if (!this.extensions.has(name_or_type)) {
                throw new Error(`Extension [${name_or_type}] is not loaded`);
            }
            // 获取热重载必要参数
            const { fileName } = this.extensions.get(name_or_type);
            if (this.unloadExtension(name_or_type)) {
                return this.loadExtension(fileName);
            }
        } catch (e) {
            logger.error(`Failed to reload Extension: ${name_or_type}  Error: ${e}\n${e.stack}`);
            return false;
        }
    }

    static loadAll() {
        if (!file.exists(this.extPath)) {
            file.mkdir(this.extPath);
        }
        file.getFilesList(this.extPath).forEach((i) => {
            if (i.endsWith(".js")) {
                this.loadExtension(i);
            }
        });
        return true;
    }

    static unloadAll() {
        this.extensions.forEach((value, key) => {
            this.unloadExtension(key);
        });
        return true;
    }
}

class PdvSystem {
    private static regxButton = /#\{(\w+)\}/g;
    private static regxPdv = /\$\{(\w+)\}/g;

    static allPdvs: Map<string, any> = new Map();

    static set pdvs(newPdv: Array<[string, any]>) {
        this.allPdvs = new Map(newPdv);
    }

    static replStr(text: string, obj?: any) {
        return text.replace(this.regxPdv, (match, key) => {
            if (this.allPdvs.has(key)) {
                return typeof this.allPdvs.get(key) === "function" ? this.allPdvs.get(key)(obj) : this.allPdvs.get(key);
            }
            return match;
        });
    }

    static replButton(text: string, button: ButtonJson) {
        return text.replace(this.regxButton, (match, key: string) => {
            if (Utils.hasKey(button, key)) {
                // @ts-ignore
                return Utils.getType(button[key]) !== "[object Array]" && Utils.getType(button[key]) !== "[object Object]"
                    ? //@ts-ignore
                      String(button[key])
                    : match;
            }
            return match;
        });
    }
}

class UMenu {
    static sendMsg(player: Player, text: string) {
        return player.tell(`§e§l[§dUMenu§e]§r§a ` + text);
    }

    static main(player: Player, fJson: FormJson) {
        try {
            fJson = JSON.parse(PdvSystem.replStr(JSON.stringify(fJson), player)); // 直接替换全部变量
            const fm = mc.newSimpleForm();
            // 标题可选
            fm.setTitle(fJson.title || "UMenu default title");
            // 内容可选
            fm.setContent(
                Utils.hasKey(fJson, "content")
                    ? Utils.getType(fJson.content) === "[object String]"
                        ? <string>fJson.content
                        : <string>Utils.randomArrayItem(<Array<string>>fJson.content)
                    : "unknow content",
            );
            // 构建按钮
            fJson.buttons.forEach((bt) => {
                const nb: ButtonJson = JSON.parse(PdvSystem.replButton(JSON.stringify(bt), bt));
                // logger.warn(JSON.stringify(nb));
                fm.addButton(
                    `${Utils.hasKey(nb, "name") ? nb.name : ""}\n${Utils.hasKey(nb, "describe") ? nb.describe : ""}`,
                    Utils.hasKey(nb, "image") ? nb.image : undefined,
                );
            });
            player.sendForm(fm, (pl, id) => {
                if (id == null) return UMenu.sendMsg(player, "表单已放弃");
                // 触发事件
                if (onUMenuFormCallBack.emit(pl, fJson.buttons[id]) === true) {
                    UMenu.type(pl, fJson.buttons[id]);
                }
            });
        } catch (e) {
            logger.error(`Failed to send main form, beacuse ${e}\n${e.stack}`);
        }
    }

    static type = (player: Player, fButton: ButtonJson) => {
        const { type } = fButton;
        // 调用扩展
        if (Extension.extensions.has(type)) {
            const ext = Extension.extensions.get(type);
            ext.entry(player, fButton);
        } else {
            this.sendMsg(player, "未知错误，执行失败!");
            logger.error(`unknow type: ${type}`);
        }
    };
}

class GameApi {
    static initCommand() {
        const { command, describe } = config.command;
        const cmd = mc.newCommand(command || "umenu", describe || "§a§l--UMenu菜单系统", PermType.Any);
        // umenu reload
        cmd.setEnum("reloadc", ["reload"]);
        cmd.mandatory("ac", ParamType.Enum, "reloadc");
        cmd.overload(["reloadc"]);

        // 模块操作
        cmd.setEnum("extension", ["extension"]);
        cmd.mandatory("ac", ParamType.Enum, "extension");
        cmd.mandatory("name_type", ParamType.String); // 必选
        cmd.optional("name_type_", ParamType.String); // 可选

        // umenu extension reload <name_type>
        cmd.setEnum("reload", ["reload"]);
        cmd.mandatory("extension", ParamType.Enum, "reload");
        cmd.overload(["extension", "reload", "name_type_"]);

        // umenu extension load <fileName>
        cmd.setEnum("load", ["load"]);
        cmd.mandatory("extension", ParamType.Enum, "load");
        cmd.mandatory("fileName", ParamType.String);
        cmd.overload(["extension", "load", "fileName"]);

        // umenu extension unload <name_type>
        cmd.setEnum("unload", ["unload"]);
        cmd.mandatory("extension", ParamType.Enum, "unload");
        cmd.overload(["extension", "unload", "name_type"]);

        // umenu extension list [name_type]
        cmd.setEnum("list", ["list"]);
        cmd.mandatory("extension", ParamType.Enum, "list");
        cmd.overload(["extension", "list", "name_type_"]);

        cmd.overload([]);
        cmd.setCallback(
            (
                _,
                ori,
                out,
                res: {
                    ac: "extension" | "reload";
                    extension: "load" | "unload" | "reload" | "list";
                    fileName: string;
                    name_type: string;
                    name_type_: string;
                },
            ) => {
                logger.debug(JSON.stringify(res, null, 2));
                switch (res.ac) {
                    case "extension":
                        (function () {
                            if (ori.type !== 7) return out.error("Use this command from the console");
                            switch (res.extension) {
                                case "list":
                                    (function () {
                                        if (res.name_type_) {
                                            // list extension
                                            if (!Extension.extensions.has(res.name_type_))
                                                return logger.error(`${Color.bold}找不到扩展 <${res.name_type_}>!`);

                                            const ext = Extension.extensions.get(res.name_type_);
                                            logger.info(`扩展 <${res.name_type_}>`);
                                            // 遍历key
                                            Object.keys(ext).forEach((key) => {
                                                // @ts-ignore getType
                                                switch (Utils.getType(ext[key])) {
                                                    case "[object Function]":
                                                        break;
                                                    case "[object Object]":
                                                        // @ts-ignore extension[key] => object
                                                        Object.keys(ext[key]).forEach((key2) => {
                                                            // @ts-ignore if extension[key][key2] => object
                                                            logger.info(`- ${Color.bgBlue}${key2}${Color.reset} : ${ext[key][key2]}`);
                                                        });
                                                        break;
                                                    case "[object Array]":
                                                        logger.info(
                                                            // @ts-ignore
                                                            `- ${Color.bgBlue}${key}${Color.reset} : ${ext[key].join().replace(/,/g, ".")}`,
                                                        );
                                                        break;
                                                    default:
                                                        // @ts-ignore
                                                        logger.info(`- ${Color.bgBlue}${key}${Color.reset} : ${ext[key]}`);
                                                }
                                            });
                                        } else {
                                            // list all
                                            logger.info(`UMenu 扩展列表`);
                                            const isShow = new Map();
                                            let cout = 0;
                                            Extension.extensions.forEach((values) => {
                                                if (isShow.has(values.type)) return; // 避免打印两次
                                                isShow.set(values.type, true);
                                                cout++;
                                                // - Name  <Type> [v1.0.0] (fileName.js)
                                                //   introduce
                                                logger.info(
                                                    `- ${Color.brightBlue}${values.name}${Color.reset} ${Color.brightYellow}<${
                                                        values.type
                                                    }>${Color.reset}${Color.brightGreen} [v${values.version.join().replace(/,/g, ".")}] ${
                                                        Color.reset
                                                    }(${values.fileName})`,
                                                );
                                                logger.info(`  ${values.introduce}`);
                                            });
                                            logger.info(` `);
                                            logger.info(
                                                `* 共计[${cout}]个扩展 使用命令"${Color.bgBlue}${config.command.command} extension <type|name>${Color.reset}"来获取更多信息`,
                                            );
                                        }
                                    })();
                                    break;
                                case "load":
                                    Extension.loadExtension(res.fileName);
                                    break;
                                case "unload":
                                    Extension.unloadExtension(res.name_type);
                                    break;
                                case "reload":
                                    if (Extension.extensions.size == 0) return logger.error(`当前未加载任何扩展!`);
                                    if (res.name_type_) {
                                        Extension.reloadExtension(res.name_type_); // 重载指定扩展
                                    } else {
                                        Extension.unloadAll(); // 重载所有扩展
                                        Extension.loadAll();
                                    }
                                    break;
                            }
                        })();
                        break;
                    case "reload":
                        if (ori.type !== 7) return out.error("Use this command from the console");
                        fileSystem.initConfig();
                        out.success(`--[操作完成]--`);
                        break;
                    default:
                        if (ori.player == null) {
                            return out.error("Failed to get the player's object");
                        }
                        UMenu.main(ori.player, fileSystem.getForm(config.entryFile || "UMenu.json"));
                }
            },
        );
        cmd.setup();
    }

    static initEvent() {
        if (config.listen.enable) {
            const fd = new Map();
            mc.listen("onUseItemOn", (pl, it) => {
                if (!pl.isSimulatedPlayer()) {
                    if (it.type === config.listen.listenItem) {
                        const { realName } = pl;
                        if (!fd.has(realName)) {
                            fd.set(realName, true);
                            pl.runcmd(config.command.command || "umenu");
                            setTimeout(() => {
                                fd.delete(realName);
                            }, 500);
                        }
                    }
                }
            });
        }
    }
}

const onConfigChange = new VirtualEvent("onConfigChange");
const onUMenuFormCallBack = new VirtualEvent("onUMenuFormCallBack");

// ================================================================================ plugin end

// 初始化文件
fileSystem.initConfig();
fileSystem.initDefaultEntry();
file.mkdir(`.\\plugins\\UMenu\\eval`);
file.mkdir(`.\\plugins\\UMenu\\form`);

// 初始化预定变量系统
PdvSystem.pdvs = [
    ["name", (pl: Player) => pl.name],
    ["realName", (pl: Player) => pl.realName],
];

mc.listen("onServerStarted", () => {
    GameApi.initEvent(); // 初始化事件
    GameApi.initCommand(); // 注册命令
    globalThis["UMenuApi"] = {
        Utils: Utils,
        UMenu: UMenu,
        Color: Color,
        config: config,
        PdvSystem: PdvSystem,
        fileSystem: fileSystem,
        onEvent: VirtualEvent.on,
    };
    Extension.loadAll(); // 加载扩展
});

logger.info(`${Color.bgBlue}版本${Color.reset}: ${Color.green}${pluginInformation.version.join().replace(/\,\d$/, "").replace(/,/g, ".")}`);
logger.info(`作者: ${pluginInformation.author}`);
