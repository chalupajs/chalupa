import { v4 } from 'uuid'

export function newUID(): string {
	return v4()
}

export async function timeout(ms: number) {
	return new Promise(resolve => {
		setTimeout(resolve, ms)
	})
}
