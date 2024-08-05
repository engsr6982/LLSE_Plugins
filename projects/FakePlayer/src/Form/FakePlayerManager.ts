import { SimpleFormWithBack } from "../modules/form/SimpleForms.js";
import { FPManager } from "../FPManager/Manager.js";
import { pluginInformation } from "../utils/GlobalVars.js";
import { closeForm, input_Null, selectDummy } from "./Tools.js";
import { index } from "./index.js";

class FakePlayerManager {
    constructor() {}

    /**
     * 假人管理
     * @param {Player} player
     */
    index(player: Player) {
        const fm = new SimpleFormWithBack(
            pluginInformation.name,
            (pl: Player) => {
                index(pl);
            },
            "top",
        );
        fm.content = " · 假人管理";
        fm.addButton(
            `创建假人`,
            (pl) => {
                this.creatingDummies(pl);
            },
            "textures/ui/color_plus",
        );
        fm.addButton(
            `快速上下线`,
            (pl) => {
                this.dummyUpAndDownLine(pl);
            },
            "textures/ui/move",
        );
        fm.addButton(
            `上线所有`,
            (pl) => {
                pl.runcmd(`fp onlineall`);
            },
            "textures/ui/flyingascend_pressed",
        );
        fm.addButton(
            `下线所有`,
            (pl) => {
                pl.runcmd(`fp offlineall`);
            },
            "textures/ui/flyingdescend_pressed",
        );
        fm.addButton(
            `下线假人`,
            (pl) => {
                this.offlineDummy(pl);
            },
            "textures/ui/flyingdescend",
        );
        fm.addButton(
            `编辑假人`,
            (pl) => {
                this.editDummy(pl);
            },
            "textures/ui/icon_setting",
        );
        fm.addButton(
            `删除假人`,
            (pl) => {
                this.deleteDummy(pl);
            },
            "textures/ui/icon_trash",
        );
        fm.close = (pl: Player) => {
            closeForm(pl);
        };
        fm.send(player);
    }

    /**
     * 创建假人
     * @param {Player} player
     */
    private creatingDummies(player: Player) {
        const fm = mc.newCustomForm();
        fm.setTitle(pluginInformation.name);
        fm.addLabel("创建一个模拟玩家实例");
        fm.addInput("输入假人名称", "String"); // 1
        fm.addInput(
            "假人上线坐标(请输入整数，使用英文逗号隔开X,Y,Z)",
            "IntPos",
            `${player.blockPos.x},${player.blockPos.y},${player.blockPos.z}`,
        );
        fm.addDropdown("上线维度", ["主世界", "地狱", "末地"], player.pos.dimid);
        player.sendForm(fm, (pl, dt) => {
            if (dt == null) return closeForm(pl);
            if (!dt[1]) return input_Null(pl);
            const [x, y, z] = dt[2].split(",").map(Number);
            pl.runcmd(`fp create "${dt[1]}" ${x} ${y} ${z} ${dt[3]}`);
        });
    }

    /**
     * 假人上下线
     * @param {Player} player
     */
    private dummyUpAndDownLine(player: Player) {
        const fm = mc.newCustomForm();
        fm.setTitle(pluginInformation.name);
        const fp = FPManager.getAllDummyInst().filter((p) => p.bindPlayer === player.realName);
        fp.forEach((i) => {
            fm.addSwitch(`假人: ${i.name}\n状态: ${i.isOnline ? "在线" : "离线"}`, i.isOnline || false);
        });
        player.sendForm(fm, (pl, dt) => {
            if (dt == null) return closeForm(pl);
            for (let i = 0; i < dt.length; i++) {
                pl.runcmd(`fp ${dt[i] ? "online" : "offline"} "${fp[i].name}"`);
            }
        });
    }

    /**
     * 下线假人
     * @param {Player} player
     */
    private offlineDummy(player: Player) {
        selectDummy(
            player,
            (fp) => {
                player.runcmd(`fp offline ${fp.name}`);
            },
            index,
            true,
        );
    }

    /**
     * 编辑假人
     * @param {Player} player
     */
    private editDummy(player: Player) {
        selectDummy(
            player,
            (fp) => {
                const fm = mc.newCustomForm();
                fm.setTitle(pluginInformation.name);
                fm.addSwitch("是否启用假人无敌", fp.isInvincible);
                fm.addSwitch("是否启用自动重生", fp.isAutoRespawn);
                fm.addSwitch("是否启用自动上线", fp.isAutoOnline);
                player.sendForm(fm, (pl, dt) => {
                    if (dt == null) return closeForm(pl);
                    pl.runcmd(`fp setfunc ${fp.name} isinvincible ${dt[0]}`);
                    pl.runcmd(`fp setfunc ${fp.name} isautoresurrection ${dt[1]}`);
                    pl.runcmd(`fp setfunc ${fp.name} isautoonline ${dt[2]}`);
                });
            },
            index,
        );
    }

    /**
     * 删除假人
     * @param {Player} player
     */
    private deleteDummy(player: Player) {
        selectDummy(
            player,
            (fp) => {
                player.runcmd(`fp delete ${fp.name}`);
            },
            index,
            false,
        );
    }
}

export const fakePlayerManager = new FakePlayerManager();
