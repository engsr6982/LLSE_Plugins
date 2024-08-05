export default class JSONChecker {
    /**
     * 实例化检查器
     * @param standardJSON 标准的JSON对象
     * @param currentJSON 当前的JSON对象
     * @param printInfo 是否打印信息
     */
    constructor(standardJSON: object, currentJSON: object, printInfo = false) {
        this.standardJSON = standardJSON; // 标准的JSON对象
        this.currentJSON = currentJSON; // 当前的JSON对象
        this.printInfo = printInfo; // 是否打印补齐和删除属性的信息，可选，默认为false
    }

    standardJSON: {
        [key: string]: any;
    };
    currentJSON: {
        [key: string]: any;
    };
    printInfo: boolean;

    /**
     * 递归检查当前JSON缺失的属性
     * @param standardObj 标准
     * @param currentObj 当前
     * @param parentKey 父键
     * @returns 缺失属性信息
     */
    checkMissingProperties(standardObj = this.standardJSON, currentObj = this.currentJSON, parentKey = "") {
        const missingProperties: Array<{
            parentKey: string;
            key: string;
            value: string;
        }> = [];

        for (const key in standardObj) {
            if (!(key in currentObj)) {
                // 如果当前JSON对象中没有标准JSON对象中的属性
                missingProperties.push({
                    parentKey: parentKey, // 缺失属性的父级键路径，用于打印信息
                    key: key, // 缺失的属性键
                    value: standardObj[key], // 缺失的属性值
                });
            } else if (typeof standardObj[key] === "object") {
                // 如果属性值是对象，递归检查
                const subMissingProperties = this.checkMissingProperties(
                    standardObj[key],
                    currentObj[key],
                    parentKey ? `${parentKey}.${key}` : key, // 更新父级键路径
                );
                missingProperties.push(...subMissingProperties); // 将子级缺失属性加入结果数组
            }
        }

        return missingProperties;
    }

    /**
     * 递归检查当前JSON多出的属性
     * @param standardObj 标准
     * @param currentObj 当前
     * @param parentKey 父键
     * @returns 多出属性信息
     */
    checkExtraProperties(standardObj = this.standardJSON, currentObj = this.currentJSON, parentKey = "") {
        const extraProperties: Array<{
            parentKey: string;
            key: string;
        }> = [];

        for (const key in currentObj) {
            if (!(key in standardObj)) {
                // 如果标准JSON对象中没有当前JSON对象中的属性
                extraProperties.push({
                    parentKey: parentKey, // 多出属性的父级键路径，用于打印信息
                    key: key, // 多出的属性键
                });
            } else if (typeof currentObj[key] === "object") {
                // 如果属性值是对象，递归检查
                const subExtraProperties = this.checkExtraProperties(
                    standardObj[key],
                    currentObj[key],
                    parentKey ? `${parentKey}.${key}` : key, // 更新父级键路径
                );
                extraProperties.push(...subExtraProperties); // 将子级多出属性加入结果数组
            }
        }

        return extraProperties;
    }

    /**
     * 补齐缺失的属性
     * @returns 新的JSON对象
     */
    async fillMissingProperties() {
        try {
            const missingProperties = this.checkMissingProperties();

            if (missingProperties.length === 0) {
                // 如果没有缺失的属性，直接返回当前JSON对象
                // logger.info("没有缺失的属性");
                return this.currentJSON;
            }

            for (const property of missingProperties) {
                const parentKey = property.parentKey ? property.parentKey.split(".") : [];
                let currentObj = this.currentJSON;

                for (const key of parentKey) {
                    // 遍历父级键路径，创建缺失的对象
                    if (!(key in currentObj)) {
                        // 如果当前JSON对象中没有该属性，创建空对象或空数组
                        currentObj[key] = typeof parentKey[parentKey.indexOf(key) + 1] === "number" ? [] : {};
                    }
                    currentObj = currentObj[key]; // 更新当前JSON对象
                }

                currentObj[property.key] = property.value; // 添加缺失的属性

                if (this.printInfo) {
                    // 如果需要打印信息，输出补齐信息
                    logger.info(`补齐属性 > ${property.parentKey}.${property.key}: ${property.value}`);
                }
            }

            return this.currentJSON;
        } catch (error) {
            logger.error("补齐属性时出现错误：", error);
            logger.error(error.stack);
        }
    }

    /**
     * 删除多出的属性
     * @returns 新的JSON对象
     */
    async removeExtraProperties() {
        try {
            const extraProperties = this.checkExtraProperties();

            if (extraProperties.length === 0) {
                // 如果没有多出的属性，直接返回当前JSON对象
                // logger.info("没有多出的属性");
                return this.currentJSON;
            }

            for (const property of extraProperties) {
                const parentKey = property.parentKey ? property.parentKey.split(".") : [];
                let currentObj = this.currentJSON;

                for (const key of parentKey) {
                    // 遍历父级键路径，删除多出的属性
                    currentObj = currentObj[key]; // 更新当前JSON对象
                }

                delete currentObj[property.key]; // 删除多出的属性

                if (this.printInfo) {
                    // 如果需要打印信息，输出删除信息
                    logger.info(`删除多出属性 > ${property.parentKey}.${property.key}`);
                }
            }

            return this.currentJSON;
        } catch (error) {
            logger.error("删除多出属性时出现错误：", error);
            logger.error(error.stack);
        }
    }
}
