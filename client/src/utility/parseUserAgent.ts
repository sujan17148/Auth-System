import { UAParser } from 'ua-parser-js';

export type ParsedUserAgent = {
  browser: string;
  os: string;
};

export const parseUserAgent = (userAgent: string | null): ParsedUserAgent => {
  if (!userAgent) {
    return {
      browser: 'Unknown',
      os: 'Unknown',
    };
  }

  const parser = new UAParser(userAgent);

  return {
    browser: parser.getBrowser().name ?? 'Unknown',
    os: parser.getOS().name ?? 'Unknown',
  };
};
