import type { User } from "./models/User"

export const TEST_MODE = process.env.TEST_MODE == "true"

const testDbData = new Map<string, User>()

export const userById = (id: string): User | null => testDbData.get(id) ?? null

const save = (user: User): void => {
    testDbData.set(user.id, user)
}

export const testDb = {
    save,
}
