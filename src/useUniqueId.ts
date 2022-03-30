import * as React from 'react'

const str = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

export const useUniqueId = (n: number): string => {
	const [generatedRandomCharacters, setGeneratedRandomCharacters] = React.useState([generateRandomCharacters(n)])
	let randomCharacters = generateRandomCharacters(n)
	return generatedRandomCharacters.includes(randomCharacters) ? useUniqueId(n) : randomCharacters
}

function generateRandomCharacters(n: number) {
	let randomCharacters = ''
	for (let i = 0; i < n; i++) {
		randomCharacters += str[~~(Math.random() * str.length)]
	}
	return randomCharacters
}
