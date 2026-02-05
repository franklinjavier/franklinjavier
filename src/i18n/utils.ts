import { ui, defaultLang } from './ui';
import { getCollection } from 'astro:content';

export function getLangFromUrl(url: URL) {
  const [, lang] = url.pathname.split('/');
  if (lang in ui) return lang as keyof typeof ui;
  return defaultLang;
}

export function useTranslations(lang: keyof typeof ui) {
  return function t(key: keyof typeof ui[typeof defaultLang]) {
    return ui[lang][key] || ui[defaultLang][key];
  }
}

export function getLocalizedPath(path: string, lang: string) {
  if (lang === defaultLang) {
    return path;
  }
  return `/${lang}${path}`;
}

export function getAlternateUrl(currentUrl: URL, targetLang: string) {
  const currentLang = getLangFromUrl(currentUrl);
  let path = currentUrl.pathname;

  if (currentLang !== defaultLang) {
    path = path.replace(`/${currentLang}`, '');
  }

  return getLocalizedPath(path, targetLang);
}

export function parseTags(tags: string | string[] | undefined): string[] {
  if (!tags) return [];
  return typeof tags === 'string'
    ? tags.split(',').map(tag => tag.trim())
    : tags;
}

export function formatDate(date: Date, lang: string): string {
  const locale = lang === 'en' ? 'en-US' : 'pt-BR';
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export function getTagUrl(tag: string, lang: string): string {
  const tagSlug = tag.toLowerCase().replace(/\s+/g, '-');
  return lang === 'en' ? `/blog/tag/${tagSlug}/` : `/pt-br/blog/tag/${tagSlug}/`;
}

export function getPostUrl(slug: string, lang: string): string {
  const cleanSlug = lang === 'pt-br' ? slug.replace('pt-br/', '') : slug;
  return lang === 'en' ? `/blog/${cleanSlug}/` : `/pt-br/blog/${cleanSlug}/`;
}

export async function getTranslatedPost(currentSlug: string, _currentLang: string, targetLang: string) {
  const allPosts = await getCollection('blog');

  // Find current post
  const currentPost = allPosts.find(post => post.slug === currentSlug);

  if (!currentPost || !currentPost.data.translationKey) {
    // If no translationKey, return to home in target language
    return targetLang === defaultLang ? '/' : `/${targetLang}/`;
  }

  // Find post with same translationKey in target language
  const translatedPost = allPosts.find(
    post => post.data.translationKey === currentPost.data.translationKey &&
            post.data.lang === targetLang
  );

  if (translatedPost) {
    const slug = translatedPost.slug.replace('pt-br/', '');
    const blogPrefix = targetLang === 'en' ? '/blog/' : '/pt-br/blog/';
    return `${blogPrefix}${slug}/`;
  }

  // If translation not found, go to home
  return targetLang === defaultLang ? '/' : `/${targetLang}/`;
}
