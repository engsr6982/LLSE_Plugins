import { _filePath } from "../utils/config.js";
import { pos2Object } from "../utils/utils.js";

!file.exists(_filePath + "data") ? file.mkdir(_filePath + "data") : null;

// 数据库表名，请勿修改
const tableName = "data";
class SQL {
    constructor() {
        this.dbInst = new DBSession("sqlite3", {
            path: `${_filePath}data\\data.sqlite`,
        });
        this.initTable();
        this.transferOldTable();
    }

    private dbInst: DBSession;

    private initTable() {
        this.dbInst.exec(`
            CREATE TABLE IF NOT EXISTS "${tableName}" (
                bindPlayer TEXT NOT NULL,
                name TEXT NOT NULL,
                isInvincible BOOLEAN NOT NULL,
                isAutoRespawn BOOLEAN NOT NULL,
                isAutoOnline BOOLEAN NOT NULL,
                onlinePos TEXT NOT NULL,
                bagGUIDKey TEXT,
                PRIMARY KEY(bindPlayer, name)
            );
        `);
        return this;
    }

    private transferOldTable() {
        try {
            // 从旧表中读取所有数据
            if (Object.keys(this.dbInst.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name='tab';`).fetch()).length == 0)
                return;
            const oldData = this.dbInst.prepare(`SELECT * FROM "tab"`).fetchAll();
            if (oldData != null) {
                logger.warn(`检测到 "tab" 表数据，开始迁移到 "data" 表...`);
                oldData.shift(); // 移除列名行
                // 遍历旧数据，插入到新表中
                oldData.forEach((row) => {
                    const [BindPlayer, Name, isInvincible, isAutoResurrection, isAutoOnline, OnlinePos, Bag] = row;
                    this.insertRow({
                        bindPlayer: BindPlayer,
                        name: Name,
                        isInvincible: isInvincible,
                        isAutoRespawn: isAutoResurrection,
                        isAutoOnline: isAutoOnline,
                        onlinePos: OnlinePos,
                        bagGUIDKey: Bag,
                    });
                });
                this.dbInst.exec(`ALTER TABLE "tab" RENAME TO "tab_backup"`);
            }
            return this;
        } catch (e) {
            logger.error(`Fail in Function: transferOldTable\n${e}\n${e.stack}`);
            return null;
        }
    }

    bool2Number = (bool: boolean) => {
        return bool ? 1 : 0;
    };

    /**
     * 插入行
     * @param dt
     * @returns
     */
    insertRow(dt: SQL_insertRow) {
        try {
            this.dbInst
                .prepare(
                    `
                    INSERT INTO "${tableName}" (
                        bindPlayer, 
                        name, 
                        isInvincible, 
                        isAutoRespawn, 
                        isAutoOnline, 
                        onlinePos, 
                        bagGUIDKey
                    ) VALUES (
                        $bindPlayer,
                        $name,
                        $isInvincible,
                        $isAutoRespawn,
                        $isAutoOnline,
                        $onlinePos,
                        $bagGUIDKey,    
                    )
                `,
                )
                .bind({
                    bindPlayer: dt.bindPlayer,
                    name: dt.name,
                    isInvincible: this.bool2Number(dt.isInvincible),
                    isAutoRespawn: this.bool2Number(dt.isAutoRespawn),
                    isAutoOnline: this.bool2Number(dt.isAutoOnline),
                    onlinePos: JSON.stringify(pos2Object(dt.onlinePos)),
                    bagGUIDKey: dt.bagGUIDKey,
                }) // @ts-ignore
                .execute();
            return this;
        } catch (e) {
            logger.error(`Fail in Function: insertRow\n${e}\n${e.stack}`);
            return null;
        }
    }

    findDataByBindPlayerAndName(bindPlayer: string, name: string) {
        return (
            this.dbInst
                .prepare(`SELECT * FROM "${tableName}" WHERE bindPlayer = $bindPlayer AND name = $name`)
                .bind({
                    bindPlayer: bindPlayer,
                    name: name,
                }) // @ts-ignore
                .fetch() || null
        );
    }

    findDataByName(name: string) {
        return (
            this.dbInst
                .prepare(`SELECT * FROM "${tableName}" WHERE name = $name`)
                .bind({
                    name: name,
                }) // @ts-ignore
                .fetch() || null
        );
    }

    parseDataToObject(data: any[]): SQL_insertRow[] {
        return data.map((row) => {
            return {
                bindPlayer: row[0],
                name: row[1],
                isInvincible: Boolean(row[2]).valueOf(),
                isAutoRespawn: Boolean(row[3]).valueOf(),
                isAutoOnline: Boolean(row[4]).valueOf(),
                onlinePos: JSON.parse(row[5]),
                bagGUIDKey: row[6],
            };
        });
    }

    findAllDataByBindPlayer(bindPlayer: string) {
        const result = this.dbInst
            .prepare(`SELECT * FROM "${tableName}" WHERE bindPlayer = $bindPlayer`)
            .bind({
                bindPlayer: bindPlayer,
            }) // @ts-ignore
            .fetchAll();
        if (result != null) {
            result.shift();
            return this.parseDataToObject(result);
        }
        return null;
    }

    findAllDataWithAutoOnlineTrue() {
        const result = this.dbInst.prepare(`SELECT * FROM "${tableName}" WHERE isAutoOnline = 1`).fetchAll();
        if (result != null) {
            result.shift();
            return this.parseDataToObject(result);
        }
        return null;
    }

    deleteDataByBindPlayerAndName(bindPlayer: string, name: string) {
        try {
            this.dbInst
                .prepare(`DELETE FROM "${tableName}" WHERE bindPlayer = $bindPlayer AND name = $name`)
                .bind({
                    bindPlayer: bindPlayer,
                    name: name,
                }) // @ts-ignore
                .execute();
            return true;
        } catch (error) {
            logger.error(`Fail in Function: deleteDataByBindPlayerAndName\n${error}\n${error.stack}`);
            return false;
        }
    }

    getAllData() {
        const result = this.dbInst.prepare(`SELECT * FROM "${tableName}"`).fetchAll();
        if (result != null) {
            result.shift();
            return this.parseDataToObject(result);
        }
        return null;
    }
}

export const sql = new SQL();
