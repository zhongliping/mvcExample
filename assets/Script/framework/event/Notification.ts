/**
 * 事件控制器
 */
const { ccclass, property } = cc._decorator;

@ccclass
export default class Notification {
    private static _instance: any = null
    private _listeners: any = {}

    constructor() {
        cc.log("事件控制器");
    }

    //单例
    public static getInstance<T>(type: { new(): T }) {
        if (this._instance === null) {
            this._instance = new type();
        }
        return this._instance;
    }

    /**
    * 注册监听
    * @params {String} name 通知事件名
    * @params {String} cb 回调方法
    * @params {Object} obj 回调方法所属对象
    */
    public on(name: String, cb: Function, obj: Object) {
        if (typeof name != "string") {
            cc.error("add event listener error: eventName must be string!");
            return;
        }

        let cbs = this._listeners[name];
        if (!cbs) {
            cbs = [{
                cb: cb,
                obj: obj
            }];
            this._listeners[name] = cbs;
        } else {
            for (let i = 0; i < cbs.length; i++) {
                let dic = cbs[i];
                if (dic.cb === cb && dic.obj === obj) {
                    return; //如果绑定的是同一回调同一对象则不重复绑定
                }
            }

            cbs.push({
                cb: cb,
                obj: obj
            });
        }
    }

    /**
     * 派发事件
     * @param name {String} name 通知事件名
     * @param msg {Object} msg 消息
     * @returns 
     */
    public dispatch(name: any, msg: Object) {
        let cbs = this._listeners[name];
        if (!cbs) {
            cc.warn('dispatch event %s no handler', name);
            return;
        }

        for (let i = 0; i < cbs.length; i++) {
            let dic = cbs[i];
            let obj = dic.obj;
            let cb = dic.cb;
            if (obj && cb && cb.call) {
                cb.call(obj, msg);
            }
        }
    }

    /**
     * 移除一个对象的所有监听
     * @param obj 
     */
    public removeListenersByObj(obj: Object) {
        let listeners = this._listeners;
        for (let key in listeners) {
            let cbs = listeners[key];
            if (!cbs) {
                continue;
            }
            for (let i = cbs.length - 1; i >= 0; i--) {
                let dic = cbs[i];
                if (dic.obj == obj) {
                    cbs.splice(i, 1);
                    break;
                }
            }
        }
    }

    /**
     *  移除所有监听
     */
    public removeAllListeners() {
        delete this._listeners;
        this._listeners = {};
    }

}
