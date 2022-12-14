import { AnonymousIdentity } from "@dfinity/agent";
import { AuthClient } from "@dfinity/auth-client";
import { Component, ReactNode } from "react";
import { AGENT } from "./Main";

//TODO: Should clean this up, this is ugly.
async function HandleAuthentication(client?: AuthClient) {
    if (client) {
        AGENT.replaceIdentity(await client.getIdentity());
    }
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
    return !authClient?.getIdentity().getPrincipal().isAnonymous();
}

export class LoginButton extends Component<LoginButtonProps, unknown> {
    constructor(props: LoginButtonProps) {
        super(props);
    }

    async componentDidMount() {
        if (isCurrentUserAuthenticated(this.props.authClient)) {
            await HandleAuthentication(this.props.authClient);
        }
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
            identityProvider:
                process.env.NODE_ENV === "production"
                    ? "https://identity.ic0.app/#authorize"
                    : `http://127.0.0.1:4943/?canisterId=${process.env.IDENTITY_CANISTER_ID}`,
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
