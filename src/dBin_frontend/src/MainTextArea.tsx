import { AuthClient } from "@dfinity/auth-client";
import { Component, FormEvent } from "react";
import { ACTOR } from "./Main";

interface TextAreaProps {
    value: string;
    readonly: boolean;
    authClient?: AuthClient;
}

interface TextAreaState {
    value: string;
    readonly: boolean;
}

//TODO: Live Editing

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
        const storedNote = await ACTOR.GetFullContents(42);
        console.log(storedNote);
        if (storedNote && storedNote.length > 0) {
            this.setState({ value: storedNote[0]!.contents });
        }
    }

    //TODO: Figure out if this is the best way to do this. Seems slow? as it forces a state merge.
    //TODO: Use a ref for this.
    public onInput(event: FormEvent<HTMLTextAreaElement>) {
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
