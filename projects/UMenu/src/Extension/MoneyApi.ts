// MoneyApi and Color Copy the github.com/engsr6982/LSE-Modules

interface MoneyConfig_ {
    /**开关 */
    Enable: boolean;
    /**经济类型 */
    MoneyType: "llmoney" | "score";
    /**计分板经济名称 */
    ScoreType: string;
    /**经济名称 */
    MoneyName: string;
}

class MoneyApi {
    private cfg: MoneyConfig_;

    constructor(config: MoneyConfig_) {
        this.cfg = config;
    }

    /**
     * 更新配置
     * @param config 配置
     * @returns 是否更新成功
     */
    updateConfig(config: MoneyConfig_): boolean {
        this.cfg = config;
        return true;
    }

    /**
     * 向玩家发送一条消息
     * @param player 玩家对象
     * @param msg 消息内容
     * @returns 是否发送成功
     */
    private tell(player: Player, msg: string): boolean {
        return player.tell(`[moneys] ${msg}`);
    }

    /**
     * 未知经济（抛出错误）
     * @param player 玩家对象（可选）
     */
    private unknownMoneyType(player?: Player) {
        player ? this.tell(player, `出现了一个错误，导致插件无法完成该操作，请联系服务器管理员。`) : null;
        throw new Error("未知的经济类型" + this.cfg.MoneyType);
    }

    /**
     * 获取玩家经济
     * @param player 玩家对象
     * @returns 玩家的经济
     */
    getPlayeyMoney(player: Player): number {
        switch (this.cfg.MoneyType) {
            case "llmoney":
                return money.get(player.xuid);
            case "score":
                return player.getScore(this.cfg.ScoreType);
            default:
                this.unknownMoneyType(player);
        }
    }

    /**
     * 获取玩家操作经济消耗字符串
     * @param player 玩家对象
     * @param deMoney 要消耗的经济
     * @returns 字符串
     */
    getPlayerMoneyStr(player: Player, deMoney: number) {
        const playerMoney = this.cfg.Enable ? this.getPlayeyMoney(player) : 0;
        return `§l此操作需消耗§9[§e${deMoney}§9]§r§l${this.cfg.MoneyName}, 当前${this.cfg.MoneyName}: §a${playerMoney}`;
    }

    /**
     * 给玩家添加经济
     * @param player 玩家对象
     * @param addMoney 要增加的经济
     * @returns 是否增加成功
     */
    addPlayerMoney(player: Player, addMoney: number) {
        if (this.cfg.Enable === false) return true;
        switch (this.cfg.MoneyType) {
            case "llmoney":
                return money.add(player.xuid, addMoney);
            case "score":
                return player.addScore(this.cfg.ScoreType, addMoney);
            default:
                this.unknownMoneyType(player);
        }
    }

    /**
     * 扣除玩家经济
     * @param player 玩家对象
     * @param deMoney 要扣除的经济
     * @returns 是否扣除成功
     */
    deductPlayerMoney(player: Player, deMoney: number) {
        if (this.cfg.Enable === false) return true;
        const cm = this.getPlayeyMoney(player);
        if (cm >= deMoney) {
            switch (this.cfg.MoneyType) {
                case "llmoney":
                    return money.reduce(player.xuid, deMoney);
                case "score":
                    return player.reduceScore(this.cfg.ScoreType, deMoney);
                default:
                    return this.unknownMoneyType(player);
            }
        }
        this.tell(player, `${this.cfg.MoneyName}不足！ 无法继续操作!`);
        return false;
    }
}

// ================================================================================ extension start

{
    module.exports = {
        name: "UMenu-MoneyApi",
        introduce: "UMenu经济支持扩展",
        version: [1, 0, 0],
        otherInformation: {
            author: "engsr6982",
        },

        type: "umenu_inside_moneyapi",
        entry: () => {},
    };

    const convet = (cfg: any) => {
        const { enable, moneyType, moneyName, scoreType } = cfg.money;
        return {
            Enable: enable,
            MoneyType: moneyType,
            ScoreType: scoreType,
            MoneyName: moneyName,
        };
    };

    const moneyApi = new MoneyApi(convet(globalThis.UMenuApi.config));
    globalThis.UMenuApi.onEvent("onConfigChange", () => {
        // 配置文件更改，立即更新经济配置
        moneyApi.updateConfig(convet(globalThis.UMenuApi.config));
    });

    globalThis.UMenuApi.onEvent("onUMenuFormCallBack", (player: Player, button: ButtonJson) => {
        // 扣除经济
        if (globalThis.UMenuApi.Utils.hasKey(button, "money")) {
            return moneyApi.deductPlayerMoney(player, button.money);
        }
    });
}
