import { nanoid } from 'nanoid'
import { Options } from './types'
import { Validator } from './Validator'

type FormElements = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement

export class ValidatorController {
	id: string
	Validators: { [key: string]: Validator[] }
	validationGroup: HTMLElement | Document | null
	validClasses?: string[]
	invalidClasses?: string[]
	errorStatus: boolean | null
	constructor(options?: Options) {
		this.id = nanoid()
		this.Validators = {}
		this.validationGroup = null
		this.validClasses = options?.validClasses
		this.invalidClasses = options?.invalidClasses
		this.errorStatus = null
	}
	logId() {
		console.log(`log ::: ValidatorController.logId / this.id: ${this.id}`)
	}
	initialize(validationGroup?: HTMLElement | Document) {
		console.log(`log ::: ValidatorController.initialize`)
		this.validationGroup = validationGroup ? validationGroup : document
		const elements = this.validationGroup.getElementsByClassName('validate')
		Array.prototype.forEach.call(elements, (element: FormElements) => {
			this.addValidator(element)
		})
	}
	addValidator(element: FormElements) {
		console.log(`log ::: ValidatorController.addValidator`)
		const name = element.getAttribute('name')
		name == null
			? console.log(`error ::: this ${element.tagName} element doesn't have name attribute`)
			: (this.Validators[name] = []) &&
			  this.Validators[name].push(
					new Validator({
						validationGroup: this.validationGroup!,
						element: element,
						validClasses: this.validClasses,
						invalidClasses: this.invalidClasses,
					}),
			  )
	}
	validate(name?: string) {
		console.log(`log ::: ValidatorController.validate`)
		if (name) {
			this.Validators[name].forEach((validator) => validator.validate())
		} else {
			for (const property in this.Validators) {
				this.Validators[property].forEach((validator) => validator.validate())
			}
		}
	}
	getErrorStatus() {
		this.errorStatus = true
		for (const property in this.Validators) {
			this.Validators[property].forEach((validator) => {
				if (!validator.getErrorStatus()) this.errorStatus = false
			})
		}
		console.log(`log ::: ValidatorController.getErrorStatus / errorStatus: ${this.errorStatus}`)
		return this.errorStatus
	}
}
