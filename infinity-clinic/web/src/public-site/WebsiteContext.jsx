import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../shared/api/client.js';
import { buildWebsiteState } from './websiteUtils.js';

const WebsiteContext = createContext(null);

export function WebsiteProvider({ children }) {
  const [apiData, setApiData] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/public/website/content').catch(() => ({})),
      api.get('/public/website/doctors').catch(() => []),
      api.get('/public/website/services').catch(() => []),
      api.get('/public/website/testimonials').catch(() => []),
    ]).then(([content, doctors, services, testimonials]) => {
      setApiData({ content, doctors, services, testimonials });
    }).finally(() => setLoaded(true));
  }, []);

  const value = useMemo(() => ({
    ...buildWebsiteState(apiData || {}),
    loaded,
  }), [apiData, loaded]);

  return <WebsiteContext.Provider value={value}>{children}</WebsiteContext.Provider>;
}

export function useWebsite() {
  const ctx = useContext(WebsiteContext);
  if (!ctx) throw new Error('useWebsite must be used within WebsiteProvider');
  return ctx;
}
