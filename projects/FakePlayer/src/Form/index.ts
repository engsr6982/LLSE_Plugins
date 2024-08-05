import { closeForm } from "./Tools.js";
import { SimpleForms } from "../modules/form/SimpleForms.js";
import { pluginInformation } from "../utils/GlobalVars.js";
import { fakePlayerManager } from "./FakePlayerManager.js";
import { simulatedOperations } from "./SimulatedOperation.js";
import { fakePlayerOperation } from "./FakePlayerOperation.js";

export function index(player: Player) {
    const fm = new SimpleForms(pluginInformation.name);
    fm.addButton("假人管理\n", (pl: Player) => {
        fakePlayerManager.index(pl);
    });
    fm.addButton("模拟操作\n", (pl: Player) => {
        simulatedOperations.index(pl);
    });
    fm.addButton("假人操作\n", (pl: Player) => {
        fakePlayerOperation.index(pl);
    });
    if (file.exists(`.\\plugins\\${pluginInformation.author}\\debug`)) {
        fm.addButton(`[管理]权限组GUI`, (pl: Player) => {
            pl.runcmd("fp mgr");
        });
    }
    fm.close = (pl: Player) => {
        closeForm(pl);
    };
    fm.send(player);
}
