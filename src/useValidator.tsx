import * as React from 'react'
import { useUniqueId } from './useUniqueId'

type Options = {
	name?: string
	validClasses?: string[]
	invalidClasses?: string[]
	recreate?: boolean
}

type Instances = {
	[x: string]: ValidatorController
}

export const useValidator = (options?: Options) => {
	const [ids, setIds] = React.useState<string[]>([useUniqueId(16)])
	const [Instances, setInstances] = React.useState<Instances>({})
}

type ValidatorControllerRegisterProps = {
	ref: React.MutableRefObject<HTMLElement>
}

class ValidatorController {
	id: string
	constructor(options?: Options) {
		console.log(`log ::: ValidatorController.constructor`)
		this.id = useUniqueId(10)
		console.log(`log ::: ValidatorController.constructor / this.id: ${this.id}`)
	}
	register(registerProps: ValidatorControllerRegisterProps) {
		console.log(`log ::: ValidatorController.register`)
		console.log(`log ::: ValidatorController.register / this.id: ${this.id}`)
		console.log(registerProps.ref.current)
		new Validator({ element: registerProps.ref.current })
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
