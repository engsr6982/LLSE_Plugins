/** 用户组元素 */
interface UserGroupElements {
    /** 组名 */ groupName: string;
    /** 权限 */ authority: Array<string>;
    /** 用户 */ user: Array<xuid>;
}

/** 权限组文件 */
interface PermissionFileJSON {
    /** 管理组 */ adminGroup: Array<xuid>;
    /** 用户组 */ userGroup: Array<UserGroupElements>;
    /** 公共组 */ publicGroup: {
        /** 权限 */ authority: Array<string>;
    };
}

interface GetGroupType {
    /** 组下标 */ index: number;
    /** 组数据 */ group: UserGroupElements;
}

interface GetUserPermissionsType {
    /** 拥有的权限 */ authority: Array<string>;
    /** 权限的来源 */ source: {
        [authority: string]: Array<string>;
    };
}

/// PermissionManager

interface RegPermissionElement {
    /** 权限名 */ name: string;
    /** 权限值! */ value: string;
}
