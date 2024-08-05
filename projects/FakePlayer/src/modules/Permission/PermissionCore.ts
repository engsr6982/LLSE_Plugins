export default class PermissionCore {
    private checkKeyInObject(object: object, key: string): boolean {
        return Object.prototype.hasOwnProperty.call(object, key);
    }

    /** 启用公共组 */
    isPublicGroupEnabled: boolean;
    /** 存储路径 */
    private pathForStorage: string;
    /** 文件缓存 */
    private permissionFileCache: PermissionFileJSON;

    constructor(pathForStorage: string, isPublicGroupEnabled: boolean = false) {
        this.pathForStorage = pathForStorage;
        this.isPublicGroupEnabled = isPublicGroupEnabled;
        this.loadPermissionFile();
        this.initializePublicGroup();
    }

    /**
     * 加载权限文件
     * @returns 成功状态
     */
    private loadPermissionFile(): boolean {
        if (!file.exists(this.pathForStorage)) {
            // 文件不存在
            file.writeTo(
                this.pathForStorage,
                JSON.stringify({
                    adminGroup: [],
                    userGroup: [],
                }),
            );
        }
        // 加载文件
        this.permissionFileCache = JSON.parse(file.readFrom(this.pathForStorage));
        return true;
    }

    /**
     * 保存权限文件
     * @returns 成功状态
     */
    private savePermissionFile(): boolean {
        return file.writeTo(this.pathForStorage, JSON.stringify(this.permissionFileCache));
    }

    // ====================================================================================================

    /**
     * 初始化公共组
     * @returns 成功状态
     */
    private initializePublicGroup(): boolean {
        if (this.isPublicGroupEnabled === false) return false;
        if (this.checkKeyInObject(this.permissionFileCache, "publicGroup")) return false;
        this.permissionFileCache["publicGroup"] = {
            authority: [],
        };
        return this.savePermissionFile();
    }

    //! 管理员接口

    /**
     * 获取所有管理员
     * @returns 所有管理员
     */
    retrieveAllAdmins() {
        return this.permissionFileCache.adminGroup;
    }

    /**
     * 检查用户是否为管理员
     * @param xuid 用户xuid
     * @returns 管理员状态
     */
    checkIfAdmin(xuid: string): boolean {
        return this.permissionFileCache.adminGroup.indexOf(xuid) !== -1;
    }

    /**
     * 添加管理员
     * @param xuid 用户xuid
     * @returns 成功状态
     */
    addAdminUser(xuid: string): boolean {
        if (this.checkIfAdmin(xuid)) return false;
        this.permissionFileCache.adminGroup.push(xuid);
        return this.savePermissionFile();
    }

    /**
     * 移除管理员
     * @param xuid 用户xuid
     * @returns 成功状态
     */
    removeAdminUser(xuid: string): boolean {
        if (!this.checkIfAdmin(xuid)) return false;
        const { adminGroup } = this.permissionFileCache;
        this.permissionFileCache.adminGroup.splice(
            adminGroup.findIndex((xuids) => xuids === xuid),
            1,
        );
        return this.savePermissionFile();
    }

    //! 用户组接口

    /**
     * 检查名称有效性 (允许1-16字节，允许中文字母，数字，下划线)
     * @param name 名称
     * @returns 有效性
     */
    private validateName(name: string): boolean {
        return RegExp(/^[a-zA-Z0-9_\u4e00-\u9fa5]{1,16}$/g).test(name);
    }

    /**
     * 检查组是否存在
     * @param name 权限组名称
     * @returns 存在性
     */
    checkGroupExistence(name: string): boolean {
        return this.permissionFileCache.userGroup.some((i) => i.groupName === name);
    }

    /**
     * 获取组
     * @param name 组名称
     * @returns 组
     */
    retrieveGroup(name: string): GetGroupType | null {
        if (!this.checkGroupExistence(name)) return null;
        const { userGroup } = this.permissionFileCache;
        const index = userGroup.findIndex((i) => i.groupName === name);
        if (index !== -1) {
            return {
                index: index,
                group: this.permissionFileCache.userGroup[index],
            };
        }
        return null;
    }

    /**
     * 获取所有组
     * @returns 用户组列表
     */
    retrieveAllGroups(): Array<UserGroupElements> {
        return this.permissionFileCache.userGroup;
    }

    /**
     * 创建组
     * @param name 组名称
     * @returns 成功状态
     */
    createNewGroup(name: string): boolean {
        if (this.checkGroupExistence(name)) return false;
        if (!this.validateName(name)) return false;
        this.permissionFileCache.userGroup.push({
            groupName: name,
            authority: [],
            user: [],
        });
        return this.savePermissionFile();
    }

    /**
     * 删除组
     * @param name 组名称
     * @returns 成功状态
     */
    deleteExistingGroup(name: string): boolean {
        if (!this.checkGroupExistence(name)) return false;
        const { index } = this.retrieveGroup(name);
        this.permissionFileCache.userGroup.splice(index, 1);
        return this.savePermissionFile();
    }

    /**
     * 重命名组
     * @param name 组名称
     * @param newGroupName 新组名称
     * @returns 成功状态
     */
    renameExistingGroup(name: string, newGroupName: string): boolean {
        if (!this.checkGroupExistence(name)) return false;
        if (!this.validateName(newGroupName)) return false;
        const { index } = this.retrieveGroup(name);
        this.permissionFileCache.userGroup[index].groupName = newGroupName;
        return this.savePermissionFile();
    }

    /**
     * 检查组是否具有特定权限
     * @param name 组名称
     * @param authority 权限
     * @returns 所有权
     */
    checkGroupPermission(name: string, authority: string): boolean {
        if (!this.checkGroupExistence(name)) return false;
        const group = this.retrieveGroup(name);
        if (group === null) return false;
        return group.group.authority.some((i) => i === authority);
    }

    /**
     * 向组添加权限
     * @param name 组名称
     * @param authority 权限
     * @returns 成功状态
     */
    addGroupPermissions(name: string, authority: string): boolean {
        if (!this.checkGroupExistence(name)) return false; // 组不存在
        if (!this.validatePermission(authority)) return false; // 权限无效
        if (this.checkGroupPermission(name, authority)) return false; // 权限已添加
        const { index } = this.retrieveGroup(name);
        this.permissionFileCache.userGroup[index].authority.push(authority);
        return this.savePermissionFile();
    }

    /**
     * 从组中移除权限
     * @param name 组名称
     * @param authority 权限
     * @returns 成功状态
     */
    removeGroupPermissions(name: string, authority: string): boolean {
        if (!this.checkGroupExistence(name)) return false;
        if (!this.checkGroupPermission(name, authority)) return false;
        const { index, group } = this.retrieveGroup(name);
        this.permissionFileCache.userGroup[index].authority.splice(
            group.authority.findIndex((i) => i === authority),
            1,
        );
        return this.savePermissionFile();
    }

    /**
     * 检查组是否有特定用户
     * @param name 组名称
     * @param xuid 用户xuid
     * @returns 所有权
     */
    checkGroupUser(name: string, xuid: string): boolean {
        if (!this.checkGroupExistence(name)) return false;
        const group = this.retrieveGroup(name);
        if (group === null) return false;
        return group.group.user.some((i) => i === xuid);
    }

    /**
     * 将用户添加到组
     * @param name 组名称
     * @param xuid 用户xuid
     * @returns 成功状态
     */
    addUserToGroup(name: string, xuid: string): boolean {
        if (!this.checkGroupExistence(name)) return false;
        if (this.checkGroupUser(name, xuid)) return false;
        const { index } = this.retrieveGroup(name);
        this.permissionFileCache.userGroup[index].user.push(xuid);
        return this.savePermissionFile();
    }

    /**
     * 从组中移除用户
     * @param name 组名称
     * @param xuid 用户xuid
     * @returns 成功状态
     */
    removeUserFromGroup(name: string, xuid: string): boolean {
        if (!this.checkGroupExistence(name)) return false;
        if (!this.checkGroupUser(name, xuid)) return false;
        const { index, group } = this.retrieveGroup(name);
        this.permissionFileCache.userGroup[index].user.splice(
            group.user.findIndex((i) => i === xuid),
            1,
        );
        return this.savePermissionFile();
    }

    /**
     * 获取用户所在的组
     * @param xuid 用户xuid
     * @returns 组
     */
    retrieveUserGroups(xuid: string): Array<UserGroupElements> {
        const data: Array<UserGroupElements> = [];
        const { userGroup } = this.permissionFileCache;
        for (let i = 0; i < userGroup.length; i++) {
            const group = userGroup[i];
            if (!group.user.some((u) => u === xuid)) continue;
            data.push(group);
        }
        return data;
    }

    /**
     * 获取用户权限
     * @param xuid 用户xuid
     * @returns 权限
     */
    retrieveUserPermissions(xuid: string): GetUserPermissionsType {
        const data: GetUserPermissionsType = {
            authority: [],
            source: {},
        };
        const group = this.retrieveUserGroups(xuid); // 获取用户所在的组
        for (let i = 0; i < group.length; i++) {
            if (group[i].authority.length === 0) continue; // 组没有权限，跳过

            group[i].authority.forEach((perm) => {
                if (!data.authority.some((data_perm) => data_perm === perm)) {
                    // 组的权限尚未添加到返回缓存
                    data.authority.push(perm); // 添加到所有权限
                }

                if (!this.checkKeyInObject(data.source, perm)) {
                    data.source[perm] = []; // 初始化source[]
                }

                if (!data.source[perm].some((source_array_groupName) => source_array_groupName === group[i].groupName)) {
                    data.source[perm].push(group[i].groupName); // 将源组名称添加到数组
                }
            });
        }
        return data;
    }

    //! 公共组接口

    /**
     * 获取公共组权限
     * @returns 权限
     */
    retrievePublicGroupPermissions(): Array<string> {
        return this.permissionFileCache.publicGroup.authority;
    }

    /**
     * 检查公共组是否具有特定权限
     * @param authority 权限
     * @returns 所有权
     */
    checkPublicGroupPermission(authority: string): boolean {
        return this.retrievePublicGroupPermissions().some((p) => p === authority);
    }

    /**
     * 向公共组添加权限
     * @param authority 权限
     * @returns 成功状态
     */
    addPublicGroupPermissions(authority: string): boolean {
        if (!this.validatePermission(authority)) return false;
        if (this.checkPublicGroupPermission(authority)) return false;
        this.permissionFileCache.publicGroup.authority.push(authority);
        return this.savePermissionFile();
    }

    /**
     * 从公共组中移除权限
     * @param authority 权限
     * @returns 成功状态
     */
    removePublicGroupPermissions(authority: string): boolean {
        if (!this.checkPublicGroupPermission(authority)) return false;
        this.permissionFileCache.publicGroup.authority.splice(
            this.permissionFileCache.publicGroup.authority.findIndex((p) => p === authority),
            1,
        );
        return this.savePermissionFile();
    }

    //! 其他接口
    /**
     * 检查用户是否具有特定权限
     * @param xuid 用户xuid
     * @param authority 权限
     * @param publicGroup 在公共组中检查权限
     * @returns 权限状态
     */
    verifyUserPermission(xuid: string, authority: string, publicGroup: boolean = this.isPublicGroupEnabled) {
        if (this.retrieveUserPermissions(xuid).authority.some((p) => p === authority)) {
            return true;
        }
        return publicGroup && this.isPublicGroupEnabled ? this.checkPublicGroupPermission(authority) : false;
    }

    //! 权限注册接口

    /**
     * 检查权限是否有效 (6~12个字符，允许数字，字母)
     * @param authority 权限
     * @returns 有效性
     */
    private validatePermission(authority: string): boolean {
        return RegExp(/^[a-zA-Z0-9]{6,12}$/g).test(authority);
    }

    /** 所有已注册的权限 */
    private registeredPermissions: Array<RegPermissionElement> = [];

    /**
     * 获取所有已注册的权限
     * @returns 权限列表
     */
    retrieveAllPermissions(): Array<RegPermissionElement> {
        return this.registeredPermissions;
    }

    /**
     * 获取权限
     * @param value 权限值
     * @returns 权限对象
     */
    retrievePermission(value: string): RegPermissionElement | null {
        const index = this.registeredPermissions.findIndex((i) => i.value === value);
        return index !== -1 ? this.registeredPermissions[index] : null;
    }

    /**
     * 检查权限是否已注册
     * @param authority 权限
     * @returns 注册状态
     */
    checkPermissionRegistration(authority: string): boolean {
        return this.registeredPermissions.some((i) => i.value === authority);
    }

    /**
     * 注册权限
     * @param name 权限名称
     * @param authority 权限值
     * @returns 成功状态
     */
    registerPermission(name: string, authority: string): boolean {
        if (!this.validateName(name)) return false; // 名称无效
        if (!this.validatePermission(authority)) return false; // 权限值无效
        if (this.checkPermissionRegistration(authority)) return false; // 权限值已注册
        this.registeredPermissions.push({
            name: name,
            value: authority,
        });
        return true;
    }

    /**
     * 注销权限
     * @param authority 权限
     * @returns 成功状态
     */
    unregisterPermission(authority: string): boolean {
        if (!this.checkPermissionRegistration(authority)) return false;
        this.registeredPermissions.splice(
            this.registeredPermissions.findIndex((i) => i.value === authority),
            1,
        );
        return true;
    }
}
