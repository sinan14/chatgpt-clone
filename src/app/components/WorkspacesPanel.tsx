'use client';

import { useState } from 'react';
import { Workspace } from '../types/chat';
import {
  AREAS,
  COUNTRIES,
  SECTORS,
  SERVICE_LINES,
  SUB_SERVICE_LINES,
  WORKSPACE_LOCATIONS,
} from '../lib/workspace';
import { useAppState } from '../providers/AppStateProvider';
import MultiSelect from './MultiSelect';

const emptyForm = {
  name: '',
  location: 'USA' as Workspace['location'],
  description: '',
  serviceLines: [] as string[],
  subServiceLines: [] as string[],
  sectors: [] as string[],
  areas: [] as string[],
  countries: [] as string[],
};

const ROLE_OPTIONS: Workspace['role'][] = ['Owner', 'Contributor', 'Viewer'];

function generateId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 9);
}

export default function WorkspacesPanel() {
  const {
    workspaces,
    conversations,
    setWorkspaces,
    activeWorkspaceId,
    setActiveWorkspaceId,
    setCurrentView,
    userName,
    userEmail,
  } = useAppState();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [workspaceError, setWorkspaceError] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilters, setRoleFilters] = useState<Workspace['role'][]>([]);
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const [openSelectId, setOpenSelectId] = useState<string | null>(null);

  const handleCreateWorkspace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setWorkspaceError('Please enter a workspace name.');
      return;
    }
    if (!form.description.trim()) {
      setWorkspaceError('Please enter a description.');
      return;
    }
    if (!form.location) {
      setWorkspaceError('Please select a workspace location.');
      return;
    }
    if (
      form.serviceLines.length === 0 ||
      form.subServiceLines.length === 0 ||
      form.sectors.length === 0 ||
      form.areas.length === 0 ||
      form.countries.length === 0
    ) {
      setWorkspaceError('Please choose at least one option for each multi-select field.');
      return;
    }

    const now = new Date();
    const newWorkspace: Workspace = {
      id: generateId(),
      organization: 'EY',
      name: form.name.trim(),
      location: form.location,
      description: form.description.trim(),
      role: 'Owner',
      serviceLines: form.serviceLines,
      subServiceLines: form.subServiceLines,
      sectors: form.sectors,
      areas: form.areas,
      countries: form.countries,
      createdAt: now,
      updatedAt: now,
    };

    setWorkspaces((prev) => [newWorkspace, ...prev]);
    setIsModalOpen(false);
    setOpenSelectId(null);
    setWorkspaceError('');
    setForm(emptyForm);
  };

  const updateMultiSelect =
    (field:
      | 'serviceLines'
      | 'subServiceLines'
      | 'sectors'
      | 'areas'
      | 'countries') =>
    (value: string[]) => {
      setForm((prev) => ({ ...prev, [field]: value }));
    };

  const handleViewWorkspace = (id: string) => {
    setActiveWorkspaceId(id);
    setCurrentView('chat');
  };

  const filteredWorkspaces = workspaces.filter((ws) => {
    const matchesSearch = ws.name.toLowerCase().includes(searchTerm.trim().toLowerCase());
    const matchesRole = roleFilters.length === 0 ? true : roleFilters.includes(ws.role);
    return matchesSearch && matchesRole;
  });

  return (
    <div className="min-h-screen bg-[#1f1f1f] text-white">
      <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm mb-4">
                <button
                  type="button"
                  onClick={() => setCurrentView('chat')}
                  className="px-3 py-1 rounded-full bg-[#1b1b1b] border border-[#2a2a2a] text-gray-200 hover:bg-[#222222]"
                >
                  Home
                </button>
                <span className="text-gray-500">/</span>
                <span className="text-gray-300">Workspaces</span>
              </div>
              <h1 className="text-3xl font-semibold text-white">Workspaces</h1>
              <p className="text-sm text-gray-400 mt-2 max-w-2xl">
                Organize, collaborate, and engage with teams and agents in one unified workspace.
              </p>
            <div className="mt-10 flex flex-col md:flex-row gap-3 items-start md:items-center">
              <div className="relative inline-block">
                <button
                  type="button"
                  onClick={() => setIsRoleMenuOpen((open) => !open)}
                  className="h-8 px-3 rounded-lg bg-[#141414] border border-[#2a2a2a] text-sm text-white hover:bg-[#1b1b1b] flex items-center gap-2"
                >
                  <span>
                    {roleFilters.length === 0 ? 'Filter by role' : roleFilters.join(', ')}
                  </span>
                  <svg
                    className={`w-4 h-4 transition-transform ${
                      isRoleMenuOpen ? 'rotate-180' : ''
                    }`}
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M6 9l6 6 6-6"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                {isRoleMenuOpen && (
                  <div className="absolute left-0 mt-2 w-48 bg-[#1b1b1b] border border-[#2a2a2a] rounded-xl shadow-xl overflow-hidden z-20">
                    {ROLE_OPTIONS.map((role) => {
                      const isChecked = roleFilters.includes(role);
                      return (
                        <button
                          key={role}
                          type="button"
                          onClick={() => {
                            setRoleFilters((prev) =>
                              isChecked ? prev.filter((r) => r !== role) : [...prev, role]
                            );
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-gray-200 hover:bg-[#222222] flex items-center gap-2"
                        >
                          <span
                            className={`w-4 h-4 rounded border border-[#3a3a3a] flex items-center justify-center ${
                              isChecked ? 'bg-white text-black' : 'bg-transparent'
                            }`}
                          >
                            {isChecked ? '✓' : ''}
                          </span>
                          <span>{role}</span>
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() => setRoleFilters([])}
                      className="w-full text-left px-3 py-2 text-xs text-gray-400 hover:bg-[#222222]"
                    >
                      Clear filters
                    </button>
                  </div>
                )}
              </div>
              <div className="relative w-full md:w-64">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search workspaces"
                  className="h-8 w-full pl-9 pr-3 rounded-lg bg-[#141414] border border-[#2a2a2a] text-sm text-white focus:outline-none focus:ring-2 focus:ring-white"
                />
              </div>
            </div>
          </div>
          <div className="flex flex-col items-stretch md:items-end gap-3 w-full md:w-auto">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(true);
                setWorkspaceError('');
              }}
              className="px-4 py-2 rounded-lg bg-white text-black hover:bg-gray-200 text-sm font-medium"
            >
              + Add Workspace
            </button>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredWorkspaces.length === 0 ? (
            <div className="text-gray-400 text-sm">
              No workspaces found. Adjust your search or add a workspace.
            </div>
          ) : (
            filteredWorkspaces.map((ws) => (
              <div
                key={ws.id}
                onClick={() => handleViewWorkspace(ws.id)}
                className="bg-[#151515] border border-[#2a2a2a] rounded-2xl flex flex-col cursor-pointer hover:border-[#3a3a3a] transition-colors"
              >
                <div className="px-5 pt-5 pb-4 border-b-2 border-[#2f2f2f]">
                  <h2 className="text-lg font-semibold text-white">{ws.name}</h2>
                </div>
                <div className="px-5 py-4 border-b-2 border-[#2f2f2f] flex flex-col gap-2">
                  <p className="text-sm text-gray-300">{ws.description}</p>
                  <div className="text-xs text-gray-500">
                    Service lines: {ws.serviceLines.join(', ') || '--'}
                  </div>
                  <div className="text-xs text-emerald-300 mt-2">{ws.role}</div>
                </div>
                <div className="px-5 py-4 flex items-end justify-between">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewWorkspace(ws.id);
                    }}
                    className="px-3 py-2 rounded-lg bg-[#2a2a2a] hover:bg-[#333333] text-sm text-white"
                  >
                    View
                  </button>
                  <div className="text-right text-xs text-gray-400">
                    {conversations.filter((c) => c.workspaceId === ws.id).length} chats
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 flex items-center justify-center">
          <div className="w-full max-w-3xl mx-6 bg-[#1b1b1b] border border-[#2a2a2a] rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Create EY Workspace</h2>
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setOpenSelectId(null);
                }}
                className="text-gray-400 hover:text-white"
                aria-label="Close"
              >
                x
              </button>
            </div>
            <form onSubmit={handleCreateWorkspace} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">
                    Workspace name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="EY - Risk Advisory"
                    className="w-full px-4 py-3 bg-[#141414] border border-[#2a2a2a] rounded-lg focus:outline-none focus:ring-2 focus:ring-white text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">
                    Workspace location <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.location}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        location: e.target.value as Workspace['location'],
                      }))
                    }
                    className="w-full px-4 py-3 bg-[#141414] border border-[#2a2a2a] rounded-lg focus:outline-none focus:ring-2 focus:ring-white text-white"
                  >
                    {WORKSPACE_LOCATIONS.map((location) => (
                      <option key={location} value={location}>
                        {location}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Describe the EY engagement or purpose"
                  className="w-full px-4 py-3 bg-[#141414] border border-[#2a2a2a] rounded-lg focus:outline-none focus:ring-2 focus:ring-white text-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <MultiSelect
                  id="service-lines"
                  label="Service line"
                  required
                  placeholder="Select service line"
                  options={SERVICE_LINES}
                  value={form.serviceLines}
                  openId={openSelectId}
                  setOpenId={setOpenSelectId}
                  onChange={updateMultiSelect('serviceLines')}
                />
                <MultiSelect
                  id="sub-service-lines"
                  label="Sub service line"
                  required
                  placeholder="Select sub service line"
                  options={SUB_SERVICE_LINES}
                  value={form.subServiceLines}
                  openId={openSelectId}
                  setOpenId={setOpenSelectId}
                  onChange={updateMultiSelect('subServiceLines')}
                />
                <MultiSelect
                  id="sectors"
                  label="Sector"
                  required
                  placeholder="Select sector"
                  options={SECTORS}
                  value={form.sectors}
                  openId={openSelectId}
                  setOpenId={setOpenSelectId}
                  onChange={updateMultiSelect('sectors')}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <MultiSelect
                  id="areas"
                  label="Area"
                  required
                  placeholder="Select area"
                  options={AREAS}
                  value={form.areas}
                  openId={openSelectId}
                  setOpenId={setOpenSelectId}
                  onChange={updateMultiSelect('areas')}
                />
                <MultiSelect
                  id="countries"
                  label="Country"
                  required
                  placeholder="Select country"
                  options={COUNTRIES}
                  value={form.countries}
                  openId={openSelectId}
                  setOpenId={setOpenSelectId}
                  onChange={updateMultiSelect('countries')}
                />
              </div>

              {workspaceError && <div className="text-sm text-red-400">{workspaceError}</div>}
              <button
                type="submit"
                className="w-full bg-white hover:bg-gray-200 text-black px-4 py-3 rounded-lg font-medium transition-colors"
              >
                Create workspace
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
