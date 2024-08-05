import { SimpleFormWithBack } from "../modules/form/SimpleForms.js";
import { instanceCache } from "../FPManager/instanceCache.js";
import { permissionCore } from "../include/Permission.js";
import { Gm_Tell, pluginInformation } from "../utils/GlobalVars.js";
import { closeForm, input_Null, noPermissions, selectDummy } from "./Tools.js";
import { index } from "./index.js";

class FakePlayerOperation {
    constructor() {}

    /**
     * 操作假人
     * @param {Player} player
     */
    index(player: Player) {
        const fm = new SimpleFormWithBack(
            pluginInformation.name,
            (pl) => {
                index(pl);
            },
            "top",
        );
        fm.addButton(
            `假人传送`,
            (pl) => {
                this.dummyTransmission(pl);
            },
            "textures/ui/FriendsIcon",
        );
        fm.addButton("假人背包", (pl) => {
            this.dummyBackpack(pl);
        });
        fm.addButton("假人说话", (pl) => {
            this.dummySpeaking(pl);
        });
        fm.addButton("假人执行命令", (pl) => {
            this.dummyCommand(pl);
        });
        fm.close = (pl) => {
            closeForm(pl);
        };
        fm.send(player);
    }

    /**
     * 假人传送
     * @param {Player} player
     */
    dummyTransmission(player: Player) {
        selectDummy(
            player,
            (fp) => {
                player.runcmd(`fp tp ${fp.name} ${player.blockPos.x} ${player.blockPos.y} ${player.blockPos.z} ${player.blockPos.dimid}`);
            },
            this.index,

            true,
        );
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * 假人背包
     * @param {Player} player
     */
    dummyBackpack(player: Player) {
        if (!permissionCore.verifyUserPermission(player.xuid, "bag")) return noPermissions(player);
        selectDummy(
            player,
            (fp) => {
                this._selectAction(player, fp);
            },
            this.index,
            true,
        );
    }
    /**
     * @param {Player} player
     * @param {import("../FPManager/tab.js").T_FP_INFO} fp
     */
    _selectAction(player: Player, fp: SQL_insertRow) {
        const fm = new SimpleFormWithBack(
            pluginInformation.name,
            (pl) => {
                this.dummyBackpack(pl);
            },
            "bottom",
        );
        fm.content = `当前正在操作假人: ${fp.name}`;
        fm.addButton(`放入物品`, (pl) => {
            this.insert(pl, fp);
        });
        fm.addButton(`取出物品`, (pl) => {
            this._selectSlot(
                player,
                instanceCache.get(fp.name).get().getInventory(),
                (item) => {
                    pl.giveItem(item.item);
                    instanceCache.get(fp.name).get().refreshItems();
                },
                fp,
                this._selectAction,
            );
        });
        fm.close = (pl) => {
            closeForm(pl);
        };
        fm.send(player);
    }
    /**
     * @param {Player} player
     * @param {import("../FPManager/tab.js").T_FP_INFO} fp
     */
    insert(player: Player, fp: SQL_insertRow) {
        const fm = new SimpleFormWithBack(
            pluginInformation.name,
            (pl) => {
                this._selectAction(pl, fp);
            },
            "bottom",
        );
        fm.content = `当前正在操作假人: ${fp.name}\n 请选择从哪放入物品到假人背包\n  `;
        fm.addButton(`放入当前手持物品`, (pl) => {
            if (pl.getHand().isNull()) return pl.tell(Gm_Tell + `当前未手持任何物品！`);
            if (instanceCache.get(fp.name).get().giveItem(pl.getHand())) {
                pl.getHand().setNull();
                pl.refreshItems();
            }
        });
        fm.addButton(`从背包选择物品`, (pl) => {
            this._selectSlot(
                pl,
                pl.getInventory(),
                (item) => {
                    instanceCache.get(fp.name).get().giveItem(item.item);
                    pl.refreshItems();
                },
                fp,
                this.insert,
            );
        });
        fm.close = (pl) => {
            closeForm(pl);
        };
        fm.send(player);
    }

    /**
     * 选择槽位
     * @param {Player} player
     * @param {Container} container
     * @param {Function} item 选中的槽位和对应物品对象
     */
    _selectSlot(
        player: Player,
        container: Container,
        item: (its: { item: Item; index: number }) => any,
        fp: SQL_insertRow,
        back: (pl: Player, fp: SQL_insertRow) => any,
    ) {
        const fm = new SimpleFormWithBack(
            pluginInformation.name,
            (pl) => {
                back.call(this, pl, fp);
            },
            "top",
        );
        fm.content = `选择一个槽位，共[${container.size}]个槽位`;
        let count = -1;
        const all_item = container
            .getAllItems()
            .map((it) => {
                return { item: it.isNull() ? null : it, index: (count += 1) };
            })
            .filter((it) => it.item);

        all_item.forEach((i) => {
            fm.addButton(`[${i.index}]: ${i.item.name}\n数量: ${i.item.count}`, () => {
                item(i);
            });
        });
        fm.close = (pl) => {
            closeForm(pl);
        };
        fm.send(player);
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * 假人说话
     * @param {Player} player
     */
    dummySpeaking(player: Player) {
        selectDummy(
            player,
            (fp) => {
                const fm = mc.newCustomForm();
                fm.setTitle(pluginInformation.name);
                fm.addInput("输入要说的内容", "String");
                player.sendForm(fm, (pl, dt) => {
                    if (dt == null) return closeForm(pl);
                    if (!dt[0]) return input_Null(pl);
                    pl.runcmd(`fp talk ${fp.name} "${dt[0]}"`);
                });
            },
            this.index,
            true,
        );
    }

    /**
     * 假人执行命令
     * @param {Player} player
     */
    dummyCommand(player: Player) {
        selectDummy(
            player,
            (fp) => {
                const fm = mc.newCustomForm();
                fm.setTitle(pluginInformation.name);
                fm.addInput("输入要执行的命令", "String");
                player.sendForm(fm, (pl, dt) => {
                    if (dt == null) return closeForm(pl);
                    if (!dt[0]) return input_Null(pl);
                    pl.runcmd(`fp cmd "${fp.name}" "${dt[0]}"`);
                });
            },
            this.index,
            true,
        );
    }
}

export const fakePlayerOperation = new FakePlayerOperation();
