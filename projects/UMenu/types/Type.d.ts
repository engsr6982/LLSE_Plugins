// 插件基础类型定义

interface FormJson {
    title?: string;
    content?: string | Array<string>;
    buttons: Array<ButtonJson>;
}
interface ButtonJson extends ButtonCallBack {
    name?: string;
    describe?: string;
    image?: string;
}
// 按钮回调（当用户点击按钮后进行的操作的参数）
interface ButtonCallBack {
    money?: number;
    permission?: ["any" | "op" | "whitelist" | "blacklist", Array<string>?]; // 按钮权限-参数2仅 白/黑 名单可用
    type: "cmd" | "form" | "tell" | "eval" | "modalform" | "contentform" | "subform" | "tag";
    run: string | ModalFormJson | ContentFormJson | SubFormJson | Extension_Tag;
}
type SubFormJson = JsonForm;

interface ModalFormJson {
    title: string;
    content?: string;
    button1: ButtonJson;
    button2: ButtonJson;
}
interface ContentFormJson {
    title: string;
    content: string;
    close: ButtonJson;
    submit: ButtonJson;
}
interface Extension_Tag {
    tag: string;
    withtag: ButtonJson;
    notag: ButtonJson;
}

interface ExtensionExportInfo {
    name: string;
    introduce: string;
    version: [number, number, number];
    otherInformation: { [key: string]: string };

    type: string;
    entry: (player: Player, buutton: ButtonJson) => any;
    fileName?: string;
}

interface ConfigType {
    entryFile: string;
    listen: {
        enable: boolean;
        listenItem: `minecraft:${string}`;
    };
    command: {
        command: string;
        describe: string;
    };
    money: {
        enable: boolean;
        moneyType: "llmoney" | "score";
        scoreType: string;
        moneyName: string;
    };
}

declare namespace module {
    export var exports: ExtensionExportInfo;
}
