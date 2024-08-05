const pluginInfo = {
    name: "UMenu Edit",
    version: [1, 0, 0, Version.Release] as readonly [number, number, number, Version],
    author: "engsr6982",
};

// ================================================================================ copy modules

// copy LSE-Modules to this
type callback_ = (player: Player) => any;
class Button {
    constructor(text: string, callback: callback_, image: string) {
        this.text = text;
        this.callback = callback;
        this.image = image;
    }

    text: string;
    callback: callback_;
    image: string;
}
class SimpleForms {
    /**
     * 创建SimpleForms
     * @param title 表单标题
     */
    constructor(title: string) {
        this.fm = mc.newSimpleForm();
        this.fm.setTitle(title);
        this.buttons = [];
    }

    private fm: SimpleForm;
    private buttons: Array<Button>;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private formClose(player?: Player) {}

    /**
     * 设置表单内容
     */
    set content(text: string) {
        this.fm.setContent(text);
    }

    /**
     * 表单关闭回调
     */
    set close(callback: callback_) {
        this.formClose = callback;
    }

    /**
     * 添加一个按钮
     * @param text 按钮文本
     * @param callback 回调
     * @param image 按钮图片
     */
    addButton(text: string, callback: callback_, image?: string) {
        this.fm.addButton(text, image || "");
        this.buttons.push(new Button(text, callback, image));
    }

    private runCallBack() {
        const formClose = this.formClose,
            buttons = this.buttons;
        // 下边匿名函数，不要用this
        // 如果使用this，将会导致BDS直接崩溃
        return (player: Player, id: number) => {
            if (id == null) {
                formClose(player);
            } else {
                buttons[id].callback(player);
            }
        };
    }

    /**
     * 发送表单
     * @param player 玩家
     * @returns 返回值
     */
    send(player: Player) {
        return player.sendForm(this.fm, this.runCallBack());
    }
}
class SimpleForm_Back extends SimpleForms {
    private img: string = "textures/ui/icon_import";
    private back: callback_;
    private position: "top" | "bottom";

    private initBackButton() {
        super.addButton("返回上一页", this.back, this.img);
    }

    /**
     * 带有 上一页 按钮的 SimpleForms
     * @param title 标题
     * @param back 上一页函数
     * @param position 位置
     */
    constructor(title: string, back: callback_, position: "top" | "bottom") {
        super(title);
        this.back = back;
        this.position = position;

        if (position === "top") {
            this.initBackButton();
        }
    }

    /**
     * 发送表单
     * @param player 玩家
     * @returns 返回
     */
    send(player: Player): number {
        if (this.position === "bottom") {
            this.initBackButton();
        }
        return super.send(player);
    }
}
// copy LSE-TPSystem to this
class ModalForms {
    constructor(title: string = pluginInfo.name, content: string = "") {
        this.title = title;
        this.content = content;
    }

    private title: string;
    private content: string;

    private text_0: string = "";
    private text_1: string = "";

    private call_0: () => void;
    private call_1: () => void;
    private call_2: () => void;

    setButton_0_call(text: string, call: () => void) {
        this.text_0 = text;
        this.call_0 = call;
    }
    setButton_1_call(text: string, call: () => void) {
        this.text_1 = text;
        this.call_1 = call;
    }
    setDefault_call(call: () => void) {
        this.call_2 = call;
    }

    send(player: Player) {
        player.sendModalForm(this.title, this.content, this.text_0, this.text_1, (player, res) => {
            switch (res) {
                case true:
                    return this.call_0();
                case false:
                    return this.call_1();
                default:
                    return this.call_2();
            }
        });
    }
}

// ================================================================================ plugin start

const formPath = `.\\plugins\\UMenu\\form`;
const types: { [key: number]: "cmd" | "form" | "tell" | "eval" | "modalform" | "contentform" | "subform" | "tag" } = {
    0: "cmd",
    1: "tag",
    2: "form",
    3: "tell",
    4: "eval",
    // 5: "subform",
    // 6: "modalform",
    // 7: "contentform",
};
enum types_e {
    cmd,
    tag,
    form,
    tell,
    eval,
    // subform,
    // modalform,
    // contentform,
}

/**正在编辑的表单文件对象 未编辑时为null */
let fileCache: FormJson = null;
/**正在编辑的表单文件名  未编辑时为null */
let fileName: string = null;

/**
 * 主入口
 * @param player
 */
function main(player: Player) {
    // 仅支持单文件编辑  防止覆盖
    if (fileCache !== null || fileName !== null) {
        const mf = new ModalForms(undefined, "检测到有未保存的更改，是否继续编辑");
        mf.setButton_0_call("继续并跳转到编辑页", () => {
            EditFormCache(player);
        });
        mf.setButton_1_call("放弃更改", () => {
            fileCache = null;
            fileName = null;
            main(player);
        });
        mf.send(player);
    } else {
        SelectFormFileLoadToFileCache(player);
    }
}

/**
 * 选择要编辑的文件
 * @param player
 */
function SelectFormFileLoadToFileCache(player: Player) {
    const allFormFile = file.getFilesList(formPath).filter((i) => i.endsWith(".json"));
    const f = new SimpleForms(pluginInfo.name);
    f.content = "选择一个文件进行编辑";
    f.addButton("新建子菜单", (pl) => {
        NewFormFile(pl);
    });
    f.addButton("删除子菜单", (pl) => {
        DeleteFormFile(pl, allFormFile);
    });
    let i = 0;
    while (i < allFormFile.length) {
        const el = allFormFile[i++];
        f.addButton(el, (pl) => {
            fileName = el;
            fileCache = JSON.parse(file.readFrom(`${formPath}\\${el}`));
            EditFormCache(pl);
        });
    }
    f.send(player);
}

/**
 * 新建菜单文件
 * @param player 玩家对象
 * @param default_Text 输入框默认存在内容
 */
function NewFormFile(player: Player, default_Text = "") {
    const fm = mc.newCustomForm();
    fm.setTitle(pluginInfo.name + "创建子表单");
    fm.addInput(`请输入文件名\n注意：不要加后缀.json,\n文件名不能包含 \\/:*?"<>|`, "String", default_Text);
    player.sendForm(fm, (pl, dt) => {
        if (dt == null) return;
        if (dt[0] == "") return;
        const write = file.writeTo(
            `${formPath}\\${dt[0]}.json`,
            JSON.stringify({
                title: "",
                content: [],
                buttons: [],
            }),
        );
        !write ? NewFormFile(pl, dt[0]) : main(pl);
    });
}

/**
 * 删除菜单文件
 * @param player
 * @param allFormFile
 */
function DeleteFormFile(player: Player, allFormFile: Array<string>) {
    const f = new SimpleForm_Back(pluginInfo.name, (pl) => main(pl), "top");
    f.content = "选择要删除的菜单文件";

    allFormFile.forEach((el) => {
        f.addButton(el, (pl) => {
            file.delete(`${formPath}\\${el}`);
            main(pl);
        });
    });

    f.send(player);
}

/**
 * 编辑单行字符串文本
 * @param player 玩家对象
 * @param describe 输入框描述
 * @param defaultContent 输入框默认内容
 * @param callback 回调修改后的字符串
 */
function EditStringText(player: Player, describe: string = "", defaultContent: string = "", callback: (newText: string) => any) {
    const fm = mc.newCustomForm();
    fm.setTitle(pluginInfo.name);
    fm.addInput(describe, "String", defaultContent);
    player.sendForm(fm, (pl, dt) => {
        if (dt == null) return;
        callback(dt[0]);
    });
}

// utils
// function getType(obj: any): `[object ${"Object"}]` {
//     return Object.prototype.toString.call(obj);
// }
function hasKey(obj: object, key: string): boolean {
    return Object.prototype.hasOwnProperty.call(obj, key);
}

/**
 * 编辑菜单
 * @param player 玩家对象
 */
function EditFormCache(player: Player) {
    const f = new SimpleForms(pluginInfo.name);
    f.content = "选择一个要编辑的配置";

    f.addButton("编辑标题", (pl) => {
        EditStringText(pl, "输入新标题", fileCache.title || "", (newTitle) => {
            fileCache.title = newTitle;
            EditFormCache(pl);
        });
    });
    f.addButton("编辑内容", (pl) => {
        EditStringText(
            pl,
            "编辑内容\n符号 #&# 分隔每一行\n符号 \\n 使文本换行",
            Array.isArray(fileCache.content) ? fileCache.content.join("#&#") : fileCache.content || "",
            (dt) => {
                fileCache.content = dt.split("#&#");
                EditFormCache(pl);
            },
        );
    });
    f.addButton("编辑按钮", (pl) => {
        SelectButton(pl);
    });
    f.addButton("保存更改", (pl) => {
        file.writeTo(`${formPath}\\${fileName}`, JSON.stringify(fileCache, null, 4));
        fileCache = null;
        fileName = null;
        pl.tell("保存成功");
    });
    f.addButton("§c放弃更改", (pl) => {
        fileCache = null;
        fileName = null;
        pl.tell("已放弃编辑");
    });
    f.send(player);
}

function moveElement(arr: Array<any>, index: number, direction: "up" | "down") {
    if (index < 0 || index >= arr.length) {
        return false;
    }
    if (direction === "up" && index > 0) {
        const element = arr.splice(index, 1)[0];
        arr.splice(index - 1, 0, element);
        return true;
    } else if (direction === "down" && index < arr.length - 1) {
        const element = arr.splice(index, 1)[0];
        arr.splice(index + 1, 0, element);
        return true;
    } else {
        return false;
    }
}

function sendErrorPop(player: Player, error: string, back: () => any) {
    const mf = new ModalForms(`[${pluginInfo.name}] Error:`, error);
    mf.setButton_0_call("返回页面", () => {
        back();
    });
    mf.setButton_1_call("关闭页面", () => {});
    mf.send(player);
}

/**
 * 选择要编辑的按钮
 * @param player
 */
function SelectButton(player: Player) {
    const fm = new SimpleForm_Back(pluginInfo.name, (pl) => EditFormCache(pl), "top");
    fm.content = "选择(创建)并编辑按钮";

    fm.addButton("新建按钮(末尾)", (pl) => {
        fileCache.buttons.push({
            name: "未定义按钮",
            describe: "",
            image: "",
            money: 0,
            permission: ["any", []],
            type: "cmd",
            run: "",
        });
        SelectButton(pl);
    });

    if (!hasKey(fileCache, "buttons") || !Array.isArray(fileCache.buttons)) {
        fileCache.buttons = [];
    }

    let i = 0;
    while (i < fileCache.buttons.length) {
        const el_Index = i++;
        const el = fileCache.buttons[el_Index];
        fm.addButton(el.name, (pl) => {
            const sf = new SimpleForm_Back(pluginInfo.name, (pl1) => SelectButton(pl1), "bottom");
            sf.content = "选择操作类型";
            sf.addButton("上移一位", (pl1) => {
                if (!moveElement(fileCache.buttons, el_Index, "up")) {
                    sendErrorPop(pl1, "Error: Invalid direction or index for moving element", () => SelectButton(pl1));
                } else {
                    SelectButton(pl1);
                }
            });
            sf.addButton("下移一位", (pl1) => {
                if (!moveElement(fileCache.buttons, el_Index, "down")) {
                    sendErrorPop(pl1, "Error: Invalid direction or index for moving element", () => SelectButton(pl1));
                } else {
                    SelectButton(pl1);
                }
            });
            sf.addButton("编辑", (pl1) => {
                EditButton(pl1, el_Index);
            });
            sf.addButton("删除", (pl1) => {
                fileCache.buttons.splice(el_Index, 1);
                SelectButton(pl1);
            });
            sf.send(pl);
        });
    }
    fm.send(player);
}

const permission_type = {
    0: "any",
    1: "op",
    2: "whitelist",
    3: "blacklist",
};

/**
 * 编辑按钮
 * @param player 玩家对象
 * @param index 被编辑按钮的索引
 */
function EditButton(player: Player, index: number) {
    const { buttons } = fileCache;
    const sf = new SimpleForm_Back(pluginInfo.name, (pl) => SelectButton(pl), "bottom");
    sf.content = JSON.stringify(buttons[index], null, 2);
    // button
    sf.addButton("name", (pl) => {
        EditStringText(pl, "输入名称", buttons[index].name || "", (newData) => {
            buttons[index].name = newData;
            EditButton(pl, index);
        });
    });
    sf.addButton("describe", (pl) => {
        EditStringText(pl, "输入描述", buttons[index].describe || "", (newData) => {
            buttons[index].describe = newData;
            EditButton(pl, index);
        });
    });
    sf.addButton("image", (pl) => {
        EditStringText(pl, "输入图片路径", buttons[index].image || "", (newData) => {
            buttons[index].image = newData;
            EditButton(pl, index);
        });
    });
    sf.addButton("money", (pl) => {
        EditStringText(pl, "输入经济", buttons[index].money.toString() || "", (newData) => {
            buttons[index].money = Number(newData);
            EditButton(pl, index);
        });
    });
    sf.addButton("permission", (pl) => {
        EditButtonPermission(pl, index);
    });
    sf.addButton("type", (pl) => {
        SelectType(pl, (ty_id) => {
            const dts = fileCache.buttons[index];
            dts.type = types[ty_id];
            switch (ty_id) {
                case types_e.cmd: // runCmd
                    EditStringText(pl, "输入待执行的命令", dts.run || "", (open) => {
                        dts.run = open;
                        _Complete(pl);
                    });
                    break;
                case types_e.form: // form
                    EditStringText(pl, "输入子表单文件名 如: form.json", dts.run || "", (open) => {
                        dts.run = open;
                        _Complete(pl);
                    });
                    break;
                case types_e.tell: // tell
                    EditStringText(pl, "输入要发送的内容", dts.run || "", (open) => {
                        dts.run = open;
                        _Complete(pl);
                    });
                    break;
                case types_e.eval: // eval
                    EditStringText(pl, "输入要执行的JS文件 如: Templet.js", dts.run || "", (open) => {
                        dts.run = open;
                        _Complete(pl);
                    });
                    break;
            }
            function _Complete(pl3: Player) {
                pl3.sendModalForm(
                    pluginInfo.name,
                    `编辑完成，是否保存此词更改？\n${JSON.stringify(dts, null, 2)}`,
                    "保存更改并返回编辑页",
                    "放弃并返回",
                    (pl4, res) => {
                        switch (res) {
                            case true:
                                fileCache.buttons[index] = dts;
                                SelectButton(pl4);
                                break;
                            case false:
                                SelectButton(pl4);
                                break;
                            default:
                                return;
                        }
                    },
                );
            }
        });
    });
    sf.send(player);
}

function EditButtonPermission(player: Player, index: number) {
    const { buttons } = fileCache;
    const sf = new SimpleForm_Back(pluginInfo.name, (pl) => EditButton(pl, index), "top");
    sf.content = `type: ${buttons[index].permission[0]}\nplayer: ${JSON.stringify(buttons[index].permission[1])}\n\n选择操作类别`;

    sf.addButton("更改权限类别", (pl) => {
        SelectButtonPermissionType(pl, (newType) => {
            buttons[index].permission[0] = newType;
            EditButtonPermission(pl, index);
        });
    });
    sf.addButton("编辑玩家", (pl) => {
        EditButtonPermissionPlayer(pl, index);
    });
    sf.send(player);
}

function SelectButtonPermissionType(player: Player, callback: (type: "any" | "op" | "whitelist" | "blacklist") => any) {
    const sf = new SimpleForms(pluginInfo.name);
    sf.content = "选择类别";

    Object.values(permission_type).forEach((ty: "any" | "op" | "whitelist" | "blacklist") => {
        sf.addButton(ty, () => {
            callback(ty);
        });
    });

    sf.send(player);
}

function EditButtonPermissionPlayer(player: Player, index: number) {
    const sf = new SimpleForm_Back(pluginInfo.name, (pl) => EditButtonPermission(pl, index), "bottom");
    sf.content = "点击玩家名进入编辑页面";

    // 检查
    if (!Array.isArray(fileCache.buttons[index].permission[1])) {
        fileCache.buttons[index].permission[1] = [];
    }
    const pls = fileCache.buttons[index].permission[1];

    sf.addButton("创建新玩家", (pl) => {
        EditStringText(pl, "输入玩家", undefined, (input) => {
            pls.indexOf(input) == -1 ? pls.push(input) : sendErrorPop(pl, "输入的玩家重复!", () => EditButtonPermissionPlayer(pl, index));
            EditButtonPermissionPlayer(pl, index);
        });
    });

    let i = 0;
    while (i < pls.length) {
        const p_Index = i++;
        const p = pls[p_Index];
        sf.addButton(p, (pl) => {
            pl.sendSimpleForm(pluginInfo.name, `EditPlayer: ${p}`, ["编辑", "删除", "返回"], Array(3).fill(""), (pl1, id) => {
                switch (id) {
                    case 0:
                        EditStringText(pl1, "输入新名称", p, (newT) => {
                            pls[p_Index] = newT;
                            EditButtonPermissionPlayer(pl1, index);
                        });
                        break;
                    case 1:
                        pls.splice(p_Index, 1);
                        EditButtonPermissionPlayer(pl1, index);
                        break;
                    case 2:
                        EditButtonPermissionPlayer(pl1, index);
                        break;
                    default:
                }
            });
        });
    }

    sf.send(player);
}

function SelectType(pl: Player, Callback: (type: number) => any) {
    const fm = mc.newSimpleForm();
    fm.setTitle(pluginInfo.name);
    fm.setContent("选择一个Type类型");
    for (const key in types) {
        fm.addButton(types[key]);
    }
    pl.sendForm(fm, (pl2, id) => {
        if (id == null) return;
        Callback(id);
    });
}

// ================================================================================ plugin end

// logger.setLogLevel(5);
ll.registerPlugin(pluginInfo.name, pluginInfo.name, pluginInfo.version, { "Author: ": pluginInfo.author });
mc.listen("onServerStarted", () => {
    const cmd = mc.newCommand("umenuedit", "UMenu编辑器", PermType.Any);
    cmd.overload([]);
    cmd.setCallback((_, ori, out) => {
        if (ori.player == null) return;
        !ori.player.isOP() ? out.error("无权限") : main(ori.player);
    });
    cmd.setup();
});

logger.info("作者： engsr6982");
logger.info("版本: " + pluginInfo.version.join().replace(/,/g, "."));
