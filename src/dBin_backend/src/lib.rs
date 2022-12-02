#![allow(non_snake_case)]

use std::cell::RefCell;

use candid::{CandidType, Deserialize, Principal};
use ic_cdk_macros::{init, post_upgrade, pre_upgrade, query, update};

use std::collections::HashMap;

thread_local! {
    // static GLOBAL_GREETING: RefCell<String>  = RefCell::new( String::from("test"));
    // static PRIVATE_GREETINGS: RefCell<HashMap<Principal,String>> = RefCell::default();


}

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

#[init]
fn init() {
    ic_cdk::api::print("hi");
}

#[query(name = "GetFullContents")]
fn get_full_contents(note_id: NoteID) -> Option<FullNote> {
    let caller = ic_cdk::caller();
    let time = ic_cdk::api::time();
    Some(FullNote {
        metadata: NoteMetadata {
            creator: caller,
            creation_date: time,
            note_id: note_id,
            last_modified_date: time,
            access: AccessType::Public,
        },
        contents: "yesssirrskiiiiii".into(),
    })
}

#[update(name = "SaveFullContents")]
fn save_full_contents(noteId: String, contents: String) {}

#[pre_upgrade]
fn pre_upgrade() {
    //TODO: Add saving to stable memory here.
}

#[post_upgrade]
fn post_upgrade() {
    //TODO: Add loading from stable memory here.
}

// #[query(name = "Greet")]
// fn greet(name: String) -> String {
//     let mut personal_greeting: Option<String> = None;
//     let mut global_greeting: String = String::new();
//     let princip_id = ic_cdk::caller();

//     "Yes".into()

//     // //TODO: No way this is the best pattern to do this? Do better
//     // GLOBAL_GREETING.with(|greeting| {
//     //     global_greeting = greeting.borrow().clone();
//     // });

//     // PRIVATE_GREETINGS.with(|greeting| {
//     //     if let Some(greeting) = greeting.borrow().get(&princip_id) {
//     //         personal_greeting = Some(greeting.clone());
//     //     }
//     // });

//     // format!(
//     //     "Hello {princip_id}, your personal greeting is {}, the global greeting is {global_greeting}",
//     //    (if personal_greeting.is_some() {personal_greeting} else {Some(String::from("Unset"))}.unwrap())
//     // )
// }

// // #[update(name = "UpdateGlobalGreeting")]
// // fn update_global_greeting(new_greeting: String) {
// //     GLOBAL_GREETING.with(|greeting| {
// //         *greeting.borrow_mut() = new_greeting;
// //     });
// // }

// // #[update(name = "UpdatePrivateGreeting")]
// // fn update_principal_greeting(new_greeting: String) {
// //     PRIVATE_GREETINGS.with(|greeting| greeting.borrow_mut().insert(ic_cdk::caller(), new_greeting));
// // }
