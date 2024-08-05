import { FPManager } from "../FPManager/Manager.js";
import { Gm_Tell, pluginInformation } from "../utils/GlobalVars.js";
import { dummyExample } from "../FPManager/example.js";
import { SimpleFormWithBack } from "../modules/form/SimpleForms.js";

export function noPermissions(player: Player) {
    return player.tell(Gm_Tell + `无权限`);
}

export function input_Null(player: Player, msg = "输入框为空！") {
    return player.tell(Gm_Tell + msg);
}

export function closeForm(player: Player) {
    return player.tell(Gm_Tell + "表单已放弃!");
}

export function selectDummy(player: Player, callback: (inst: dummyExample) => any, backForm: (pl: Player) => any, onlyOnline = true) {
    const fm = new SimpleFormWithBack(
        pluginInformation.name,
        (pl) => {
            backForm(pl);
        },
        "top",
    );
    const fp = onlyOnline
        ? FPManager.getOnlineDummy().filter((p) => p.bindPlayer == player.realName)
        : FPManager.getAllDummyInst().filter((p) => p.bindPlayer == player.realName);
    fp.forEach((i) => {
        fm.addButton(`假人: ${i.name}\n状态: ${i.isOnline ? "在线" : "离线"}`, () => {
            callback(i);
        });
    });
    fm.close = (pl) => {
        closeForm(pl);
    };
    fm.send(player);
}
