import { v4 as uuidv4 } from "uuid";

export default class BaseModel {
    constructor(data = {}) {
        const nowUtc = new Date().toISOString().replace("T", " ").replace("Z", "");

        this.id = data.id || uuidv4();
        this.createdAt = data.createdAt || nowUtc;
        this.updatedAt = data.updatedAt || nowUtc;
        this.active = data.active !== undefined ? data.active : true;
    }

    static toUTC(date) {
        return new Date(date).toISOString().replace("T", " ").replace("Z", "");
    }

    touch() {
        this.updatedAt = BaseModel.toUTC(new Date());
    }
}
export function baseModel(data) {
    return new BaseModel(data);
}