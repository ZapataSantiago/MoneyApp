import { Href, router } from 'expo-router';

/** Vuelve atrás; si no hay historial (p. ej. al recargar la página en web), va a `fallback`. */
export function goBack(fallback: Href = '/') {
  if (router.canGoBack()) router.back();
  else router.replace(fallback);
}
