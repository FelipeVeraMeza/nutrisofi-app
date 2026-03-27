const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

export const analizarImagenConGemini = async (fotoBase64: string, nombresAlimentos: string, reglasMemoria: string) => {
  const prompt = `Eres un nutricionista experto. Analiza la imagen.
  BASE DE DATOS: [ ${nombresAlimentos} ] ${reglasMemoria}
  REGLAS: El 'nombre_db' DEBE ser exacto a la lista. Estima 'cantidad_porciones' (número decimal).
  JSON requerido: { "ingredientes": [{ "alimento_visto": "", "nombre_db": "", "cantidad_porciones": 1, "medida_casera_vista": "" }] }`;

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`, {
    method: 'POST', 
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      contents: [{ parts: [{ text: prompt }, { inlineData: { mimeType: "image/jpeg", data: fotoBase64 } }] }], 
      generationConfig: { responseMimeType: "application/json" } 
    })
  });

  const result = await response.json();
  if (!response.ok || result.error) throw new Error(result.error?.message);
  return JSON.parse(result.candidates[0].content.parts[0].text);
};
