module.exports = {
    name: "tell",
    introduce: "发送文本扩展",
    version: [1, 0, 0],
    otherInformation: {
        Autor: "engsr6982",
    },

    type: "tell",
    entry: function (player, button) {
        return player.tell(button.run);
    },
};
