import { Parcel } from "@parcel/core";

import { execSync } from "child_process";
import * as dotenv from "dotenv";

const REPLICA_URL = "http://127.0.0.1:4943";
const FRONTEND_ASSET_CANISTER_ID = "DBIN_FRONTEND_CANISTER_ID";
const IDENTITY_FILE = "parcel.pem";
const DISTDIR = "dist/";

/*

Parcel build watch script with a post-build step that syncs dist/ with the asset frontend canister.

Requires icx-asset(https://crates.io/crates/icx-asset) in $PATH.

Requires a exported identity in a IDENTITY_FILE, which must also be the identity that started the asset canister.
This identity must have no password.

Requires FRONTEND_ASSET_CANISTER_ID to be a canister ID that's loaded from a .env file.

*/

//TODO: TODO: TODO: GET HMR WORKING
//TODO: Make this generate a .proxyrc file that corresponds to the canister backend URL for development. AND FINALLY GET HMR WORKING :))))))))
// In fact, perhaps I should just consolidate that into setupEnv?
//TODO: Fix error handling

dotenv.config();

const ICON = "‽";

const bundler = new Parcel({
    entries: "src/dBin_frontend/src/index.html",
    defaultConfig: ".parcelrc",
});

function logError(err) {
    if ((err && err, toString)) {
        console.log(`${ICON} ✖️  ${err.toString()}`);
    }
}




const sub = await bundler
    .watch((err, event) => {
        if (err) {
            throw err;
        }

        if (event.type === "buildSuccess") {
            console.log(
                `${ICON}  Built asset bundle in ${event.buildTime / 1000}s`
            );

            //TODO: Might need to add rate-limiting?
            const currentTime = performance.now();
            execSync(
                `icx-asset --replica ${REPLICA_URL} --pem ${IDENTITY_FILE} sync ${process.env[FRONTEND_ASSET_CANISTER_ID]} ${DISTDIR}`
            );

            console.log(
                `${ICON}  Replaced asset bundle in canister in ${
                    (performance.now() - currentTime) / 1000
                }s`
            );
        } else if (event.type === "buildFailure") {
            logError(event.diagnostics);
            // throw new Error(`${event.diagnostics}`);
        }
    })
    .catch((err) => {
        logError(err);
    });

//await sub.unsubscribe();
