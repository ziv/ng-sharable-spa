import {effect, Injectable, signal} from '@angular/core';

export type Settings = {
  useCache: boolean;
  cacheTTL: number; // in milliseconds
  simulateNetworkLatency: boolean;
  networkLatency: number; // in milliseconds
}

const SETTINGS_KEY = 'app-settings';

const DEFAULT_SETTINGS: Settings = {
  useCache: true,
  cacheTTL: 300000, // 5 minutes
  simulateNetworkLatency: true,
  networkLatency: 1000, // 1 second
}

function isSettings(obj: unknown): obj is Settings {
  return typeof obj === 'object'
    && obj !== null
    && 'useCache' in obj
    && 'cacheTTL' in obj
    && 'simulateNetworkLatency' in obj
    && 'networkLatency' in obj;
}

function getSavedSettingsOrDefault(): Settings {
  const saved = localStorage.getItem(SETTINGS_KEY);
  // quick return if no saved settings
  if (!saved) {
    return DEFAULT_SETTINGS;
  }
  // we use try-catch to handle possible JSON.parse errors
  try {
    const settings = JSON.parse(saved) as Settings;
    return isSettings(settings) ? settings : DEFAULT_SETTINGS;
  } catch {
    // remove faulted saved settings
    localStorage.removeItem(SETTINGS_KEY);
    return DEFAULT_SETTINGS;
  }
}

@Injectable({providedIn: 'root'})
export class AppSettings {
  readonly settings = signal<Settings>(getSavedSettingsOrDefault());

  constructor() {
    effect(() => {
      // save settings to localStorage on change
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings()));
    });
  }
}
