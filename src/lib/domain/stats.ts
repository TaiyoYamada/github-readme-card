/**
 * Domain types for the stats card. The `github` layer produces these,
 * the `card` layer consumes them. Nothing in here knows about SVG or
 * the GitHub API shape.
 */

export interface LanguageStat {
  readonly name: string;
  readonly bytes: number;
  /** GitHub's canonical language color, e.g. "#3178c6". `null` for languages without one. */
  readonly color: string | null;
}

export interface Stats {
  readonly username: string;
  /** Year the user joined GitHub (used for the eyebrow text and contributions window). */
  readonly joinedYear: number;
  readonly totalCommits: number;
  readonly totalPRs: number;
  readonly totalIssues: number;
  readonly totalStars: number;
  /** Top language by total bytes across non-fork repos. `null` if no code. */
  readonly mostUsedLanguage: LanguageStat | null;
  /** Top languages, descending by bytes. Trimmed to a manageable count by the aggregator. */
  readonly languages: ReadonlyArray<LanguageStat>;
  /** When the data was fetched. Used for the "updated at" footer if shown. */
  readonly fetchedAt: Date;
}
