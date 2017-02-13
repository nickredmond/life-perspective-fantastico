var StringTools = (function () {
    function StringTools(pattern, isTypeSafe) {
        var sanitizedPattern = isTypeSafe ? pattern.toUpperCase() : pattern;
        this.pattern = new RegExp(sanitizedPattern, "g");
        this.isTypeSafe = isTypeSafe;
    }
    StringTools.instance = function (pattern, isTypeSafe) {
        if (pattern === void 0) { pattern = StringTools.PROFANITY_REGEX; }
        if (isTypeSafe === void 0) { isTypeSafe = true; }
        if (!StringTools.self) {
            StringTools.self = new StringTools(pattern, isTypeSafe);
        }
        return StringTools.self;
    };
    StringTools.prototype.censorText = function (text, replacementText) {
        if (replacementText === void 0) { replacementText = "****"; }
        var sanitizedText = StringTools.self.isTypeSafe ? text.toUpperCase() : text;
        return sanitizedText.replace(StringTools.self.pattern, replacementText);
    };
    return StringTools;
}());
export { StringTools };
StringTools.PROFANITY_REGEX = "[!@#$%^&*]*(faggot[s]*|(bull|horse)?shit(s+|t(y+|ier)|head[s]*)?|(bitch(e([s]+|d|ry))?|asshole[s]*|fucker([y]*|[s]*)|fuckin(g)?|fuck[s]*|cunt(y|s)*|whore(s+|d)?)[!@#$%^&*]*)+";
StringTools.self = null;
//# sourceMappingURL=stringtools.js.map