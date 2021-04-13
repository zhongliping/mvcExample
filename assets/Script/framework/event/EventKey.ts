/**
 * 事件ID
 */

let __uuid = 0;
let getUID = function () {
    __uuid = __uuid + 1;
    return "UUID" + __uuid.toString();
};

let M: any = {};

M.SHOW_SIGN = getUID();//签到
M.GET_SIGN_DATA = getUID();//获取签到数据

export default M;