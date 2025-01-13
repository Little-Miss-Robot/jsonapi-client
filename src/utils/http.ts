export function makeSearchParams(params: Record<string, string | number>) {
    return (new URLSearchParams(params as Record<string, string>)).toString();
}
