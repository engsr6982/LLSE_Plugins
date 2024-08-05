interface _TimeObj {
    Str: string;
    Y: number | string;
    M: number | string;
    D: number | string;
}

export default class CsvLogger {
    /**
     * 实例化CsvLogger
     * @param path 存放CSV日志到文件夹 .\\logs\\
     * @param fileName CSV文件名  log.csv  或 log_%Y%-%M%-%D%.csv
     * @param header CSV文件第一行内容
     */
    constructor(path: string, fileName: string, header = "") {
        this._path = path;
        this._fileName = fileName;
        this._header = header;
        this._openName = null;
        this._openFile = this._path + this._openName;
        this.checkFileName();
    }

    _path: string;
    _fileName: string;
    _header: string;
    _openName: string;
    _openFile: string;

    /**
     * 获取日期字符串
     * @returns 2021-6-10
     */
    getTimeStr(): _TimeObj {
        const t = system.getTimeObj();
        return {
            Str: `${t.Y}-${t.M}-${t.D}`,
            Y: t.Y,
            M: t.M,
            D: t.D,
        };
    }

    /**
     * 检查文件名是否需要更新
     */
    checkFileName() {
        const dateStr = this.getTimeStr();
        const name = this._fileName
            .replace(/%Y%/, dateStr.Y as string)
            .replace(/%M%/, dateStr.M as string)
            .replace(/%D%/, dateStr.D as string);
        if (name !== this._openName) {
            this._openName = name;
            this._openFile = this._path + this._openName;
            // 如果有header，写入header
            if (this._header && !file.exists(this._openFile)) {
                this.write(this._header);
            }
        }
    }

    /**
     * 写入一行日志
     * @param msg 日志内容
     * @returns 是否写入成功
     */
    write(msg: string): boolean {
        this.checkFileName();
        return file.writeLine(this._openFile, msg);
    }
}
