export interface Question {
  id: number;
  text: string;
  category: 'Estrés y nerviosismo' | 'Ánimo y energía' | 'Confianza y disfrute';
}

export const questions: Question[] = [
  // Estrés y nerviosismo (1-5)
  {
    id: 1,
    text: '¿Sientes que tu cabeza no para de dar vueltas con preocupaciones?',
    category: 'Estrés y nerviosismo'
  },
  {
    id: 2,
    text: '¿Te cuesta relajarte aunque tengas tiempo libre?',
    category: 'Estrés y nerviosismo'
  },
  {
    id: 3,
    text: '¿Has tenido noches en que el sueño no llega o se corta por pensamientos?',
    category: 'Estrés y nerviosismo'
  },
  {
    id: 4,
    text: '¿Tu cuerpo se tensa (palpitaciones, presión, sudor) cuando estás bajo presión?',
    category: 'Estrés y nerviosismo'
  },
  {
    id: 5,
    text: '¿Vives con la sensación de estar "en alerta" aunque no pase nada grave?',
    category: 'Estrés y nerviosismo'
  },
  
  // Ánimo y energía (6-10)
  {
    id: 6,
    text: '¿Últimamente te cuesta encontrar ganas para lo cotidiano?',
    category: 'Ánimo y energía'
  },
  {
    id: 7,
    text: '¿Sientes que pocas cosas te entusiasman o te llenan de ilusión?',
    category: 'Ánimo y energía'
  },
  {
    id: 8,
    text: '¿Notas tu energía baja, incluso en días tranquilos?',
    category: 'Ánimo y energía'
  },
  {
    id: 9,
    text: '¿Las emociones negativas se quedan contigo más tiempo del que quisieras?',
    category: 'Ánimo y energía'
  },
  {
    id: 10,
    text: '¿Te has descubierto más irritable o de mal humor sin motivo claro?',
    category: 'Ánimo y energía'
  },

  // Confianza y disfrute (11-15)
  {
    id: 11,
    text: '¿Sientes que te guardas lo que te pasa porque no sabes con quién hablarlo?',
    category: 'Confianza y disfrute'
  },
  {
    id: 12,
    text: '¿Dudas de ti mismo/a cuando tienes que enfrentar problemas o decisiones?',
    category: 'Confianza y disfrute'
  },
  {
    id: 13,
    text: '¿Te viene seguido la idea de que "no estás dando la talla"?',
    category: 'Confianza y disfrute'
  },
  {
    id: 14,
    text: '¿Actividades que antes disfrutabas hoy ya no te generan lo mismo?',
    category: 'Confianza y disfrute'
  },
  {
    id: 15,
    text: '¿Tu cabeza se queda atrapada en pensamientos negativos que dan vueltas y vueltas?',
    category: 'Confianza y disfrute'
  }
];