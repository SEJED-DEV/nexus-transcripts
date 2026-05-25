"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.compileTranscript = compileTranscript;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
async function compileTranscript(channel, messages, options) {
    const templatePath = path.join(__dirname, 'template', 'ui.html');
    let templateContent = '';
    try {
        templateContent = fs.readFileSync(templatePath, 'utf8');
    }
    catch (err) {
        // Fallback if running from a different relative path
        const altPath = path.join(process.cwd(), 'src', 'template', 'ui.html');
        templateContent = fs.readFileSync(altPath, 'utf8');
    }
    const payload = {
        channel,
        messages,
        generatedAt: Date.now(),
        poweredBy: options.poweredBy !== false
    };
    const jsonPayloadString = JSON.stringify(payload);
    // Replace the placeholder script data
    const compiledContent = templateContent.replace('/* DATA_PLACEHOLDER */', jsonPayloadString);
    return compiledContent;
}
