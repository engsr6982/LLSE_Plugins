type func = (player: Player) => any;

export class ModalForms {
    constructor(title: string = "default") {
        this._titleText = title;
    }

    private _titleText: string;
    private _contentText: string;

    private _confirmText: string = "";
    private _cancelText: string = "";

    private _confirmFunc: func;
    private _cancelFunc: func;
    private _defaultFunc: func;

    // public

    set contentText(text: string) {
        this._contentText = text;
    }

    setConfirm(text: string, call: func) {
        this._confirmText = text;
        this._confirmFunc = call;
    }
    setCancel(text: string, call: func) {
        this._cancelText = text;
        this._cancelFunc = call;
    }
    setDefault(call: func) {
        this._defaultFunc = call;
    }

    send(player: Player) {
        player.sendModalForm(this._titleText, this._contentText, this._confirmText, this._cancelText, (pl, res) => {
            switch (res) {
                case true:
                    return this._confirmFunc(pl);
                case false:
                    return this._cancelFunc(pl);
                default:
                    return this._defaultFunc(pl);
            }
        });
    }
}
