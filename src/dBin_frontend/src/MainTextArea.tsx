import { ChangeEvent, Component, FormEvent, Inferno } from "inferno";
import { h } from "inferno-hyperscript";
import { storageClient } from "./Main";

interface TextAreaProps {
    value: string;
    readonly: boolean;
}

interface TextAreaState {
    value: string;
    readonly: boolean;
}

//TODO: Add streaming support for files. Seems unnecessary for simple text rn.
//TODO: Ponder timing attacks with CID getting/creation.
//TODO: Think about private IPFS swarms? Gateways? Since it seems content is immutable, and only deletable if nothing subscribes to it.
//TODO: Quantum computing or algo vulnerabilities could break or have already broken current encryption algorithms. Think about this more.

const CurrentThoughtsCID =
    "bafybeigso5vphlutf3h7mpxn5fzuj6z3jpokv37xdj2nmyl4tyxqptwl2e";

export class MainTextArea extends Component<TextAreaProps, TextAreaState> {
    public constructor(props: TextAreaProps) {
        super(props);
        this.state = { value: this.props.value, readonly: this.props.readonly };
    }

    //TODO: Probably don't need a custom ShouldComponentUpdate? Believe the implementation generates one by default.
    //
    // public shouldComponentUpdate(props: TextAreaProps): boolean {
    //     // console.log("update");
    //     return true;
    // }

    public async componentDidMount() {
        const response = await storageClient.get(CurrentThoughtsCID);

        console.log(await storageClient.status(CurrentThoughtsCID));

        if (response) {
            const underlying_files = await response.files();
            console.log("bruh");

            if (underlying_files.length > 0) {
                //this.setState({ value: await underlying_files[0].text() });
                this.setState({ value: "tedddsdt" });
            }
        }
    }

    //TODO: Figure out if this is the best way to do this. Seems slow? as it forces a state merge.
    public onInput(event: FormEvent<HTMLTextAreaElement>) {
        console.log("this werk?");
        this.setState({
            value: event.currentTarget.value,
        });
    }

    public render() {
        return (
            <textarea
                id="typing_area"
                value={this.state ? this.state.value : "beep boop"}
                readOnly={this.state?.readonly}
                onInput={(event) => {
                    this.onInput(event);
                }}
            />
        );
    }
}
