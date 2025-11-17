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
