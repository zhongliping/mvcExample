/**
 * 弹窗基类
 * modify by zlp
 */

const { ccclass, property } = cc._decorator;

@ccclass
export default class Dialog extends cc.Component {
    private TOP: Boolean = false; //此视图是否需要保持在最上面
    private LOCK: Boolean = false; //是否要锁定此界面，不能自动执行上拉动作
    private TIMID: Boolean = false; //此弹窗打开时，不隐藏其他弹窗，直接覆盖其上
    private UNIQUE: Boolean = true; //此视图是否同时只能显示一个
    private ALWAYS_SHOW: Boolean = false; //是否一直显示此视图

    private _all_data: any = {}; //打开视图时的全部参数
    private init_data: {}; ////初始化的数据
    private _is_inited: Boolean = false; //是否已经初始化了
    public load_data = {};////拿到的服务器数据
    private _is_data_loadded: Boolean = false; //数据是否已经拿到

    private _action_type: 0; //显示类型： 0直接打开，1缩放打开，2定制打开方式
    private _enter_action: cc.Tween = null; //进入动作
    private _is_enter_finish: Boolean = false; //进入完成
    private _is_exit_finish: Boolean = false; //退出完成
    private _auto_setview_pushy: Boolean = false; //不等进入动作完成，有数据就刷新
    private _is_setview_called: Boolean = false; //setview是否已经被调用过
    private _normal_position: cc.Vec3 = null;//视图正常的位置

    public get vid() {
        return this._all_data.vid;
    }

    onLoad() {

    }

    start() {

    }

    //初始化
    public init(params) {
        params = params || {};

        this._all_data = params;

        this.initViewFeature();

        this.initData(params);
        this.initUI();
        this.initClick();
        this.initEvent();

        this._is_inited = true;
    }

    //初始化此视图的特性
    private initViewFeature() {
        this.TOP = this._all_data.TOP !== undefined ? this._all_data.TOP : this.TOP;
        this.LOCK = this._all_data.LOCK !== undefined ? this._all_data.LOCK : this.LOCK;
        this.TIMID = this._all_data.TIMID !== undefined ? this._all_data.TIMID : this.TIMID;
        this.UNIQUE = this._all_data.UNIQUE !== undefined ? this._all_data.UNIQUE : this.UNIQUE;
        this.ALWAYS_SHOW = this._all_data.ALWAYS_SHOW !== undefined ? this._all_data.ALWAYS_SHOW : this.ALWAYS_SHOW;
    }

    //初始化数据
    private initData(params) {
        this.init_data = params.init_data;

        this._is_data_loadded = params.loadded_data;
        this._action_type = params.action_type ? params.action_type : 0;
    }

    //初始化UI，对UI进行初始化操作
    private initUI() {
        this.node.on(cc.Node.EventType.TOUCH_START, () => { }, this, true);
        this.node.on(cc.Node.EventType.TOUCH_END, () => {
            this.onClickSpace();
        }, this);
    }

    //监听点击事件
    private initClick() {

    }

    //监听Module派发的数据更新事件
    private initEvent() {

    }

    //触摸到了空白区域，默认关闭视图
    private onClickSpace() {
        cc.log("点击了空白区域", this._is_enter_finish)
        if (this._is_enter_finish) {
            this.removeSelf();
        }
    }

    //进入完成时，强制恢复到正常状态
    private setNormalStatus() {
        this.node.opacity = 255;
        this.node.scale = 1;
    }

    /**
     * 移除节点
     * 说明：直接调用弹窗管理器的remove方法，可以做到移除节点和清理队列
     * 特殊的：一些继承Dialog的弹窗关闭时可能不会调用到removeSelf,
     * 此时onDestroy方法必须调用弹窗管理器的cleanStack清理队列
     * 我们先统一用dm.remove()方法吧，因为这种特殊情况比较少
     */
    public removeSelf() {
        GM.dm.remove(this._all_data.vid);

        // this.node.destroy();
    }

    /**
     * 如果界面需要数据支持，务必重写此方法，在此处做数据请求
     * 数据请求成功后务必调用 setData 方法保存数据
     * 弹窗打开结束后会自动调用setView方法，子类弹窗可重写此方法设置界面
     * 流程 reqData->setData->setView
     */
    public reqData() {

    }

    //服务器数据已拿到
    public setData(data) {
        this.load_data = data;

        this._is_data_loadded = true;

        if (this._is_enter_finish || this._auto_setview_pushy) {
            this._is_setview_called = true;
            this.setView();
        }
    }

    /**
     * 设置界面数据
     * 双重判断 1：拿到服务器数据后判断界面是否已经打开完成，是则setView
     * 2:界面打开完成时判断服务器数据是否已经拿到，是则setView
     */
    public setView() {

    }

    //打开界面
    private show() {
        if (this._action_type === 0) {
            //直接打开
            this.node.active = true;
            this.onEnterFinish();
        } else if (this._action_type === 1) {
            //缩放打开
            this.node.opacity = 0;
            this.scheduleOnce(() => {
                this.runEnterAction(() => {
                    this.onEnterFinish();
                });
            }, 0)
        } else if (this._action_type === 2) {
            this.runCustomEnterAction();
        }

        //可以播放打开音效
    }

    /**
     * 直接展示视图
     * 用于上层弹窗关闭后下层弹窗直接显示
     */
    private display() {
        this.setNormalStatus();

        this.node.active = true;
        this.node.position = new cc.Vec3(cc.winSize.width * 0.5, cc.winSize.height * 0.5);
        this.showAd(true);
    }

    //直接隐藏
    private hide() {
        this.setNormalStatus();

        if (this._enter_action) {
            this._enter_action.stop();
            this._enter_action = null;

            this.onEnterFinish();
        }

        this.node.scale = 1;//防止动作还未执行完毕
        this.node.active = false;

        this.hideAd();
    }

    //界面打开完成
    private onEnterFinish() {
        this._is_enter_finish = true;

        this.setNormalStatus();

        if (this._is_data_loadded && !this._is_setview_called) {
            this._is_setview_called = true;
            this.setView();
        }
    }

    //退出动作完成回调
    private onExitFinish() {
        let vid = this._all_data.vid;

        this._is_exit_finish = true;

        this.node.active = false;

        GM.dm.remove(vid);
    }

    //执行进入动作
    private runEnterAction(callback) {
        this.node.opacity = 255;
        this.node.scale = 0.7;
        this.node.anchorX = this.node.anchorY = 0.5;
        this._normal_position = new cc.Vec3(cc.winSize.width * 0.5, cc.winSize.height * 0.5);

        let action = cc.tween(this.node)
            .to(0.15, {
                scale: 1.06
            }, {
                easing: 'sineOut'
            })
            .to(0.2, {
                scale: 1.0
            }, {
                easing: 'sineOut'
            })
            .call((sender) => {
                this._enter_action = null;
                if (callback) callback(sender);
            })
            .start()

        this._enter_action = action;
    }

    //执行视图定制的进入动作
    private runCustomEnterAction() {

    }

    //开始执行退出动作 暂不做关闭动作
    private runExitAction(callback) {

    }

    /**
    * 控制信息流广告
    * 需要显示信息流的弹窗需要重写此方法,搭配hideAd()一起使用
    * 注意子类是否重写了onDestroy
    */
    private showAd(display) {

    }

    /**
     * 用于隐藏信息流广告
     */
    private hideAd() {

    }


    /**
     * 视图被销毁
     * 注意：子类如果有重写此方法，必须调用到父类
     * 父类控制清理弹窗队列和事件监听
     */
    onDestroy() {
        this.hideAd();
        GM.Notification.removeListenersByObj(this);

        // GM.dm.cleanStack(this._all_data.vid);//如果removeSelf里面不是调用dm.remove，则需要调用cleanStack
    }
}
