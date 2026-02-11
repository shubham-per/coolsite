
export function formatText(text: string): string {
    if (!text) return ""

    // Escape HTML to prevent XSS (basic)
    let safeText = text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")

    // formatting
    let formatted = safeText
        // Bold: **text**
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        // Italic: *text*
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        // Color: [text](#color)
        .replace(/\[([^\]]+)\]\s*\((#[0-9a-fA-F]{3,8})\)/g, '<span style="color: $2">$1</span>')
        // Links: [text](url) or [text] (url)
        .replace(/\[([^\]]+)\]\s*\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">$1</a>')

    // split into lines to handle lists and paragraphs
    const lines = formatted.split('\n')
    let output = ''
    let inList = false

    lines.forEach((line, index) => {
        const isListItem = line.trim().startsWith('- ')

        if (isListItem) {
            if (!inList) {
                output += '<ul class="list-disc pl-5 space-y-1 mb-2">'
                inList = true
            }
            output += `<li>${line.trim().substring(2)}</li>`
        } else {
            if (inList) {
                output += '</ul>'
                inList = false
            }
            // plain line - add break if not empty and not last
            if (line.trim()) {
                output += `<p class="mb-2 last:mb-0">${line}</p>`
            } else if (!inList) {
                // preserve empty lines as spacers if needed, or ignore
            }
        }
    })

    if (inList) output += '</ul>'

    return output
}
