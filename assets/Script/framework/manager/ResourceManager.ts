/**
 * 资源管理器
 * modify by zlp
 */
const { ccclass, property } = cc._decorator;

@ccclass
export default class ResourceManager {
    private static _instance: any = null;
    private Audios: any = {}; //音频
    private Prefabs: any = {}; //预制体

    //单例
    public static getInstance<T>(type: { new(): T }) {
        if (this._instance === null) {
            this._instance = new type();
        }
        return this._instance;
    }

    constructor() {
        cc.log("资源管理器")

    }

    public loadResArr(arr, dispatch) {
        cc.resources.load(arr, (completedCount, totalCount, item) => {
            if (dispatch) {
                let pro = completedCount / totalCount;
                // GM.Notification.dispatch(GM.eKey.LOADING_RES, pro); //更新进度
            }
        }, (err, assets: any) => {
            if (err) {
                cc.log(err)
                if (dispatch) {
                    GM.Notification.dispatch(GM.eKey.RES_LOADED_RESULT, false);
                }
            } else {
                assets.forEach(element => {
                    if (element.__classname__ == "cc.Prefab") {
                        this.Prefabs[element.name] = element;
                    } else if (element.__classname__ == "cc.AudioClip") {
                        this.Audios[element.name] = element;
                    }
                });
                if (dispatch) {
                    GM.Notification.dispatch(GM.eKey.RES_LOADED_RESULT, true);
                }
            }
        })
    }

    //检查资源是否加载好
    public checkLoad(name: string, type: any, callback: Function) {
        let arr = type == cc.Prefab ? this.Prefabs : this.Audios;
        if (arr[name]) {
            callback(arr[name]);
        } else {
            this.load(name, type, callback);
        }
    }

    //单个加载音频/预制
    private load(name, type, callback) {
        let str = type == cc.Prefab ? "prefabs/" : "audio/";
        let url = str + name;
        cc.resources.load(url, type, (err, res) => {
            if (err) {
                cc.warn("加载资源 " + url + "出错");
            } else {
                if (type == cc.Prefab) {
                    this.Prefabs[name] = res;
                } else {
                    this.Audios[name] = res;
                }
                callback(res);
            }
        });
    }

    //获取预制体 只能获取到已经加载好的
    public getPrefab(name) {
        if (this.Prefabs[name]) {
            return this.Prefabs[name];
        } else {
            cc.warn("获取预制体" + name + "失败");
        }
    }

    /**
     * 释放资源
     * @param name 预制体名称
     * 说明：A预制体引用了a,b,c,d四个图片，B预制体引用了a,b,c,e四个图片,A销毁时调用了释放资源，B未调用
     * 先加载A界面，缓存中则有abcd的资源，关闭A时，abcd被释放;再加载B界面，abce被缓存，关闭B时，abce不被释放
     * 先加载B界面，abce被缓存，关闭B时，abce不被释放；再加载A,abcd被缓存，关闭A时，因为B对abc持有引用，此时只释放了d
     */
    public releaseAsset(name) {
        let assert = this.Prefabs[name];
        if (assert) {
            cc.assetManager.releaseAsset(assert);
            delete this.Prefabs[name];
        }
    }
}
