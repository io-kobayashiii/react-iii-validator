import * as React from 'react'
import { ValidatorController } from './ValidatorController'

type Options = {
	validClasses?: string[]
	invalidClasses?: string[]
	debugMode?: boolean
}

export const useValidator = (options?: Options) => {
	const [Validator] = React.useState(new ValidatorController(options))
	return Validator
}
