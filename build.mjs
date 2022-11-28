import { Parcel } from "@parcel/core";

import { exec } from "child_process";
import * as dotenv from "dotenv";

const REPLICA_URL = "http://127.0.0.1:4943";
const FRONTEND_ASSET_CANISTER_ID = "DBIN_FRONTEND_CANISTER_ID";
const IDENTITY_FILE = "parcel.pem";
const DISTDIR = "dist/";

/*

Parcel build watch script with a post-build step that syncs dist/ with the asset frontend canister.

Requires icx-asset(https://crates.io/crates/icx-asset) in $PATH.

Requires a exported identity IDENTITY_FILE, which must also be the identity that started the asset canister.
This identity must have no password.

Requires FRONTEND_ASSET_CANISTER_ID to be a canister ID that's read from a .env file.

*/

//TODO: maybe I can just get HMR to work and this isn't needed?

dotenv.config();

const bundler = new Parcel({
    entries: "src/dBin_frontend/src/index.html",
    defaultConfig: ".parcelrc",
});

function logError(err) {
    console.log(`📦 ❌  ${err}`);
}

logError(process.env);

Object.entries(process.env).forEach(logError);

const sub = await bundler
    .watch(async (err, event) => {
        if (err) {
            throw err;
        }

        if (event.type === "buildSuccess") {
            console.log(`📦  Built asset bundle in ${event.buildTime / 1000}s`);

            console.log(
                `icx-asset --replica ${REPLICA_URL} --pem ${IDENTITY_FILE} sync ${process.env[FRONTEND_ASSET_CANISTER_ID]} ${DISTDIR}`
            );

            const { out, err } = await exec(
                `icx-asset --replica ${REPLICA_URL} --pem ${IDENTITY_FILE} sync ${process.env[FRONTEND_ASSET_CANISTER_ID]} ${DISTDIR}`
            );

            console.log(`${out} ${err}`);
        } else if (event.type === "buildFailure") {
            logError(event.diagnostics);
            // throw new Error(`${event.diagnostics}`);
        }
    })
    .catch((err) => {
        logError(err);
    });

//await sub.unsubscribe();
