export interface Mailable {
    from: string
    to: string
    subject: string
    text?: string
    html?: string
}

export interface MailOptions {
    to: string
    subject: string,
    viewName: string,
    input: object
}
