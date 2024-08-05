import { SimpleFormWithBack } from "../modules/form/SimpleForms.js";
import { FPManager } from "../FPManager/Manager.js";
import { pluginInformation } from "../utils/GlobalVars.js";
import { closeForm, input_Null, selectDummy } from "./Tools.js";
import { index } from "./index.js";

class SimulatedOperation {
    constructor() {}

    /**
     * 模拟操作
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
            `模拟朝向`,
            (pl) => {
                this.simulateOrientation(pl);
            },
            "textures/ui/icon_steve",
        );
        fm.addButton(
            `模拟破坏`,
            (pl) => {
                this.simulatedDamage(pl);
            },
            "textures/ui/anvil_icon",
        );
        fm.addButton(
            `模拟攻击`,
            (pl) => {
                this.simulatedAttack(pl);
            },
            "textures/ui/icon_recipe_equipment",
        );
        fm.addButton(
            `模拟使用物品`,
            (pl) => {
                this.simulateTheUseOfItems(pl);
            },
            "textures/ui/icon_book_writable",
        );
        fm.addButton(`关闭模拟操作`, (pl) => {
            this.closeSimulationOperation(pl);
        });
        fm.close = (pl) => {
            closeForm(pl);
        };
        fm.send(player);
    }

    /**
     * 模拟朝向
     * @param {Player} player
     */
    simulateOrientation(player: Player) {
        selectDummy(
            player,
            (fp) => {
                const fm = mc.newCustomForm();
                fm.addInput(
                    `朝向目标坐标(请输入整数，使用英文逗号隔开X,Y,Z)`,
                    "IntPos",
                    `${player.blockPos.x},${player.blockPos.y},${player.blockPos.z}`,
                );
                player.sendForm(fm, (pl, dt) => {
                    if (dt == null) return closeForm(pl);
                    if (!dt[0]) return input_Null(pl);
                    const [x, y, z] = dt[0].split(",").map(Number);
                    pl.runcmd(`fp lookpos ${fp.name} ${x} ${y} ${z}`);
                });
            },
            this.index,
            true,
        );
    }

    /**
     * 模拟攻击
     * @param {Player} player
     */
    simulatedAttack(player: Player) {
        selectDummy(
            player,
            (fp) => {
                const fm = mc.newCustomForm();
                fm.addInput(`[可选]要破坏的目标方块坐标\n(默认为视线上方块, 使用英文逗号隔开X,Y,Z)`, "IntPos");
                fm.addInput(`[可选]执行周期,单位：毫秒\n(多久攻击一次)`, "Number");
                player.sendForm(fm, (pl, dt) => {
                    if (dt == null) return closeForm(pl);
                    if (dt[0] != "") {
                        const [x, y, z] = dt[0].split(",").map(Number);
                        pl.runcmd(`fp lookpos ${fp.name} ${x} ${y} ${z}`);
                    }
                    pl.runcmd(`fp operation attack ${fp.name} ${dt[1] || ""}`);
                });
            },
            this.index,
            true,
        );
    }

    /**
     * 模拟破坏
     * @param {Player} player
     */
    simulatedDamage(player: Player) {
        selectDummy(
            player,
            (fp) => {
                const fm = mc.newCustomForm();
                fm.addInput(`[可选]要破坏的目标方块坐标\n(默认为视线上方块, 使用英文逗号隔开X,Y,Z)`, "IntPos");
                fm.addInput(`[可选]执行周期,单位：毫秒\n(多久破坏一次)`, "Number");
                player.sendForm(fm, (pl, dt) => {
                    if (dt == null) return closeForm(pl);
                    if (dt[0] != "") {
                        const [x, y, z] = dt[0].split(",").map(Number);
                        pl.runcmd(`fp lookpos ${fp.name} ${x} ${y} ${z}`);
                    }
                    pl.runcmd(`fp operation destroy ${fp.name} ${dt[1] || ""}`);
                });
            },
            this.index,
            true,
        );
    }

    /**
     * 模拟使用物品
     * @param {Player} player
     */
    simulateTheUseOfItems(player: Player) {
        selectDummy(
            player,
            (fp) => {
                const fm = mc.newCustomForm();
                const container = mc.getPlayer(fp.name).getInventory();
                fm.addDropdown(
                    `[可选]使用的物品栏物品\n(默认为当前手持物品)`,
                    Array.from(
                        { length: 9 },
                        (_, i) => `槽位[${i}]: ` + (container.getItem(i).name != "" ? container.getItem(i).name : "Null"),
                    ),
                );
                fm.addInput(`[可选]要破坏的目标方块坐标\n(默认为视线上方块, 使用英文逗号隔开X,Y,Z)`, "IntPos");
                fm.addInput(`[可选]执行周期,单位：毫秒\n(多久右键一次)`, "Number");
                player.sendForm(fm, (pl, dt) => {
                    if (dt == null) return closeForm(pl);
                    if (dt[1] != "") {
                        const [x, y, z] = dt[1].split(",").map(Number);
                        pl.runcmd(`fp lookpos ${fp.name} ${x} ${y} ${z}`);
                    }
                    pl.runcmd(`fp operation item ${fp.name} ${dt[2] == "" ? fp.loopCycleTime : dt[2]} ${dt[0]}`);
                });
            },
            this.index,
            true,
        );
    }

    /**
     * 关闭模拟操作(批量)
     * @param {Player} player
     */
    closeSimulationOperation(player: Player) {
        const fm = new SimpleFormWithBack(
            pluginInformation.name,
            (pl) => {
                this.index(pl);
            },
            "top",
        );
        const fp = FPManager.getOnlineDummy().filter((p) => p.bindPlayer == player.realName && p.loopCycleTime != null);
        fp.forEach((p) => {
            fm.addButton(
                `假人: ${p.name}\n操作: ${
                    p.loopType == "attack"
                        ? "模拟攻击"
                        : p.loopType == "destroy"
                          ? "模拟破坏"
                          : p.loopType == "item"
                            ? "模拟使用物品"
                            : "错误！(未知类别)"
                }`,
                (pl) => {
                    pl.runcmd(`fp offoperation ${p.name}`);
                },
            );
        });
        fm.close = (pl) => {
            closeForm(pl);
        };
        fm.send(player);
    }
}

export const simulatedOperations = new SimulatedOperation();
