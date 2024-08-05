# FP - 假人系统

## 插件特性

-   拥有OPTools同款权限组（Pro版）全GUI操作
-   支持假人执行命令、说话、模拟操作等...
-   超详细的日志系统（CSV格式）记录玩家每一次操作
-   假人绑定玩家，无法越权操作假人
-   保留旧版原有的功能特性
-   SQLite存储数据
-   假人背包保存
-   更多特性，请下载后体验

## 注意

本插件为白名单制，默认所有人无权限。  
当然，你可以选择开放一些功能给所有玩家  
也可以开放部分功能的权限给权限组内的玩家

具体步骤看下文[常见问题](#常见问题解答)

本插件每一个功能都有独立权限

## 命令系统

> []为可选参数，<>为必选参数

```command
/fp op <opname>   添加一个插件管理员

/fp deop <opname>   删除一个插件管理员

/fp [gui]  打开GUI

/fp [mgr]  打开权限组配置

/fp cmd <name: string> <cmds: string>  使一个假人执行命令

/fp create <name: string> <pos: x y z> <dimid: int> [bindPlayer: string]  创建一个假人

/fp delete <name: string>   删除一个假人

/fp list [name1: string]  查看一个假人的信息

/fp lookpos <name: string> <pos: x y z>   设置假人的朝向

/fp offline <name: string>  下线一个假人

/fp offlineall   下线所有假人

/fp offoperation <name: string>  关闭一个假人的模拟操作

/fp offoperationall   关闭所有假人的模拟操作

/fp online <name: string>   上线一个假人

/fp onlineall   下线一个假人

/fp operation <item|destroy|attack> <name: string> [time: int] [slot: int]   开启一个假人的模拟操作   time：右键时间单位毫秒   slot物品栏序号0-9

/fp setfunc <name: string> <invincible|autoonline|autoresurrection> <func_value: Boolean>   设置一个假人的属性

/fp talk <name: string> <msg: string>   使一个假人说话

/fp tp <name: string> <pos: x y z> <dimid: int>  传送一个假人到目标坐标
```

-   注意： 以上所有命令操作都会记录到日志

## 配置文件

路径：".plugins\FP\engsr6982\FakePlayer\Config.json"

```json
{
    /**自动上线 */ "AutomaticOnline": true,
    /**假人无敌 */ "InterceptDamage": true,
    /**自动复活 */ "AutomaticResurrection": true,
    /**日志配置*/ "CsvLogger": {
        /**输出目录*/ "Output": ".\\logs\\FP\\",
        /**输出文件*/ "FileName": "FP_%Y%-%M%-%D%.csv"
    },
    /**最大在线时长*/ "MaxOnline": {
        "Enable": false, // 开关
        "Time": 30 // 假人最大在线时长（分钟）
    }
}
```

## 常见问题解答

-   `插件目录结构是怎样的？`

插件文件夹下，有以下文件（文件夹）具体定义如下：

```file
- FakePlayer
    - data  // 数据文件夹
        - data.sqlite  // SQL数据库（存储假人基本信息）
        - KVDB_Bag  // KVDB数据库（存储假人背包数据）
        - Perm.json  // 权限组文件
    - Config.json  // 配置文件
```

-   `我需要迁移假人数据？`

根据上文目录结构，迁移数据需要将data（文件夹）及Config.json一起迁移

-   `假人支持默认权限组吗？（支持开放给所有玩家？）`

    4.3.0版本已支持，具体步骤：

1. `fp op <name>`添加自己为插件管理员
2. 游戏内执行`fp mgr`打开权限组GUI
3. 在底部找到`编辑公共组权限`点击进入编辑页面
4. 选择需要开放给玩家的权限，玩家就可以不在权限组内也能使用开放的功能

-   `支持新版本吗？（支持xxx版本吗？）`

LSE自动适配新版本, 低版本请自行考虑兼容性

-   `为什么有问题需前往Github Issue反馈？`

讨论区也行，但是容易忘。Issue可以更好统计问题（备忘）

-   `我希望增加xxx功能？`

请前往Github Issue选择功能请求模板，提交你的新功能请求

## API接口

### 事件系统

> 插件名: `FakePlayer`  
> 实例信息各个值的定义请查看`example.js`或`tab.d.ts`  
> 实例信息类型是`Object`不是实例本身  
> 要监听插件事件请安装`listenAPI.js`。[点我前往仓库](https://gitee.com/minimouse0/listenapi)  
> 如果你需要监听模板，请前往仓库查看`EventTemplate.js`

`onDummySimulationOperation` - 假人执行模拟操作

-   返回：
    -   实例信息: `Object`
-   拦截
    -   函数返回false

`onDummyLookPos` - 假人看向指定坐标

-   返回:
    -   实例信息: `Object`
    -   要看向的坐标: `Object`
-   拦截
    -   函数返回false
