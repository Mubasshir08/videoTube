import "dotenv/config";
import mongoDB from "./db/db.js";
import {app} from "./app.js";

// db code initialize
mongoDB()
.then(() => {
    app.listen(process.env.PORT, () => {
        console.log(`\nServer is running on port ${process.env.PORT} ✅\n`);
    });
})
.catch((error) => {
    console.error("MongoDB Connection Failed ❌ : " , error);
    process.exit(1);
})