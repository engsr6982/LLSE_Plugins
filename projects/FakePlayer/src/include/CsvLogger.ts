import CsvLogger from "../modules/CsvLogger.js";
import { FPManager } from "../FPManager/Manager.js";
import { Config } from "../utils/config.js";

export const cLogger = new CsvLogger(
    Config.CsvLogger.Output,
    Config.CsvLogger.FileName,
    [
        "时间",
        "主体",
        "维度",
        "x",
        "y",
        "z",
        "事件",
        "目标",
        "维度",
        "x",
        "y",
        "z",
        "绑定玩家",
        "是否在线",
        "假人无敌",
        "自动复活",
        "自动上线",
        "模拟操作",
        "任务周期",
    ].join(),
);

/**
 * 抽象生成CSV日志为函数
 * @param {Player} player 玩家对象
 * @param {String} action 事件
 * @param {String} targetDummy 目标
 */
export async function generateCSVLog(player: Player, action: string, targetDummy: string) {
    const fp = FPManager.getDummyInst(targetDummy) || {
        // @ts-ignore
        onlinePos: { x: null, y: null, z: null, dim: null, dimid: null },
        bindPlayer: "",
        isOnline: false,
        isInvincible: false,
        isAutoRespawn: false,
        loopCycleTime: "",
        loopType: "attack",
        isAutoOnline: false,
    };

    const parseDim = (dimid: number) => {
        return { 0: "主世界", 1: "地狱", 2: "末地" }[dimid];
    };
    return cLogger.write(
        `${system.getTimeStr()},${player ? player.realName : "console"},${player ? player.pos.dim : null},${player ? player.pos.x : null},${player ? player.pos.y : null},${player ? player.pos.z : null},${action},${targetDummy},${parseDim(fp.onlinePos.dimid)},${fp.onlinePos.x},${fp.onlinePos.y},${fp.onlinePos.z},${fp.bindPlayer},${fp.isOnline},${fp.isInvincible},${fp.isAutoRespawn},${fp.isAutoOnline},${fp.loopType},${fp.loopCycleTime}`
            .replace(/null/gm, "")
            .replace(/undefined/gm, ""),
    );
}
