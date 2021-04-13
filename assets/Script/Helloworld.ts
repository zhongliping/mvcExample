const { ccclass, property } = cc._decorator;

@ccclass
export default class Helloworld extends cc.Component {

    @property(cc.Label)
    label: cc.Label = null;

    @property
    text: string = 'hello';

    start() {
        // init logic
        this.label.string = this.text;
    }

    private showTest() {
        // GM.Notification.dispatch(GM.ekey.SHOW_SIGN);
        cc.log(GM.mm.getModule("sign"))
    }

    private showCache() {
        cc.log("所有缓存", cc.assetManager.assets)
    }
}
