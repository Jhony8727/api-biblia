import express from 'express';
import fetch from 'node-fetch';
import livros from './dados/livros.js';

const app = express();
const PORT = 3000;

const removerAcentos = (str) =>
  str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

const livrosTraduzidos = {
  genesis: "genesis",
  exodo: "exodus",
  levitico: "leviticus",
  numeros: "numbers",
  deuteronomio: "deuteronomy",
  josue: "joshua",
  juizes: "judges",
  rute: "ruth",
  primeirosamuel: "1-samuel",
  segundosamuel: "2-samuel",
  primeiroreis: "1-kings",
  segundoreis: "2-kings",
  primeiracronicas: "1-chronicles",
  segundacronicas: "2-chronicles",
  esdras: "ezra",
  neemias: "nehemiah",
  ester: "esther",
  jo: "job",
  salmos: "psalms",
  proverbios: "proverbs",
  eclesiastes: "ecclesiastes",
  cantares: "song-of-songs",
  isaias: "isaiah",
  jeremias: "jeremiah",
  lamentacoes: "lamentations",
  ezequiel: "ezekiel",
  daniel: "daniel",
  oseias: "hosea",
  joel: "joel",
  amos: "amos",
  obadias: "obadiah",
  jonas: "jonah",
  miqueias: "micah",
  naum: "nahum",
  habacuque: "habakkuk",
  sofonias: "zephaniah",
  ageu: "haggai",
  zacarias: "zechariah",
  malaquias: "malachi",
  mateus: "matthew",
  marcos: "mark",
  lucas: "luke",
  joao: "john",
  atos: "acts",
  romanos: "romans",
  primeirocorintios: "1-corinthians",
  segundocorintios: "2-corinthians",
  galatas: "galatians",
  efesios: "ephesians",
  filipenses: "philippians",
  colossenses: "colossians",
  primeirotessalonicenses: "1-thessalonians",
  segundotessalonicenses: "2-thessalonians",
  primeirotimoteo: "1-timothy",
  segundotimoteo: "2-timothy",
  tito: "titus",
  filemom: "philemon",
  hebreus: "hebrews",
  tiago: "james",
  primeiropedro: "1-peter",
  segundopedro: "2-peter",
  primeirojoao: "1-john",
  segundojoao: "2-john",
  terceirojoao: "3-john",
  judas: "jude",
  apocalipse: "revelation"
};

// Rota raiz
app.get('/', (req, res) => {
  res.send('Bem-vindo à API da Bíblia!');
});

// Listar livros localmente, sem mostrar ID
app.get('/livros', (req, res) => {
  const livrosSemId = livros.map(({ id, ...rest }) => rest);
  res.json(livrosSemId);
});

// Buscar livro pelo nome localmente (sem ID)
app.get('/livros/:nome', (req, res) => {
  const nomeBuscado = removerAcentos(req.params.nome);
  const livro = livros.find(l => removerAcentos(l.nome) === nomeBuscado);
  if (livro) {
    const { id, ...livroSemId } = livro;
    res.json(livroSemId);
  } else {
    res.status(404).json({ mensagem: "Livro não encontrado" });
  }
});

// Buscar capítulos localmente pelo id do livro
app.get('/livros/:id/capitulos', (req, res) => {
  const id = parseInt(req.params.id);
  const livro = livros.find(l => l.id === id);
  if (!livro) {
    return res.status(404).json({ mensagem: "Livro não encontrado" });
  }
  const capitulos = Array.from({ length: livro.capitulos }, (_, i) => i + 1);
  res.json({
    livro: livro.nome,
    quantidadeCapitulos: livro.capitulos,
    capitulos
  });
});

// Versículo específico (API externa)
app.get('/versiculo/:livro/:capitulo/:versiculo', async (req, res) => {
  let { livro, capitulo, versiculo } = req.params;
  livro = removerAcentos(livro.replace(/\s/g, ''));
  const livroEmIngles = livrosTraduzidos[livro];
  if (!livroEmIngles) {
    return res.status(400).json({ erro: "Nome do livro inválido ou não suportado." });
  }
  const url = `https://bible-api.com/${livroEmIngles}+${capitulo}:${versiculo}?translation=almeida`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.error) {
      return res.status(404).json({ mensagem: "Versículo não encontrado ou inválido." });
    }
    res.json({
      livro: data.book_name,
      capítulo: data.chapter,
      versículo: data.verse,
      texto: data.text.trim()
    });
  } catch (error) {
    res.status(500).json({ erro: "Erro ao buscar o versículo." });
  }
});

// Capítulo inteiro (API externa)
app.get('/capitulo/:livro/:capitulo', async (req, res) => {
  let { livro, capitulo } = req.params;
  livro = removerAcentos(livro.replace(/\s/g, ''));
  const livroEmIngles = livrosTraduzidos[livro];
  if (!livroEmIngles) {
    return res.status(400).json({ erro: "Nome do livro inválido ou não suportado." });
  }
  const url = `https://bible-api.com/${livroEmIngles}+${capitulo}?translation=almeida`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.error) {
      return res.status(404).json({ mensagem: "Capítulo não encontrado." });
    }
    res.json({
      livro: data.book_name,
      capítulo: data.chapter,
      versículos: data.verses.map(v => ({
        versículo: v.verse,
        texto: v.text.trim()
      }))
    });
  } catch (error) {
    res.status(500).json({ erro: "Erro ao buscar o capítulo." });
  }
});

// Livro inteiro (API externa)
app.get('/livro/:livro', async (req, res) => {
  let { livro } = req.params;
  livro = removerAcentos(livro.replace(/\s/g, ''));
  const livroEmIngles = livrosTraduzidos[livro];
  if (!livroEmIngles) {
    return res.status(400).json({ erro: "Nome do livro inválido ou não suportado." });
  }
  const url = `https://bible-api.com/${livroEmIngles}?translation=almeida`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.error) {
      return res.status(404).json({ mensagem: "Livro não encontrado." });
    }
    // Agrupar versículos por capítulo
    const agruparCapitulos = (verses) => {
      const resultado = {};
      verses.forEach(v => {
        if (!resultado[v.chapter]) resultado[v.chapter] = [];
        resultado[v.chapter].push({ versículo: v.verse, texto: v.text.trim() });
      });
      return resultado;
    };
    res.json({
      livro: data.verses[0].book_name,
      capítulos: agruparCapitulos(data.verses)
    });
  } catch (error) {
    res.status(500).json({ erro: "Erro ao buscar o livro." });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});