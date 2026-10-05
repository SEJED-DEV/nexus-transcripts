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
async function compileTranscript(channel, messages, options, emojiMap, mentionMap) {
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
        poweredBy: options.poweredBy !== false,
        emojiMap: emojiMap && Object.keys(emojiMap).length ? emojiMap : undefined,
        mentionMap: mentionMap && (Object.keys(mentionMap.users).length
            || Object.keys(mentionMap.roles).length
            || Object.keys(mentionMap.channels).length) ? mentionMap : undefined
    };
    const jsonPayloadString = JSON.stringify(payload);
    // Discord serves Lottie stickers as .json animation data, so something has to
    // play them. The player is ~240KB, so it is only inlined when the transcript
    // actually contains a Lottie sticker - otherwise those files would carry it
    // for nothing.
    const needsLottie = messages.some(m => (m.stickers || []).some(s => s.format === 'lottie'));
    if (needsLottie) {
        templateContent = templateContent.replace('/* LOTTIE_RUNTIME */', readLottieRuntime());
    }
    else {
        // Leave the placeholder as a comment so the file stays valid HTML.
        templateContent = templateContent.replace('/* LOTTIE_RUNTIME */', '');
    }
    // Replace the placeholder script data
    const compiledContent = templateContent.replace('/* DATA_PLACEHOLDER */', jsonPayloadString);
    return compiledContent;
}
function readLottieRuntime() {
    const candidates = [
        path.join(__dirname, 'template', 'vendor', 'lottie_svg.min.js'),
        path.join(process.cwd(), 'src', 'template', 'vendor', 'lottie_svg.min.js')
    ];
    for (const candidate of candidates) {
        try {
            return fs.readFileSync(candidate, 'utf8');
        }
        catch {
            // try the next location
        }
    }
    console.warn('[nexus-transcripts] Lottie sticker found but the vendored lottie player ' +
        'was not found; Lottie stickers will fall back to a static placeholder.');
    return '';
}
