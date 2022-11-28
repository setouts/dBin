import { Component } from "inferno";
import { h } from "inferno-hyperscript";

import { backendURL, storageClient } from "./Main";

async function upload(pasteText: string) {
    const response = await window.fetch(backendURL.concat("/pasd1te"), {
        method: "post",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            contents: (
                document.getElementById("typing_area") as HTMLTextAreaElement
            ).value,
        }),
    });

    const newFile = new File([pasteText], "ThoughtsSoFar", {
        type: "text/plain",
    });

    const fileResponse = await storageClient.put([newFile]);
    console.log(await storageClient.status(fileResponse));
}

export class Nav extends Component {
    public constructor() {
        super();
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
                ></button>
            </div>
        );
    }
}
