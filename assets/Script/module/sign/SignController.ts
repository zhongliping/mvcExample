/**
 * 签到
 */

const { ccclass, property } = cc._decorator;
import Controller from "../../framework/mvc/Controller"
import SignModel from "../sign/SignModel";

@ccclass
export default class SignController extends Controller {

    //override
    initGlobalEvent() {
        cc.log("SignController 注册全局事件")
        GM.Notification.on(GM.ekey.SHOW_SIGN, this.showSign, this);
        GM.Notification.on(GM.ekey.GET_SIGN_DATA, this.getSignData, this);
    }

    //override
    initModel() {
        this._model = new SignModel();
    }

    private showSign() {
        cc.log("测试 ！！！showSign")
        GM.rm.checkLoad("Sign", cc.Prefab, () => {
            cc.log("显示签到")
            let data = {
                prefab: "Sign",
                script: "Sign",
                loadded_data: false,
                action_type: 1,
                TIMID: true,
            }
            this._dialog = GM.dm.push(data);
            GM.dm.pop();
        })
    }

    //获取签到界面数据
    private getSignData() {
        //请求服务器接口获取数据

        let data = {
            list: [

            ]
        }

        //保存数据
        this._model.setSignData(data);

        let dia = GM.dm.getDialog(this._dialog);
        dia && dia.setData(data);
    }
}
