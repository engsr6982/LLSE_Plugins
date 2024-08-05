module.exports = {
    name: "Eval_JavaScript",
    introduce: "代码运行支持",
    version: [1, 0, 0],
    otherInformation: {
        Author: "engsr6982",
    },

    type: "eval",
    entry: function (player, button) {
        return runJSCode(player, button);
    },
};

function runJSCode(player: Player, button: ButtonJson) {
    const { fileSystem, UMenu } = globalThis.UMenuApi;
    try {
        const jsStr = fileSystem.getEval(button.run);
        const runJS = jsStr + `;main("${player.realName}", ${JSON.stringify(button)})`;
        // logger.info("替换完成：", runJS);
        eval(runJS);
    } catch (err) {
        UMenu.sendMsg(player, "未知错误！");
        logger.error(`扩展 Eval 执行失败: ${err}\n${err.stack}`);
    }
}
