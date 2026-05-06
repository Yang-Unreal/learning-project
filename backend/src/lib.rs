use candid::CandidType;
use ic_cdk::{init, post_upgrade, query, update};
use ic_stable_structures::{
    memory_manager::{MemoryId, MemoryManager, VirtualMemory},
    storable::{Bound, Storable},
    DefaultMemoryImpl, StableBTreeMap,
};
use serde::{Deserialize, Serialize};
use std::borrow::Cow;
use std::cell::RefCell;

type Memory = VirtualMemory<DefaultMemoryImpl>;

#[derive(CandidType, Serialize, Deserialize, Clone)]
struct User {
    id: u64,
    name: String,
    created: u64,
}

impl Storable for User {
    const BOUND: Bound = Bound::Unbounded;

    fn to_bytes(&self) -> Cow<'_, [u8]> {
        let mut buf = vec![];
        ciborium::into_writer(self, &mut buf).expect("Failed to encode User");
        Cow::Owned(buf)
    }

    fn into_bytes(self) -> Vec<u8> {
        let mut buf = vec![];
        ciborium::into_writer(&self, &mut buf).expect("Failed to encode User");
        buf
    }

    fn from_bytes(bytes: Cow<'_, [u8]>) -> Self {
        ciborium::from_reader(bytes.as_ref()).expect("Failed to decode User")
    }
}

thread_local! {
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> =
        RefCell::new(MemoryManager::init(DefaultMemoryImpl::default()));

    static USERS: RefCell<StableBTreeMap<u64, User, Memory>> =
        RefCell::new(StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(0)))
        ));

    static COUNTER: RefCell<ic_stable_structures::StableCell<u64, Memory>> =
        RefCell::new(ic_stable_structures::StableCell::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(1))),
            0u64,
        ));
}

#[init]
fn init() {}

#[post_upgrade]
fn post_upgrade() {}

#[update]
fn add_user(name: String) -> u64 {
    let id = COUNTER.with(|c| {
        let mut cell = c.borrow_mut();
        let current = *cell.get();
        let _ = cell.set(current + 1);
        current
    });

    let user = User {
        id,
        name,
        created: ic_cdk::api::time(),
    };

    USERS.with(|users| {
        users.borrow_mut().insert(id, user);
    });

    id
}

#[query]
fn get_user(id: u64) -> Option<User> {
    USERS.with(|users| users.borrow().get(&id))
}

#[query]
fn get_user_count() -> u64 {
    USERS.with(|users| users.borrow().len())
}

#[query]
fn get_all_users() -> Vec<User> {
    USERS.with(|users| {
        users
            .borrow()
            .iter()
            .map(|entry| entry.value().clone())
            .collect()
    })
}

#[update]
fn delete_user(id: u64) -> bool {
    USERS.with(|users| users.borrow_mut().remove(&id).is_some())
}

ic_cdk::export_candid!();
