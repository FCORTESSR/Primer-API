const express = require("express");

const app = express();
app.use(express.json()); // permite leer JSON en el body de las peticiones

// "Base de datos" en memoria (se reinicia cada vez que el servidor se reinicia)
let tareas = [
  { id: 1, titulo: "Aprender APIs", completada: false },
  { id: 2, titulo: "Subir la API a Render", completada: false },
];
let siguienteId = 3;

// Ruta de bienvenida
app.get("/", (req, res) => {
  res.json({ mensaje: "API funcionando", rutas: ["/tareas"] });
});

// LEER todas las tareas
app.get("/tareas", (req, res) => {
  res.json(tareas);
});

// LEER una tarea por id
app.get("/tareas/:id", (req, res) => {
  const tarea = tareas.find((t) => t.id === Number(req.params.id));
  if (!tarea) return res.status(404).json({ error: "Tarea no encontrada" });
  res.json(tarea);
});

// CREAR una tarea
app.post("/tareas", (req, res) => {
  const { titulo } = req.body;
  if (!titulo || typeof titulo !== "string") {
    return res.status(400).json({ error: "El campo 'titulo' es obligatorio" });
  }
  const nueva = { id: siguienteId++, titulo, completada: false };
  tareas.push(nueva);
  res.status(201).json(nueva);
});

// ACTUALIZAR una tarea
app.put("/tareas/:id", (req, res) => {
  const tarea = tareas.find((t) => t.id === Number(req.params.id));
  if (!tarea) return res.status(404).json({ error: "Tarea no encontrada" });

  const { titulo, completada } = req.body;
  if (titulo !== undefined) tarea.titulo = titulo;
  if (completada !== undefined) tarea.completada = Boolean(completada);
  res.json(tarea);
});

// BORRAR una tarea
app.delete("/tareas/:id", (req, res) => {
  const indice = tareas.findIndex((t) => t.id === Number(req.params.id));
  if (indice === -1) return res.status(404).json({ error: "Tarea no encontrada" });
  tareas.splice(indice, 1);
  res.status(204).send();
});

// Cualquier otra ruta
app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

// Render asigna el puerto en process.env.PORT
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API escuchando en el puerto ${PORT}`));

// Manejo de errores (debe ir después de todas las rutas)
app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "JSON inválido en el cuerpo de la petición" });
  }
  console.error(err);
  res.status(500).json({ error: "Error interno del servidor" });
});
