/* eslint-disable prettier/prettier */
import PermissionCore from "./PermissionCore.js";

export default class PermissionForm {
    /** i18n存储路径 */
    private i18nStoragePath: string;

    tr = (() => {
        // if (i18n.tr("title") == "title" || i18n.tr("title") == "") this.i18nFileInit(); // 检查，防止i18n失效
        return i18n.tr;
    })();

    i18nFileInit(path: string = /* ".\\plugins\\engsr6982\\LSE-OPTools\\lang\\perm\\" */ this.i18nStoragePath): boolean {
        try {
            // logger.warn("p: " + path);
            // logger.warn(new Error().stack);
            this.i18nStoragePath = path;
            if (!file.exists(this.i18nStoragePath + `zh_CN.json`)) {
                file.writeTo(
                    this.i18nStoragePath + "zh_CN.json",
                    JSON.stringify({
                        title: "§d权限组管理GUI",
                        content: "§a§l• 请选择选择一个操作",
                        noPermissions: "无权限！",
                        formClose: "§e[§l§d权限组§r§e] §b表单已放弃",
                        index: {
                            "0": "查看",
                            "1": "编辑",
                            "2": "搜索",
                            "3": "公共组",
                        },
                        view: {
                            "0": "返回上一级",
                            "1": "查看所有权限组",
                            "2": "查看指定权限组",
                        },
                        edit: {
                            "0": "返回上一级",
                            "1": "新建组",
                            "2": "删除组",
                            "3": "重命名组",
                            "4": "编辑用户",
                            "5": "编辑权限",
                        },
                        search: {
                            "0": "返回上一级",
                            "1": "用户所在的权限组",
                            "2": "用户拥有的权限",
                            "3": "用户权限的来源",
                        },
                        continueForm: {
                            content: "§a§l• 操作完成\n是否继续?",
                            button0: "§a§l继续",
                            button1: "§c§l放弃表单",
                        },
                        selectGroup: {
                            content: "§l§a• 选择一个权限组",
                            button: "名称: {0}\n权限: {1} | 用户: {2}",
                        },
                        viewForm: "§l§b|§r名称: {0}\n§l§b|§r权限: {1}\n§l§b|§r用户: {2}",
                        createGroupForm: "输入权限组名称\n注意：允许1-16字节，允许中文字母数字下划线",
                        inputIsEmpty: "§e[§l§d权限组§r§e] §b输入框为空！",
                        deleteGroupForm: {
                            content: "§e您确定要删除权限组<{0}>吗？\n组用户：{1}\n组权限：{2}",
                            button0: "§c确认删除",
                            button1: "§a取消删除",
                        },
                        renameGroupForm: "当前名称：{0}\n\n输入新名称\n注意：允许1-16字节，允许中文字母数字下划线",
                        selectCategory: {
                            button0: "返回上一页",
                            button1: "§a§l添加用户",
                            button2: "§c§l删除用户",
                        },
                        addUserForm: {
                            stepSliderTitle: "请选择操作模式",
                            stepSliderItem0: "在线模式",
                            stepSliderItem1: "离线模式",
                            dropdownTitle: "在线| 选择一个用户",
                            inputTitle: "离线| 输入用户名",
                        },
                        xuidNull: "查询玩家XUID失败！",
                        deleteUserForm: "当前正在编辑：{0}\n请选择需要删除的用户",
                        searchComponent: {
                            stepSliderTitle: "请选择操作模式",
                            stepSliderItem0: "在线模式",
                            stepSliderItem1: "离线模式",
                            dropdownTitle: "在线| 选择一个用户",
                            inputTitle: "离线| 输入用户名",
                        },
                        searchUserGroupForm: "搜索失败！未找到此用户！",
                        searchUserPermissionForm: {
                            "Label-0": "§l§b|§r权限: {0}\n§l§b|§r来源: {1}",
                            "Label-1": "用户[{0}]共计[{1}]个权限",
                        },
                    }),
                );
            }
            i18n.load(this.i18nStoragePath, "zh_CN");
            return true;
        } catch (err) {
            logger.error(`${err}\n${err.stack}`);
            return false;
        }
    }
    /**
     * 权限组GUI模块
     * @param i18nStoragePath_ i18n存储路径
     * @param permissionCoreInstance 权限组实例（函数返回已实例化的权限组）
     */
    constructor(i18nStoragePath_: string, permissionCoreInstance: () => PermissionCore) {
        this.getPermInst = permissionCoreInstance;
        this.i18nFileInit(i18nStoragePath_);
    }

    /** 获取权限组实例 */
    private getPermInst: () => PermissionCore;
    /** 按钮表单 */
    private simpleForm() {
        return mc.newSimpleForm().setTitle(this.tr("title")).setContent(this.tr("content"));
    }
    /** 自定义表单 */
    private customForm() {
        return mc.newCustomForm().setTitle(this.tr("title"));
    }
    /** 表单关闭 */
    private formClose(player: Player): boolean {
        return player.tell(this.tr("formClose"));
    }

    /**
     * 表单入口
     * @param player
     */
    index(player: Player) {
        const p = this.getPermInst();
        if (!p.checkIfAdmin(player.xuid)) return player.tell(this.tr("noPermissions")); // 无权限
        const fm = this.simpleForm();
        fm.addButton(this.tr("index.0"));
        fm.addButton(this.tr("index.1"));
        fm.addButton(this.tr("index.2"));
        fm.addButton(this.tr("index.3"));
        player.sendForm(fm, (pl, id) => {
            switch (id) {
                case 0:
                    this.viewPanel(pl);
                    break;
                case 1:
                    this.editPanel(pl);
                    break;
                case 2:
                    this.searchPanel(pl);
                    break;
                case 3:
                    this.editPublicGroupForm(pl);
                    break;
                default:
                    this.formClose(pl);
            }
        });
    }

    /**
     * 查看面板
     * @param player
     */
    private viewPanel(player: Player) {
        const fm = this.simpleForm();
        fm.addButton(this.tr("view.0")); // back
        fm.addButton(this.tr("view.1"));
        fm.addButton(this.tr("view.2"));
        player.sendForm(fm, (pl, id) => {
            switch (id) {
                case 0:
                    this.index(pl);
                    break;
                case 1:
                    this.viewForm(pl, this.getPermInst().retrieveAllGroups());
                    break;
                case 2:
                    this.selectGroup(pl, (name) => {
                        this.viewForm(pl, [this.getPermInst().retrieveGroup(name).group]);
                    });
                    break;
                default:
                    this.formClose(pl);
            }
        });
    }

    /**
     * 编辑面板
     * @param player
     */
    private editPanel(player: Player) {
        const fm = this.simpleForm();
        fm.addButton(this.tr("edit.0")); // back
        fm.addButton(this.tr("edit.1"));
        fm.addButton(this.tr("edit.2"));
        fm.addButton(this.tr("edit.3"));
        fm.addButton(this.tr("edit.4"));
        fm.addButton(this.tr("edit.5"));
        player.sendForm(fm, (pl, id) => {
            switch (id) {
                case 0:
                    this.index(pl);
                    break;
                case 1:
                    this.createGroupForm(pl);
                    break;
                case 2:
                    this.deleteGroupForm(pl);
                    break;
                case 3:
                    this.renameGroupForm(pl);
                    break;
                case 4:
                    this.selectCategory(pl, (isAdd) => {
                        if (isAdd) {
                            this.addUserForm(pl);
                        } else {
                            this.deleteUserForm(pl);
                        }
                    });
                    break;
                case 5:
                    this.editPermissionForm(pl);
                    break;
                default:
                    this.formClose(pl);
            }
        });
    }

    /**
     * 搜索面板
     * @param player
     */
    private searchPanel(player: Player) {
        const fm = this.simpleForm();
        fm.addButton(this.tr("search.0")); // back
        fm.addButton(this.tr("search.1"));
        fm.addButton(this.tr("search.2"));
        // fm.addButton(this.tr("search.3"));
        player.sendForm(fm, (pl, id) => {
            switch (id) {
                case 0:
                    this.index(pl);
                    break;
                case 1:
                    this.searchUserGroupForm(pl);
                    break;
                case 2:
                    this.searchUserPermissionForm(pl);
                    break;
                // case 3: // todo 用户权限的来源
                //     break;
                default:
                    this.formClose(pl);
            }
        });
    }

    /**
     * 继续表单
     * @param player 玩家对象
     * @param callback 回调，是否继续操作
     */
    private continueForm(player: Player, func: (pl: Player) => any) {
        player.sendModalForm(
            this.tr("title"),
            this.tr("continueForm.content"),
            this.tr("continueForm.button0"),
            this.tr("continueForm.button1"),
            (pl, res) => {
                if (res == null || res == false) return this.formClose(pl);
                func.call(this, pl);
            },
        );
    }

    private selectGroup(player: Player, callback: (groupName: string) => any): void {
        const cache: Array<string> = []; // 缓存组名称
        const fm = this.simpleForm();
        fm.setContent(this.tr("selectGroup.content")); // 设置内容
        this.getPermInst()
            .retrieveAllGroups()
            .forEach((group) => {
                fm.addButton(
                    this.tr("selectGroup.button", {
                        0: group.groupName,
                        1: group.authority.length,
                        2: group.user.length,
                    }),
                );
                cache.push(group.groupName); // 添加进缓存
            });
        player.sendForm(fm, (pl, id: number) => {
            if (id == null) return this.formClose(pl);
            callback(cache[id]); // 返回指定组
        });
    }

    /**
     * 查看权限组表单
     * @param player 玩家对象
     * @param viewData 要查看的数据
     */
    private viewForm(player: Player, viewData: Array<UserGroupElements>) {
        // log(JSON.stringify(viewData, null, 2));
        const p = this.getPermInst(); // 获取权限核心实例
        const fm = this.customForm();
        if (viewData.length !== 0) {
            for (let i = 0; i < viewData.length; i++) {
                const { groupName, user, authority } = viewData[i]; // 取出组元素
                fm.addLabel(
                    this.tr("viewForm", {
                        0: groupName,
                        1: authority
                            .map((value) => {
                                return p.retrievePermission(value).name || value; // 尝试权限组查找名称
                            })
                            .join(`§r §l§e| §r`),
                        2: user
                            .map((xuid) => {
                                return data.xuid2name(xuid) || xuid; // 尝试xuid查找名称
                            })
                            .join(`§r §l§e| §r`),
                    }),
                );
            }
        }
        player.sendForm(fm, (pl) => {
            this.continueForm(pl, () => this.index(pl));
        });
    }

    /**
     * 输入为空
     * @param player
     * @returns
     */
    private inputIsEmpty(player: Player) {
        return player.tell(this.tr("inputIsEmpty"));
    }

    /**
     * 创建组表单
     * @param player
     */
    private createGroupForm(player: Player) {
        const p = this.getPermInst();
        const fm = this.customForm();
        fm.addInput(this.tr("createGroupForm"), "string 1~16 length");
        player.sendForm(fm, (pl, dt: Array<string>) => {
            if (dt == null) return this.formClose(pl);
            if (dt[0] == "") return this.inputIsEmpty(pl);
            p.createNewGroup(dt[0]);
            this.continueForm(pl, () => this.editPanel(pl)); // 回调-连锁操作
        });
    }

    /**
     * 删除组表单
     * @param player
     */
    private deleteGroupForm(player: Player) {
        this.selectGroup(player, (name) => {
            const { user, authority } = this.getPermInst().retrieveGroup(name).group;
            player.sendModalForm(
                this.tr("title"),
                this.tr("deleteGroupForm.content", {
                    0: name,
                    1: user.length,
                    2: authority.length,
                }),
                this.tr("deleteGroupForm.button0"),
                this.tr("deleteGroupForm.button1"),
                (pl, res) => {
                    switch (res) {
                        case true:
                            this.getPermInst().deleteExistingGroup(name);
                            this.continueForm(pl, () => this.editPanel(pl)); // 继续
                            break;
                        case false:
                            this.editPanel(pl);
                            break;
                        default:
                            this.formClose(pl);
                    }
                },
            );
        });
    }

    /**
     * 重命名组表单
     * @param player
     */
    private renameGroupForm(player: Player) {
        this.selectGroup(player, (name) => {
            const fm = this.customForm();
            fm.addInput(this.tr("renameGroupForm", { 0: name }), "string 1~16 length", name);
            player.sendForm(fm, (pl, dt) => {
                if (dt == null) return this.formClose(pl);
                if (dt[0] == "") return this.inputIsEmpty(pl);
                this.getPermInst().renameExistingGroup(name, dt[0]);
                this.continueForm(pl, () => this.editPanel(pl));
            });
        });
    }

    /**
     * 编辑权限表单
     * @param player
     */
    private editPermissionForm(player: Player) {
        this.selectGroup(player, (groupName) => {
            const p = this.getPermInst(); // 权限组实例
            const allPermissionName: Array<string> = p
                .retrieveAllPermissions() // 获取所有已注册权限
                .map(({ value }) => value); // 取出权限值
            const oldData: {
                [key: string]: boolean;
            } = {}; // 原始数据
            const newData: {
                [key: string]: boolean;
            } = {}; // 变动数据
            // form
            const fm = this.customForm().addLabel(`Edit Group: ${groupName}`);
            allPermissionName.forEach((i) => {
                const isHave = p.checkGroupPermission(groupName, i); // 检查是否有这个权限
                oldData[i] = isHave; // 缓存
                const pm = p.retrievePermission(i);
                fm.addSwitch(pm ? pm.name : i, isHave);
            });
            player.sendForm(fm, (pl, dt: Array<boolean>) => {
                if (dt == null) return this.formClose(pl);
                dt.shift(); // 去除第一个文本元素
                for (let i = 0; i < dt.length; i++) {
                    newData[allPermissionName[i]] = dt[i]; // 构建变动数据，用于辅助判断
                }
                allPermissionName.forEach((PermValue) => {
                    if (oldData[PermValue] === false && newData[PermValue] === true) {
                        // 如果原始数据false，新数据true，则添加权限
                        p.addGroupPermissions(groupName, PermValue);
                    } else if (oldData[PermValue] === true && newData[PermValue] === false) {
                        // 如果原始数据true，新数据false，则删除权限
                        p.removeGroupPermissions(groupName, PermValue);
                    }
                    // 剩余情况：
                    // 1. 原始false  新false   忽略
                    // 2. 原始true   新true    忽略
                });
                this.continueForm(pl, () => this.editPanel(pl));
            });
        });
    }

    /**
     * 编辑公共组表单
     * @param player
     */
    private editPublicGroupForm(player: Player) {
        const groupName = "PublicGroup";
        const p = this.getPermInst(); // 权限组实例
        const allPermissionName = p
            .retrieveAllPermissions() // 获取所有已注册权限
            .map(({ value }) => value); // 取出权限值
        const oldData: {
            [key: string]: boolean;
        } = {}; // 原始数据
        const newData: {
            [key: string]: boolean;
        } = {}; // 变动数据
        // form
        const fm = this.customForm().addLabel(`Edit Group: ${groupName}`);
        allPermissionName.forEach((i) => {
            const isHave = p.checkPublicGroupPermission(i);
            oldData[i] = isHave;
            const pm = p.retrievePermission(i);
            fm.addSwitch(pm ? pm.name : i, isHave);
        });
        player.sendForm(fm, (pl, dt: Array<boolean>) => {
            if (dt == null) return this.formClose(pl);
            dt.shift();
            for (let i = 0; i < dt.length; i++) {
                newData[allPermissionName[i]] = dt[i];
            }
            allPermissionName.forEach((PermValue) => {
                if (oldData[PermValue] === false && newData[PermValue] === true) {
                    p.addPublicGroupPermissions(PermValue);
                } else if (oldData[PermValue] === true && newData[PermValue] === false) {
                    p.removePublicGroupPermissions(PermValue);
                }
            });
            this.continueForm(pl, () => this.index(pl));
        });
    }

    /**
     * 选择类别
     * @param player
     */
    private selectCategory(player: Player, callback: (isAdd: boolean) => any) {
        const fm = this.simpleForm();
        fm.addButton(this.tr("selectCategory.button0"));
        fm.addButton(this.tr("selectCategory.button1"));
        fm.addButton(this.tr("selectCategory.button2"));
        player.sendForm(fm, (pl, id) => {
            if (id == null) return this.formClose(pl);
            if (id === 0) return this.editPanel(pl);
            callback(id === 1 ? true : false);
        });
    }

    /**
     * 添加用户表单
     * @param player
     */
    private addUserForm(player: Player) {
        this.selectGroup(player, (groupName) => {
            const allPlayer = mc.getOnlinePlayers();
            const fm = this.customForm();
            fm.addLabel(`Edit Group: ${groupName}`); // 0
            fm.addStepSlider(
                this.tr("addUserForm.stepSliderTitle"),
                Array.of(this.tr("addUserForm.stepSliderItem0"), this.tr("addUserForm.stepSliderItem1")),
            ); // 1
            fm.addDropdown(
                this.tr("addUserForm.dropdownTitle"),
                allPlayer.map((apl) => apl.realName),
            ); // 2
            fm.addInput(this.tr("addUserForm.inputTitle"), "string player name"); //3
            player.sendForm(fm, (pl, dt) => {
                if (dt == null) return this.formClose(pl);
                const xuid =
                    dt[1] === 0 ? allPlayer[dt[2]].xuid : dt[3] != "" ? data.name2xuid(dt[3]) : this.inputIsEmpty(pl) ? null : null;
                // 检查XUID
                if (xuid) {
                    this.getPermInst().addUserToGroup(groupName, xuid);
                    this.continueForm(player, () => this.editPanel(pl));
                } else pl.tell(this.tr("xuidNull"));
            });
        });
    }

    /**
     * 删除用户表单
     * @param player
     */
    private deleteUserForm(player: Player) {
        this.selectGroup(player, (groupName) => {
            const p = this.getPermInst();
            const groupUser = this.getPermInst().retrieveGroup(groupName).group.user; // 所有用户
            const fm = this.customForm();
            fm.addLabel(this.tr("deleteUserForm", { 0: groupName }));
            groupUser.forEach((i) => {
                fm.addSwitch(data.xuid2name(i) || i, false);
            });
            player.sendForm(fm, (pl, dt: Array<boolean>) => {
                if (dt == null) return this.formClose(pl);
                dt.shift(); // 去除Label
                for (let i = 0; i < dt.length; i++) {
                    dt[i] ? p.removeUserFromGroup(groupName, groupUser[i]) : null; // 如果开关变为true，则代表删除用户
                }
                this.continueForm(pl, () => this.editPanel(pl));
            });
        });
    }

    /**
     * 搜索组件
     * @param player
     * @param callback 回调玩家XUID/null
     */
    private searchComponent(player: Player, callback: (xuid: string) => any) {
        const allPlayer = mc.getOnlinePlayers();
        const fm = this.customForm();
        /* 0 */ fm.addStepSlider(
            this.tr("searchComponent.stepSliderTitle"),
            Array.of(this.tr("searchComponent.stepSliderItem0"), this.tr("searchComponent.stepSliderItem1")),
        );
        /* 1 */ fm.addDropdown(
            this.tr("searchComponent.dropdownTitle"),
            allPlayer.map((apl) => apl.realName),
        );
        /* 2 */ fm.addInput(this.tr("searchComponent.inputTitle"), "string player name");
        player.sendForm(fm, (pl, dt) => {
            if (dt == null) return this.formClose(pl);
            callback(dt[0] === 0 ? allPlayer[dt[1]].xuid : dt[2] != "" ? data.name2xuid(dt[2]) : this.inputIsEmpty(pl) ? null : null);
        });
    }

    /**
     * 搜索用户组
     * @param player
     */
    private searchUserGroupForm(player: Player) {
        this.searchComponent(player, (xuid) => {
            if (xuid === null) return player.tell(this.tr("xuidNull"));
            const group = this.getPermInst().retrieveUserGroups(xuid);
            // log(`xuid: ${xuid}`);
            // log(`\n${JSON.stringify(group, null, 2)}`);
            group.length !== 0 ? this.viewForm(player, group) : player.tell(this.tr("searchUserGroupForm"));
        });
    }

    /**
     * 搜索用户权限
     * @param player
     */
    private searchUserPermissionForm(player: Player) {
        this.searchComponent(player, (xuid) => {
            if (xuid === null) return player.tell(this.tr("xuidNull"));
            const p = this.getPermInst();
            const { authority, source } = p.retrieveUserPermissions(xuid); // 获取用户的权限
            // form
            const fm = this.customForm();
            for (const key in source) {
                // 遍历权限
                const inf = p.retrievePermission(key); // 获取权限详细信息
                fm.addLabel(
                    this.tr("searchUserPermissionForm.Label-0", {
                        0: inf ? inf.name : key, // 显示权限名
                        1: source[key].join(`§r §l§e| §r`), // 显示来源
                    }),
                );
            }
            // 显示统计信息
            fm.addLabel(
                this.tr("searchUserPermissionForm.Label-1", {
                    0: data.xuid2name(xuid) || xuid,
                    1: authority.length,
                }),
            );
            player.sendForm(fm, (pl) => {
                this.continueForm(pl, () => this.searchPanel(pl));
            });
        });
    }
}
