module.exports = {
    name: "contentForm",
    introduce: "内容表单",
    version: [1, 0, 0],
    otherInformation: {
        Author: "engsr6982",
    },

    type: "contentform",
    entry: function (player, button) {
        return send(player, button);
    },
};

// @ts-ignore
function send(player: Player, button: ButtonJson) {
    const { Utils, UMenu } = globalThis.UMenuApi;
    if (Utils.getType(button.run) !== "[object Object]") {
        UMenu.sendMsg(player, "未知错误");
        throw new TypeError(`扩展contentform回调失败！run配置错误！`);
    }

    try {
        const fm = mc.newCustomForm();
        fm.setTitle(button.run.title || "");
        fm.addLabel(button.run.content || "");
        player.sendForm(fm, (pl, dt) => {
            if (dt == null) {
                UMenu.type(pl, button.run.close);
                return;
            }
            UMenu.type(pl, button.run.submit);
        });
    } catch (err) {
        UMenu.sendMsg(player, "未知错误");
        logger.error(`扩展contentform回调失败: ${err}\n${err.stack}`);
    }
}
