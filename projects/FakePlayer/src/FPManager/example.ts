import { time } from "../modules/Time.js";
import { levelDB } from "../DB/LevelDB.js";
import { onDummyLookPos, onDummyOffline, onDummyOnline, onDummySimulationOperation, onDummyTryRespawn } from "../Event/ListenerEvent.js";
import { Config } from "../utils/config.js";
import { stringifyExample } from "../utils/utils.js";
export class dummyExample {
    constructor(name: string) {
        if (mc.getPlayer(name)) {
            throw new Error("Instantiation failed, name is already taken");
        }
        this.name = name;
    }

    name: string; // 玩家名
    uuid: string; // 假人UUID

    onlinePos: IntPos | FloatPos; //上线坐标
    bindPlayer: string; //绑定玩家

    isInvincible: boolean; //是否无敌
    isAutoRespawn: boolean; // 自动重生
    isAutoOnline: boolean; //自动上线
    offlineTime: string; // 下线时间

    isOnline: boolean; // 当前是否在线
    bagGUIDKey: string; // 背包ID（数据库Key）

    /// func

    initData(data: initDataType) {
        const { isAutoOnline, isAutoRespawn, isInvincible, bagGUIDKey, bindPlayer, onlinePos } = data;
        this.isAutoOnline = isAutoOnline;
        this.bagGUIDKey = bagGUIDKey;
        this.bindPlayer = bindPlayer;
        this.onlinePos = onlinePos;
        this.isAutoRespawn = isAutoRespawn;
        this.isInvincible = isInvincible;
        return true;
    }

    get() {
        const pl = mc.getPlayer(this.name) as SimulatedPlayer;
        return pl && pl.isSimulatedPlayer() ? pl : null;
    }

    checkOnline() {
        const p1 = this.get();
        this.isOnline = p1 == null ? false : true;
        return this.isOnline;
    }

    online() {
        if (this.checkOnline()) return false;
        if (onDummyOnline.exec(stringifyExample(this))) {
            const p = mc.spawnSimulatedPlayer(this.name, this.onlinePos);
            this.uuid = p.uuid;
            this.writeBag();
            this.offlineTime = Config.MaxOnline.Enable ? time.getEndTimeStr(Config.MaxOnline.Time) : undefined; // 设置最大在线时长
        }
        return this.checkOnline();
    }

    offline() {
        if (!this.checkOnline()) return false;
        if (onDummyOffline.exec(stringifyExample(this))) {
            this.setBagToLevelDB();
            this.get().simulateDisconnect();
        }
        return this.checkOnline();
    }

    tryRespawn() {
        if (onDummyTryRespawn.exec(stringifyExample(this))) {
            return this.get().simulateRespawn();
        }
        return false;
    }

    teleport(targetPos: IntPos) {
        if (!this.checkOnline()) return false;
        const s = this.get().teleport(targetPos);
        if (s) {
            this.onlinePos = targetPos;
        }
        return s;
    }

    // playerBag

    getBagFromLevelDB(): string {
        return levelDB.get(this.bagGUIDKey) || null;
    }

    setBagToLevelDB() {
        if (!this.checkOnline()) return false;
        const snbt = this.get().getNbt().toSNBT();
        if (snbt) {
            return levelDB.set(this.bagGUIDKey, snbt);
        }
        return false;
    }

    writeBag() {
        if (!this.checkOnline()) return false;
        const snbtString = this.getBagFromLevelDB();
        if (!snbtString) return false;
        const snbt = NBT.parseSNBT(snbtString);
        if (!snbt) return false;

        const nbtObject: {
            [key: string]: NbtType;
        } = {
            Mainhand: snbt.getTag("Mainhand"),
            Offhand: snbt.getTag("Offhand"),
            Armor: snbt.getTag("Armor"),
            Inventory: snbt.getTag("Inventory"),
        };

        const pl = this.get();
        const playerNBT = pl.getNbt(); // 备份NBT用于修改数据

        Object.keys(nbtObject).forEach((key) => {
            if (nbtObject[key]) {
                playerNBT.setTag(key.toString(), nbtObject[key]) ? logger.info(`恢复假人背包: ${key}`) : logger.error(`set ${key} error`);
            }
        });
        pl.setNbt(playerNBT); // 写入NBT
        pl.refreshItems();
        return true;
    }

    // simulatedOperation

    setDummyLookAt(target: IntPos | FloatPos | Block | Entity) {
        if (!this.checkOnline()) return false;
        if (onDummyLookPos.exec(stringifyExample(this))) {
            return this.get().simulateLookAt(target);
        }
        return false;
    }

    loopSlot: number; // 循环操作（使用物品槽位）
    loopType: LoopTypes; // 操作类型
    loopCycleTime: number = 1000; // 循环周期
    private loopID: number; // setTimeout的ID

    loopStart() {
        try {
            if (!this.checkOnline()) return false;
            const pl = this.get();

            if (onDummySimulationOperation.exec(stringifyExample(this))) {
                switch (this.loopType) {
                    case "attack":
                        pl.simulateAttack();
                        break;
                    case "destroy":
                        pl.simulateDestroy();
                        break;
                    case "item":
                        pl.simulateUseItem(this.loopSlot);
                        break;
                    default:
                        return false;
                }
            }
            if (this.loopCycleTime <= 10) this.loopCycleTime = 1000;

            this.loopID = setTimeout(() => {
                this.looping();
            }, this.loopCycleTime);
            return true;
        } catch (e) {
            logger.error(`${e}\n${e.stack}`);
            return false;
        }
    }

    private looping = () => {
        if (this.checkOnline()) return false;
        if (this.loopType === "item") {
            this.get().simulateStopUsingItem();
        }
        return this.loopStart();
    };

    loopStop() {
        if (this.loopID) {
            if (clearInterval(this.loopID)) {
                this.loopID = undefined;
                this.loopType = undefined;
                return true;
            }
        }
        return false;
    }
}
