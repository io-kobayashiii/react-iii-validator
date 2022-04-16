import { customNanoid } from './customNanoid'
import { FormElements } from './types'

type ValidatorProps = {
	validationGroup: HTMLElement | Document
	element: FormElements
	validClasses?: string[]
	invalidClasses?: string[]
	debugMode: boolean
}

export class Validator {
	id: string
	validationGroup: Document | HTMLElement
	element: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
	validClasses?: string[]
	invalidClasses?: string[]
	debugMode: boolean
	name: string | null
	validations?: string[]
	formGroupElement: HTMLElement | null
	validityStyleTarget: HTMLElement | null
	errorTipElement: HTMLElement | null
	errorMessages: { [key: string]: string }
	validateFunctions: { [key: string]: () => void }
	value: number | boolean | string | null
	currentValidation: string | null
	validity: boolean | null
	constructor({ validationGroup, element, validClasses, invalidClasses, debugMode }: ValidatorProps) {
		this.id = customNanoid()
		debugMode && console.log(`log ::: Validator.constructor / this.id: ${this.id}`)
		this.validationGroup = validationGroup
		this.element = element
		this.validClasses = validClasses
		this.invalidClasses = invalidClasses
		this.debugMode = debugMode
		this.name = this.element.getAttribute('name')
		this.validations = this.setValidations()
		this.formGroupElement = element.closest('.form-group')
		this.validityStyleTarget = this.formGroupElement!.querySelector('.validity-style-target')
		this.errorTipElement = this.formGroupElement!.querySelector('.error-tip')
		this.errorMessages = this.setErrorMessages()
		this.validateFunctions = this.setValidateFunctions()
		this.value = null
		this.currentValidation = null
		this.validity = null
	}
	logId() {
		console.log(`log ::: Validator.logId / this.id: ${this.id}`)
	}
	setValidations() {
		let validations = [] as string[]
		Array.prototype.forEach.call(this.element.classList, (_class: string) => {
			if (_class.match(/^validations::/)) validations = _class.split('::')[1].split(':')
		})
		return validations
	}
	setErrorMessages() {
		return {
			required: 'この項目は必須です。',
			email: 'メールアドレスの形式が正しくありません。',
			confirmation: '入力内容が一致しません。',
			halfWidthNumber: '半角数字で入力してください。',
			katakana: '全角カタカナで入力してください。',
			hiragana: 'ひらがなで入力してください。',
		}
	}
	setValue() {
		this.value = this.element.value
	}
	setValidateFunctions() {
		return {
			required: () => {
				switch (this.element.tagName) {
					case 'INPUT':
					case 'TEXTAREA':
						if (this.value == '') {
							this.showErrorMessage('required')
							this.validity = false
							this.adjustValidationClasses()
						}
						break
					case 'SELECT':
						if ((this.value as string) == 'unselected' || (this.value as string) == '') {
							this.showErrorMessage('required')
							this.validity = false
							this.adjustValidationClasses()
						}
						break
					default:
						break
				}
			},
			multipleRequired: () => {
				let isMultipleRequiredValid = false as boolean
				let multipleRequiredGroup = '' as string
				Array.prototype.forEach.call(this.element.classList, (_class: string) => {
					if (_class.match(/^multipleRequiredGroup::/)) multipleRequiredGroup = _class.split('::')[1]
				})
				const multipleRequiredElements = document.querySelectorAll(`.multipleRequiredGroup\\:\\:${multipleRequiredGroup}`)
				Array.prototype.forEach.call(multipleRequiredElements, (element) => {
					if (element.value != '') isMultipleRequiredValid = true
				})
				if (!isMultipleRequiredValid) {
					let errorMessage = '' as string
					Array.prototype.forEach.call(multipleRequiredElements, (element, index) => {
						let multipleRequiredName = '' as string
						Array.prototype.forEach.call(element.classList, (_class: string) => {
							if (_class.match(/^multipleRequiredName::/)) multipleRequiredName = _class.split('::')[1]
						})
						errorMessage += index == 0 ? multipleRequiredName : `、${multipleRequiredName}`
						if (index == multipleRequiredElements.length - 1) errorMessage += `のいずれかの入力は必須です。`
					})
					this.showCustomErrorMessage(errorMessage)
					this.validity = false
					this.adjustValidationClasses()
				}
			},
			email: () => {
				if (
					!(this.value as string).match(
						/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.||~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.||~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i,
					)
				) {
					this.showErrorMessage('email')
					this.validity = false
					this.adjustValidationClasses()
				}
			},
			confirmation: () => {
				let confirmationBase = '' as string
				Array.prototype.forEach.call(this.element.classList, (_class: string) => {
					if (_class.match(/^confirmationBase::/)) confirmationBase = _class.split('::')[1]
				})
				if ((this.value as string) != this.validationGroup.querySelector<HTMLInputElement>(`[name=${confirmationBase}]`)!.value) {
					this.showErrorMessage('confirmation')
					this.validity = false
					this.adjustValidationClasses()
				}
			},
			minimumCharacters: () => {
				const minimumCharacters = this.currentValidation?.split('-')[1]
				if ((this.value as string).length < Number(minimumCharacters)) {
					this.showCustomErrorMessage(`${minimumCharacters}文字以上必要です。`)
					this.validity = false
					this.adjustValidationClasses()
				}
			},
			maximumCharacters: () => {
				const maximumCharacters = this.currentValidation?.split('-')[1]
				if (Number(maximumCharacters) < (this.value as string).length) {
					this.showCustomErrorMessage(`${maximumCharacters}文字以下で入力してください。`)
					this.validity = false
					this.adjustValidationClasses()
				}
			},
			halfWidthNumber: () => {
				if (!(this.value as string).match(/^[0-9\s!"#$%&'()=~|`{+*}<>?_\-^\\@[;:\],./^]+$/)) {
					this.showErrorMessage('halfWidthNumber')
					this.validity = false
					this.adjustValidationClasses()
				}
			},
			katakana: () => {
				if (!(this.value as string).match(/^[ァ-ヾ０-９－\s　！”＃＄％＆’（）＝～｜‘｛＋＊｝＜＞？＿－＾￥＠「；：」、。・]+$/)) {
					this.showErrorMessage('katakana')
					this.validity = false
					this.adjustValidationClasses()
				}
			},
			hiragana: () => {
				if (!(this.value as string).match(/^[ぁ-んー０-９－\s　！”＃＄％＆’（）＝～｜‘｛＋＊｝＜＞？＿－＾￥＠「；：」、。・]+$/)) {
					this.showErrorMessage('hiragana')
					this.validity = false
					this.adjustValidationClasses()
				}
			},
			charactersRange: () => {
				const minimumCharacters = this.currentValidation?.split('-')[1]
				const maximumCharacters = this.currentValidation?.split('-')[2]
				if ((this.value as string).length < Number(minimumCharacters) || Number(maximumCharacters) < (this.value as string).length) {
					this.showCustomErrorMessage(`${minimumCharacters}文字以上${maximumCharacters}以下で入力してください。`)
					this.validity = false
					this.adjustValidationClasses()
				}
			},
		}
	}
	showErrorMessage(validationName: string) {
		const p = document.createElement('p')
		p.textContent = this.errorMessages[validationName]
		this.errorTipElement!.appendChild(p)
	}
	showCustomErrorMessage(errorMessage: string) {
		const p = document.createElement('p')
		p.textContent = errorMessage
		this.errorTipElement!.appendChild(p)
	}
	adjustValidationClasses() {
		switch (this.validity) {
			case true:
				this.element.classList.remove('is-invalid')
				this.validClasses?.forEach((_class) => {
					this.element.classList.add(_class)
					this.validityStyleTarget?.classList.add(_class)
				})
				this.invalidClasses?.forEach((_class) => {
					this.element.classList.remove(_class)
					this.validityStyleTarget?.classList.remove(_class)
				})
				break
			case false:
				this.element.classList.add('is-invalid')
				this.validClasses?.forEach((_class) => {
					this.element.classList.remove(_class)
					this.validityStyleTarget?.classList.remove(_class)
				})
				this.invalidClasses?.forEach((_class) => {
					this.element.classList.add(_class)
					this.validityStyleTarget?.classList.add(_class)
				})
				break
			default:
				break
		}
	}
	resetErrorTip() {
		this.errorTipElement!.innerHTML = ''
	}

	validate() {
		this.debugMode && console.log(`log ::: Validator.validate / name: ${this.name}`)
		if (this.getHasIgnoreValidation()) return
		this.setValue()
		this.resetErrorTip()
		this.validity = true
		this.validations!.forEach((validation) => {
			this.currentValidation = validation
			if (validation == 'required' || validation == 'multipleRequired') this.validateFunctions[validation]()
			if (validation != 'required' && (this.value as string) != '') this.validateFunctions[validation.includes('-') ? validation.split('-')[0] : validation]()
			this.currentValidation = null
		})
		if (this.validity) this.adjustValidationClasses()
	}
	getValidity() {
		this.debugMode && console.log(`log ::: Validator.getValidity / ${this.validity}`)
		return this.validity
	}
	getHasIgnoreValidation() {
		return this.element.classList.contains('ignore-validation')
	}
	getErrorStatus() {
		return this.getHasIgnoreValidation() || this.getValidity()
	}
}
