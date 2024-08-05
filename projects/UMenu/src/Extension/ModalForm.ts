module.exports = {
    name: "modalform",
    introduce: "模式表单扩展",
    version: [1, 0, 0],
    otherInformation: {
        Author: "engsr6982",
    },

    type: "modalform",
    entry: function (player, button) {
        return distAndSend(player, button);
    },
};

function distAndSend(player: Player, button: ButtonJson) {
    const { UMenu, Utils } = globalThis.UMenuApi;

    if (Utils.getType(button.run) !== "[object Object]") {
        UMenu.sendMsg(player, "未知错误");
        throw new TypeError(`扩展 modalform 配置错误`);
    }

    try {
        player.sendModalForm(
            button.run.title || "",
            button.run.content || "",
            button.run.button1.name || "",
            button.run.button2.name || "",
            (pl, res) => {
                switch (res) {
                    case true:
                        UMenu.type(pl, button.run.button1);
                        break;
                    case false:
                        UMenu.type(pl, button.run.button2);
                        break;
                    default:
                        UMenu.sendMsg(pl, `表单已放弃`);
                }
            },
        );
    } catch (err) {
        UMenu.sendMsg(player, "未知错误, 执行失败！");
        logger.error(`捕获错误: ${err}\n${err.stack}`);
    }
}
