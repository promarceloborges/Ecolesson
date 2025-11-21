
import React, { useState, useMemo, useEffect } from 'react';
import type { LessonPlanRequest } from '../types';

interface LessonPlanFormProps {
  onSubmit: (formData: LessonPlanRequest) => void;
  isLoading: boolean;
}

const teachingModalities = [
  { id: 'educacao_infantil', name: 'Educação Infantil' },
  { id: 'ensino_fundamental', name: 'Ensino Fundamental' },
  { id: 'ensino_medio', name: 'Ensino Médio' },
];

const disciplinesByModality: { [key: string]: string[] } = {
  educacao_infantil: [
    'Campos de Experiências',
  ],
  ensino_fundamental: [
    'Língua Portuguesa',
    'Arte',
    'Educação Física',
    'Língua Inglesa',
    'Matemática',
    'Ciências',
    'Geografia',
    'História',
    'Ensino Religioso'
  ],
  ensino_medio: [
    'Língua Portuguesa',
    'Literatura',
    'Língua Inglesa',
    'Arte',
    'Educação Física',
    'Matemática',
    'Física',
    'Química',
    'Biologia',
    'História',
    'Geografia',
    'Sociologia',
    'Filosofia'
  ],
};

const gradesByModality: { [key: string]: string[] } = {
  educacao_infantil: [
    'Berçário I (0 a 1 ano)',
    'Berçário II (1 a 2 anos)',
    'Maternal I (2 a 3 anos)',
    'Maternal II (3 a 4 anos)',
    'Pré-escola I (4 a 5 anos)',
    'Pré-escola II (5 a 6 anos)'
  ],
  ensino_fundamental: [
    '1º Ano',
    '2º Ano',
    '3º Ano',
    '4º Ano',
    '5º Ano',
    '6º Ano',
    '7º Ano',
    '8º Ano',
    '9º Ano'
  ],
  ensino_medio: [
    '1ª Série',
    '2ª Série',
    '3ª Série'
  ],
};

// Configuração de tempos e aulas por modalidade
const timeConfig: { 
  [key: string]: { 
    durations: { label: string; value: number }[], 
    counts: { label: string; value: number }[] 
  } 
} = {
  educacao_infantil: {
    durations: [
      { label: '30 min (Atividade curta/Rotina)', value: 30 },
      { label: '45 min (Atividade padrão)', value: 45 },
      { label: '60 min (1 hora)', value: 60 },
      { label: '4 horas (Período parcial)', value: 240 },
      { label: '7 horas (Período integral)', value: 420 },
    ],
    counts: [
      { label: '1 momento/atividade', value: 1 },
      { label: 'Sequência de 3 atividades', value: 3 },
      { label: '5 atividades (Semana)', value: 5 },
    ]
  },
  ensino_fundamental: {
    durations: [
      { label: '45 min (Hora-aula curta)', value: 45 },
      { label: '50 min (Hora-aula padrão)', value: 50 },
      { label: '60 min (Hora relógio)', value: 60 },
    ],
    counts: [
      { label: '1 aula (Isolada)', value: 1 },
      { label: '2 aulas (Geminada/Bloco)', value: 2 },
      { label: '3 aulas', value: 3 },
      { label: '4 aulas (Semana padrão)', value: 4 },
      { label: '5 aulas (Semana intensiva)', value: 5 },
    ]
  },
  ensino_medio: {
    durations: [
      { label: '45 min (Hora-aula noturno/curta)', value: 45 },
      { label: '50 min (Hora-aula padrão)', value: 50 },
      { label: '100 min (Bloco duplo)', value: 100 },
    ],
    counts: [
      { label: '1 aula', value: 1 },
      { label: '2 aulas (Geminada)', value: 2 },
      { label: '3 aulas (Carga horária estendida)', value: 3 },
      { label: '4 aulas (Semana de área)', value: 4 },
      { label: '5 aulas', value: 5 },
    ]
  }
};

// Base de dados de sugestões de temas (Objetos de Conhecimento) alinhados à BNCC
const themeSuggestions: { [modality: string]: { [discipline: string]: { [grade: string]: string[] } } } = {
  'educacao_infantil': {
    'Campos de Experiências': {
      'Berçário I (0 a 1 ano)': [
        'Exploração sensorial e motora (O eu, o outro e o nós)',
        'Sons, gestos e balbucios (Traços, sons, cores e formas)',
        'Exploração de objetos e materiais (Espaços, tempos, quantidades...)',
        'Vínculos afetivos e cuidados pessoais'
      ],
      'Berçário II (1 a 2 anos)': [
        'O corpo e seus movimentos (Corpo, gestos e movimentos)',
        'Escuta de histórias e músicas (Escuta, fala, pensamento...)',
        'Identidade e autonomia nas brincadeiras',
        'Exploração do ambiente físico e social'
      ],
      'Maternal I (2 a 3 anos)': [
        'Jogos simbólicos e faz de conta',
        'Expressão plástica (desenho, pintura, modelagem)',
        'Contagem oral e noções de quantidade',
        'Relações espaciais (dentro, fora, perto, longe)'
      ],
      'Maternal II (3 a 4 anos)': [
        'Narrativas e contação de histórias',
        'Danças e brincadeiras cantadas',
        'Observação de fenômenos naturais',
        'Regras de convivência e interação social'
      ],
      'Pré-escola I (4 a 5 anos)': [
        'Escrita espontânea e nome próprio',
        'Jogos de regras e cooperação',
        'Classificação e seriação de objetos',
        'Corpo humano e sentidos'
      ],
      'Pré-escola II (5 a 6 anos)': [
        'Reconhecimento de letras e sons (consciência fonológica)',
        'Operações concretas (juntar, separar)',
        'Manifestações culturais e artísticas',
        'Preservação do meio ambiente'
      ]
    }
  },
  'ensino_fundamental': {
    'Língua Portuguesa': {
      '1º Ano': ['Alfabeto e ordem alfabética', 'Consciência fonológica', 'Leitura de listas e bilhetes', 'Produção de legendas'],
      '2º Ano': ['Ortografia (F/V, T/D, P/B)', 'Segmentação de palavras', 'Leitura de contos de fadas', 'Produção de pequenos relatos'],
      '3º Ano': ['Sílaba tônica e acentuação', 'Gêneros textuais: Carta e E-mail', 'Substantivos e Adjetivos', 'Pontuação e entonação'],
      '4º Ano': ['Concordância verbal e nominal', 'Leitura de notícias e reportagens', 'Produção de texto instrucional', 'Verbos: tempos e modos'],
      '5º Ano': ['Gênero textual: Crônica', 'Discurso direto e indireto', 'Uso dos porquês', 'Leitura de gráficos e infográficos'],
      '6º Ano': ['Variedades linguísticas', 'Elementos da narrativa', 'Figuras de linguagem', 'Gênero: Diário e Relato pessoal'],
      '7º Ano': ['Gênero: Notícia e Reportagem', 'Sintaxe: Sujeito e Predicado', 'Verbos transitivos e intransitivos', 'Coesão e Coerência'],
      '8º Ano': ['Gênero: Artigo de Opinião', 'Vozes verbais', 'Aposto e Vocativo', 'Período composto por coordenação'],
      '9º Ano': ['Gênero: Resenha Crítica', 'Orações subordinadas', 'Regência verbal e nominal', 'Colocação pronominal']
    },
    'Matemática': {
      '1º Ano': ['Contagem até 100', 'Figuras geométricas planas', 'Adição e subtração simples', 'Noções de tempo (calendário)'],
      '2º Ano': ['Sistema de numeração decimal (centenas)', 'Medidas de comprimento', 'Dobro e metade', 'Leitura de tabelas simples'],
      '3º Ano': ['Multiplicação e tabuada', 'Figuras geométricas espaciais', 'Sistema monetário brasileiro', 'Medidas de massa e capacidade'],
      '4º Ano': ['Divisão com números naturais', 'Frações (noções básicas)', 'Ângulos e retas', 'Perímetro e área (malha quadriculada)'],
      '5º Ano': ['Números decimais', 'Porcentagem básica', 'Plano cartesiano (1º quadrante)', 'Probabilidade básica'],
      '6º Ano': ['Operações com números naturais e decimais', 'Múltiplos e divisores', 'Polígonos', 'Fração e seus significados'],
      '7º Ano': ['Números inteiros', 'Números racionais', 'Equações de 1º grau', 'Ângulos e triângulos'],
      '8º Ano': ['Dízimas periódicas e notação científica', 'Polinômios e Monômios', 'Triângulos (congruência e pontos notáveis)', 'Estatística: média, moda e mediana'],
      '9º Ano': ['Radiciação e Potenciação', 'Equação de 2º grau', 'Teorema de Pitágoras', 'Semelhança de triângulos']
    },
    'Ciências': {
      '1º Ano': ['Corpo humano e higiene', 'Escalas de tempo (dia/noite)', 'Materiais do cotidiano'],
      '2º Ano': ['Plantas e suas partes', 'Prevenção de acidentes', 'Sol e sombras', 'Materiais e seus usos'],
      '3º Ano': ['Animais (características e classificação)', 'Solo e sua formação', 'Luz e som', 'Saúde auditiva e visual'],
      '4º Ano': ['Cadeias alimentares', 'Microrganismos', 'Estados físicos da matéria', 'Movimentos da Terra'],
      '5º Ano': ['Ciclo da água', 'Sistema digestório e respiratório', 'Consumo consciente', 'Constelações e mapas celestes'],
      '6º Ano': ['Célula como unidade da vida', 'Sistemas do corpo humano (integração)', 'Misturas e separação', 'Movimentos da Terra e Lua'],
      '7º Ano': ['Ecossistemas brasileiros', 'Calor e temperatura', 'Máquinas simples', 'Placas tectônicas e deriva continental'],
      '8º Ano': ['Fontes de energia', 'Sistema Sol, Terra e Lua', 'Reprodução humana e sexualidade', 'Clima e tempo'],
      '9º Ano': ['Estrutura da matéria (átomo)', 'Tabela Periódica', 'Reações químicas', 'Genética e hereditariedade']
    },
    'História': {
      '1º Ano': ['Minha história, minha vida', 'A escola e a família', 'Brincadeiras de ontem e hoje'],
      '2º Ano': ['A comunidade e seus registros', 'O tempo e o relógio', 'Trabalho na comunidade'],
      '3º Ano': ['O lugar onde vivo (cidade/campo)', 'Patrimônio histórico e cultural', 'Espaços públicos e privados'],
      '4º Ano': ['A formação do povo brasileiro', 'Migrações e imigrações', 'Os primeiros grupos humanos', 'Ciclos econômicos'],
      '5º Ano': ['Cidadania e Direitos Humanos', 'Povos antigos e registros', 'Patrimônio da humanidade', 'Constituição e leis'],
      '6º Ano': ['Pré-história e Antiguidade', 'Grécia e Roma Antiga', 'Feudalismo', 'Povos indígenas originários'],
      '7º Ano': ['Renascimento e Humanismo', 'Formação do Brasil Colonial', 'Povos africanos (Reinos e Impérios)', 'Reforma Protestante'],
      '8º Ano': ['Iluminismo e Revoluções', 'Independência do Brasil', 'Brasil Império', 'Revolução Industrial'],
      '9º Ano': ['República Velha', 'Era Vargas', 'Ditadura Militar no Brasil', 'Guerra Fria e Mundo Contemporâneo']
    },
    'Geografia': {
      '1º Ano': ['O lugar de vivência', 'Jogos e brincadeiras (espacialidade)', 'Ritmos naturais (dia/noite)'],
      '2º Ano': ['Meios de transporte e comunicação', 'Convivência no bairro', 'Orientação espacial básica'],
      '3º Ano': ['Paisagens rurais e urbanas', 'Impactos ambientais', 'Representações cartográficas (croquis)'],
      '4º Ano': ['Território brasileiro', 'Unidades federativas', 'Campo e cidade (relações)', 'Mapas e escalas'],
      '5º Ano': ['Dinâmica populacional', 'Urbanização brasileira', 'Regiões do Brasil', 'Tecnologia e trabalho'],
      '6º Ano': ['Paisagem, Lugar e Território', 'Orientação e localização (coordenadas)', 'Estrutura da Terra (litosfera)', 'Hidrosfera e atmosfera'],
      '7º Ano': ['Formação territorial do Brasil', 'Domínios morfoclimáticos', 'População brasileira (demografia)', 'Região Norte e Nordeste'],
      '8º Ano': ['Geopolítica mundial', 'América Latina e África', 'Países desenvolvidos e subdesenvolvidos', 'Globalização'],
      '9º Ano': ['Europa, Ásia e Oceania', 'Economia global', 'Conflitos mundiais contemporâneos', 'Meio ambiente e sustentabilidade']
    }
  },
  'ensino_medio': {
    'Língua Portuguesa': {
      '1ª Série': ['Trovadorismo e Humanismo', 'Funções da linguagem', 'Gênero: Notícia e Editorial', 'Variação linguística e preconceito'],
      '2ª Série': ['Romantismo e Realismo', 'Sintaxe do período composto', 'Gênero: Artigo de Opinião e Resenha', 'Literatura indígena e africana'],
      '3ª Série': ['Modernismo Brasileiro', 'Tendências contemporâneas', 'Redação dissertativa-argumentativa (ENEM)', 'Intertextualidade']
    },
    'Matemática': {
      '1ª Série': ['Conjuntos numéricos', 'Funções (Afim e Quadrática)', 'Função Exponencial e Logarítmica', 'Progressões (PA e PG)'],
      '2ª Série': ['Trigonometria no ciclo', 'Matrizes e Determinantes', 'Sistemas Lineares', 'Análise Combinatória e Probabilidade'],
      '3ª Série': ['Geometria Analítica (Ponto e Reta)', 'Números Complexos', 'Polinômios', 'Estatística Aplicada']
    },
    'Biologia': {
      '1ª Série': ['Bioquímica celular', 'Citologia (Estrutura e funções)', 'Metabolismo energético (Fotossíntese/Respiração)', 'Divisão Celular'],
      '2ª Série': ['Classificação dos seres vivos', 'Reino Plantae e Fungi', 'Reino Animalia (Invertebrados e Vertebrados)', 'Vírus e Bactérias'],
      '3ª Série': ['Genética (Mendeliana e Moderna)', 'Evolução Biológica', 'Ecologia (Populações e Comunidades)', 'Biotecnologia']
    },
    'Física': {
      '1ª Série': ['Cinemática (MRU e MRUV)', 'Leis de Newton', 'Trabalho e Energia', 'Quantidade de movimento'],
      '2ª Série': ['Termologia e Calorimetria', 'Óptica Geométrica', 'Ondulatória (Som e Luz)', 'Hidrostática'],
      '3ª Série': ['Eletrostática', 'Eletrodinâmica (Circuitos)', 'Eletromagnetismo', 'Física Moderna']
    },
    'Química': {
      '1ª Série': ['Modelos Atômicos', 'Tabela Periódica', 'Ligações Químicas', 'Funções Inorgânicas'],
      '2ª Série': ['Físico-Química (Termoquímica)', 'Cinética Química', 'Equilíbrio Químico', 'Eletroquímica (Pilhas e Eletrólise)'],
      '3ª Série': ['Química Orgânica (Cadeias Carbônicas)', 'Funções Orgânicas', 'Isomeria', 'Reações Orgânicas']
    },
    'História': {
      '1ª Série': ['Antiguidade Clássica e Oriental', 'Idade Média', 'Mundo Moderno e Renascimento', 'Colonização da América'],
      '2ª Série': ['Iluminismo e Revoluções Burguesas', 'Brasil Império', 'Imperialismo e Neocolonialismo', 'Primeira República no Brasil'],
      '3ª Série': ['Eras Vargas e Populismo', 'Ditadura Militar', 'Guerra Fria e Queda do Muro', 'Brasil Contemporâneo']
    },
    'Geografia': {
      '1ª Série': ['Cartografia e Geotecnologias', 'Geologia e Relevo', 'Climatologia e Vegetação', 'Recursos Hídricos'],
      '2ª Série': ['Geografia Urbana e Rural', 'Demografia e Migrações', 'Industrialização e Fontes de Energia', 'Espaço Agrário'],
      '3ª Série': ['Geopolítica Mundial', 'Globalização e Blocos Econômicos', 'Conflitos Internacionais', 'Geografia do Brasil (Regional)']
    },
    'Sociologia': {
      '1ª Série': ['Surgimento da Sociologia', 'Socialização e Instituições Sociais', 'Cultura e Identidade', 'Émile Durkheim'],
      '2ª Série': ['Karl Marx e Max Weber', 'Estratificação e Desigualdade Social', 'Trabalho e Sociedade', 'Movimentos Sociais'],
      '3ª Série': ['Cidadania e Direitos Humanos', 'Política e Estado', 'Sociologia Brasileira (Gilberto Freyre, Sérgio Buarque)', 'Violência e Criminalidade']
    },
    'Filosofia': {
      '1ª Série': ['Mito e Filosofia', 'Pré-Socráticos', 'Sócrates, Platão e Aristóteles', 'Teoria do Conhecimento'],
      '2ª Série': ['Filosofia Medieval', 'Racionalismo e Empirismo', 'Filosofia Política (Contratualistas)', 'Iluminismo'],
      '3ª Série': ['Ética e Moral', 'Filosofia Contemporânea', 'Existencialismo', 'Estética e Filosofia da Arte']
    }
  }
};

const LessonPlanForm: React.FC<LessonPlanFormProps> = ({ onSubmit, isLoading }) => {
    const [formData, setFormData] = useState({
        modalidade_ensino: 'ensino_medio',
        componente_curricular: 'Biologia',
        serie_turma: '3ª Série',
        objeto_conhecimento: 'Sistema Nervoso Central - funções do cerebelo',
        duracao_aula_min: 50,
        numero_aulas: 1,
        nivel_detalhe: 'completo' as 'resumo' | 'completo' | 'detalhado',
    });

  const currentDisciplines = useMemo(() => {
    return disciplinesByModality[formData.modalidade_ensino] || [];
  }, [formData.modalidade_ensino]);

  const currentGrades = useMemo(() => {
    return gradesByModality[formData.modalidade_ensino] || [];
  }, [formData.modalidade_ensino]);

  // Configurações de tempo baseadas na modalidade
  const currentTimeConfig = useMemo(() => {
    return timeConfig[formData.modalidade_ensino] || timeConfig['ensino_medio'];
  }, [formData.modalidade_ensino]);

  // Recupera sugestões baseadas no estado atual
  const currentSuggestions = useMemo(() => {
    const modalityData = themeSuggestions[formData.modalidade_ensino];
    if (!modalityData) return [];
    
    const disciplineData = modalityData[formData.componente_curricular];
    if (!disciplineData) return [];

    return disciplineData[formData.serie_turma] || [];
  }, [formData.modalidade_ensino, formData.componente_curricular, formData.serie_turma]);

  // Atualiza campos quando a modalidade muda, para manter consistência
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'modalidade_ensino') {
        const newDiscipline = disciplinesByModality[value][0];
        const newGrade = gradesByModality[value][0];
        const newTimeConfig = timeConfig[value] || timeConfig['ensino_medio'];
        
        setFormData(prev => ({
            ...prev,
            modalidade_ensino: value,
            componente_curricular: newDiscipline,
            serie_turma: newGrade,
            objeto_conhecimento: '', // Limpa o tema ao mudar drasticamente o contexto
            duracao_aula_min: newTimeConfig.durations[0].value, // Reseta para o padrão da modalidade
            numero_aulas: newTimeConfig.counts[0].value // Reseta para o padrão da modalidade
        }));
    } else if (name === 'componente_curricular' || name === 'serie_turma') {
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    } else {
        setFormData(prev => ({
          ...prev,
          [name]: name === 'duracao_aula_min' || name === 'numero_aulas' ? parseInt(value, 10) : value,
        }));
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setFormData(prev => ({ ...prev, objeto_conhecimento: suggestion }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const modalityName = teachingModalities.find(m => m.id === formData.modalidade_ensino)?.name || formData.modalidade_ensino;
    const submissionData: LessonPlanRequest = {
        ...formData,
        modalidade_ensino: modalityName,
        disciplina: formData.componente_curricular,
    };
    onSubmit(submissionData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-1">
      <div>
        <label htmlFor="modalidade_ensino" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Modalidade de Ensino
        </label>
        <select
          name="modalidade_ensino"
          id="modalidade_ensino"
          value={formData.modalidade_ensino}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          {teachingModalities.map(modality => (
            <option key={modality.id} value={modality.id}>{modality.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="componente_curricular" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Componente Curricular / Disciplina
        </label>
        <select
          name="componente_curricular"
          id="componente_curricular"
          value={formData.componente_curricular}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
            {currentDisciplines.map(discipline => (
                <option key={discipline} value={discipline}>{discipline}</option>
            ))}
        </select>
      </div>

      <div>
        <label htmlFor="serie_turma" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Série / Turma
        </label>
        <select
          name="serie_turma"
          id="serie_turma"
          value={formData.serie_turma}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
            {currentGrades.map(grade => (
                <option key={grade} value={grade}>{grade}</option>
            ))}
        </select>
      </div>
      
      <div>
        <label htmlFor="objeto_conhecimento" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Objeto do Conhecimento / Conteúdo
        </label>
        
        {/* Área de Sugestões */}
        {currentSuggestions.length > 0 && (
            <div className="mb-2">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Sugestões alinhadas à BNCC (clique para selecionar):</p>
                <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto custom-scrollbar">
                    {currentSuggestions.map((suggestion, index) => (
                        <button
                            key={index}
                            type="button"
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="text-xs bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-full px-3 py-1 hover:bg-emerald-100 dark:hover:bg-emerald-800 transition-colors text-left"
                        >
                            {suggestion}
                        </button>
                    ))}
                </div>
            </div>
        )}

        <textarea
          name="objeto_conhecimento"
          id="objeto_conhecimento"
          value={formData.objeto_conhecimento}
          onChange={handleChange}
          required
          rows={3}
          placeholder="Digite o tema da aula ou selecione uma sugestão acima..."
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
            <label htmlFor="duracao_aula_min" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Duração da Aula (min)
            </label>
            <select
                name="duracao_aula_min"
                id="duracao_aula_min"
                value={formData.duracao_aula_min}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
                {currentTimeConfig.durations.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
        </div>
        <div>
            <label htmlFor="numero_aulas" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Nº de Aulas / Momentos
            </label>
            <select
                name="numero_aulas"
                id="numero_aulas"
                value={formData.numero_aulas}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
                {currentTimeConfig.counts.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
        </div>
      </div>

      <div>
        <label htmlFor="nivel_detalhe" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Nível de Detalhe
        </label>
        <select
          name="nivel_detalhe"
          id="nivel_detalhe"
          value={formData.nivel_detalhe}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="resumo">Resumo</option>
          <option value="completo">Completo</option>
          <option value="detalhado">Detalhado</option>
        </select>
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Gerando Plano...
            </>
          ) : (
            'Gerar Plano de Aula'
          )}
        </button>
      </div>
    </form>
  );
};

export default LessonPlanForm;
