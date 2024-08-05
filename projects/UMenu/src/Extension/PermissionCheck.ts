module.exports = {
    name: "ButtonPermissionCheck",
    introduce: "按钮权限检查",
    version: [1, 0, 0],
    otherInformation: {
        Author: "engsr6982",
    },

    type: "ButtonPermissionCheck",
    entry: function () {},
};

globalThis.UMenuApi.onEvent("onUMenuFormCallBack", (player: Player, button: ButtonJson) => {
    const { UMenu, Utils } = globalThis.UMenuApi;
    if (!Utils.hasKey(button, "permission")) return true; // 没配置（默认有权限）
    if (
        Utils.getType(button.permission) !== "[object Array]" ||
        Utils.getType(button.permission[0]) !== "[object String]" ||
        Utils.getType(button.permission[1]) !== "[object Array]"
    ) {
        logger.error(`button: ${button.name} button.permission type error!`);
        UMenu.sendMsg(player, "未知错误");
        return false; // 配置错误（无权限，拦截回调）
    }

    switch (button.permission[0]) {
        case "any":
            return true; // 有权限
        case "op": {
            if (!player.isOP()) {
                UMenu.sendMsg(player, "无权限");
                return false;
            }
            return true;
        }
        case "whitelist": {
            if (!button.permission[1].some((i) => i === player.realName)) {
                UMenu.sendMsg(player, "无权限");
                return false;
            }
            return true;
        }
        case "blacklist": {
            if (button.permission[1].some((i) => i === player.realName)) {
                UMenu.sendMsg(player, "无权限");
                return false;
            }
            return true;
        }
        default:
            return false; // 配置错误（拦截
    }
});
