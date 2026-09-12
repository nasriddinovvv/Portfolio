import { useEffect } from 'react'
import { useContent } from '../contexts/ContentContext'
import { useLanguage } from '../contexts/LanguageContext'
import { api } from '../lib/api'
import Background from '../components/Background'
import ScrollProgress from '../components/ScrollProgress'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Chatbot from '../components/Chatbot'
import Hero from '../components/sections/Hero'
import About from '../components/sections/About'
import Skills from '../components/sections/Skills'
import Projects from '../components/sections/Projects'
import Experience from '../components/sections/Experience'
import Contact from '../components/sections/Contact'
import { IconAlert } from '../components/Icons'

export default function Home() {
  const { t, language } = useLanguage()
  const { offline, loading } = useContent()

  // One page view per visit, recorded once the language is known.
  useEffect(() => {
    api.track('page_view', { path: '/', lang: language })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <a className="skip-link" href="#main">
        {t('nav.skip')}
      </a>

      <Background />
      <ScrollProgress />
      <Header />

      <main id="main">
        <Hero />

        {offline && !loading && (
          <div className="container" style={{ marginBottom: '2rem' }}>
            <div className="notice">
              <IconAlert className="notice__icon" size={19} />
              <div>
                <p className="notice__title">{t('common.offline.title')}</p>
                <p className="notice__body">{t('common.offline.body')}</p>
              </div>
            </div>
          </div>
        )}

        <About />
        <Skills />
        <Projects />
        <Experience />
        <Contact />
      </main>

      <Footer />
      <Chatbot />
    </>
  )
}
