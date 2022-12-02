import { HttpAgent } from "@dfinity/agent";
import { AuthClient } from "@dfinity/auth-client";
import { Component } from "react";
import { createActor, idlFactory } from "../../declarations/dBin_backend";
import { LoginButton } from "./LoginButton";

const agent = new HttpAgent();

const actor = createActor("rrkah-fqaaa-aaaaa-aaaaq-cai", {
    agent: agent,
});

async function upload(pasteText: string) {
    const test = await actor.GetFullContents(32);

    console.log(test);

    // const response = await window.fetch(backendURL.concat("/pasd1te"), {
    //     method: "post",
    //     headers: {
    //         "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify({
    //         contents: (
    //             document.getElementById("typing_area") as HTMLTextAreaElement
    //         ).value,
    //     }),
    // });
    // const newFile = new File([pasteText], "ThoughtsSoFar", {
    //     type: "text/plain",
    // });
    // const fileResponse = await storageClient.put([newFile]);
    // console.log(await storageClient.status(fileResponse));
}

interface NavProps {
    authClient?: AuthClient;
}

export class Nav extends Component<NavProps> {
    public constructor(props: NavProps) {
        super(props);
    }

    public render() {
        return (
            <div id="nav">
                <button
                    id="upload_button"
                    onClick={async (event) => {
                        event.preventDefault();
                        //TODO: Prevent spam clicks?
                        await upload(
                            (
                                document.getElementById(
                                    "typing_area"
                                ) as HTMLTextAreaElement
                            ).value
                        );
                    }}
                >
                    UPLOAD
                </button>
                <LoginButton authClient={this.props.authClient} />
            </div>
        );
    }
}
