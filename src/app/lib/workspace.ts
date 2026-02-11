import { Workspace } from '../types/chat';

export const WORKSPACES_KEY = 'chatgpt_clone_workspaces_v1';
export const ACTIVE_WORKSPACE_KEY = 'chatgpt_clone_active_workspace_v1';

export const WORKSPACE_LOCATIONS: Workspace['location'][] = ['USA', 'Australia', 'Japan'];
export const SERVICE_LINES = ['Assurance', 'Consulting', 'Tax', 'Strategy and Transactions'];
export const SUB_SERVICE_LINES = ['Technology', 'Risk', 'People Advisory', 'Finance', 'Digital'];
export const SECTORS = ['Financial Services', 'Energy', 'Government', 'Healthcare', 'Technology', 'Consumer'];
export const AREAS = ['Americas', 'APAC', 'EMEIA', 'Global'];
export const COUNTRIES = ['United States', 'Canada', 'United Kingdom', 'Germany', 'India', 'Japan', 'Australia', 'UAE'];

export function serializeWorkspaces(workspaces: Workspace[]) {
  return workspaces.map((w) => ({
    ...w,
    createdAt: w.createdAt.toISOString(),
    updatedAt: w.updatedAt.toISOString(),
  }));
}

export function deserializeWorkspaces(raw: unknown): Workspace[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((w) => w && typeof w === 'object')
    .map((w: any) => ({
      id: String(w.id),
      organization: 'EY',
      name: String(w.name ?? 'Workspace'),
      location: WORKSPACE_LOCATIONS.includes(w.location) ? w.location : 'USA',
      description: String(w.description ?? ''),
      role: w.role === 'Contributor' || w.role === 'Viewer' ? w.role : 'Owner',
      serviceLines: Array.isArray(w.serviceLines) ? w.serviceLines.map(String) : [],
      subServiceLines: Array.isArray(w.subServiceLines) ? w.subServiceLines.map(String) : [],
      sectors: Array.isArray(w.sectors) ? w.sectors.map(String) : [],
      areas: Array.isArray(w.areas) ? w.areas.map(String) : [],
      countries: Array.isArray(w.countries) ? w.countries.map(String) : [],
      createdAt: new Date(w.createdAt ?? Date.now()),
      updatedAt: new Date(w.updatedAt ?? Date.now()),
    }));
}
