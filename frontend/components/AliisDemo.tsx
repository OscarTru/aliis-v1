'use client'

/* eslint-disable @next/next/no-img-element */

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  forwardRef,
  type ReactNode,
} from 'react'
import './AliisDemo.css'

// ─── Reusable bits ────────────────────────────────────────────

type IconName = 'plus' | 'file' | 'book' | 'pill' | 'stetho'

const SidebarIcon = ({ name, active }: { name: IconName; active: boolean }) => {
  const stroke = active ? '#1F8A9B' : '#71717a'
  const common = {
    width: 16,
    height: 16,
    viewBox: '0 0 24 24',
    fill: 'none' as const,
    stroke,
    strokeWidth: 1.6,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }
  if (name === 'plus')
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v8M8 12h8" />
      </svg>
    )
  if (name === 'file')
    return (
      <svg {...common}>
        <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
        <path d="M14 3v6h6" />
      </svg>
    )
  if (name === 'book')
    return (
      <svg {...common}>
        <path d="M4 4h12a2 2 0 0 1 2 2v14H6a2 2 0 0 1-2-2z" />
        <path d="M4 18a2 2 0 0 1 2-2h12" />
      </svg>
    )
  if (name === 'pill')
    return (
      <svg {...common}>
        <rect x="3" y="9" width="18" height="6" rx="3" transform="rotate(-45 12 12)" />
        <path d="M8.5 8.5l7 7" />
      </svg>
    )
  if (name === 'stetho')
    return (
      <svg {...common}>
        <path d="M6 3v6a4 4 0 0 0 8 0V3" />
        <circle cx="18" cy="14" r="2.5" />
        <path d="M10 13v3a4 4 0 0 0 5.5 3.7" />
      </svg>
    )
  return null
}

const Sidebar = ({ active }: { active: string }) => {
  const items: { id: string; label: string; icon: IconName }[] = [
    { id: 'nuevo', label: 'Nuevo diagnóstico', icon: 'plus' },
    { id: 'expediente', label: 'Mi expediente', icon: 'file' },
    { id: 'diario', label: 'Mi diario', icon: 'book' },
    { id: 'tratamientos', label: 'Mis tratamientos', icon: 'pill' },
    { id: 'diagnosticos', label: 'Diagnósticos', icon: 'stetho' },
  ]
  return (
    <aside className="aliis-sidebar" data-collapsed="false">
      <div className="aliis-sidebar-logo">
        <img src="/assets/aliis-logo-full.png" alt="aliis" />
      </div>
      <nav className="aliis-sidebar-nav">
        {items.map((it) => (
          <div key={it.id} className={'aliis-nav-item' + (active === it.id ? ' is-active' : '')}>
            <SidebarIcon name={it.icon} active={active === it.id} />
            <span>{it.label}</span>
          </div>
        ))}
      </nav>
      <div className="aliis-sidebar-user">
        <div className="aliis-avatar">N</div>
        <div className="aliis-user-meta">
          <div>Oscar</div>
          <div className="aliis-user-email">oscar.trujillo93@gmail.c…</div>
        </div>
      </div>
    </aside>
  )
}

const NotifBell = () => (
  <div className="aliis-notif">
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#71717a"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
    <span className="aliis-notif-dot">1</span>
  </div>
)

// ─── Scene 1: Nuevo diagnóstico ───────────────────────────────
const SceneNuevo = ({
  typed,
  isFocus,
  ctaActive,
}: {
  typed: string
  isFocus: boolean
  ctaActive: boolean
}) => (
  <div className="aliis-scene aliis-scene-nuevo">
    <NotifBell />
    <div className="aliis-nuevo-body">
      <div className="aliis-eyebrow">PASO 1 DE 4</div>
      <h1 className="aliis-serif-title">¿Qué te dijo tu médico?</h1>
      <p className="aliis-subcopy">
        Escribe el diagnóstico, copia lo que dice tu receta, o cuéntalo con tus palabras.
      </p>
      <div className={'aliis-input ' + (isFocus ? 'is-focus' : '')}>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#a1a1aa"
          strokeWidth="1.8"
          strokeLinecap="round"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" />
        </svg>
        <span className="aliis-input-text">
          {typed || (
            <span className="aliis-input-placeholder">
              Escribe tu diagnóstico o busca en la biblioteca…
            </span>
          )}
          {isFocus && <span className="aliis-caret" />}
        </span>
      </div>
      <button className={'aliis-btn-cta ' + (ctaActive ? 'is-active' : '')}>Continuar →</button>
    </div>
  </div>
)

// ─── Scene 2: Expediente ──────────────────────────────────────
const ExpedienteCard = ({
  title,
  body,
  chap,
  date,
  hilite,
}: {
  title: string
  body: string
  chap: string
  date: string
  hilite?: boolean
}) => (
  <div className={'aliis-exp-card' + (hilite ? ' is-hilite' : '')}>
    <div className="aliis-exp-card-bar" />
    <div className="aliis-exp-card-head">
      <h3>{title}</h3>
      <div className="aliis-exp-card-actions">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="1.6">
          <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m1 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
        </svg>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="1.6">
          <path d="M9 6l6 6-6 6" />
        </svg>
      </div>
    </div>
    <p className="aliis-exp-card-body">{body}</p>
    <div className="aliis-exp-card-meta">
      <span className="aliis-chap">{chap}</span>
      <span className="aliis-date">{date}</span>
    </div>
    <div className="aliis-exp-card-foot">
      <span>Continúa donde lo dejaste</span>
      <span className="aliis-continuar">Continuar →</span>
    </div>
  </div>
)

const SceneExpediente = ({ hiliteFirst }: { hiliteFirst: boolean }) => (
  <div className="aliis-scene aliis-scene-exp">
    <NotifBell />
    <div className="aliis-exp-grid">
      <div className="aliis-exp-main">
        <div className="aliis-eyebrow">7 DIAGNÓSTICOS</div>
        <h1 className="aliis-serif-title">
          Mi <em>expediente</em>
        </h1>
        <div className="aliis-exp-tabs">
          <span className="is-active">Todos</span>
          <span>Sin leer</span>
          <span>A medias</span>
          <span>Completados</span>
        </div>
        <div className="aliis-exp-list">
          <ExpedienteCard
            hilite={hiliteFirst}
            title="Dislipidemia (Colesterol y Triglicéridos Alterados)"
            body="Tu análisis de sangre mostró que las grasas en tu sangre (colesterol y triglicéridos) están fuera de rango. No sientes nada ahora, pero si no se controlan, aumentan el riesgo de infarto o…"
            chap="1 DE 6 CAPÍTULOS"
            date="3 de mayo"
          />
          <ExpedienteCard
            title="Diabetes"
            body="Tu cuerpo tiene dificultades para usar el azúcar que comes como energía, y eso con el tiempo puede afectar varios órganos. La buena noticia es que con los cambios correctos, la diabetes…"
            chap="2 DE 6 CAPÍTULOS"
            date="2 de mayo"
          />
          <ExpedienteCard
            title="Hipertensión Arterial"
            body="El corazón está empujando la sangre con más fuerza de la necesaria, y eso va desgastando tus arterias sin que lo sientas. Con el control adecuado, vas a seguir haciendo tu vida normal."
            chap="4 DE 6 CAPÍTULOS"
            date="30 de abril"
          />
        </div>
      </div>
      <div className="aliis-exp-side">
        <div className="aliis-exp-side-head">
          <span className="aliis-eyebrow">HISTORIAL MÉDICO</span>
          <span className="aliis-modify">✎ Modificar</span>
        </div>
        <div className="aliis-side-card">
          <div className="aliis-side-row">
            <span className="aliis-side-label">Diagnósticos</span>
            <span className="aliis-side-add">+ Agregar</span>
          </div>
          <div className="aliis-side-pill aliis-side-pill-full">
            Dislipidemia (Colesterol y Triglicéridos Alterados)
          </div>
          <div className="aliis-side-pills">
            <span className="aliis-side-pill">Diabetes</span>
            <span className="aliis-side-pill">Hipertensión Arterial</span>
            <span className="aliis-side-pill">Apnea del Sueño</span>
            <span className="aliis-side-pill">Migraña</span>
            <span className="aliis-side-pill">ACV / Ictus</span>
            <span className="aliis-side-pill">Síncope</span>
          </div>
          <div className="aliis-side-row" style={{ marginTop: 14 }}>
            <span className="aliis-side-label">Medicamentos</span>
            <span className="aliis-side-add">Gestionar →</span>
          </div>
          <div className="aliis-side-meds">
            <div>Ramipril 5 mg</div>
            <div>Ácido acetilsalicílico 100 mg</div>
            <div>Atorvastatina 40 mg</div>
            <div>Paracetamol 500 mg</div>
            <div>Ibuprofeno 400 mg</div>
          </div>
        </div>
      </div>
    </div>
  </div>
)

// ─── Scene 3: Explicación del diagnóstico ─────────────────────
const SceneExplicacion = ({ readProgress }: { readProgress: number }) => (
  <div className="aliis-scene aliis-scene-exp-detail">
    <div className="aliis-exp-detail-top">
      <span className="aliis-prepare">📋 Preparar consulta</span>
      <NotifBell />
    </div>
    <div className="aliis-exp-detail-grid">
      <aside className="aliis-chap-side">
        <div className="aliis-eyebrow">ESTA EXPLICACIÓN</div>
        <div className="aliis-chap-cond">Dislipidemia (Colesterol y Triglicéridos Altera…</div>
        <div className="aliis-chap-list">
          <div className="aliis-chap-item is-active">
            <span className="aliis-chap-dot is-active" />
            ¿Qué es?
          </div>
          <div className="aliis-chap-item">
            <span className="aliis-chap-dot" />
            ¿Cómo funciona?
          </div>
          <div className="aliis-chap-item">
            <span className="aliis-chap-dot" />
            ¿Qué esperar?
          </div>
          <div className="aliis-chap-item">
            <span className="aliis-chap-dot" />
            ¿Qué preguntar?
          </div>
          <div className="aliis-chap-item">
            <span className="aliis-chap-dot" />
            ¿Cuándo actuar?
          </div>
          <div className="aliis-chap-item">
            <span className="aliis-chap-dot" />
            Mito frecuente
          </div>
        </div>
        <div className="aliis-chap-tools">
          <div className="aliis-chap-tools-h">Herramientas</div>
          <div className="aliis-chap-tool">⤴︎ Compartir</div>
        </div>
      </aside>
      <main className="aliis-chap-main">
        <div className="aliis-eyebrow">01 · 3 MIN</div>
        <h1 className="aliis-serif-title aliis-q">
          ¿Qué es <em>exactamente?</em>
        </h1>
        <p className="aliis-italic-sub">
          Tienes demasiada grasa circulando en tu sangre, y eso no duele, pero va dañando tus arterias en silencio.{' '}
          <span className="aliis-leer-link">📖 Leer a profundidad →</span>
        </p>
        <div className="aliis-chap-body">
          <p>
            Oscar, entiendo que recibir otro diagnóstico encima de la diabetes y la hipertensión puede sentirse como demasiado. Pero quiero que sepas algo desde el principio: esto no es una emergencia de hoy. Es información que te da ventaja para actuar antes de que algo malo pase.
          </p>
          <p>
            La dislipidemia significa que alguna de las grasas en tu sangre está alterada. Esas grasas son principalmente el colesterol y los triglicéridos. El colesterol LDL (el que se llama &apos;malo&apos;) se deposita en las paredes de tus arterias formando placas, como sarro en una tubería.
          </p>
          <p>
            Lo que hace difícil notar esto es que no produce ningún síntoma. No duele, no marea, no avisa. La mayoría de las personas se enteran, como tú, por un análisis de rutina.
          </p>
          <div className="aliis-callout">
            <div className="aliis-eyebrow">PARA IMAGINARLO ASÍ</div>
            <p>
              Piensa en tus arterias como tuberías de agua. El LDL alto es como cal que se va pegando por dentro, poco a poco, estrechando el paso. Al principio el agua fluye normal. Pero con los años, ese sarro se acumula hasta que la tubería se tapa o se rompe.
            </p>
          </div>
        </div>
      </main>
    </div>
    <div className="aliis-chap-foot">
      <span className="aliis-chap-foot-disclaimer">
        Esta información es educativa y no reemplaza la consulta con tu médico.
      </span>
      <div className="aliis-chap-progress">
        <div style={{ width: readProgress * 100 + '%' }} />
      </div>
      <div className="aliis-chap-foot-nav">
        <button className="aliis-btn-ghost">← Anterior</button>
        <span>1 / 6</span>
        <button className="aliis-btn-dark">Siguiente →</button>
      </div>
    </div>
  </div>
)

// ─── Scene 4: Chat con Aliis (overlay) ────────────────────────
const SceneChat = ({
  userQuestion,
  aiText,
  isTyping,
}: {
  userQuestion: string
  aiText: string
  isTyping: boolean
}) => {
  const [slidIn, setSlidIn] = useState(false)
  useEffect(() => {
    const id = setTimeout(() => setSlidIn(true), 50)
    return () => clearTimeout(id)
  }, [])
  return (
    <div className="aliis-scene aliis-scene-chat">
      {/* Behind: the explicacion screen */}
      <SceneExplicacion readProgress={0.5} />
      {/* Chat panel */}
      <div
        className="aliis-chat-panel"
        style={{ transform: slidIn ? 'translateX(0)' : 'translateX(100%)' }}
      >
        <div className="aliis-chat-head">
          <div>
            <div className="aliis-eyebrow">· ALIIS ·</div>
            <div className="aliis-chat-cond">Dislipidemia (Colesterol y Triglicéridos Alterados)</div>
          </div>
          <span className="aliis-chat-x">×</span>
        </div>
        <div className="aliis-chat-tabs">
          <span className="is-active">Chat</span>
          <span>Mis apuntes</span>
        </div>
        <div className="aliis-chat-body">
          {userQuestion && (
            <div className="aliis-chat-user-row">
              <div className="aliis-chat-user-bubble">{userQuestion}</div>
            </div>
          )}
          {(aiText || isTyping) && (
            <div className="aliis-chat-ai-row">
              <div className="aliis-chat-ai-avatar">
                <img src="/assets/aliis-logo.png" alt="" />
              </div>
              <div className="aliis-chat-ai-bubble">
                {aiText}
                {isTyping && <span className="aliis-caret aliis-caret-dark" />}
              </div>
            </div>
          )}
        </div>
        <div className="aliis-chat-input">
          <span>Pregunta sobre Dislipidemia (Colesterol y…</span>
          <span className="aliis-chat-send">↑</span>
        </div>
      </div>
    </div>
  )
}

// ─── Scene 5: Diario ──────────────────────────────────────────
const SceneDiario = ({ chartProgress }: { chartProgress: number }) => {
  const w = 380
  const h = 150
  const series: { c: string; pts: [number, number][] }[] = [
    { c: '#ef4444', pts: [[0, 90], [1, 140], [2, 110], [3, 150], [4, 118]] },
    { c: '#a855f7', pts: [[0, 80], [1, 90], [2, 70], [3, 100], [4, 72]] },
    { c: '#22c55e', pts: [[0, 95], [1, 100], [2, 82], [3, 108], [4, 95]] },
    { c: '#f59e0b', pts: [[0, 86], [1, 78], [2, 90], [3, 72], [4, 88]] },
    { c: '#3b82f6', pts: [[0, 40], [1, 45], [2, 40], [3, 55], [4, 68]] },
  ]
  const xs = (i: number) => 20 + (i / 4) * (w - 40)
  const ys = (v: number) => h - 20 - ((v - 30) / 130) * (h - 40)
  return (
    <div className="aliis-scene aliis-scene-diario">
      <NotifBell />
      <div className="aliis-diario-grid">
        <div className="aliis-diario-main">
          <div className="aliis-eyebrow">MI DIARIO</div>
          <h1 className="aliis-serif-title">
            Tu <em>diario</em> de salud
          </h1>
          <div className="aliis-diario-aliis-card">
            <div className="aliis-diario-aliis-head">
              <img src="/assets/aliis-logo.png" alt="" />
              <span>Aliis</span>
            </div>
            <p>
              Hola Oscar, he notado que tu presión arterial ha estado en 135/85 mmHg esta semana, y me llama la atención que la sistólica ronde los 135 — un poco arriba de lo ideal para alguien con diabetes. Tu glucosa se ve bien controlada, lo cual es excelente, pero sería buena idea mencionar estos números de presión en tu próxima cita para ver si necesita ajustes.
            </p>
          </div>
          <div className="aliis-diario-chart-card">
            <div className="aliis-diario-chart-head">
              <span className="aliis-eyebrow">SÍNTOMAS Y SIGNOS VITALES</span>
              <button className="aliis-btn-dark aliis-btn-small">+ Registrar</button>
            </div>
            <div className="aliis-diario-chips">
              <span className="aliis-chip-dark is-active">Glucosa</span>
              <span className="aliis-chip-dark">Sistólica</span>
              <span className="aliis-chip-dark">Diastólica</span>
              <span className="aliis-chip-dark">FC</span>
              <span className="aliis-chip-dark">Peso</span>
              <span className="aliis-chip-dark">Temp</span>
            </div>
            <div className="aliis-diario-chart-row">
              <div className="aliis-diario-chart-entries">
                <div className="aliis-entry">
                  <div className="aliis-entry-when">29 ABR · 16:59</div>
                  <div className="aliis-entry-vals">
                    Glucosa <strong>89 mg/dL</strong>
                  </div>
                  <div className="aliis-entry-vals">
                    TA <strong>135/87</strong> · FC <strong>99 lpm</strong>
                  </div>
                  <div className="aliis-entry-sym">
                    Síntoma: <em>dolor de cabeza</em>
                  </div>
                </div>
                <div className="aliis-entry">
                  <div className="aliis-entry-when">28 ABR · 23:59</div>
                  <div className="aliis-entry-vals">
                    Glucosa <strong>77 mg/dL</strong>
                  </div>
                  <div className="aliis-entry-vals">
                    TA <strong>122/79</strong> · FC <strong>70 lpm</strong>
                  </div>
                  <div className="aliis-entry-sym">Tranquilo</div>
                </div>
              </div>
              <svg width={w} height={h} className="aliis-chart-svg">
                {[40, 80, 120, 160].map((v) => (
                  <line
                    key={v}
                    x1="20"
                    x2={w - 20}
                    y1={ys(v)}
                    y2={ys(v)}
                    stroke="rgba(0,0,0,0.05)"
                    strokeDasharray="2 3"
                  />
                ))}
                {[40, 80, 120, 160].map((v) => (
                  <text key={v} x="6" y={ys(v) + 3} fontSize="8" fill="#a1a1aa">
                    {v}
                  </text>
                ))}
                {series.map((s, si) => {
                  const visible = Math.min(s.pts.length, Math.ceil(chartProgress * s.pts.length))
                  if (visible < 1) return null
                  const pts = s.pts.slice(0, visible)
                  const d = pts
                    .map((p, i) => (i === 0 ? 'M' : 'L') + xs(p[0]) + ' ' + ys(p[1]))
                    .join(' ')
                  return (
                    <g key={si}>
                      <path
                        d={d}
                        stroke={s.c}
                        strokeWidth="1.5"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      {pts.map((p, i) => (
                        <circle key={i} cx={xs(p[0])} cy={ys(p[1])} r="2.5" fill={s.c} />
                      ))}
                    </g>
                  )
                })}
                <text x="20" y={h - 5} fontSize="8" fill="#a1a1aa">
                  26/04 20:37
                </text>
                <text x={w / 2 - 30} y={h - 5} fontSize="8" fill="#a1a1aa">
                  27/04 22:13
                </text>
                <text x={w - 80} y={h - 5} fontSize="8" fill="#a1a1aa">
                  29/04 16:15
                </text>
              </svg>
            </div>
          </div>
        </div>
        <div className="aliis-diario-side">
          <div className="aliis-side-card">
            <div className="aliis-eyebrow" style={{ color: '#a1a1aa' }}>
              HOY · DOMINGO, 3 DE MAYO
            </div>
            <div className="aliis-meds-h">
              Mis <em>medicamentos</em>
            </div>
            <div className="aliis-med-row">
              <span>
                Ramipril
                <br />
                <small>5 mg</small>
              </span>
              <span className="aliis-check">✓</span>
            </div>
            <div className="aliis-med-row">
              <span>
                Ácido acetilsalicílico
                <br />
                <small>100 mg</small>
              </span>
              <span className="aliis-check">✓</span>
            </div>
            <div className="aliis-med-row">
              <span>
                Atorvastatina
                <br />
                <small>40 mg</small>
              </span>
              <span className="aliis-check is-empty">○</span>
            </div>
            <div className="aliis-med-row">
              <span>
                Paracetamol
                <br />
                <small>500 mg</small>
              </span>
              <span className="aliis-checks">✓✓✓✓</span>
            </div>
            <div className="aliis-med-row">
              <span>
                Ibuprofeno
                <br />
                <small>400 mg</small>
              </span>
              <span />
            </div>
            <div className="aliis-streak">🔥 1 día seguidos</div>
          </div>
          <div className="aliis-side-card aliis-side-card-small">
            <div className="aliis-eyebrow">TU HISTORIA DE SALUD</div>
            <div className="aliis-side-card-title">
              El Hilo <span style={{ float: 'right', color: '#a1a1aa' }}>›</span>
            </div>
            <div className="aliis-side-card-sub">3 de mayo</div>
          </div>
          <div className="aliis-side-card aliis-side-card-small">
            <div className="aliis-eyebrow">CÁPSULA DEL TIEMPO</div>
            <div className="aliis-side-card-title">Comparar mi mes</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Caption ──────────────────────────────────────────────────
const Caption = ({ eyebrow, title }: { eyebrow: string; title: string }) => (
  <div className="aliis-caption" key={title}>
    <div className="aliis-eyebrow">{eyebrow}</div>
    <h3 className="aliis-caption-title">{title}</h3>
  </div>
)

// ─── Browser frame ────────────────────────────────────────────
const BrowserFrame = forwardRef<HTMLDivElement, { children: ReactNode }>(
  function BrowserFrame({ children }, ref) {
    return (
      <div className="aliis-browser is-macos">
        <div className="aliis-browser-top">
          <div className="aliis-traffic">
            <span style={{ background: '#ff5f57' }} />
            <span style={{ background: '#febc2e' }} />
            <span style={{ background: '#28c840' }} />
          </div>
          <div className="aliis-browser-url">
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#71717a"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <rect x="4" y="11" width="16" height="10" rx="2" />
              <path d="M8 11V8a4 4 0 0 1 8 0v3" />
            </svg>
            <span>aliis.app</span>
          </div>
          <div style={{ width: 60 }} />
        </div>
        <div className="aliis-browser-body" ref={ref}>
          {children}
        </div>
      </div>
    )
  }
)

// ─── Timeline ─────────────────────────────────────────────────

type SceneId = 'nuevo' | 'expediente' | 'explicacion' | 'chat' | 'diario'
type SceneDef = { id: SceneId; dur: number; eyebrow: string; caption: string }

const SCENES: SceneDef[] = [
  { id: 'nuevo', dur: 5.0, eyebrow: '01 · INGRESO', caption: 'Cuéntale a Aliis tu diagnóstico' },
  { id: 'expediente', dur: 4.5, eyebrow: '02 · TU EXPEDIENTE', caption: 'Todo lo que entiendes, en un solo lugar' },
  { id: 'explicacion', dur: 5.0, eyebrow: '03 · EXPLICACIÓN', caption: 'En palabras que entiendes — sin jerga' },
  { id: 'chat', dur: 5.5, eyebrow: '04 · PREGÚNTALE', caption: 'Aliis te responde, con la ciencia detrás' },
  { id: 'diario', dur: 5.0, eyebrow: '05 · DIARIO', caption: 'Tu salud, día a día — Aliis encuentra los patrones' },
]

const FULL_DIAG = 'Dislipidemia'

type CursorTarget = { t: number; x: number; y: number }
const CURSOR_TARGETS: Record<SceneId, CursorTarget[]> = {
  nuevo: [
    { t: 0, x: 32, y: 30 },
    { t: 0.6, x: 50, y: 53 },
    { t: 2.6, x: 50, y: 53 },
    { t: 3.6, x: 50, y: 64 },
    { t: 5.0, x: 50, y: 64 },
  ],
  expediente: [
    { t: 0, x: 70, y: 28 },
    { t: 1.0, x: 50, y: 42 },
    { t: 2.5, x: 60, y: 50 },
    { t: 4.5, x: 60, y: 50 },
  ],
  explicacion: [
    { t: 0, x: 55, y: 38 },
    { t: 1.5, x: 52, y: 56 },
    { t: 3.5, x: 60, y: 70 },
    { t: 5.0, x: 87, y: 92 },
  ],
  chat: [
    { t: 0, x: 70, y: 55 },
    { t: 0.8, x: 87, y: 88 },
    { t: 2.5, x: 95, y: 88 },
    { t: 5.5, x: 78, y: 50 },
  ],
  diario: [
    { t: 0, x: 50, y: 35 },
    { t: 1.5, x: 60, y: 22 },
    { t: 3.0, x: 50, y: 55 },
    { t: 5.0, x: 35, y: 70 },
  ],
}

const interpCursor = (targets: CursorTarget[], t: number) => {
  for (let i = 0; i < targets.length - 1; i++) {
    if (t >= targets[i].t && t < targets[i + 1].t) {
      const a = targets[i]
      const b = targets[i + 1]
      const k = (t - a.t) / (b.t - a.t)
      const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2
      return { x: a.x + (b.x - a.x) * e, y: a.y + (b.y - a.y) * e }
    }
  }
  const last = targets[targets.length - 1]
  return { x: last.x, y: last.y }
}

// ─── Main component ───────────────────────────────────────────

export default function AliisDemo() {
  const [t, setT] = useState(0) // global time in seconds
  const [playing, setPlaying] = useState(true)
  const [scale, setScale] = useState(1)
  // userPaused tracks explicit pause via the play/pause button, so the
  // IntersectionObserver doesn't restart playback when the user paused manually.
  const userPausedRef = useRef(false)
  const shellHostRef = useRef<HTMLDivElement | null>(null)
  const rafRef = useRef<number | null>(null)
  const lastRef = useRef<number>(typeof performance !== 'undefined' ? performance.now() : 0)
  const rootRef = useRef<HTMLDivElement | null>(null)

  // Pause RAF when demo scrolls out of viewport — saves CPU on mobile and
  // on desktop when the user scrolls past the hero. Resumes automatically
  // when the demo comes back into view (unless the user manually paused).
  useEffect(() => {
    const el = rootRef.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!userPausedRef.current) setPlaying(true)
        } else {
          setPlaying(false)
        }
      },
      { threshold: 0.1 } // pause when less than 10% is visible
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // Auto-scale fixed 1280×724 shell to fit the browser body
  useEffect(() => {
    const compute = () => {
      const host = shellHostRef.current
      if (!host) return
      const r = host.getBoundingClientRect()
      const designW = 1280
      const designH = 724
      const s = Math.min(r.width / designW, r.height / designH)
      setScale(s || 1)
    }
    compute()
    const ro = new ResizeObserver(compute)
    if (shellHostRef.current) ro.observe(shellHostRef.current)
    window.addEventListener('resize', compute)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', compute)
    }
  }, [])

  const totalDur = useMemo(() => SCENES.reduce((a, s) => a + s.dur, 0), [])

  useEffect(() => {
    const tick = (now: number) => {
      const dt = (now - lastRef.current) / 1000
      lastRef.current = now
      if (playing) {
        setT((prev) => {
          let next = prev + dt
          if (next >= totalDur) next = 0 // loop
          return next
        })
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [playing, totalDur])

  // Find current scene
  let acc = 0
  let sceneIdx = 0
  let sceneT = 0
  for (let i = 0; i < SCENES.length; i++) {
    if (t < acc + SCENES[i].dur) {
      sceneIdx = i
      sceneT = t - acc
      break
    }
    acc += SCENES[i].dur
    if (i === SCENES.length - 1) {
      sceneIdx = i
      sceneT = SCENES[i].dur
    }
  }
  const scene = SCENES[sceneIdx]
  const sceneProgress = Math.min(1, sceneT / scene.dur)

  // Per-scene state
  const typedChars = Math.min(FULL_DIAG.length, Math.floor((sceneT - 0.6) / 0.13))
  const typedText = sceneT > 0.6 ? FULL_DIAG.slice(0, Math.max(0, typedChars)) : ''
  const inputFocus = sceneT > 0.3 && sceneT < scene.dur - 0.3
  const ctaActive = typedText.length > 0
  const hiliteFirst = sceneT > 1.8
  const readProg = Math.min(1, sceneT / scene.dur)
  const userQuestion = sceneT > 1.0 ? '¿porqué pasa?' : ''
  const aiFull =
    'Buena pregunta. Tu hígado tiene unos receptores que atrapan el LDL para eliminarlo. Si no funcionan bien, el colesterol se queda dando vueltas y termina pegándose en las arterias.'
  const aiStart = 1.6
  const aiChars = Math.min(aiFull.length, Math.floor((sceneT - aiStart) / 0.025))
  const aiText = sceneT > aiStart ? aiFull.slice(0, Math.max(0, aiChars)) : ''
  const isTyping = sceneT > aiStart && aiChars < aiFull.length
  const chartProgress = Math.min(1, Math.max(0, (sceneT - 0.8) / (scene.dur - 1.5)))

  const cursor = interpCursor(CURSOR_TARGETS[scene.id] ?? [{ t: 0, x: 50, y: 50 }], sceneT)

  // Crossfade with previous scene
  const [prevScene, setPrevScene] = useState<SceneId | null>(null)
  const lastSceneIdRef = useRef<SceneId>(scene.id)
  useEffect(() => {
    if (lastSceneIdRef.current !== scene.id) {
      const prevId = lastSceneIdRef.current
      lastSceneIdRef.current = scene.id
      setPrevScene(prevId)
      const id = setTimeout(() => setPrevScene(null), 700)
      return () => clearTimeout(id)
    }
  }, [scene.id])

  const renderSceneById = (id: SceneId) => {
    switch (id) {
      case 'nuevo':
        return <SceneNuevo typed={typedText} isFocus={inputFocus} ctaActive={ctaActive} />
      case 'expediente':
        return <SceneExpediente hiliteFirst={hiliteFirst} />
      case 'explicacion':
        return <SceneExplicacion readProgress={readProg} />
      case 'chat':
        return <SceneChat userQuestion={userQuestion} aiText={aiText} isTyping={isTyping} />
      case 'diario':
        return <SceneDiario chartProgress={chartProgress} />
      default:
        return null
    }
  }

  const navMap: Record<SceneId, string> = {
    nuevo: 'nuevo',
    expediente: 'expediente',
    explicacion: 'expediente',
    chat: 'expediente',
    diario: 'diario',
  }
  const activeNav = navMap[scene.id] || 'nuevo'

  return (
    <div className="aliis-demo-root" ref={rootRef}>
      <div className="aliis-stage">
        <div className="aliis-bg-glow" />

        <div className="aliis-stage-inner">
          <BrowserFrame ref={shellHostRef}>
            <div className="aliis-app-shell" style={{ transform: `scale(${scale})` }}>
              <Sidebar active={activeNav} />
              <div className="aliis-main-pane">
                {prevScene && (
                  <div className="aliis-scene-wrap is-leaving" key={'leave-' + prevScene}>
                    {renderSceneById(prevScene)}
                  </div>
                )}
                <div className="aliis-scene-wrap is-entering" key={'enter-' + scene.id}>
                  {renderSceneById(scene.id)}
                </div>
                <div
                  className="aliis-cursor"
                  style={{ left: cursor.x + '%', top: cursor.y + '%' }}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24">
                    <path
                      d="M5 3l5 18 3-7 7-3z"
                      fill="#0F2633"
                      stroke="#fff"
                      strokeWidth="1.4"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </BrowserFrame>

          <Caption eyebrow={scene.eyebrow} title={scene.caption} />

          {/* Progress dots */}
          <div className="aliis-progress">
            {SCENES.map((s, i) => (
              <div
                key={s.id}
                className={
                  'aliis-progress-dot' +
                  (i === sceneIdx ? ' is-active' : '') +
                  (i < sceneIdx ? ' is-done' : '')
                }
                onClick={() => {
                  let acc2 = 0
                  for (let j = 0; j < i; j++) acc2 += SCENES[j].dur
                  setT(acc2)
                }}
              >
                <div
                  className="aliis-progress-fill"
                  style={{
                    width:
                      i < sceneIdx ? '100%' : i === sceneIdx ? sceneProgress * 100 + '%' : '0%',
                  }}
                />
              </div>
            ))}
          </div>

          {/* Play/pause */}
          <button
            className="aliis-play"
            onClick={() => {
              userPausedRef.current = playing // if currently playing, user is pausing
              setPlaying((p) => !p)
            }}
            aria-label={playing ? 'Pausar' : 'Reproducir'}
          >
            {playing ? (
              <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="5" width="4" height="14" rx="1" />
                <rect x="14" y="5" width="4" height="14" rx="1" />
              </svg>
            ) : (
              <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 4l13 8-13 8z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
