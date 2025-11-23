export function nepToEng(str: string): string {
    return str.replace(/[\u0966-\u096F]/g, d => String(d.charCodeAt(0) - 0x0966));
}

export function engToNep(str: string): string {
  return str.replace(/\d/g, d => String.fromCharCode(Number(d) + 0x0966));
}