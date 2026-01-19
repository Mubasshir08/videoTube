import { isValidObjectId } from "mongoose";

// check if id is valid
export const isValidId = (id) => {
    return isValidObjectId(id);
};