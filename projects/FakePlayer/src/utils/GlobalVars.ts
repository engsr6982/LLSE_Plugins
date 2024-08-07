/**插件信息 */
export const pluginInformation = {
    name: "FakePlayer",
    introduce: "模拟玩家/假人",
    version: [5, 0, 0, Version.Release] as readonly [number, number, number, Version],
    author: "engsr6982",
};
/**消息前缀 */

export const Gm_Tell = file.exists(`.\\plugins\\${pluginInformation.author}\\debug`)
    ? `§e§l[§d${pluginInformation.name} Debug§e]§r§b `
    : `§e§l[§d${pluginInformation.name}§e]§r§b `;
