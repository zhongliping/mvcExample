/**
 * 弹窗管理器
 * 统一管理弹窗的生命周期
 * modify by zlp
 */

const { ccclass, property } = cc._decorator;
@ccclass
export default class DialogManager {
    private static _instance: any = null;
    private root: cc.Node = null;
    private zIndex: number = 0;

    //队列
    private queue: any = [];
    private stack: any = [];
    private _vid = 0;

    private get vid() {
        return ++this._vid;
    }

    constructor() {
        cc.log("弹窗管理器")
    }

    //单例
    public static getInstance<T>(type: { new(): T }) {
        if (this._instance === null) {
            this._instance = new type();
        }
        return this._instance;
    }

    //清理所有弹窗
    public clean() {
        let dialog;
        while (this.stack.length > 0) {
            dialog = this.stack.shift();
            dialog.node.destroy();
        }

        this.queue = [];
        this.stack = [];

        this.zIndex = 1;
    }

    //获取弹窗
    public getDialog(vid) {
        for (let i = 0; i < this.stack.length; i++) {
            if (this.stack[i].vid === vid) {
                return this.stack[i];
            }
        }
    }

    public getStackNum() {
        return this.stack.length;
    }

    //整理数据
    private genData(params) {
        let prefab = params.prefab; //预制体
        let script = params.script; //脚本

        let action_type = params.action_type === undefined ? 0 : params.action_type; //弹窗打开方式
        let priority = params.priority || false;
        let loadded_data = params.loadded_data || false; //标记是否已经拿到弹窗数据

        let TOP = params.TOP;
        let LOCK = params.LOCK;
        let TIMID = params.TIMID;
        let UNIQUE = params.UNIQUE;
        let ALWAYS_SHOW = params.ALWAYS_SHOW;

        return {
            vid: this.vid,
            prefab: prefab,
            script: script,
            priority: priority,
            action_type: action_type,
            loadded_data: loadded_data,

            TOP: TOP,
            LOCK: LOCK,
            TIMID: TIMID,
            UNIQUE: UNIQUE,
            ALWAYS_SHOW: ALWAYS_SHOW
        };
    }

    public push(params: any, index: Number) {
        if (!params) return;

        let data = this.genData(params);

        if (index === undefined || index >= this.queue.length || index < 0) {
            this.queue.push(data);
        } else {
            this.queue.splice(index, 0, data);
        }

        return data.vid;
    }

    /**
     * 取出队列顶端的弹窗数据，并打开相应的弹窗
     */
    public pop() {
        if (this.queue.length <= 0) return;

        if (this.stack.length > 0) {
            let dialog = this.stack[this.stack.length - 1];

            if (!cc.isValid(dialog) || !cc.isValid(dialog.node)) return;

            //判断当前显示中的弹窗是否设置了TOP属性
            if (dialog.node.active && dialog.TOP) {
                if (!this.queue[0].TOP) {
                    //当前显示中的弹窗TOP为true,如果待显示的弹窗TOP不为true则返回
                    return;
                }
            }
        }

        let data = this.queue.shift();

        if (!data.TIMID) {
            this._hide();
        }
        this._unique(data);
        this._show(data);
    }

    /**
     * 新界面被打开，隐藏当前已经显示的界面
     * 如果当前界面设置了ALWAYS_SHOW=true 不隐藏当前界面
     */
    private _hide() {
        if (this.stack.length <= 0) return;

        let w = this.stack[this.stack.length - 1];
        if (!w.ALWAYS_SHOW) {
            w.hide();
        }
    }

    /**
     * 检查弹窗的唯一性
     * 判断是否存在已经打开的界面与t界面相同，如果相同则移除已经打开的界面
     * 逻辑控制：如果设置UNIQUE=false，可以存在多个相同的界面
     * 注意：在queue队列中未打开的不考虑
     * @param t 
     * @returns 
     */
    private _unique(t) {
        if (this.stack.length <= 0) return;

        for (let i = 0; i < this.stack.length; i++) {
            if (t.script === this.stack[i].__classname__ && this.stack[i].UNIQUE) {
                this.stack[i].node.destroy();
                this.stack.splice(i, 1);
            }
        }
    }

    /**
     * 打开一个界面
     * @param t 
     */
    private _show(t) {
        let prefab = GM.rm.getPrefab(t.prefab);
        if (!cc.isValid(prefab)) {
            cc.error("获取弹窗预制体错误");
            return;
        };
        let handler = cc.instantiate(prefab);
        let script = handler.getComponent(t.script);
        if (!script) {
            script = handler.addComponent(t.script);
        }

        let cur_scene = cc.director.getScene();
        this.root = cur_scene;

        if (cc.isValid(this) && cc.isValid(this.root)) {
            handler.parent = this.root;
            handler.zIndex = ++this.zIndex;

            handler.active = true;
            this.stack.push(script);
            script.init(t);
            script.reqData();
            script.show();
        }
    }

    /**
     * 移除界面
     * @param vid 弹窗uid
     * @returns 
     */
    private _remove(vid) {
        if (this.stack.length <= 0) return;

        for (let i = 0; i < this.stack.length; i++) {
            if (this.stack[i].vid === vid) {
                this.stack[i].node.destroy();

                this.stack.splice(i, 1);
                break;
            }
        }
    }

    /**
     * 关闭一个界面或者一组界面
     * 一般用在界面的关闭方法中
     * @param vid 
     */
    public remove(vid) {
        if (vid instanceof Array) {
            for (let i = 0; i < vid.length; i++) {
                this._remove(vid[i]);
            }
        } else {
            this._remove(vid);
        }

        this.check();
    }

    //特殊处理一些继承Dialog节点在destory未调用父类removeself()方法导致队列异常
    public cleanStack(vid) {
        if (this.stack.length <= 0) return;
        for (let i = 0; i < this.stack.length; i++) {
            if (this.stack[i].vid === vid) {
                this.stack.splice(i, 1);
                break;
            }
        }

        this.check();
    }

    /**
     *  延迟一帧执行pop
     * 延迟一帧进行弹窗创建，防止弹窗之间切换导致卡顿
     */
    private _prepare() {
        this.pop();
    }

    /**
     * 检查是否还有下一个界面要展示
     * 逻辑控制 
     *      先检查有没有优先显示的界面
     *      再显示隐藏的界面 
     *      最后pop
     */
    private check() {
        if (this.stack.length > 0 && this.stack[this.stack.length - 1].TOP) {
            let w = this.stack[this.stack.length - 1];
            if (!w.node.active) {
                w.display();
            }
        } else if (this.queue.length > 0 && this.queue[0].priority) {
            this._prepare();
        } else if (this.stack.length > 0) {
            let w = this.stack[this.stack.length - 1];
            if (!w.node.active) {
                w.display();
            }
        } else if (this.queue.length < 1) {
            //没有弹窗
        } else {
            this._prepare();
        }
    }


    /**
     * 单独处理吐司提示 GM.dm.showToast("aaa")
     * @param pStr 显示的文本
     * @param delayTime 显示的时间
     */
    public showToast(pStr, delayTime: 2) {
        GM.rm.checkLoad("Toast", cc.Prefab, () => {
            let prefab = GM.rm.getPrefab("Toast");
            let toast_node = cc.instantiate(prefab);
            let cur_scene = cc.director.getScene();
            if (cc.isValid(cur_scene)) {
                cur_scene.addChild(toast_node, cc.macro.MAX_ZINDEX);
                let script = toast_node.getComponent("Toast");
                if (delayTime) script.setDelayTime(delayTime);
                script.show(pStr);
            }
        })
    }
}
