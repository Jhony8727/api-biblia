import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();

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

const removerAcentos = (str) =>
  str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, '');

function traduzirLivro(livro) {
  return livrosTraduzidos[removerAcentos(livro)] || null;
}

// Versículo específico
router.get('/versiculo/:livro/:capitulo/:versiculo', async (req, res) => {
  const { livro, capitulo, versiculo } = req.params;
  const livroEmIngles = traduzirLivro(livro);
  if (!livroEmIngles) return res.status(400).json({ erro: "Livro inválido." });

  const url = `https://bible-api.com/${livroEmIngles}+${capitulo}:${versiculo}?translation=almeida`;
  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      return res.status(404).json({ mensagem: "Versículo não encontrado." });
    }

    res.json({
      livro: data.book_name,
      capitulo: data.chapter,
      versiculo: data.verse,
      texto: data.text.trim()
    });
  } catch (err) {
    res.status(500).json({ erro: "Erro na consulta." });
  }
});

// Capítulo inteiro
router.get('/capitulo/:livro/:capitulo', async (req, res) => {
  const { livro, capitulo } = req.params;
  const livroEmIngles = traduzirLivro(livro);
  if (!livroEmIngles) return res.status(400).json({ erro: "Livro inválido." });

  const url = `https://bible-api.com/${livroEmIngles}+${capitulo}?translation=almeida`;
  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      return res.status(404).json({ mensagem: "Capítulo não encontrado." });
    }

    res.json({
      livro: data.book_name,
      capitulo: parseInt(capitulo),
      texto: data.verses.map(v => v.text.trim())
    });
  } catch (err) {
    res.status(500).json({ erro: "Erro na consulta." });
  }
});
