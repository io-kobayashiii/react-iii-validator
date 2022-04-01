import * as React from 'react'
import { ValidatorController } from './ValidatorController'

type Options = {
	validationGroup?: HTMLElement
	validClasses?: string[]
	invalidClasses?: string[]
}

export const useValidator = (options?: Options) => {
	const [Validator] = React.useState(new ValidatorController(options))
	return Validator
}