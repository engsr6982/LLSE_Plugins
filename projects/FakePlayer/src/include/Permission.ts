import PermissionCore from "../modules/Permission/PermissionCore.js";
import PermissionForm from "../modules/Permission/PermissionForm.js";
import { _filePath } from "../utils/config.js";

export const permissionCore = new PermissionCore(`${_filePath}data\\permission.json`, true);
export const permissionForm = new PermissionForm(`${_filePath}lang\\`, () => {
    return permissionCore;
});

// 注册权限
permissionCore.registerPermission("添加假人", "add");
permissionCore.registerPermission("删除假人", "delete");
permissionCore.registerPermission("编辑假人", "edit");
permissionCore.registerPermission("上线假人", "online");
permissionCore.registerPermission("上线所有", "onlineall");
permissionCore.registerPermission("下线假人", "offonline");
permissionCore.registerPermission("下线所有", "offonlineall");
permissionCore.registerPermission("假人传送", "tp");
permissionCore.registerPermission("假人说话", "talkas");
permissionCore.registerPermission("假人命令", "cmd");
permissionCore.registerPermission("查看假人", "list");
permissionCore.registerPermission("模拟朝向", "lookpos");
permissionCore.registerPermission("模拟破坏", "block");
permissionCore.registerPermission("模拟攻击", "attack");
permissionCore.registerPermission("使用物品", "item");
permissionCore.registerPermission("关闭模拟操作", "offoperation");
permissionCore.registerPermission("关闭所有模拟操作", "offoperationall");
permissionCore.registerPermission("假人背包", "bag");
