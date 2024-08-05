module.exports = {
    name: "form",
    introduce: "多表单扩展",
    version: [1, 0, 0],
    otherInformation: {
        Author: "engsr6982",
    },

    type: "form",
    entry: function (player, button) {
        return send(player, button);
    },
};

// @ts-ignore
function send(player: Player, button: ButtonJson) {
    const { UMenu, fileSystem } = globalThis.UMenuApi;

    const json = fileSystem.getForm(button.run);
    if (!json) {
        logger.error(`扩展 form 读取文件失败! ${button.run}`);
        return;
    }

    UMenu.main(player, json);
}
