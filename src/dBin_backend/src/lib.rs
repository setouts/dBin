#![feature(local_key_cell_methods)]
#![allow(non_snake_case)]

use std::{cell::RefCell, fmt};

use candid::{CandidType, Deserialize, Principal};
use ic_cdk::api::{call::RejectionCode, print};
use ic_cdk::storage;
use ic_cdk_macros::{init, post_upgrade, pre_upgrade, query, update};

use std::collections::HashMap;

/*

DESIGN AND THOUGHTS:
Client sends encrypted content to server. Server saves content to a note_id. Server redirects to the note_id.
Could I just encrypt content using the users's private key and/or identity? This seems reallllllly easy. And then just decrypt using that.
However, how would note sharing work with this?
Might not be understanding delegation chains completely yet, but could I use that to allow this functionality?
Maybe I could allow users to list identity anchors of which could view the note? Unsure if it's possible to get the public
key of a given identity anchor yet, but I don't think so?

And account authentication is already done by IC.

It seems like since memory is persisted in canisters, I only have to worry about stable memory when upgrading the canister module.

IC is so fuckin cool

*/

type NoteID = u32;

#[derive(Clone, Debug, CandidType, Deserialize)]
enum AccessType {
    Public,
    Invite,
    Private,
}

#[derive(Clone, Debug, CandidType, Deserialize)]
struct NoteMetadata {
    creator: Principal,
    creation_date: u64,
    note_id: NoteID,
    last_modified_date: u64,
    access: AccessType,
}

#[derive(Clone, Debug, CandidType, Deserialize)]
struct PartialNote {
    metadata: NoteMetadata,
    contents: String,
}

#[derive(Clone, Debug, CandidType, Deserialize)]
struct FullNote {
    metadata: NoteMetadata,
    contents: String,
}

//TODO: Just save to stable storage instantly?
thread_local! {
    // static GLOBAL_GREETING: RefCell<String>  = RefCell::new( String::from("test"));
    // static PRIVATE_GREETINGS: RefCell<HashMap<Principal,String>> = RefCell::default();

    //TODO: Would have to keep these in sync. Seems inefficent.
    static GLOBAL_NOTE_STORAGE: RefCell<HashMap<NoteID,FullNote>> = RefCell::default();
    static USER_NOTE_STORAGE: RefCell<HashMap<Principal,NoteID>> = RefCell::default();

}

#[init]
async fn init() {
    ic_cdk::api::print("hi");

    let seed_bytes_call = ic_cdk::api::management_canister::main::raw_rand().await;

    match seed_bytes_call {
        Ok((bytes,)) => {
            // let mut seed_bytes = [0u8;32];
            // seed_bytes.copy_from_slice(&bytes);
            //seed_bytes
        }
        Err((err_code, err_string)) => {
            print(err_string);
        }
    }
}

const MAX_IDENTIFIER_LENGTH: usize = 10;

// I could just use consecutive numbers instead, but yolo.
fn generate_identifier() -> String {
    "yes".into()
}

// fn generate_identifier() -> String {
//     rand::distributions::Alphanumeric.sample_string(
//         &mut rand::thread_rng(),
//         rand::thread_rng().gen_range(1..MAX_IDENTIFIER_LENGTH),
//     )
// }

#[query(name = "GetFullContents")]
fn get_full_contents(note_id: NoteID) -> Option<FullNote> {
    let caller = ic_cdk::caller();

    //TODO: Add better error handling here.
    let foundNote = GLOBAL_NOTE_STORAGE
        .with(|global_note_storage| Some(global_note_storage.borrow().get(&note_id)?.clone()));
    if let Some(mut note) = foundNote {
        // note.contents = generaIte_identifier();
        Some(note)
    } else {
        None
    }
}

//TODO: Progressively generate note IDs. Should probably change it to a string and use a random identifier.
#[update(name = "SaveFullContents")]
fn save_full_contents(contents: String) {
    let caller = ic_cdk::caller();
    let time = ic_cdk::api::time();
    let noteId = 42;

    GLOBAL_NOTE_STORAGE.with(|storage| {
        storage.borrow_mut().insert(
            noteId,
            FullNote {
                metadata: NoteMetadata {
                    access: AccessType::Public,
                    creator: caller,
                    creation_date: time,
                    note_id: noteId,
                    last_modified_date: time,
                },
                contents: contents,
            },
        );
    });
}

#[pre_upgrade]
fn pre_upgrade() {
    let clone_hashmap = GLOBAL_NOTE_STORAGE.with(|storage| storage.borrow_mut().clone());

    //TODO: Add error handling
    let res = storage::stable_save((clone_hashmap,));

    if let Err(e) = res {
        ic_cdk::api::print(e.to_string());
    }

    return;
}

#[post_upgrade]
fn post_upgrade() {
    let res: Result<(HashMap<NoteID, FullNote>,), String> = storage::stable_restore();

    if let Ok((stored_notes,)) = res {
        GLOBAL_NOTE_STORAGE.replace(stored_notes);
    } else if let Err(e) = res {
        ic_cdk::api::print(e);
    }

    return;
}
