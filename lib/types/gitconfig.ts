export interface IGitConfig {
  global: {
    email?: string;
    name?: string;
  };
  local: {
    email?: string;
    name?: string;
    key?: string;
  };
}
