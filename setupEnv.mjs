import * as fs from "fs/promises";
import process from "process";

const LOCAL_CANISTERS_FILE = ".dfx/local/canister_ids.json";
const PROD_CANISTERS_FILE = "canister_ids.json";

/*

Script that reads canister ids from the dfx cache and outputs them into an environment(.env) file.
Also sets NODE_ENV to either "production" or "development" depending on the selected dfx network.

*/

async function loadJSONFromFile(filePath) {
    const file = await fs.readFile(filePath);
    return JSON.parse(file);
}

async function initCanisterEnv() {
    const network =
        process.env.DFX_NETWORK ||
        (process.env.NODE_ENV === "production" ? "ic" : "local");

    let canisters;

    try {
        canisters = await loadJSONFromFile(
            network === "ic" ? PROD_CANISTERS_FILE : LOCAL_CANISTERS_FILE
        );
    } catch (error) {
        console.log(error);
    }

    const canisterMap = Object.entries(canisters).reduce((prev, current) => {
        const [canisterName, canisterDetails] = current;
        prev[canisterName.toUpperCase() + "_CANISTER_ID"] =
            canisterDetails[network];
        return prev;
    }, {});

    //Sets the Node env variable
    canisterMap["NODE_ENV"] =
        process.env.NODE_ENV ||
        (network === "ic" ? "production" : "development");

    return canisterMap;
}
const canisters = await initCanisterEnv();

if (canisters) {
    const template = Object.entries(canisters).reduce(
        (templateString, nextCanister) => {
            const [key, val] = nextCanister;
            return `${templateString}${
                templateString ? "\n" : ""
            }${key}=${val}`;
        },
        ""
    );

    await fs.writeFile(".env", template);
}
