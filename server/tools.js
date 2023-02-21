//model
function successModel(data, message) {
    const obj = { errno: 0 };
    if (typeof data === "string") {
        obj.message = data;
        data = null;
        message = null;
    }
    if (data) {
        obj.data = data;
    }
    if (message) {
        obj.message = message;
    }
    return obj;
}
function errorModel(data, message) {
    const obj = { errno: -1 };
    if (typeof data === "string") {
        obj.message = data;
        data = null;
        message = null;
    }
    if (data) {
        obj.data = data;
    }
    if (message) {
        obj.message = message;
    }
    return obj;
}


export { successModel, errorModel }