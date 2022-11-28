const fs = require("fs");
const path = require("path");

function initCanisterEnv() {
    let localCanisters, prodCanisters;
    try {
        localCanisters = require(path.resolve(
            ".dfx",
            "local",
            "canister_ids.json"
        ));
    } catch (error) {
        console.log("No local canister_ids.json found");
    }
    try {
        prodCanisters = require(path.resolve("canister_ids.json"));
    } catch (error) {
        console.log("No production canister_ids.json found");
    }

    const network =
        process.env.DFX_NETWORK ||
        (process.env.NODE_ENV === "production" ? "ic" : "local");

    const canistersConfig =
        network === "local" ? localCanisters : prodCanisters;

    const canisterMap = canistersConfig
        ? Object.entries(localCanisters).reduce((prev, current) => {
              const [canisterName, canisterDetails] = current;
              prev[canisterName.toUpperCase() + "_CANISTER_ID"] =
                  canisterDetails[network];
              return prev;
          }, {})
        : undefined;

    canisterMap["NODE_ENV"] =
        process.env.NODE_ENV ||
        (network === "ic" ? "production" : "development");

    return canisterMap;
}
const canisters = initCanisterEnv();

if (canisters) {
    const template = Object.entries(canisters).reduce((start, next) => {
        const [key, val] = next;
        console.log(`${key} ${val}`);
        return `${start ?? ""} \n${key}=${val}`;
    });

    fs.writeFileSync(".env", template);
}
