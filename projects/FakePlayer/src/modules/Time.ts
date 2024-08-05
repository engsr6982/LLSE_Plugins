export class time {
    /**
     * 格式化Date到对象
     * @param date_ Date
     * @returns
     */
    static formatDateToObject(date_: Date) {
        const date = date_ ? date_ : new Date();
        const y = date.getFullYear();
        const m = (date.getMonth() + 1).toString().padStart(2, "0");
        const d = date.getDate().toString().padStart(2, "0");
        const h = date.getHours().toString().padStart(2, "0");
        const i = date.getMinutes().toString().padStart(2, "0");
        const s = date.getSeconds().toString().padStart(2, "0");
        return {
            y: y,
            m: m,
            d: d,
            h: h,
            i: i,
            s: s,
        };
    }

    /**
     * 格式化Date到字符串
     * @param date_
     * @returns
     */
    static formatDateToString(date_: Date): string {
        const { y, m, d, h, i, s } = this.formatDateToObject(date_);
        return `${y}-${m}-${d} ${h}:${i}:${s}`;
    }

    /**
     * 获取指定(分钟/毫秒)后的时间
     * @param time 分钟或毫秒
     * @param unit 时间单位，可选值为 'second' 或 'minute'，默认为 'minute'
     * @returns 格式化后的结束时间字符串
     */
    static getEndTimeStr(time: number, unit: "minute" | "second" = "minute"): string {
        return this.formatDateToString(new Date(Date.now() + time * (unit === "second" ? 1000 : 60000)));
    }

    /**
     * 检查当前时间是否超过传入日期
     * @param time 传入日期  2023-01-01 10:30:20
     * @returns true超过 false未超过
     */
    static checkEndTime(time: string): boolean {
        return new Date(time).getTime() <= new Date().getTime();
    }

    /**
     * 获取昨天的开始和结束时间
     * @returns 昨天的开始和结束时间
     */
    static getYesterdayTime(): { start: Date; end: Date } {
        const start = new Date(new Date(new Date().toLocaleDateString()).getTime() - 24 * 60 * 60 * 1000);
        const end = new Date(new Date(new Date().toLocaleDateString()).getTime() - 1);
        return { start, end };
    }

    /**
     * 获取今天的开始和结束时间
     * @returns 今天的开始和结束时间
     */
    static getTodayTime(): { start: Date; end: Date } {
        const start = new Date(new Date(new Date().toLocaleDateString()).getTime());
        const end = new Date(new Date(new Date().toLocaleDateString()).getTime() + 24 * 60 * 60 * 1000 - 1);
        return { start, end };
    }

    /**
     * 获取明天的开始和结束时间
     * @returns 明天的开始和结束时间
     */
    static getTomorrowTime(): { start: Date; end: Date } {
        const start = new Date(new Date(new Date().toLocaleDateString()).getTime() + 24 * 60 * 60 * 1000);
        const end = new Date(new Date(new Date().toLocaleDateString()).getTime() + 24 * 60 * 60 * 1000 * 2 - 1);
        return { start, end };
    }
}
