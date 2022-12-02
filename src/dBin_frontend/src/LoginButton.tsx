import { AnonymousIdentity } from "@dfinity/agent";
import { AuthClient } from "@dfinity/auth-client";
import { Component, ReactNode } from "react";

async function HandleAuthentication(client?: AuthClient) {
    console.log(client?.getIdentity());
}

async function InitializeIdentity() {
    const authClient = await AuthClient.create();
    console.log(authClient.getIdentity());

    if (await authClient.isAuthenticated()) {
        await HandleAuthentication(authClient);
    } else {
        await authClient.login({
            onSuccess: async () => {
                await HandleAuthentication(authClient);
            },
        });
    }
}

interface LoginButtonProps {
    authClient?: AuthClient;
}

function isCurrentUserAuthenticated(authClient?: AuthClient) {
    console
    return !authClient?.getIdentity().getPrincipal().isAnonymous();
}

export class LoginButton extends Component<LoginButtonProps, unknown> {
    constructor(props: LoginButtonProps) {
        super(props);
    }

    async componentDidMount() {
        // if (this.props.authClient?.isAuthenticated()) {
        //     await HandleAuthentication(this.props.authClient);
        // } else {
        //     await HandleAuthentication(this.props.authClient);
        // }
    }

    //TODO: Add a debounce
    private async onClick() {
        this.props.authClient?.login({
            onSuccess: async () => {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                await HandleAuthentication(this.props.authClient!);
            },
        });
    }

    render() {
        return (
            <button
                id="login_button"
                className={
                    //TODO: Figure out if this blocks the render thread? Probably not?
                    isCurrentUserAuthenticated(this.props.authClient)
                        ? "hidden"
                        : "shown"
                }
                onClick={() => {
                    this.onClick();
                }}
            >
                LOGIN
            </button>
        );
    }
}
