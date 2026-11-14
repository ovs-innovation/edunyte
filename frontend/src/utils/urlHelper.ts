export const getAdminUrl = (): string => {
  if (import.meta.env.VITE_ADMIN_URL) {
    return import.meta.env.VITE_ADMIN_URL;
  }
  if (typeof window !== 'undefined') {
    const { hostname, protocol } = window.location;
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      if (hostname.includes('edunyte.com')) {
        return `${protocol}//admin.edunyte.com`;
      }
      return `${protocol}//admin.${hostname}`;
    }
  }
  return 'http://localhost:8080';
};

