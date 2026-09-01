export const revealVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
} as const

export const notFoundCopy = {
  code: "404",
  title: "Página não encontrada",
  description:
    "Este endereço não existe no seu espaço. Pode ter sido movido ou digitado incorretamente.",
  ctaHome: "Voltar ao início",
  ctaLogin: "Entrar",
} as const
