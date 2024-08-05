module.exports = {
    name: "tag",
    introduce: "Tag检测",
    version: [1, 0, 0],
    otherInformation: {
        Author: "engsr6982",
    },

    type: "tag",
    entry: function (player, button) {
        const { UMenu, Utils } = globalThis.UMenuApi;
        if (Utils.getType(button.run) !== "[object Object]") {
            UMenu.sendMsg(player, "未知错误");
            throw new TypeError(`扩展 tag 回调失败！run配置错误！`);
        }

        const tag: Extension_Tag = button.run;
        logger.info(JSON.stringify(tag));
        player.hasTag(tag.tag) ? UMenu.type(player, tag.withtag) : UMenu.type(player, tag.notag);
    },
};
