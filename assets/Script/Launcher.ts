/**
 * 启动器
 * 用于初始化一些内容
 * modify by zlp
 */
const { ccclass, property } = cc._decorator;
window["GM"] = window["GM"] || {};//定义全局变量，之后所有全局内容基于此对象

import ModuleManager from "../Script/framework/manager/ModuleManager";
import ResourceManager from "../Script/framework/manager/ResourceManager";
import DialogManager from "../Script/framework/manager/DialogManager";
import Notification from "../Script/framework/event/Notification";
import EventKey from "../Script/framework/event/EventKey";

@ccclass
export default class Launcher extends cc.Component {
    onLoad() {
        GM.ekey = EventKey;//事件ID
        GM.Notification = Notification.getInstance(Notification);//事件派发器
        GM.mm = ModuleManager.getInstance(ModuleManager);//模块管理器
        GM.dm = DialogManager.getInstance(DialogManager);//弹窗管理器
        GM.rm = ResourceManager.getInstance(ResourceManager);//资源管理器

    }

    start() {

    }

    // update (dt) {}
}
