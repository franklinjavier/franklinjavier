/** Kind of named snapshot shared by a list row and its post page. */
type ViewTransitionKind = 'title' | 'date'

const prefix: Record<ViewTransitionKind, string> = {
  title: 'post-title',
  date: 'post-date',
}

/**
 * CSS `<custom-ident>` for a post title or date. The prefix keeps it from
 * starting with a digit. `pt-br/meu-post` becomes `post-title-pt-br-meu-post`.
 */
export function viewTransitionName(kind: ViewTransitionKind, id: string): string {
  const slug = id.toLowerCase().replace(/[^a-z0-9_-]/g, '-')
  return `${prefix[kind]}-${slug}`
}
