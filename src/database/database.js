import fs from "fs";
import path from "path";

const DATABASE_PATH = path.resolve(
    "src",
    "database"
);

export function readDatabase(file){

    const filePath = path.join(
        DATABASE_PATH,
        file
    );

    if(!fs.existsSync(filePath)){
        fs.writeFileSync(
            filePath,
            JSON.stringify({}, null, 2)
        );
    }

    return JSON.parse(
        fs.readFileSync(filePath)
    );

}

export function writeDatabase(file,data){

    const filePath = path.join(
        DATABASE_PATH,
        file
    );

    fs.writeFileSync(
        filePath,
        JSON.stringify(data,null,2)
    );

}