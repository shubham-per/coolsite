export const deriveDefaultIcon = (key: string): string => {
    if (key === "about") return "user"
    if (key === "engineering") return "rocket"
    if (key === "games") return "gamepad"
    if (key === "art") return "palette"
    if (key === "contact") return "mail"
    if (key === "faq") return "help"
    return "folder"
}
