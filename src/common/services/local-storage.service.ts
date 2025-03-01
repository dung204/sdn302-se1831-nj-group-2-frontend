class LocalStorageService {
  public set<T>(key: string, value: T) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  public get<TDefault, TResult = string>(
    key: string,
    defaultValue: TDefault,
  ): TResult | TDefault {
    const item = localStorage.getItem(key) || JSON.stringify(defaultValue);
    return JSON.parse(item);
  }

  public remove(key: string) {
    localStorage.removeItem(key);
  }

  public clear() {
    localStorage.clear();
  }
}

export const localStorageService = new LocalStorageService();
