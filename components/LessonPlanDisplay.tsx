
import React, { useState, useRef } from 'react';
import type { LessonPlanResponse } from '../types';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, Bullet } from 'docx';

interface LessonPlanDisplayProps {
  data: LessonPlanResponse;
}

// Componente de Template para Impressão/PDF
const LessonPlanPrintTemplate = React.forwardRef<HTMLDivElement, { data: LessonPlanResponse }>(({ data }, ref) => {
  const { plano_aula } = data;
  
  return (
    // Margens reduzidas de p-8 para p-6 para melhor aproveitamento do papel A4
    <div ref={ref} className="bg-white p-6 text-black font-sans" style={{ width: '210mm', minHeight: '297mm', margin: '0 auto' }}> 
      {/* Header */}
      <div className="border-b-2 border-gray-800 mb-4 pb-3">
        <h1 className="text-2xl font-bold text-gray-900 mb-2 uppercase">{plano_aula.titulo}</h1>
        <div className="flex justify-between text-sm text-gray-700 font-semibold mt-2">
             <span>{plano_aula.componente_curricular} &bull; {plano_aula.serie_turma}</span>
             <span>Duração: {plano_aula.duracao_total_min} min ({plano_aula.numero_de_aulas} aulas)</span>
        </div>
      </div>

      {/* Content Sections */}
      <div className="space-y-5">
         {/* Fundamentação */}
         <section>
            <h2 className="text-lg font-bold text-gray-800 mb-2 border-b border-gray-300 pb-1 uppercase tracking-wide">1. Fundamentação Pedagógica</h2>
            <div className="space-y-2 text-sm text-gray-800">
                <div className="bg-gray-50 p-2 rounded border border-gray-200">
                    <p><strong>Competência Específica:</strong></p>
                    <p className="mt-1">{plano_aula.competencia_especifica.codigo} - {plano_aula.competencia_especifica.texto}</p>
                </div>
                
                <div>
                    <strong>Habilidades:</strong>
                    <ul className="list-disc list-inside ml-1 mt-1 space-y-1">
                        {plano_aula.habilidades.map(h => (
                            <li key={h.codigo}>
                                <span className="font-semibold">{h.codigo}:</span> {h.texto}
                            </li>
                        ))}
                    </ul>
                </div>

                <div>
                    <strong>Objetivos de Aprendizagem:</strong>
                    <ul className="list-disc list-inside ml-1 mt-1 space-y-1">
                         {plano_aula.objetivos_de_aprendizagem.map((o, i) => <li key={i}>{o}</li>)}
                    </ul>
                </div>

                 {plano_aula.descritores && plano_aula.descritores.length > 0 && (
                    <div>
                        <strong>Descritores (SAEB):</strong>
                         <ul className="list-disc list-inside ml-1 mt-1 space-y-1">
                            {plano_aula.descritores.map(d => (
                                <li key={d.codigo}><span className="font-semibold">{d.codigo}:</span> {d.texto}</li>
                            ))}
                        </ul>
                    </div>
                 )}
            </div>
         </section>

         {/* Metodologia */}
         <section>
            <h2 className="text-lg font-bold text-gray-800 mb-2 border-b border-gray-300 pb-1 uppercase tracking-wide">2. Metodologia e Atividades</h2>
            <div className="space-y-3 text-sm text-gray-800">
                 {plano_aula.metodologia.map((etapa, i) => (
                    <div key={i} className="mb-2">
                        <h3 className="font-bold text-gray-900 text-base mb-1">{etapa.etapa} <span className="font-normal text-gray-600 text-xs ml-2">({etapa.duracao_min} min)</span></h3>
                        <div className="pl-3 border-l-2 border-gray-300">
                            <p className="font-semibold text-xs text-gray-600 mb-1">Atividades:</p>
                            <ul className="list-disc list-inside ml-1 mb-2 space-y-1">
                                {etapa.atividades.map((a, j) => <li key={j}>{a}</li>)}
                            </ul>
                            {etapa.recursos.length > 0 && (
                                <p className="text-gray-600 text-xs"><strong>Recursos:</strong> {etapa.recursos.join(', ')}</p>
                            )}
                        </div>
                    </div>
                 ))}
            </div>
         </section>

         {/* Avaliação */}
         <section className="break-inside-avoid">
             <h2 className="text-lg font-bold text-gray-800 mb-2 border-b border-gray-300 pb-1 uppercase tracking-wide">3. Avaliação</h2>
             <div className="text-sm text-gray-800 grid grid-cols-2 gap-4">
                 <div>
                    <p className="font-bold mb-1">Critérios:</p>
                    <ul className="list-disc list-inside ml-1 space-y-1">
                        {plano_aula.estrategia_de_avaliacao.criterios.map((c, i) => <li key={i}>{c}</li>)}
                    </ul>
                 </div>
                 <div>
                    <p className="font-bold mb-1">Instrumentos:</p>
                    <p>{plano_aula.estrategia_de_avaliacao.instrumentos.join(', ')}</p>
                 </div>
             </div>
         </section>
        
         {/* Recursos e Adaptações */}
         <section className="break-inside-avoid">
            <h2 className="text-lg font-bold text-gray-800 mb-2 border-b border-gray-300 pb-1 uppercase tracking-wide">4. Recursos e Adaptações</h2>
            <div className="text-sm text-gray-800 space-y-2">
                <div>
                    <p className="font-bold mb-1">Material de Apoio:</p>
                    <ul className="list-disc list-inside ml-1 space-y-1">
                         {plano_aula.material_de_apoio.map((m, i) => (
                            <li key={i} className="break-words">
                                <span className="uppercase text-xs font-bold bg-gray-200 px-1 rounded mr-1">{m.tipo}</span> 
                                {m.titulo} 
                                <span className="text-gray-500 text-xs block ml-6 break-all">{m.link}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                 <div>
                    <p className="font-bold mb-1">Adaptações para Inclusão (NEE):</p>
                    <div className="bg-blue-50 p-2 rounded border border-blue-100">
                        <ul className="list-disc list-inside ml-1 space-y-1">
                            {plano_aula.adapitacoes_nee.map((a, i) => <li key={i}>{a}</li>)}
                        </ul>
                    </div>
                </div>
            </div>
         </section>

         {/* Observações */}
         {plano_aula.observacoes && (
             <section className="break-inside-avoid">
                <h2 className="text-lg font-bold text-gray-800 mb-2 border-b border-gray-300 pb-1 uppercase tracking-wide">5. Observações</h2>
                <p className="text-sm text-gray-800 whitespace-pre-wrap bg-gray-50 p-2 rounded border border-gray-100">{plano_aula.observacoes}</p>
             </section>
         )}
      </div>
      
      {/* Footer */}
      <div className="mt-8 pt-2 border-t border-gray-300 text-center text-xs text-gray-400 flex justify-between items-center">
        <span>Gerado por <strong>Didacta</strong></span>
        <span>{new Date().toLocaleDateString()}</span>
      </div>
    </div>
  );
});

const Section: React.FC<{ title: string; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-3 md:p-4 text-left bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors rounded-t-lg"
      >
        <h3 className="text-lg font-semibold text-emerald-700 dark:text-emerald-400">{title}</h3>
        <svg className={`w-6 h-6 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
      </button>
      {isOpen && <div className="p-3 md:p-4 bg-white dark:bg-gray-800/50 rounded-b-lg">{children}</div>}
    </div>
  );
};

const LessonPlanDisplay: React.FC<LessonPlanDisplayProps> = ({ data }) => {
  const { plano_aula } = data;
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [exportingFormat, setExportingFormat] = useState<'pdf' | 'docx' | 'txt' | 'google_docs' | 'sheets' | null>(null);
  
  // Ref para o template de impressão (oculto)
  const printRef = useRef<HTMLDivElement>(null);

  const generatePlainText = (data: LessonPlanResponse): string => {
    const { plano_aula } = data;
    let content = `PLANO DE AULA: ${plano_aula.titulo}\n`;
    content += `Série/Turma: ${plano_aula.serie_turma} | Disciplina: ${plano_aula.componente_curricular}\n`;
    content += `Duração: ${plano_aula.duracao_total_min} min | Aulas: ${plano_aula.numero_de_aulas}\n`;
    content += "========================================\n\n";

    content += "FUNDAMENTAÇÃO PEDAGÓGICA\n";
    content += `Competência Específica: ${plano_aula.competencia_especifica.codigo} - ${plano_aula.competencia_especifica.texto}\n`;
    content += "Habilidades:\n";
    plano_aula.habilidades.forEach(h => content += `- ${h.codigo}: ${h.texto}\n`);
    content += "Objetivos de Aprendizagem:\n";
    plano_aula.objetivos_de_aprendizagem.forEach(o => content += `- ${o}\n`);
    if (plano_aula.descritores && plano_aula.descritores.length > 0) {
      content += "Descritor(es):\n";
      plano_aula.descritores.forEach(d => content += `- ${d.codigo}: ${d.texto}\n`);
    }
    content += "\n";

    content += "METODOLOGIA E ATIVIDADES\n";
    plano_aula.metodologia.forEach(etapa => {
        content += `\n--- ${etapa.etapa.toUpperCase()} (${etapa.duracao_min} min) ---\n`;
        content += "Atividades:\n";
        etapa.atividades.forEach(a => content += `- ${a}\n`);
        content += `Recursos: ${etapa.recursos.join(', ')}\n`;
    });
    content += "\n";
    
    content += "AVALIAÇÃO\n";
    content += "Critérios:\n";
    plano_aula.estrategia_de_avaliacao.criterios.forEach(c => content += `- ${c}\n`);
    content += `Instrumentos: ${plano_aula.estrategia_de_avaliacao.instrumentos.join(', ')}\n\n`;

    content += "RECURSOS E ADAPTAÇÕES\n";
    content += "Material de Apoio:\n";
    plano_aula.material_de_apoio.forEach(m => content += `- [${m.tipo}] ${m.titulo}: ${m.link}\n`);
    content += "Adaptações NEE:\n";
    plano_aula.adapitacoes_nee.forEach(a => content += `- ${a}\n`);
    content += "\n";

    content += "OBSERVAÇÕES:\n"
    content += `${plano_aula.observacoes}\n`

    return content;
  };
  
  const generateDocxObject = (data: LessonPlanResponse) => {
    const { plano_aula } = data;
    const children: any[] = [];
    
    children.push(new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(plano_aula.titulo)] }));
    children.push(new Paragraph({ children: [new TextRun({ text: `${plano_aula.serie_turma} - ${plano_aula.componente_curricular}`, italics: true })] }));
    children.push(new Paragraph(""));

    children.push(new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Fundamentação Pedagógica")] }));
    children.push(new Paragraph({ children: [new TextRun({ text: 'Competência Específica:', bold: true })] }));
    children.push(new Paragraph({ children: [new TextRun(`${plano_aula.competencia_especifica.codigo}: ${plano_aula.competencia_especifica.texto}`)]}));
    children.push(new Paragraph({ children: [new TextRun({ text: 'Habilidades:', bold: true })] }));
    plano_aula.habilidades.forEach(h => children.push(new Paragraph({ bullet: { level: 0 }, children: [new TextRun(`${h.codigo}: ${h.texto}`)] })));
    children.push(new Paragraph({ children: [new TextRun({ text: 'Objetivos de Aprendizagem:', bold: true })] }));
    plano_aula.objetivos_de_aprendizagem.forEach(o => children.push(new Paragraph({ bullet: { level: 0 }, children: [new TextRun(o)] })));
    if (plano_aula.descritores && plano_aula.descritores.length > 0) {
      children.push(new Paragraph({ children: [new TextRun({ text: 'Descritor(es):', bold: true })]}));
      plano_aula.descritores.forEach(d => children.push(new Paragraph({ bullet: { level: 0 }, children: [new TextRun(`${d.codigo}: ${d.texto}`)] })));
    }
    children.push(new Paragraph(""));
    
    children.push(new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Metodologia e Atividades")] }));
    plano_aula.metodologia.forEach(etapa => {
        children.push(new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun(`${etapa.etapa} (${etapa.duracao_min} min)`)] }));
        children.push(new Paragraph({ children: [new TextRun({ text: 'Atividades:', bold: true })] }));
        etapa.atividades.forEach(a => children.push(new Paragraph({ bullet: { level: 0 }, children: [new TextRun(a)] })));
        children.push(new Paragraph({ children: [new TextRun({ text: 'Recursos:', bold: true }), new TextRun({ text: ` ${etapa.recursos.join(', ')}`, italics: true })] }));
    });
    children.push(new Paragraph(""));
    
    // ... add other sections

    return new Document({ sections: [{ children }] });
  };

  const handleSaveToSheets = async () => {
    if (exportingFormat) return;
    setExportingFormat('sheets');
    setIsExportMenuOpen(false);

    try {
        // Simula o envio para um backend
        console.log("Payload para salvar no Google Sheets (simulado):", JSON.stringify(data, null, 2));

        alert(
          "Integração com Google Sheets\n\n" +
          "Esta funcionalidade requer um backend (ex: Google Cloud Function) para funcionar.\n\n" +
          "1. O frontend enviaria os dados deste plano (ver console) para o seu backend.\n" +
          "2. O seu backend usaria a API do Google Sheets para autenticar e adicionar uma nova linha à sua planilha com estes dados.\n\n" +
          "Esta é uma funcionalidade de servidor que não pode ser implementada apenas no frontend."
        );

    } catch (e) {
        console.error("Erro na simulação de salvar no Google Sheets:", e);
        alert("Ocorreu um erro na simulação de salvamento.");
    } finally {
        setExportingFormat(null);
    }
  };

  const handleExportToGoogleDocs = async () => {
    if (exportingFormat) return;
    setExportingFormat('google_docs');
    setIsExportMenuOpen(false);

    try {
        // Simula o envio para um backend
        console.log("Enviando para o backend (simulado):", JSON.stringify(data, null, 2));

        alert(
          "Integração com Google Docs\n\n" +
          "Para habilitar esta funcionalidade, você precisará configurar um backend (ex: Google Cloud Function).\n\n" +
          "1. O frontend enviaria os dados deste plano de aula (veja o console do navegador) para seu endpoint de backend.\n" +
          "2. Seu backend usaria a API do Google Docs para criar um documento a partir de um template.\n" +
          "3. O backend então usaria a API do Google Drive para exportar o documento como PDF e enviá-lo de volta para download.\n\n" +
          "Esta é uma funcionalidade avançada que requer infraestrutura de servidor."
        );

    } catch (e) {
        console.error("Erro na simulação de exportação para Google Docs:", e);
        alert("Ocorreu um erro na simulação de exportação.");
    } finally {
        setExportingFormat(null);
    }
  };


  const handleExport = async (format: 'pdf' | 'docx' | 'txt') => {
    if (exportingFormat) return;

    const sanitizedTitle = plano_aula.titulo.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const fileName = `plano_de_aula_${sanitizedTitle || 'sem_titulo'}`;

    setExportingFormat(format);
    setIsExportMenuOpen(false);
    
    try {
        if (format === 'pdf') {
            // Usa o template de impressão em vez do componente visual da tela
            if (!printRef.current) {
                throw new Error("Template de impressão não encontrado.");
            }
            
            const element = printRef.current;

            const canvas = await html2canvas(element, { 
                scale: 2,
                backgroundColor: '#ffffff',
                useCORS: true,
                logging: false
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            
            // Ajusta a altura da imagem proporcionalmente
            const imgHeight = (canvas.height * pdfWidth) / canvas.width;
            
            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
            heightLeft -= pdfHeight;

            // Adiciona páginas se o conteúdo for maior que uma página A4
            while (heightLeft > 0) {
                position = -heightLeft; // Move a posição para cima para renderizar o restante
                // A lógica correta para multipáginas com html2canvas em PDF é complexa pois html2canvas cria uma imagem única.
                // Para PDFs longos perfeitos, seria ideal gerar o PDF nativamente (texto) ou fatiar o canvas.
                // Aqui usamos o método simples de adicionar nova página e deslocar a imagem, 
                // o que pode cortar linhas de texto ao meio.
                // Para minimizar, o template tem margins generosas.
                
                // Se sobrou conteúdo, adiciona página
                if (heightLeft > 0) {
                    pdf.addPage();
                    // Precisamos desenhar a imagem deslocada para cima
                    // A posição deve ser calculada com base na altura da página e quanto já foi impresso
                    const pageHeight = pdfHeight;
                    // A posição Y negativa desloca a imagem para cima
                    // Calcula quanto já foi impresso: imgHeight - heightLeft
                    const printedHeight = imgHeight - heightLeft;
                    // A nova posição deve ser negativa do que já foi impresso?
                    // Não, a lógica padrão de multipage image é:
                    pdf.addImage(imgData, 'PNG', 0, -(imgHeight - heightLeft), pdfWidth, imgHeight);
                    heightLeft -= pdfHeight;
                }
            }
            
            // Método alternativo mais simples para 1 página longa (que o navegador lida no print), 
            // mas aqui estamos forçando um A4. Se o conteúdo for muito grande, html2canvas gera uma imagem gigante.
            // O loop acima tenta lidar com isso, mas cortes podem ocorrer.
            // Como melhoria para 'design limpo', garantimos que o template tem largura fixa A4.

            pdf.save(`${fileName}.pdf`);

        } else if (format === 'docx') {
            const doc = generateDocxObject(data);
            const blob = await Packer.toBlob(doc);
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${fileName}.docx`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } else if (format === 'txt') {
            const textContent = generatePlainText(data);
            const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${fileName}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }

    } catch (e) {
        console.error("Failed to export file:", e);
        alert(`Ocorreu um erro ao exportar como ${format.toUpperCase()}.`);
    } finally {
        setExportingFormat(null);
    }
  };

  return (
    // Reduzido padding do container pai para maximizar espaço na tela
    <div className="text-gray-800 dark:text-gray-200">
      
      {/* Template de Impressão Oculto */}
      <div className="absolute left-[-9999px] top-0 overflow-hidden">
        <LessonPlanPrintTemplate ref={printRef} data={data} />
      </div>

      <div className='bg-white dark:bg-gray-900 p-4'>
          <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow-lg mb-6">
            <h2 className="text-3xl font-bold text-emerald-800 dark:text-emerald-300 mb-2">{plano_aula.titulo}</h2>
            <p className="text-gray-600 dark:text-gray-400">{plano_aula.serie_turma} - {plano_aula.componente_curricular}</p>
            <div className="mt-4 flex flex-wrap gap-4 text-sm">
                <span className="bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 px-3 py-1 rounded-full">{plano_aula.duracao_total_min} min</span>
                <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full">{plano_aula.numero_de_aulas} aula(s)</span>
            </div>
          </div>

          <Section title="Fundamentação Pedagógica" defaultOpen={true}>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-700 dark:text-gray-300">Competência Específica</h4>
                <p className="mt-1 text-gray-600 dark:text-gray-400">
                    <strong className="font-mono bg-gray-100 dark:bg-gray-700 p-1 rounded-md text-emerald-600 dark:text-emerald-400">{plano_aula.competencia_especifica.codigo}</strong>: {plano_aula.competencia_especifica.texto}
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-700 dark:text-gray-300">Habilidades</h4>
                <ul className="list-disc list-inside mt-1 space-y-2 text-gray-600 dark:text-gray-400">
                  {plano_aula.habilidades.map((h, i) => (
                    <li key={i}>
                        <strong className="font-mono bg-gray-100 dark:bg-gray-700 p-1 rounded-md text-emerald-600 dark:text-emerald-400">{h.codigo}</strong>: {h.texto}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-700 dark:text-gray-300">Objetivos de Aprendizagem</h4>
                <ul className="list-disc list-inside mt-1 space-y-1 text-gray-600 dark:text-gray-400">
                  {plano_aula.objetivos_de_aprendizagem.map((o, i) => <li key={i}>{o}</li>)}
                </ul>
              </div>
              {plano_aula.descritores && plano_aula.descritores.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-700 dark:text-gray-300">Descritor(es)</h4>
                   <ul className="list-disc list-inside mt-1 space-y-2 text-gray-600 dark:text-gray-400">
                      {plano_aula.descritores.map((d, i) => (
                        <li key={i}>
                            <strong className="font-mono bg-gray-100 dark:bg-gray-700 p-1 rounded-md text-emerald-600 dark:text-emerald-400">{d.codigo}</strong>: {d.texto}
                        </li>
                      ))}
                    </ul>
                </div>
              )}
            </div>
          </Section>
          
          <Section title="Metodologia e Atividades" defaultOpen={true}>
            <div className="space-y-6">
              {plano_aula.metodologia.map((etapa, i) => (
                <div key={i} className="border-l-4 border-emerald-500 pl-4">
                  <h4 className="font-bold text-md">{etapa.etapa} <span className="font-normal text-sm text-gray-500 dark:text-gray-400">({etapa.duracao_min} min)</span></h4>
                  <p className="font-semibold text-sm mt-2 text-gray-700 dark:text-gray-300">Atividades:</p>
                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-400">
                    {etapa.atividades.map((a, j) => <li key={j}>{a}</li>)}
                  </ul>
                  {etapa.recursos.length > 0 && (
                    <>
                      <p className="font-semibold text-sm mt-2 text-gray-700 dark:text-gray-300">Recursos:</p>
                      <p className="text-gray-600 dark:text-gray-400 italic text-sm">{etapa.recursos.join(', ')}</p>
                    </>
                  )}
                </div>
              ))}
            </div>
          </Section>
          
          <Section title="Avaliação">
            <div className="space-y-4">
                <div>
                    <h4 className="font-semibold text-gray-700 dark:text-gray-300">Critérios de Avaliação</h4>
                    <ul className="list-disc list-inside mt-1 space-y-1 text-gray-600 dark:text-gray-400">
                    {plano_aula.estrategia_de_avaliacao.criterios.map((c, i) => <li key={i}>{c}</li>)}
                    </ul>
                </div>
                <div>
                    <h4 className="font-semibold text-gray-700 dark:text-gray-300">Instrumentos</h4>
                    <p className="mt-1 text-gray-600 dark:text-gray-400">{plano_aula.estrategia_de_avaliacao.instrumentos.join(', ')}</p>
                </div>
            </div>
          </Section>

          <Section title="Recursos e Adaptações">
            <div className="space-y-4">
                <div>
                    <h4 className="font-semibold text-gray-700 dark:text-gray-300">Material de Apoio</h4>
                    <ul className="list-disc list-inside mt-1 space-y-1 text-gray-600 dark:text-gray-400">
                        {plano_aula.material_de_apoio.map((m, i) => (
                            <li key={i}>[{m.tipo}] {m.titulo}: <a href={m.link} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline break-all">{m.link}</a></li>
                        ))}
                    </ul>
                </div>
                <div>
                    <h4 className="font-semibold text-gray-700 dark:text-gray-300">Adaptações para Alunos com NEE</h4>
                    <ul className="list-disc list-inside mt-1 space-y-1 text-gray-600 dark:text-gray-400">
                        {plano_aula.adapitacoes_nee.map((a, i) => <li key={i}>{a}</li>)}
                    </ul>
                </div>
            </div>
          </Section>

          <Section title="Observações">
            <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{plano_aula.observacoes}</p>
          </Section>
      </div>
      <div className="mt-8 text-center">
        <div className="relative inline-block text-left">
          <div>
            <button
              type="button"
              onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
              disabled={!!exportingFormat}
              className="inline-flex justify-center w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-800 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-wait"
            >
              {exportingFormat ? `Exportando ${exportingFormat.toUpperCase()}...` : 'Salvar ou Exportar'}
              <svg className="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          {isExportMenuOpen && (
            <div className="origin-bottom-right absolute right-0 bottom-full mb-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
              <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                <a href="#" onClick={(e) => { e.preventDefault(); handleSaveToSheets(); }} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600" role="menuitem">Salvar no Google Sheets 💾</a>
                <div className="border-t border-gray-200 dark:border-gray-600 my-1"></div>
                <a href="#" onClick={(e) => { e.preventDefault(); handleExport('pdf'); }} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600" role="menuitem">Exportar como PDF (Design Limpo)</a>
                <a href="#" onClick={(e) => { e.preventDefault(); handleExport('docx'); }} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600" role="menuitem">Exportar como DOCX</a>
                <a href="#" onClick={(e) => { e.preventDefault(); handleExport('txt'); }} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600" role="menuitem">Exportar como TXT</a>
                <div className="border-t border-gray-200 dark:border-gray-600 my-1"></div>
                <a href="#" onClick={(e) => { e.preventDefault(); handleExportToGoogleDocs(); }} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600" role="menuitem">Exportar para GDocs (PDF) ✨</a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LessonPlanDisplay;
