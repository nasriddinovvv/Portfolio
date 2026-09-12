import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { api } from '../lib/api'
import type { Experience, Profile, Project, Skill } from '../lib/types'
import {
  fallbackExperiences,
  fallbackProfile,
  fallbackProjects,
  fallbackSkills,
} from '../data/portfolio'

type ContentContextValue = {
  profile: Profile
  projects: Project[]
  skills: Skill[]
  experiences: Experience[]
  loading: boolean
  /** True when the API could not be reached and fallback data is on screen. */
  offline: boolean
  reload: () => void
}

const ContentContext = createContext<ContentContextValue | undefined>(undefined)

export function ContentProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile>(fallbackProfile)
  const [projects, setProjects] = useState<Project[]>(fallbackProjects)
  const [skills, setSkills] = useState<Skill[]>(fallbackSkills)
  const [experiences, setExperiences] = useState<Experience[]>(fallbackExperiences)
  const [loading, setLoading] = useState(true)
  const [offline, setOffline] = useState(false)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    let cancelled = false

    async function load() {
      setLoading(true)
      try {
        const [bootstrap, profileData] = await Promise.all([
          api.bootstrap(controller.signal),
          api.profile(controller.signal),
        ])
        if (cancelled) return

        // An empty database should not blank the page — keep the samples.
        if (bootstrap.projects.length) setProjects(bootstrap.projects)
        if (bootstrap.skills.length) setSkills(bootstrap.skills)
        if (bootstrap.experiences.length) setExperiences(bootstrap.experiences)
        setProfile(profileData)
        setOffline(false)
      } catch (error) {
        if (cancelled || (error as Error).name === 'AbortError') return
        setOffline(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
      controller.abort()
    }
  }, [attempt])

  const reload = useCallback(() => setAttempt((n) => n + 1), [])

  const value = useMemo(
    () => ({ profile, projects, skills, experiences, loading, offline, reload }),
    [profile, projects, skills, experiences, loading, offline, reload],
  )

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>
}

export function useContent(): ContentContextValue {
  const context = useContext(ContentContext)
  if (!context) throw new Error('useContent must be used within a ContentProvider')
  return context
}
