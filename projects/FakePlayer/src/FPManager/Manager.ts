import { dummyExample } from "./example.js";
import { sql } from "../DB/SQL.js";
import { instanceCache } from "./instanceCache.js";
import { levelDB } from "../DB/LevelDB.js";
import { time as Time_Mod } from "../modules/Time.js";
import { Config } from "../utils/config.js";

export class FPManager {
    /**
     * 名称是否合法 (允许1-16字节，允许中文字母数字下划线)
     * @param {String} name
     * @returns 是否合法
     */
    static _isTheNameLegal(name: string) {
        //! 请勿修改，修改后导致的一系列问题请自行解决
        return RegExp(/^[a-zA-Z0-9_\u4e00-\u9fa5]{1,16}$/).test(name);
    }

    //==========================//
    //          实例操作        //
    //==========================//

    static initCache() {
        try {
            const data = sql.getAllData();
            if (data) {
                data.forEach((fp) => {
                    if (instanceCache.has(fp.name)) return;
                    if (!this._isTheNameLegal(fp.name)) return;
                    const inst = new dummyExample(fp.name);
                    inst.initData(fp);
                    inst.checkOnline();
                    instanceCache.set(fp.name, inst);
                });
            }
            return true;
        } catch (e) {
            logger.error(`Fail in Function: initCache\n${e}\n${e.stack}`);
            return false;
        }
    }

    static createDummyExample(fp: SQL_insertRow) {
        if (!this._isTheNameLegal(fp.name)) return false;
        if (instanceCache.has(fp.name)) return false;
        const dummy = new dummyExample(fp.name);
        dummy.initData(fp);
        sql.insertRow(fp);
        instanceCache.set(fp.name, dummy);
        return true;
    }

    static destroyInstance(name: string) {
        if (!instanceCache.has(name)) return false;
        const inst = instanceCache.get(name);
        inst.loopStop();
        inst.offline();
        const { bindPlayer, bagGUIDKey } = inst;
        instanceCache.delete(name); // 从缓存中清除
        return levelDB.delete(bagGUIDKey) && sql.deleteDataByBindPlayerAndName(bindPlayer, name); // 从sql删除数据
    }

    //==========================//
    //           上下线         //
    //==========================//

    static online(name: string) {
        if (!instanceCache.has(name)) return false;
        return instanceCache.get(name).online();
    }

    static offline(name: string) {
        if (!instanceCache.has(name)) return false;
        const i = instanceCache.get(name);
        sql.insertRow(i);
        return i.offline();
    }

    static onlineAll(check_isAutoOnline = false) {
        instanceCache.forEach((inst) => {
            if (inst.checkOnline()) return false; // 已在线
            check_isAutoOnline ? (inst.isAutoOnline ? inst.online() : undefined) : inst.online;
        });
        return true;
    }

    static offlineAll() {
        instanceCache.forEach((inst) => {
            if (!inst.checkOnline()) return;
            inst.offline();
        });
        return true;
    }

    //==========================//
    //          模拟操作        //
    //==========================//

    /**
     * 设置模拟朝向
     */
    static setDummyLookAt(name: string, targetPos: IntPos | FloatPos) {
        if (!instanceCache.has(name)) return false;
        return instanceCache.get(name).setDummyLookAt(targetPos);
    }

    /**
     * 设置模拟操作信息并开始模拟操作
     */
    static setOperationInfo(name: string, type: LoopTypes, time: number, slot: number = undefined) {
        if (!instanceCache.has(name)) return false;
        const inst = instanceCache.get(name);
        inst.loopType = type;
        inst.loopSlot = slot;
        inst.loopCycleTime = time;
        return inst.loopStart();
    }

    static stopOperation(name: string) {
        if (!instanceCache.has(name)) return false;
        const inst = instanceCache.get(name);
        return inst.loopStop();
    }

    static stopOperationAll() {
        instanceCache.forEach((inst) => {
            inst.loopStop();
        });
        return true;
    }

    static setProperty(name: string, key: Propertys, value: boolean) {
        if (!instanceCache.has(name)) return false;
        const fp = instanceCache.get(name);
        fp[key] = value;
        return sql.insertRow(fp);
    }

    //==========================//
    //          实例获取         //
    //==========================//

    static getAllDummyInst(): dummyExample[] {
        return [...instanceCache.values()];
    }

    static getDummyInst(name: string): dummyExample {
        return instanceCache.has(name) ? instanceCache.get(name) : null;
    }

    static getOnlineDummy() {
        return this.getAllDummyInst().filter((dummy) => dummy.isOnline);
    }
}

Config.MaxOnline.Enable
    ? setInterval(async () => {
          Config.MaxOnline.Enable
              ? FPManager.getOnlineDummy().forEach(async (i) => {
                    if (Time_Mod.checkEndTime(i.offlineTime)) {
                        i.offline()
                            ? logger.info(`假人[${i.name}]已到达最大在线时长，已下线`)
                            : logger.warn(`假人[${i.name}]已到达最大在线时长，下线失败!`);
                    }
                })
              : null;
      }, 60000)
    : null;
