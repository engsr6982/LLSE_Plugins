type callback_ = (player: Player) => any;

class Button {
    constructor(text: string, callback: callback_, image: string) {
        this.text = text;
        this.callback = callback;
        this.image = image;
    }

    text: string;
    callback: callback_;
    image: string;
}

export class SimpleForms {
    /**
     * 创建SimpleForms
     * @param title 表单标题
     */
    constructor(title: string) {
        this.fm = mc.newSimpleForm();
        this.fm.setTitle(title);
        this.buttons = [];
    }

    private fm: SimpleForm;
    private buttons: Array<Button>;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private formClose(player?: Player) {}

    /**
     * 设置表单内容
     */
    set content(text: string) {
        this.fm.setContent(text);
    }

    /**
     * 表单关闭回调
     */
    set close(callback: callback_) {
        this.formClose = callback;
    }

    /**
     * 添加一个按钮
     * @param text 按钮文本
     * @param callback 回调
     * @param image 按钮图片
     */
    addButton(text: string, callback: callback_, image?: string) {
        this.fm.addButton(text, image || "");
        this.buttons.push(new Button(text, callback, image));
    }

    private runCallBack() {
        const formClose = this.formClose,
            buttons = this.buttons;
        // 下边匿名函数，不要用this
        // 如果使用this，将会导致BDS直接崩溃
        return (player: Player, id: number) => {
            if (id == null) {
                formClose(player);
            } else {
                buttons[id].callback(player);
            }
        };
    }

    /**
     * 发送表单
     * @param player 玩家
     * @returns 返回值
     */
    send(player: Player) {
        return player.sendForm(this.fm, this.runCallBack());
    }
}

export class SimpleFormWithBack extends SimpleForms {
    private img: string = "textures/ui/icon_import";
    private back: callback_;
    private position: "top" | "bottom";

    private initBackButton() {
        super.addButton("返回上一页", this.back, this.img);
    }

    /**
     * 带有 上一页 按钮的 SimpleForms
     * @param title 标题
     * @param back 上一页函数
     * @param position 位置
     */
    constructor(title: string, back: callback_, position: "top" | "bottom") {
        super(title);
        this.back = back;
        this.position = position;

        if (position === "top") {
            this.initBackButton();
        }
    }

    /**
     * 发送表单
     * @param player 玩家
     * @returns 返回
     */
    send(player: Player): number {
        if (this.position === "bottom") {
            this.initBackButton();
        }
        return super.send(player);
    }
}
