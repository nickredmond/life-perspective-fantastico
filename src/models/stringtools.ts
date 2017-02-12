export class StringTools {
	static readonly PROFANITY_REGEX: string = "[!@#$%^&*]*((bull|horse)?shit(s+|t(y+|ier)|head[s]*)?|(bitch(e([s]+|d|ry))?|asshole[s]*|fucker([y]*|[s]*)|fuckin(g)?|fuck[s]*|cunt(y|s)*|whore(s+|d)?)[!@#$%^&*]*)+";

	private pattern: RegExp;
	private isTypeSafe: boolean;
	private static self: StringTools = null;

	private constructor(pattern: string, isTypeSafe: boolean){
		let sanitizedPattern = isTypeSafe ? pattern.toUpperCase() : pattern;
		this.pattern = new RegExp(sanitizedPattern, "g");
		this.isTypeSafe = isTypeSafe;
	}

	static instance(pattern: string = StringTools.PROFANITY_REGEX,
			isTypeSafe: boolean = true){
		if (!StringTools.self){
			StringTools.self = new StringTools(pattern, isTypeSafe);
		}
		return StringTools.self;
	}

	censorText(text: string, replacementText: string = "****"): string {
		let sanitizedText = StringTools.self.isTypeSafe ? text.toUpperCase() : text;
		return sanitizedText.replace(StringTools.self.pattern, replacementText);
	}
}