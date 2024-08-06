declare function log(...args: string[]): boolean;

declare function colorLog(
  color:
    | /**深蓝色*/ "dk_blue"
    | /**深绿色*/ "dk_green"
    | /**浅蓝色*/ "bt_blue"
    | /**深红色*/ "dk_red"
    | /**紫色*/ "purple"
    | /**深黄色*/ "dk_yellow"
    | /**灰色*/ "grey"
    | /**天蓝色*/ "sky_blue"
    | /**蓝色*/ "blue"
    | /**绿色*/ "green"
    | /**青色*/ "cyan"
    | /**红色*/ "red"
    | /**粉色*/ "pink"
    | /**黄色*/ "yellow"
    | /**白色*/ "white",
  ...args: string[]
): boolean;

declare function format(format_string: string, ...args: any[]): string;

// @ts-ignore
declare class console {
  static log(...args: string[]): boolean;
  static info(...args: string[]): boolean;
  static warn(...args: string[]): boolean;
  static error(...args: string[]): boolean;
}

declare class os {
  static path: string;

  static mkdir(path: string): boolean;
  static delete(path: string): boolean;
  static copy(src: string, dest: string): boolean;
  static move(src: string, dest: string): boolean;
  static exists(path: string): boolean;
  static rename(src: string, dest: string): boolean;
  static isDir(path: string): boolean;
  static getFileList(path: string): string[];
  static getFileSize(path: string): number;
  static readFrom(path: string): string;
  static writeTo(path: string, content: string): boolean;
  static writeLine(path: string, content: string): boolean;

  static cmd(command: string): string; // cmd
}
