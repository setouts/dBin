import { Component, Fragment, Inferno, render } from "inferno";
import { Web3Storage } from "web3.storage";
import { h } from "inferno-hyperscript";
import { initDevTools } from "inferno-devtools";
import { Nav } from "./Nav";
import { MainTextArea } from "./MainTextArea";
import config from "../assets/config.json";

export const storageClient = new Web3Storage({
    token: config.Web3StorageAPIKey,
});

export const backendURL =
    "http://127.0.0.1:4943/api/v2/canister/ryjl3-tyaaa-aaaaa-aaaba-cai&id=rrkah-fqaaa-aaaaa-aaaaq-cai";

class MyComp extends Component {
    public constructor() {
        super();
    }

    public render() {
        return [
            <Nav key="1" />,
            <MainTextArea key="2" value="" readonly={false} />,
        ];
    }
}

// initDevTools();

render(<MyComp />, document.getElementById("app"));
