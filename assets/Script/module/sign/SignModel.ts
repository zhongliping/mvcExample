/**
 * 签到数据缓存
 */

const { ccclass, property } = cc._decorator;
import Model from "../../framework/mvc/Model"

@ccclass
export default class SignModel extends Model {
    public _data: any = null;//签到界面数据

    //设置签到界面数据
    public setSignData(data) {
        this._data = data;
    }

    //更新签到界面数据
    public updateSignData() {

    }
}
