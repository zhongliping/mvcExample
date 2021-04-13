/**
 * 控制器
 * 用于控制所有视图
 * 持有视图的id和数据缓存
 * modify by zlp
 */

const { ccclass, property } = cc._decorator;

@ccclass
export default class Controller {
    public _dialog: any = null;//视图id
    public _model: any = null;//视图缓存


    constructor() {
        this.initGlobalEvent();
        this.initModel();
    }

    //事件注册
    initGlobalEvent() {
        cc.log("Controller 注册全局事件")
    }

    //数据缓存
    initModel() {

    }
}
