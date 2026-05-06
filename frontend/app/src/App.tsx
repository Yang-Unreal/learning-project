import { getCanisterEnv } from "@icp-sdk/core/agent/canister-env";
import { useCallback, useEffect, useState } from "react";
import { createActor } from "./backend/api/backend";
import "./App.css";

interface CanisterEnv {
	readonly "PUBLIC_CANISTER_ID:backend": string;
	readonly IC_ROOT_KEY?: string;
}

interface User {
	id: bigint;
	name: string;
	created: bigint;
}

const canisterEnv = getCanisterEnv<CanisterEnv>() ?? {};
const canisterId = canisterEnv["PUBLIC_CANISTER_ID:backend"];

if (!canisterId) {
	console.error("❌ Backend canister ID not found in environment variables.");
}

const backendActor = createActor(canisterId, {
	agentOptions: {
		rootKey: !import.meta.env.DEV ? canisterEnv?.IC_ROOT_KEY : undefined,
		shouldFetchRootKey: import.meta.env.DEV,
	},
});

function App() {
	const [users, setUsers] = useState<User[]>([]);
	const [deletingId, setDeletingId] = useState<bigint | null>(null);

	const fetchUsers = useCallback(() => {
		backendActor.get_all_users().then((result: User[]) => {
			setUsers(result);
		});
	}, []);

	useEffect(() => {
		fetchUsers();
	}, [fetchUsers]);

	function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const nameInput = (event.target as HTMLFormElement).elements.namedItem(
			"name",
		) as HTMLInputElement;

		const name = nameInput.value;
		backendActor.add_user(name).then(() => {
			fetchUsers();
		});

		nameInput.value = "";
		return false;
	}

	function handleDelete(id: bigint) {
		setDeletingId(id);
		backendActor.delete_user(id).then(() => {
			setDeletingId(null);
			fetchUsers();
		});
	}

	function formatTime(ns: bigint): string {
		const ms = Number(ns) / 1_000_000;
		return new Date(ms).toLocaleString();
	}

	return (
		<main className="page">
			<section className="panel">
				<div className="brand" role="img" aria-label="ICP plus Vite">
					<img src="/icp.svg" alt="ICP logo" className="brand-icp" />
					<span className="plus">+</span>
					<img src="/vite.svg" alt="Vite logo" className="brand-vite" />
				</div>
				<h1 className="title">Stable Memory Example</h1>
				<p className="subtitle">Total users registered: {users.length}</p>
				<form className="form" action="#" onSubmit={handleSubmit}>
					<label htmlFor="name">Add a new user</label>
					<div className="controls">
						<input
							id="name"
							type="text"
							className="input"
							placeholder="Username"
							required
						/>
						<button type="submit" className="button">
							Add User
						</button>
					</div>
				</form>

				{users.length > 0 && (
					<section className="user-list" aria-label="Registered users">
						<h2 className="user-list-title">Registered Users</h2>
						<ul className="user-items">
							{users.map((user) => (
								<li key={Number(user.id)} className="user-item">
									<div className="user-info">
										<span className="user-name">{user.name}</span>
										<span className="user-meta">
											ID: {Number(user.id)} · {formatTime(user.created)}
										</span>
									</div>
									<button
										type="button"
										className="delete-button"
										onClick={() => handleDelete(user.id)}
										disabled={deletingId === user.id}
										aria-label={`Delete user ${user.name}`}
									>
										{deletingId === user.id ? "…" : "✕"}
									</button>
								</li>
							))}
						</ul>
					</section>
				)}
			</section>
		</main>
	);
}

export default App;
