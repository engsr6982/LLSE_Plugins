// 妈的，为什么之前不写注释，现在还要理解这坨答辩  太草了

const PLUGINS_NAME = "Server_Announcements";
const PLUGINS_JS = `${PLUGINS_NAME}服务器公告插件`;
// @ts-ignore
const PLUGINS_VERSION = [2, 2, 0, Version.Release] as readonly [number, number, number, Version];
// @ts-ignore
const PLUGINS_ZZ = "engsr6982";
// @ts-ignore
const PLUGINS_URL = "https://www.minebbs.com/resources/server_announcements.5218/";
ll.registerPlugin(
    /* name */ PLUGINS_NAME,
    /* introduction */ PLUGINS_JS,
    /* version */ PLUGINS_VERSION,
    /* otherInformation */ {
        作者: PLUGINS_ZZ,
        下载链接: PLUGINS_URL,
    },
);

// 配置文件
const Conf_Path = `.\\Plugins\\engsr6982\\${PLUGINS_NAME}\\`;
// @ts-ignore
const Config = data.openConfig(
    Conf_Path + "Config.json",
    "json",
    JSON.stringify({
        version: "2.1.0", //配置文件版本
        Command: {
            name: "sa", // 顶层命令
            alias: "公告", //命令别名
            description: "打开公告", //命令描述
        },
        NO_PROMPT_SWITCH: true, //不再提示开关
        LOADING_POP_UP_WINDOW: true, //进服弹出公告
        SWITCH_DEFAULT_STATE: false, //不再提示开关默认状态
        INSPECTION_MODE: 0, //公告变动检测 0为都检测 1为仅服务器启动时检测 2为玩家进服时检测
        FORM_TITLE: "公告", //表单标题
        PROMPT_CONTENT: "表单已放弃", //关闭表单时提示
        CONTENT: "欢迎加入服务器\nQQ群:123xxxxx", //公告内容
        CLOSED_PLAYERS: [], //存储关闭弹窗的玩家
        BACKUP: "",
    }),
);

// @ts-ignore
function Conf_reload() {
    Config.reload();
    // colorLog('green', '重载配置文件完成')
}

// @ts-ignore 注册命令
function regCommand() {
    const { name, alias, description } = Config.get("Command");
    const Command = mc.newCommand(name, description, PermType.Any);
    Command.setAlias(alias);
    Command.setEnum("mj", ["reload"]);
    Command.optional("re", ParamType.Enum, "mj");
    Command.overload(["re"]);
    Command.setCallback((_, ori, out, res) => {
        switch (res.re) {
            case "reload":
                if (ori.type !== 7) return out.error("此命令仅限控制台执行!");
                if (Config.get("INSPECTION_MODE") == 0 || Config.get("INSPECTION_MODE") == 1 || Config.get("INSPECTION_MODE") == 2) {
                    if (Config.get("BACKUP") == "") {
                        UPDATE_BACKUP();
                    } else {
                        if (Config.get("BACKUP") == Config.get("CONTENT")) {
                        } else {
                            logger.info("检测到公告变更，正在处理...");
                            UPDATE_BACKUP(true);
                        }
                    }
                }
                Conf_reload();
                out.success("操作完成");
                PROFILE_CHECK();
                break;
            default:
                if (!ori.player) {
                    return out.error("此命令仅限玩家执行！");
                }
                MainGUI(ori.player, 1);
                PROFILE_CHECK();
                break;
        }
    });
    Command.setup();
}

// 监听事件
{
    mc.listen("onJoin", (pl) => {
        if (Config.get("INSPECTION_MODE") == 0 || Config.get("INSPECTION_MODE") == 2) {
            if (Config.get("BACKUP") == "") {
                UPDATE_BACKUP();
            } else {
                if (Config.get("BACKUP") == Config.get("CONTENT")) {
                } else {
                    logger.info("检测到公告变更，正在处理...");
                    UPDATE_BACKUP(true);
                }
            }
        }
        if (Config.get("LOADING_POP_UP_WINDOW") == true) {
            if (qx(pl)) {
                MainGUI(pl);
            }
        }
        PROFILE_CHECK();
    });
    mc.listen("onServerStarted", () => {
        if (Config.get("INSPECTION_MODE") == 0 || Config.get("INSPECTION_MODE") == 1) {
            if (Config.get("BACKUP") == "") {
                UPDATE_BACKUP();
            } else {
                if (Config.get("BACKUP") == Config.get("CONTENT")) {
                } else {
                    logger.info("检测到公告变更，正在处理...");
                    UPDATE_BACKUP(true);
                }
            }
        }
        PROFILE_CHECK();
        regCommand();
    });
}

/**
 * 更新备份
 * @param {Boolean} ClearPlayer 是否清除玩家 默认false
 */
function UPDATE_BACKUP(ClearPlayer = false) {
    if (ClearPlayer) {
        // 清除保存的玩家
        const tmp = Config.get("CLOSED_PLAYERS");
        tmp.splice(tmp);
        Config.set("CLOSED_PLAYERS", tmp);
    }
    // 更新备份
    Config.set("BACKUP", Config.get("CONTENT"));
}

/**
 * 配置项检查
 */
function PROFILE_CHECK() {
    if (!RegExp(/[0-2]/g).test(Config.get("INSPECTION_MODE"))) {
        logger.error(
            `检测到配置项“检测模式(INSPECTION_MODE)”配置错误,允许值0,1,2,当前配置值:${Config.get(
                "INSPECTION_MODE",
            )}\n详细内容请前往MineBBS查看，链接:${PLUGINS_URL}`,
        );
    }
}

/**
 * 查询玩家
 * @param {Object} pl 玩家对象
 * @returns {boolean} 是否为非关闭玩家
 */
function qx(pl: Player) {
    const closedPlayers = Config.get("CLOSED_PLAYERS");
    return !closedPlayers.includes(pl.realName);
}
/**
 * 主界面
 * @param {Object} pl 玩家对象
 * @param {number} num 数字
 */
function MainGUI(pl: Player, num?: number) {
    const fm = mc.newCustomForm().setTitle(Config.get("FORM_TITLE")).addLabel(Config.get("CONTENT"));
    if (Config.get("NO_PROMPT_SWITCH")) {
        const isClosedPlayer = !qx(pl);
        const switchStatus = num === 1 ? isClosedPlayer : Config.get("SWITCH_DEFAULT_STATE");
        fm.addSwitch("不再弹出", switchStatus);
    }
    pl.sendForm(fm, (pl, dt) => {
        if (dt == null) {
            Close_Tell(pl);
            return;
        }
        logger.info(JSON.stringify(dt));
        if (Config.get("NO_PROMPT_SWITCH")) {
            const index = Number(dt[1]);
            const closedPlayers = Config.get("CLOSED_PLAYERS");
            if (index == 1) {
                if (!closedPlayers.includes(pl.realName)) {
                    closedPlayers.push(pl.realName);
                    Config.set("CLOSED_PLAYERS", closedPlayers);
                }
            } else {
                const playerIndex = closedPlayers.indexOf(pl.realName);
                if (playerIndex !== -1) {
                    closedPlayers.splice(playerIndex, 1);
                    Config.set("CLOSED_PLAYERS", closedPlayers);
                }
            }
        }
    });
}

// 关闭提示
const Gm_Tell = `§l§6[§e${PLUGINS_NAME}§6] §d`;
function Close_Tell(pl: Player) {
    pl.tell(Gm_Tell + Config.get("PROMPT_CONTENT"));
}
// 输出插件信息
colorLog("green", `插件版本: ${PLUGINS_VERSION}`);
colorLog("green", `插件作者: ${PLUGINS_ZZ}`);
