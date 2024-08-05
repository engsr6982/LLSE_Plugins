// 注意： 请不要修改主函数 main的命名
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function main(realName, button) {
    const player = mc.getPlayer(realName);
    // 例如：发送一条广播
    mc.broadcast("UMenu");
    // 或者：发送本次被点击按钮的Type
    player.tell(button.type);
}
