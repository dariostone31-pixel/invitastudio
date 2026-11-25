import type { EventCategory } from "@/templates/catalog";
import type { TriviaQuestion } from "@/lib/db";

export function getDefaultStoryTitleForCategory(
  category: EventCategory,
  skinName?: string
): string {
  const lowerName = (skinName || "").toLowerCase();
  switch (category) {
    case "boda":
      return "Nuestra Historia";
    case "xv":
      return "Mis 15 Años";
    case "hombre":
      return "Un Nuevo Capítulo";
    case "nino":
      return "¡Hora de Jugar!";
    case "nina":
      return "Un Día Mágico";
    case "bautismo":
      if (lowerName.includes("comuni")) return "Mi Primera Comunión";
      if (lowerName.includes("baby")) return "Te Esperamos con Amor";
      return "Un Día Muy Especial";
  }
}

export function getCompatibleCategories(category: EventCategory): EventCategory[] {
  switch (category) {
    case "boda":
      return ["boda"];
    case "xv":
      return ["xv"];
    case "hombre":
      return ["hombre"];
    case "nino":
    case "nina":
    case "bautismo":
      return ["bautismo", "nina", "nino"];
  }
}

export function getTriviaPresetForCategory(
  category: EventCategory,
  dressCodeLabel = "Elegante Sport",
  skinId = ""
): TriviaQuestion[] {
  const lower = skinId.toLowerCase();

  if (category === "boda") {
    return [
      {
        id: "tq-boda-1",
        question: "¿Dónde fue su primer viaje juntos?",
        options: ["Bariloche", "Mendoza", "Mar del Plata", "Córdoba"],
        correctIndex: 1,
      },
      {
        id: "tq-boda-2",
        question: "¿Quién dio el primer paso para conocerse?",
        options: ["Fue amor a primera vista", "Por amigos en común", "En un viaje", "Por mensaje"],
        correctIndex: 1,
      },
      {
        id: "tq-boda-3",
        question: "¿Cuál es el código de vestimenta para esta noche?",
        options: ["Deportivo", dressCodeLabel, "Disfraz", "Playa"],
        correctIndex: 1,
      },
    ];
  }

  if (category === "xv") {
    return [
      {
        id: "tq-xv-1",
        question: "¿Cuál es su comida favorita?",
        options: ["Pizza", "Sushi", "Milanesas con papas fritas", "Pastas"],
        correctIndex: 2,
      },
      {
        id: "tq-xv-2",
        question: "¿Qué música no puede faltar en su pista?",
        options: ["Pop & Reggaeton", "Solo Rock", "Tango", "Jazz"],
        correctIndex: 0,
      },
      {
        id: "tq-xv-3",
        question: "¿Cuál es el código de vestimenta para la fiesta?",
        options: ["Deportivo", dressCodeLabel, "Pijama", "Playa"],
        correctIndex: 1,
      },
    ];
  }

  if (category === "hombre") {
    return [
      {
        id: "tq-h-1",
        question: "¿Qué es lo que nunca puede faltar en una reunión suya?",
        options: ["Asado y buena música", "Sopa de verduras", "Silencio total", "Dormir temprano"],
        correctIndex: 0,
      },
      {
        id: "tq-h-2",
        question: "¿Cuál es su plan favorito de fin de semana?",
        options: ["Juntarse con amigos y familia", "Hacer trámites", "Planchar camisas", "Estudiar contabilidad"],
        correctIndex: 0,
      },
      {
        id: "tq-h-3",
        question: "¿Cómo hay que ir vestido a este festejo?",
        options: ["Traje de buzo", dressCodeLabel, "Uniforme escolar", "Ropa de nieve"],
        correctIndex: 1,
      },
    ];
  }

  if (category === "nino") {
    return [
      {
        id: "tq-nino-1",
        question: "¿Cuál es su sabor de torta favorito para el cumple?",
        options: ["Chocolate y dulce de leche", "Brócoli", "Limón amargo", "Café"],
        correctIndex: 0,
      },
      {
        id: "tq-nino-2",
        question: "¿Qué es lo que más le gusta hacer en su fiesta?",
        options: ["Jugar, correr y soplar las velitas con amigos", "Hacer la tarea", "Ordenar el placard", "Ir al dentista"],
        correctIndex: 0,
      },
      {
        id: "tq-nino-3",
        question: "¿Cómo conviene venir vestido para disfrutar a full?",
        options: ["Traje de astronauta", dressCodeLabel, "Saco y corbata rígida", "Botas de esquí"],
        correctIndex: 1,
      },
    ];
  }

  if (category === "nina") {
    return [
      {
        id: "tq-nina-1",
        question: "¿Qué mesa dulce o torta le encanta elegir para festejar?",
        options: ["Frutillas, chocolate y cupcakes", "Sopa de zapallo", "Aceitunas", "Café amargo"],
        correctIndex: 0,
      },
      {
        id: "tq-nina-2",
        question: "¿Cuál es su momento favorito de su cumple?",
        options: ["Bailar, jugar y pedir los deseos con sus amigas", "Hacer cuentas de matemática", "Limpiar el cuarto", "Dormir la siesta"],
        correctIndex: 0,
      },
      {
        id: "tq-nina-3",
        question: "¿Cuál es el look sugerido para acompañarla hoy?",
        options: ["Pijama de invierno", dressCodeLabel, "Traje de buzo", "Equipo de fútbol"],
        correctIndex: 1,
      },
    ];
  }

  // bautismo / comunion / baby
  if (lower.includes("comuni")) {
    return [
      {
        id: "tq-com-1",
        question: "¿Cuál es su comida favorita para festejar en familia?",
        options: ["Milanesas o pizza", "Sopa de zapallo", "Ensalada sin sal", "Pescado hervido"],
        correctIndex: 0,
      },
      {
        id: "tq-com-2",
        question: "¿Con quiénes disfruta más compartir este día especial?",
        options: ["Con su familia, padrinos y amigos", "Solo mirando tele", "Haciendo compras", "En silencio"],
        correctIndex: 0,
      },
      {
        id: "tq-com-3",
        question: "¿Cuál es el código de vestimenta sugerido?",
        options: ["Ropa de playa", dressCodeLabel, "Disfraz", "Deportivo"],
        correctIndex: 1,
      },
    ];
  }

  return [
    {
      id: "tq-baut-1",
      question: "¿Cuál es la comida o postre favorito de la familia?",
      options: ["Mesa dulce y tortas", "Solo apio", "Limón puro", "Aceitunas"],
      correctIndex: 0,
    },
    {
      id: "tq-baut-2",
      question: "¿Quiénes son los invitados de honor en este día?",
      options: ["Su familia, padrinos y seres queridos", "Desconocidos", "Carteros", "Vecinos de otra ciudad"],
      correctIndex: 0,
    },
    {
      id: "tq-baut-3",
      question: "¿Cómo nos vestimos para acompañarlos?",
      options: ["Traje de lluvia", dressCodeLabel, "Equipo de fútbol", "Pijama"],
      correctIndex: 1,
    },
  ];
}
