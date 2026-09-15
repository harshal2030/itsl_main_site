import { PUBLIC_STRAPI_URL } from 'astro:env/client';

export interface Opening {
  documentId: string;
  title: string;
  job_status: 'Open' | 'Closed' | 'Filled';
  location: string;
  tags?: string | null;
  description: string;
}

// Public configuration only. Importing this module never contacts Strapi.
export const careersApi = (() => {
  try {
    const url = new URL(PUBLIC_STRAPI_URL ?? '');
    if (
      !['http:', 'https:'].includes(url.protocol) ||
      url.username ||
      url.password ||
      url.search ||
      url.hash
    )
      return '';
    return `${url.href.replace(/\/+$/, '')}/api`;
  } catch {
    return '';
  }
})();

const fields = new URLSearchParams();
['title', 'job_status', 'location', 'tags', 'description'].forEach(
  (field, index) => fields.set(`fields[${index}]`, field),
);

function checkOpening(opening: Opening): Opening {
  if (
    !opening ||
    typeof opening.documentId !== 'string' ||
    !opening.documentId.trim() ||
    typeof opening.title !== 'string' ||
    !opening.title.trim() ||
    typeof opening.location !== 'string' ||
    typeof opening.description !== 'string' ||
    !['Open', 'Closed', 'Filled'].includes(opening.job_status) ||
    (opening.tags != null && typeof opening.tags !== 'string')
  ) {
    throw new Error(
      'The openings service returned an unexpected response. Please try again.',
    );
  }
  return opening;
}

async function readOpenings(query: string, signal: AbortSignal) {
  const response = await fetch(`${careersApi}/openings${query}`, {
    credentials: 'omit',
    referrerPolicy: 'no-referrer',
    redirect: 'error',
    signal,
  });
  if (response.status === 404) return null;
  if (response.status === 401 || response.status === 403)
    throw new Error('Openings are currently unavailable. Please contact us.');
  if (response.status === 429)
    throw new Error('Too many requests. Please wait before trying again.');
  if (!response.ok)
    throw new Error('We could not load openings. Please try again.');
  return response.json();
}

export async function getOpenings(): Promise<Opening[]> {
  const signal = AbortSignal.timeout(20_000);
  const openings: Opening[] = [];
  for (let page = 1; ; page++) {
    const query = new URLSearchParams(fields);
    query.set('filters[job_status][$eq]', 'Open');
    query.set('sort', 'title:asc');
    query.set('pagination[page]', String(page));
    query.set('pagination[pageSize]', '100');
    const result = await readOpenings(`?${query}`, signal);
    const pagination = result?.meta?.pagination;
    if (
      !Array.isArray(result?.data) ||
      !Number.isInteger(pagination?.pageCount) ||
      pagination.page !== page ||
      pagination.pageCount < 0 ||
      (pagination.pageCount < page &&
        !(page === 1 && pagination.pageCount === 0 && result.data.length === 0))
    ) {
      throw new Error(
        'The openings service returned an unexpected response. Please try again.',
      );
    }
    openings.push(
      ...result.data
        .map(checkOpening)
        .filter((opening: Opening) => opening.job_status === 'Open'),
    );
    if (page >= pagination.pageCount) break;
    if (!result.data.length)
      throw new Error(
        'The openings service returned an incomplete list. Please try again.',
      );
  }
  return openings.sort((a, b) => a.title.localeCompare(b.title, 'en-IN'));
}

export async function getOpening(id: string): Promise<Opening | null> {
  if (!/^[a-zA-Z0-9_-]{1,128}$/.test(id)) return null;
  const result = await readOpenings(
    `/${encodeURIComponent(id)}?${fields}`,
    AbortSignal.timeout(20_000),
  );
  if (result === null) return null;
  const opening = checkOpening(result?.data);
  if (opening.documentId !== id)
    throw new Error(
      'The openings service returned an unexpected response. Please try again.',
    );
  return opening;
}

export function openingError(error: unknown): string {
  if (error instanceof DOMException && error.name === 'TimeoutError')
    return 'Loading took too long. Please try again.';
  if (error instanceof TypeError || error instanceof SyntaxError)
    return 'We could not load openings. Check your connection and try again.';
  return error instanceof Error
    ? error.message
    : 'We could not load openings. Please try again.';
}
