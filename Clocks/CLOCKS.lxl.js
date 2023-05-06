// LiteLoader-AIDS automatic generated
/// <reference path="c:\Users\Administrator\Documents\aids/dts/HelperLib-master/src/index.d.ts"/> 

/********************#注册插件#********************/
const PLUHINS_NAME = "CLOCKS";
const PLUHINS_JS = "CLOCKS进服欢迎";
const PLUGINS_ZZ = "PPOUI";
const PLUGINS_VERSION = [2, 1, 0];
const PLUGINS_URL = "https://www.minebbs.com/resources/clocks-_.4804/";

ll.registerPlugin(
    /* name */ PLUHINS_NAME,
    /* introduction */ PLUHINS_JS,
    /* version */ PLUGINS_VERSION,
    /* otherInformation */ {
        "作者": PLUGINS_ZZ,
        "发布链接": PLUGINS_URL
    }
);
const Gm_tell = `§l§d[${PLUHINS_NAME}] §e`;
//设置日志头
logger.setTitle(`${PLUHINS_NAME}`);
logger.setConsole(true, 4);

/********************#配置文件#********************/
const _filePath = `.\\Plugins\\PPOUI\\${PLUHINS_NAME}\\`;
const Config = data.openConfig(_filePath + 'Config.json', 'json', JSON.stringify(
    { //0为关闭 1为开启
        "REG_COMMAND": 1,    //注册命令
        "PERMISSION_MODE": 1,    //权限模式 0为仅OP可用 1为插件管理可用
        "SUBTITLE_SWITCH": 1,    //副标题开关
        "REG_SET_COMMAND": 1,    //注册GUI设置命令
        "MAIN_TITLE_SWITCH": 1,        //主标题开关
        "CHAT_WELCOME_SWITCH": 1,    //聊天栏开关
        "RETURN_PROMPT_SWITCH": 1,     //返回提示开关
        "MAIN_TITLE_TEXT": "元旦快乐",     //主标题内容
        "SUBTITLE_TEXT": "祝您游玩愉快",    //副标题内容
        "CHAT_WELCOME_TEXT": "§l§d欢迎加入§exxx§d服务器 | 输入/clock获得钟表菜单",        //聊天栏内容
        "RETURN_PROMPT_TEXT": "§l§d[CLOCLS]§e获取钟成功！"    //返回提示内容
    }
));
const User = data.openConfig(_filePath + 'user.json', 'json', JSON.stringify({ "user": [] }));

function Conf_reload() {
    Config.reload();
    User.reload();
    logger.info('重载配置文件完成');
}

/********************#注册命令#********************/
{
    const Command = mc.newCommand('clock', '§l§e获§a取§d钟', PermType.Any);
    Command.setAlias('给爷钟');
    Command.setEnum('kx', ['set', 'reload']);
    Command.setEnum('bx', ['add', 'remove']);
    Command.optional('ac', ParamType.Enum, 'kx', 1);
    Command.mandatory('ac', ParamType.Enum, 'bx', 1);
    Command.mandatory('name', ParamType.RawText);
    Command.overload(['kx']);
    Command.overload(['bx', 'name']);
    Command.setCallback((_, ori, out, res) => {
        let tmp = User.get('user'); let plxuid;
        switch (res.ac) {
            case 'set':
                if (!ori.player) return out.error('Error!' + ori.player);
                if (Config.get('REG_SET_COMMAND') == 1) {
                    if (Config.get('PERMISSION_MODE') == 1) {
                        if (AUTHORITY_JUDGMENT(ori.player)) {
                            GUI(ori.player)
                        }
                    } else {
                        GUI(ori.player)
                    }
                } else {
                    out.error(`${Gm_tell}此功能已关闭`)
                }
                break;
            case 'add':
                if (ori.type !== 7) return out.error('请在控制台执行此命令');
                plxuid = data.name2xuid(res.name)
                if (tmp.indexOf(plxuid) == -1) {
                    if (plxuid == '') {
                        out.error('获取玩家' + res.name + '的XUID失败！')
                    } else {
                        colorLog('green', '玩家' + res.name + '已设置为管理员')
                        tmp.push(plxuid)
                        User.set('user', tmp)
                        Conf_reload()
                    }
                } else {
                    logger.warn('玩家' + res.name + '已是管理员！请勿重复添加')
                }
                break;
            case 'remove':
                if (ori.type !== 7) return out.error('请在控制台执行此命令');
                plxuid = data.name2xuid(res.name)
                if (tmp.indexOf(plxuid) == -1) {
                    logger.warn('获取玩家' + res.name + '的XUID失败！')
                } else {
                    tmp.splice(tmp.indexOf(plxuid), 1)
                    User.set('user', tmp)
                    colorLog('green', '成功移除管理员' + res.name)
                    Conf_reload()
                }
                break;
            case 'reload':
                if (ori.type !== 7) return out.error('请在控制台执行此命令');
                Conf_reload();
                out.success('完成');
                break;
            default:
                if (!ori.player) return out.error('Error!' + ori.player);
                if (Config.get('REG_COMMAND') == 1) {
                    Give_item(ori.player)
                } else {
                    out.error(`${Gm_tell}管理员已关闭此功能`)
                }
                break;
        }
    });
    Command.setup();
}

function AUTHORITY_JUDGMENT(pl) {
    let tmp = User.get('user')
    if (tmp.indexOf(pl.xuid) !== -1) {
        return true
    }
    else {
        pl.tell(Gm_tell + '无权限访问！')
        return false
    }
}

/********************#GUI#********************/
function GUI(pl) {
    const fm = mc.newSimpleForm()
        .setTitle(PLUHINS_NAME + ' 插件设置')
        .setContent('请选择一项操作')
        .addButton('功能管理', "textures/ui/settings_glyph_color_2x.png")
        .addButton('欢迎设置', "textures/ui/settings_glyph_color_2x.png")
        .addButton('热重载插件', "textures/ui/refresh_light.png")
        .addButton('重载配置文件', "textures/ui/refresh.png")
    pl.sendForm(fm, (player, id) => {
        switch (id) {
            case 0:
                const fm_1 = mc.newCustomForm();
                fm_1.setTitle(PLUHINS_NAME + ' 功能管理');
                fm_1.addSwitch('§l§a|§r§e注册命令\n§a关闭后将无法通过/clock获取钟', Boolean(Config.get('REG_COMMAND')).valueOf());
                fm_1.addSwitch('§l§a|§r§e注册设置命令\n§a关闭后将无法打开本设置页面', Boolean(Config.get('REG_SET_COMMAND')).valueOf());
                fm_1.addSwitch('§l§a|§r§e启用主标题\n§a关闭后将不再显示主标题', Boolean(Config.get('MAIN_TITLE_SWITCH')).valueOf());
                fm_1.addSwitch('§l§a|§r§e启用副标题\n§a关闭后将不再显示副标题', Boolean(Config.get('SUBTITLE_SWITCH')).valueOf());
                fm_1.addSwitch('§l§a|§r§e启用聊天欢迎\n§a关闭后聊天栏将不显示欢迎信息', Boolean(Config.get('CHAT_WELCOME_SWITCH')).valueOf());
                fm_1.addSwitch('§l§a|§r§e启用返回提示\n§a关闭后获取钟将不再显示提示', Boolean(Config.get('RETURN_PROMPT_SWITCH')).valueOf());
                fm_1.addSwitch('§l§a|§r§e权限判定模式\n§aOP(操作员) <=> 插件管理', Boolean(Config.get('PERMISSION_MODE')).valueOf());
                player.sendForm(fm_1, (player, data_1) => {
                    if (data_1 == null) { return }
                    Config.set('REG_COMMAND', data_1[0]);
                    Config.set('REG_SET_COMMAND', data_1[1]);
                    Config.set('MAIN_TITLE_SWITCH', data_1[2]);
                    Config.set('SUBTITLE_SWITCH', data_1[3]);
                    Config.set('CHAT_WELCOME_SWITCH', data_1[4]);
                    Config.set('RETURN_PROMPT_SWITCH', data_1[5]);
                    Config.set('PERMISSION_MODE', data_1[6]);
                    player.sendModalForm(PLUHINS_NAME, '设置完成，请选择一个操作', '返回上一级', '关闭表单', (pl, res_1) => {
                        switch (res_1) {
                            case true:
                                GUI(pl);
                                break;
                            default: return;
                        }
                    })
                })
                break;
            case 1:
                const fm_2 = mc.newCustomForm()
                fm_2.setTitle(PLUHINS_NAME + ' 欢迎设置');
                fm_2.addInput('主标题内容', 'str', Config.get('MAIN_TITLE_TEXT'));
                fm_2.addInput('副标题内容', 'str', Config.get('SUBTITLE_TEXT'));
                fm_2.addInput('聊天栏内容', 'str', Config.get('CHAT_WELCOME_TEXT'));
                fm_2.addInput('返回提示内容', 'str', Config.get('RETURN_PROMPT_TEXT'));
                player.sendForm(fm_2, (pl, data_2) => {
                    if (data_2 == null) { return }
                    Config.set('MAIN_TITLE_TEXT', data_2[0])
                    Config.set('SUBTITLE_TEXT', data_2[1])
                    Config.set('CHAT_WELCOME_TEXT', data_2[2])
                    Config.set('RETURN_PROMPT_TEXT', data_2[3])
                    pl.sendModalForm(PLUHINS_NAME, '设置完成，请选择一个操作', '返回上一级', '关闭表单', (pl, res_2) => {
                        switch (res_2) {
                            case true:
                                GUI(pl);
                                break;
                            default: return;
                        }
                    })
                })
                break;
            case 2:
                player.sendModalForm(PLUHINS_NAME + ' §c警告！', '§c警告，你正在进行热重载插件\n使用此功能前需确保未更改插件默认名称,如有更改导致重载失败和报错请自行解决\n如果重载后功能异常请删除配置文件重启服务器', '返回上一级', '我已确认风险 继续重载', (pl, res_3) => {
                    switch (res_3) {
                        case true:
                            GUI(pl)
                            break;
                        case false:
                            mc.runcmdEx('ll reload "CLOCKS.lxl.js"')
                            break;
                        default:
                            return;
                    }
                })
                break;
            case 3:
                Conf_reload();
                player.tell(`${Gm_tell}重载完成`);
                break;
            default:
                return;
        }
    })
}

/********************#核心#********************/
//监听进入服务器
mc.listen("onJoin", function (player) {
    //主标题
    if (Config.get('MAIN_TITLE_SWITCH') == 1) {
        player.setTitle(`${Config.get('MAIN_TITLE_TEXT')}`);
    } else {
        logger.debug('主标题已关闭，无法发送标题');
    }
    //副标题
    if (Config.get('SUBTITLE_SWITCH') == 1) {
        player.setTitle(`${Config.get('SUBTITLE_TEXT')}`, 3);
    } else {
        logger.debug('副标题已关闭，无法发送标题');
    }
    //聊天栏
    if (Config.get('CHAT_WELCOME_SWITCH') == 1) {
        player.tell(`${Config.get('CHAT_WELCOME_TEXT')}`);
    } else {
        logger.debug('聊天栏已关闭，无法发送聊天栏内容');
    }
})

//获取钟
function Give_item(pl) {
    mc.runcmdEx('give "' + pl.realName + '" clock');
    if (Config.get('RETURN_PROMPT_SWITCH') == 1) {//返回值
        pl.tell(`${Config.get('RETURN_PROMPT_TEXT')}`);
    } else {
        logger.debug('返回值已关闭，无法发送内容');
    }
}

/********************#输出日志#********************/
logger.info(`版本:${PLUGINS_VERSION}`)
logger.info(`§a作者：${PLUGINS_ZZ}`)
logger.info(`§a发布链接：${PLUGINS_URL}`)