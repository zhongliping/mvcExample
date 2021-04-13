/**
 * 签到
 */

const { ccclass, property } = cc._decorator;
import Dialog from "../../framework/mvc/Dialog"

@ccclass
export default class Sign extends Dialog {
    onLoad() { }

    start() {

    }

    //override
    reqData() {
        cc.log("签到 reqData")
        GM.Notification.dispatch(GM.ekey.GET_SIGN_DATA);
    }

    //override
    setView() {
        cc.log("签到界面！setView", this.load_data)
    }

    onDestroy() {
        // this.super()
        GM.rm.releaseAsset("Sign")
    }

    // update (dt) {}
}
