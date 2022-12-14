import { Nav } from "./Nav";
import { MainTextArea } from "./MainTextArea";
import React, { Component } from "react";
import { createRoot } from "react-dom/client";
import assert from "assert";
import { AuthClient } from "@dfinity/auth-client";
import { HttpAgent, Identity } from "@dfinity/agent";
import { Int } from "@dfinity/candid/lib/cjs/idl";
import { createActor } from "../../declarations/dBin_backend";

//TODO: Keep it simple, stupid.
//TODO: Add Unit tests

interface MainCompProps {
    authClient?: AuthClient;
}

//TODO: Refactor this.
export const AGENT = new HttpAgent({ host: "http://127.0.0.1:4943/" });

export const ACTOR = createActor("rrkah-fqaaa-aaaaa-aaaaq-cai", {
    agent: AGENT,
});

class MainComp extends Component<MainCompProps> {
    public constructor(props: MainCompProps) {
        super(props);
    }

    public render() {
        return (
            <React.StrictMode>
                <Nav authClient={this.props.authClient} />
                <MainTextArea
                    authClient={this.props.authClient}
                    value=""
                    readonly={false}
                />
                ,
            </React.StrictMode>
        );
        // return [
        //     //<Nav key="1" />,
        //     <MainTextArea key="2" value="" readonly={false} />,
        // ];
    }
}

// initDevTools();

async function main() {
    const container = document.getElementById("app");
    assert(container);

    const client = await AuthClient.create();

    const root = createRoot(container);
    root.render(<MainComp authClient={client} />);
}

main();
