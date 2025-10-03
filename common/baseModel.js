import { v4 as uuidv4 } from "uuid";

function baseModel() {
    return {
        id: uuidv4(),
        createdAt: new Date().toISOString(),   // GMT ISO
        updatedAt: new Date().toISOString(),
        active: true,
    };
}

export default baseModel;