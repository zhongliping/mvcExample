/**
 * 模块管理器
 * 统一初始化Controller，并持有所有Controller的句柄
 * modify by zlp
 */
import SignController from "../../module/sign/SignController";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ModuleManager {
    private static _instance: any = null
    private _controllers: any = {}

    //单例
    public static getInstance<T>(type: { new(): T }) {
        if (this._instance === null) {
            this._instance = new type();
        }
        return this._instance;
    }

    constructor() {
        cc.log("模块控制器")
        this._controllers["sign"] = new SignController();
    }

    //获取模块控制器
    public getModule(module) {
        return this._controllers[module];
    }
}
