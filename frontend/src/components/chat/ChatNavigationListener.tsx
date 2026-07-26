import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

type ChatNavigateDetail = {
  path: string;
};

/**
 * Listens for chat:navigate events dispatched by ChatProvider when the
 * command engine returns a NAVIGATE action (e.g. "start pomodoro").
 */
export function ChatNavigationListener() {
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (event: Event) => {
      const { path } = (event as CustomEvent<ChatNavigateDetail>).detail ?? {};
      if (path) {
        navigate(path);
      }
    };

    window.addEventListener('chat:navigate', handler);
    return () => window.removeEventListener('chat:navigate', handler);
  }, [navigate]);

  return null;
}
