import { lazy, Suspense } from 'react'
import { LazyMotion, domAnimation } from 'framer-motion'
import Nav from './components/Nav'
import Hero from './components/Hero'
import ScrollProgress from './components/ScrollProgress'
import CommandPalette from './components/CommandPalette'
import { ThemeProvider } from './lib/theme'

const Projects = lazy(() => import('./components/Projects'))
const Experience = lazy(() => import('./components/Experience'))
const Skills = lazy(() => import('./components/Skills'))
const Certifications = lazy(() => import('./components/Certifications'))
const Contact = lazy(() => import('./components/Contact'))
const Chatbot = lazy(() => import('./components/Chatbot'))

export default function App() {
  return (
    <ThemeProvider>
      <LazyMotion features={domAnimation} strict>
        <a
          href="#projects"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-sm focus:bg-fg focus:px-3 focus:py-2 focus:font-mono focus:text-sm focus:text-bg"
        >
          Skip to projects
        </a>
        <ScrollProgress />
        <Nav />
        <main id="top">
          <Hero />
          <Suspense fallback={<div className="min-h-[60vh]" aria-hidden="true" />}>
            <Projects />
            <Experience />
            <Skills />
            <Certifications />
            <Contact />
          </Suspense>
        </main>
        <CommandPalette />
        <Suspense fallback={null}>
          <Chatbot />
        </Suspense>
      </LazyMotion>
    </ThemeProvider>
  )
}
