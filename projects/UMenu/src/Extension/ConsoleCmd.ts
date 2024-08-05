module.exports = {
    name: "console_Cmd",
    introduce: "cmd执行后台命令",
    version: [1, 0, 0],
    otherInformation: {
        Author: "engsr6982",
    },

    type: "consolecmd",
    entry: function (player, button) {
        return mc.runcmd(button.run);
    },
};
