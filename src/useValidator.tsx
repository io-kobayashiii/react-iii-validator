import * as React from 'react'
import { customAlphabet } from 'nanoid'

type Options = {
	name?: string
	validClasses?: string[]
	invalidClasses?: string[]
	recreate?: boolean
}

const ValidatorControllerInstances = {} as { [x: string]: ValidatorController }

const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'
const nanoid = customAlphabet(alphabet, 16)

export const useValidator = (options?: Options) => {
	const id = nanoid()
	return new ValidatorController(id, options)
}

type ValidatorControllerRegisterProps = {
	ref: React.MutableRefObject<HTMLElement>
}

class ValidatorController {
	id: string
	constructor(id: string, options?: Options) {
		console.log(`log ::: ValidatorController.constructor`)
		this.id = id
		console.log(`log ::: ValidatorController.constructor / this.id: ${this.id}`)
	}
	register(registerProps: ValidatorControllerRegisterProps) {
		console.log(`log ::: ValidatorController.register`)
		console.log(`log ::: ValidatorController.register / this.id: ${this.id}`)
		console.log(registerProps.ref.current)
		new Validator({ element: registerProps.ref.current })
	}
	addValidator(name: string) {
		console.log(`log ::: ValidatorController.addValidator`)
	}
	validate() {
		console.log(`log ::: ValidatorController.validate`)
	}
}

type ValidatorProps = {
	element: HTMLElement
}

class Validator {
	constructor(props: ValidatorProps) {
		console.log(`log ::: Validator.constructor`)
	}
}
