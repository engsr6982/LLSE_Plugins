/* eslint-disable no-var */

declare global {
    namespace globalThis {
        var UMenuApi: {
            Utils: typeof Utils;
            UMenu: typeof UMenu;
            Color: Color;
            config: ConfigType;
            PdvSystem: typeof PdvSystem;
            fileSystem: typeof fileSystem;
            onEvent: VirtualEvent.on;
        };
    }
}
export {};
