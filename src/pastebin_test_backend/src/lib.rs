use std::cell::RefCell;

use candid::Principal;
use ic_cdk_macros::{query, update};
use std::collections::HashMap;

thread_local! {
    static GLOBAL_GREETING: RefCell<String>  = RefCell::new( String::from("test"));
    static PRIVATE_GREETINGS: RefCell<HashMap<Principal,String>> = RefCell::default();
}

//TODO: Do better

#[query(name = "Greet")]
fn greet(name: String) -> String {
    let mut personal_greeting: Option<String> = None;
    let mut global_greeting: String = String::new();
    let princip_id = ic_cdk::caller();

    //TODO: No way this is the best pattern to do this? Do better
    GLOBAL_GREETING.with(|greeting| {
        global_greeting = greeting.borrow().clone();
    });

    PRIVATE_GREETINGS.with(|greeting| {
        if let Some(greeting) = greeting.borrow().get(&princip_id) {
            personal_greeting = Some(greeting.clone());
        }
    });

    format!(
        "Hello {princip_id}, your personal greeting is {}, the global greeting is {global_greeting}",
       (if personal_greeting.is_some() {personal_greeting} else {Some(String::from("Unset"))}.unwrap())
    )
}

#[update(name = "UpdateGlobalGreeting")]
fn update_global_greeting(new_greeting: String) {
    GLOBAL_GREETING.with(|greeting| {
        *greeting.borrow_mut() = new_greeting;
    });
}

#[update(name = "UpdatePrivateGreeting")]
fn update_principal_greeting(new_greeting: String) {
    PRIVATE_GREETINGS.with(|greeting| greeting.borrow_mut().insert(ic_cdk::caller(), new_greeting));
}
