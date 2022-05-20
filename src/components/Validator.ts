import { threadId } from 'worker_threads'
import { customNanoid } from '../libraries/customNanoid'
import { FormElements } from '../types'

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
			date: '日付の形式が正しくありません。',
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
				if (!/^[a-zA-Z0-9_+-]+(\.[a-zA-Z0-9_+-]+)*@([a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.)+[a-zA-Z]{2,}$/.test(this.value as string)) {
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
				if (!/^[0-9\s!"#$%&'()=~|`{+*}<>?_\-^\\@[;:\],./^]+$/.test(this.value as string)) {
					this.showErrorMessage('halfWidthNumber')
					this.validity = false
					this.adjustValidationClasses()
				}
			},
			katakana: () => {
				if (!/^[ァ-ヾ０-９－\s　！”＃＄％＆’（）＝～｜‘｛＋＊｝＜＞？＿－＾￥＠「；：」、。・]+$/.test(this.value as string)) {
					this.showErrorMessage('katakana')
					this.validity = false
					this.adjustValidationClasses()
				}
			},
			hiragana: () => {
				if (!/^[ぁ-んー０-９－\s　！”＃＄％＆’（）＝～｜‘｛＋＊｝＜＞？＿－＾￥＠「；：」、。・]+$/.test(this.value as string)) {
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
			date: () => {
				let isMatched = false
				const regExps = [
					/^[1-9][0-9]{3}(\/)([1-9]|[0-1][0-9])(\/)([0-9]|[0-3][0-9])$/,
					/^[1-9][0-9]{3}(\-)([1-9]|[0-1][0-9])(\-)([0-9]|[0-3][0-9])$/,
					/^[1-9][0-9]{3}(\.)([1-9]|[0-1][0-9])(\.)([0-9]|[0-3][0-9])$/,
					/^[1-9][0-9]{3}(年)([1-9]|[0-1][0-9])(月)([0-9]|[0-3][0-9])[日]$/,
				]
				regExps.forEach((regExp) => {
					if (regExp.test(this.value as string)) isMatched = true
				})
				if (!isMatched) {
					this.showErrorMessage('date')
					this.validity = false
					this.adjustValidationClasses()
				}
			},
			dateAfter: () => {
				let dateAfterBaseNameAttribute = '' as string
				Array.prototype.forEach.call(this.element.classList, (_class: string) => {
					if (_class.match(/^dateAfterBaseNameAttribute::/)) dateAfterBaseNameAttribute = _class.split('::')[1]
				})
				console.log(`log ::: dateAfterBaseNameAttribute: ${dateAfterBaseNameAttribute}`)
				const dateAfterBaseValue = this.validationGroup.querySelector<HTMLInputElement | HTMLSelectElement>(`[name='${dateAfterBaseNameAttribute}']`)!.value
				if (dateAfterBaseValue == '') return

				const dateAfterBaseDateLocaleString = new Date(dateAfterBaseValue.replace('年', '/').replace('月', '/').replace('日', '')).toLocaleString().split(' ')[0]
				const dateAfterBaseDate = {
					year: Number(dateAfterBaseDateLocaleString.split('/')[0]),
					month: Number(dateAfterBaseDateLocaleString.split('/')[1]),
					day: Number(dateAfterBaseDateLocaleString.split('/')[2]),
				}
				const thisDateLocaleString = new Date((this.value as string).replace('年', '/').replace('月', '/').replace('日', '')).toLocaleString().split(' ')[0]
				const thisDate = {
					year: Number(thisDateLocaleString.split('/')[0]),
					month: Number(thisDateLocaleString.split('/')[1]),
					day: Number(thisDateLocaleString.split('/')[2]),
				}

				console.log(`log ::: compare date / year: ${thisDate.year}, ${dateAfterBaseDate.year} / month: ${thisDate.month}, ${dateAfterBaseDate.month} / day: ${thisDate.day}, ${dateAfterBaseDate.day}`)

				if (
					thisDate.year < dateAfterBaseDate.year ||
					(thisDate.year == dateAfterBaseDate.year && thisDate.month < dateAfterBaseDate.month) ||
					(thisDate.year == dateAfterBaseDate.year && thisDate.month == dateAfterBaseDate.month && thisDate.day < dateAfterBaseDate.day)
				) {
					let dateAfterBaseName = '' as string
					Array.prototype.forEach.call(this.element.classList, (_class: string) => {
						if (_class.match(/^dateAfterBaseName::/)) dateAfterBaseName = _class.split('::')[1]
					})
					this.showCustomErrorMessage(`${dateAfterBaseName}より後の日付を入力してください。`)
					this.validity = false
					this.adjustValidationClasses()
				}
			},
			dateBefore: () => {
				let dateBeforeBaseNameAttribute = '' as string
				Array.prototype.forEach.call(this.element.classList, (_class: string) => {
					if (_class.match(/^dateBeforeBaseNameAttribute::/)) dateBeforeBaseNameAttribute = _class.split('::')[1]
				})
				console.log(`log ::: dateBeforeBaseNameAttribute: ${dateBeforeBaseNameAttribute}`)
				const dateBeforeBaseValue = this.validationGroup.querySelector<HTMLInputElement | HTMLSelectElement>(`[name='${dateBeforeBaseNameAttribute}']`)!.value
				if (dateBeforeBaseValue == '') return

				const dateBeforeBaseDateLocaleString = new Date(dateBeforeBaseValue.replace('年', '/').replace('月', '/').replace('日', '')).toLocaleString().split(' ')[0]
				const dateBeforeBaseDate = {
					year: Number(dateBeforeBaseDateLocaleString.split('/')[0]),
					month: Number(dateBeforeBaseDateLocaleString.split('/')[1]),
					day: Number(dateBeforeBaseDateLocaleString.split('/')[2]),
				}
				const thisDateLocaleString = new Date((this.value as string).replace('年', '/').replace('月', '/').replace('日', '')).toLocaleString().split(' ')[0]
				const thisDate = {
					year: Number(thisDateLocaleString.split('/')[0]),
					month: Number(thisDateLocaleString.split('/')[1]),
					day: Number(thisDateLocaleString.split('/')[2]),
				}

				console.log(`log ::: compare date / year: ${thisDate.year}, ${dateBeforeBaseDate.year} / month: ${thisDate.month}, ${dateBeforeBaseDate.month} / day: ${thisDate.day}, ${dateBeforeBaseDate.day}`)

				if (
					dateBeforeBaseDate.year < thisDate.year ||
					(dateBeforeBaseDate.year == thisDate.year && dateBeforeBaseDate.month < thisDate.month) ||
					(dateBeforeBaseDate.year == thisDate.year && dateBeforeBaseDate.month == thisDate.month && dateBeforeBaseDate.day < thisDate.day)
				) {
					let dateBeforeBaseName = '' as string
					Array.prototype.forEach.call(this.element.classList, (_class: string) => {
						if (_class.match(/^dateBeforeBaseName::/)) dateBeforeBaseName = _class.split('::')[1]
					})
					this.showCustomErrorMessage(`${dateBeforeBaseName}より前の日付を入力してください。`)
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
