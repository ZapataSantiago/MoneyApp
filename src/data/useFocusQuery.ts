import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { errorMessage } from '@/domain/errors';

/** Carga datos cada vez que la pantalla gana foco (p. ej. al volver de un formulario). */
export function useFocusQuery<T>(fn: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  useFocusEffect(
    useCallback(() => {
      let alive = true;
      fn()
        .then((d) => alive && (setData(d), setError(null)))
        .catch((e) => alive && setError(errorMessage(e)));
      return () => {
        alive = false;
      };
    }, [fn]),
  );
  return { data, error };
}
