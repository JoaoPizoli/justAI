document.addEventListener('DOMContentLoaded', function() {
  const searchParamsDiv = document.getElementById('searchParams');
  const resultContentDiv = document.getElementById('resultContent');
  const searchData = JSON.parse(sessionStorage.getItem('searchData'));
  const apiResponse = JSON.parse(sessionStorage.getItem('apiResponse'));

  if (searchData) {

    const tribunalsText = searchData.tribunals && searchData.tribunals.length > 0
      ? (searchData.tribunals[0] === 'todos' ? 'Todos os Tribunais' : searchData.tribunals.join(', ').toUpperCase())
      : '';

    const orderingText = searchData.source === 'recent' ? 'Mais Recentes' : 'Mais Relevantes';

    const url = searchData.url || 'Não disponível';
    const urlDisplay = url !== 'Não disponível' 
      ? `<a href="${url}" target="_blank" class="url-link">${url}</a>` 
      : 'Não disponível';

    const url2 = searchData.url2 || 'Não disponível';
    const urlDisplay2 = url2 !== 'Não disponível' 
      ? `<a href="${url2}" target="_blank" class="url-link">${url2}</a>` 
      : 'Não disponível';

    searchParamsDiv.innerHTML = `
      <div class="tribunal-selection result-card">
        <div><strong>Tópico:</strong> <span class="param-value">${searchData.topic || ''}</span></div>
        <div><strong>Tribunal:</strong> <span class="param-value">${tribunalsText}</span></div>
        <div><strong>Ordenação:</strong> <span class="param-value">${orderingText}</span></div>
        <div><strong>Jurisprudências Relacionadas(Tópico gerado por AI):</strong> <span class="param-value status-text">${urlDisplay}</span></div>
        <div><strong>Jurisprudências Relacionadas(Tópico passado pelo usuário):</strong> <span class="param-value status-text">${urlDisplay2}</span></div>
      </div>
    `;

    if (apiResponse) {
      let conteudo = apiResponse.peticao || 'Nenhum conteúdo disponível';
      conteudo = conteudo.replace(/&&&&/g, '<input type="text" class="campo-editavel" placeholder="Preencha Aqui" />');
      conteudo = marked.parse(conteudo);
      resultContentDiv.innerHTML = `
        <div class="tribunal-selection" style="max-height: none; overflow: visible;">
          ${conteudo}
        </div>
      `;

      const inputs = document.querySelectorAll('.campo-editavel');
      inputs.forEach(input => {
        const resizeInput = (el) => {
          const span = document.createElement('span');
          span.style.visibility = 'hidden';
          span.style.whiteSpace = 'pre';
          span.style.font = window.getComputedStyle(el).font;
          span.innerText = el.value || el.placeholder;
          document.body.appendChild(span);
          let newWidth = span.offsetWidth + 10; 
          document.body.removeChild(span);
          newWidth = Math.max(newWidth, 80);  
          newWidth = Math.min(newWidth, 300); 
          el.style.width = newWidth + 'px';
        };

        resizeInput(input);

        input.addEventListener('input', () => resizeInput(input));

        input.addEventListener('focus', function() {
          this.placeholder = '';
          resizeInput(this);
        });

        input.addEventListener('blur', function() {
          if (this.value.trim() === '') {
            this.placeholder = 'Preencha Aqui';
          }
          resizeInput(this);
        });
      });
    } else {
      resultContentDiv.innerHTML = `
        <div class="tribunal-selection result-card">
          <h4>Análise em andamento</h4>
          <p>Estamos processando sua consulta com base nos seguintes critérios:</p>
          <ul>
            <li>Tópico especificado</li>
            <li>Descrição fornecida</li>
            <li>Jurisprudência do(s) tribunal(is) selecionado(s)</li>
          </ul>
          <p class="mb-0">O resultado será exibido aqui em breve.</p>
        </div>
      `;
    }
  } else {
    searchParamsDiv.innerHTML = `
      <div class="tribunal-selection result-card">
        <h4>Nenhum parâmetro encontrado</h4>
        <p>Por favor, retorne à página inicial para realizar uma nova consulta.</p>
      </div>
    `;
  }

  const newSearchButton = document.querySelector('.submit-btn:last-of-type'); 
  if (newSearchButton) {
    newSearchButton.addEventListener('click', function() {
      sessionStorage.removeItem('searchData');
      sessionStorage.removeItem('apiResponse');
      document.getElementById('loading-overlay').classList.add('d-none');
    });
  }
});

function downloadDocument(format) {
  const loadingOverlay = document.getElementById('loading-overlay');
  loadingOverlay.classList.remove('d-none');


  const contentContainer = document.querySelector('#resultContent .tribunal-selection');
  if (!contentContainer) {
      alert('Nenhum conteúdo disponível para download.');
      loadingOverlay.classList.add('d-none');
      return;
  }

  const contentClone = contentContainer.cloneNode(true);


  contentClone.querySelectorAll('input.campo-editavel').forEach(input => {
      const span = document.createElement('span');
      span.textContent = input.value || input.placeholder;
      input.parentNode.replaceChild(span, input);
  });


  const content = contentClone.innerHTML;
  const searchData = JSON.parse(sessionStorage.getItem('searchData'));


  const date = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
  const topic = searchData?.topic || 'consulta';
  const filename = `${topic}-${date}`;

  try {
    if (format === 'pdf') {
      const tempContainer = document.createElement('div');
      tempContainer.innerHTML = `
          <html>
          <head>
              <meta charset="UTF-8">
              <style>
                  body {
                      font-family: Arial, sans-serif;
                      padding: 20px;
                      line-height: 1.5;
                      font-size: 11pt;
                  }
                  .content {
                      max-width: 800px;
                      margin: 0 auto;
                  }
                  p, div, li {
                      margin-bottom: 10px;
                      text-align: justify;
                  }
                  h1, h2, h3, h4, h5, h6 {
                      margin-top: 20px;
                      margin-bottom: 10px;
                      page-break-after: avoid;
                  }
                  ul, ol {
                      padding-left: 20px;
                      margin-bottom: 20px;
                  }
                  table {
                      width: 100%;
                      border-collapse: collapse;
                      margin-bottom: 20px;
                  }
                  td, th {
                      border: 1px solid #ddd;
                      padding: 8px;
                  }
                  /* Evita quebras de página indesejadas */
                  p, h2, h3 {
                      page-break-inside: avoid;
                  }
                  /* Controle melhor de quebras de página */
                  .page-break {
                      page-break-before: always;
                  }
              </style>
          </head>
          <body>
              <div class="content">${content}</div>
          </body>
          </html>
      `;

      const element = tempContainer;
      const opt = {
          margin: [0.75, 0.75, 0.75, 0.75],
          filename: `${filename}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: {
              scale: 2,
              useCORS: true,
              letterRendering: true,
              logging: false,
              allowTaint: false,
              scrollY: 0
          },
          jsPDF: {
              unit: 'in',
              format: 'letter',
              orientation: 'portrait',
              compress: true,
              precision: 16
          },
          pagebreak: { 
              mode: ['avoid-all', 'css', 'legacy'],
              before: '.page-break',
              avoid: ['tr', 'td', 'li', 'img', 'h2', 'h3', 'h4']
          },
          enableLinks: true,
          pdfCallback: function(pdf) {
              pdf.setProperties({
                  maxPageLength: 100000000 
              });
          }
      };

      html2pdf()
        .set(opt)
        .from(element)
        .toPdf()
        .get('pdf')
        .then(function(pdf) {
            // Otimizar PDF
            pdf.setProperties({
                title: filename,
                subject: 'Documento Jurídico',
                creator: 'JustAI'
            });
            return pdf;
        })
        .save()
        .then(() => {
            loadingOverlay.classList.add('d-none');
        })
        .catch(error => {
            console.error('Erro ao gerar PDF:', error);
            loadingOverlay.classList.add('d-none');
            alert('Erro ao gerar o PDF. Por favor, tente novamente.');
        });

    } else if (format === 'docx') {
      const preHtml = `
        <html>
          <head>
            <meta charset="utf-8">
            <title>Documento Exportado</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                padding: 40px; 
                line-height: 1.6;
                color: #333333;
                font-size: 11pt;
              }
              .content { 
                max-width: 800px; 
                margin: 0 auto;
              }
              p { 
                margin-bottom: 1em;
                text-align: justify;
              }
              h1, h2, h3, h4, h5, h6 {
                line-height: 1.3;
                margin-top: 2em;
                margin-bottom: 1.2em;
                color: #000000;
                page-break-after: avoid;
              }
              h1 { font-size: 16pt; }
              h2 { font-size: 14pt; }
              h3 { font-size: 12pt; }
              h4, h5, h6 { font-size: 11pt; }
              ul, ol {
                margin-bottom: 1em;
                padding-left: 2em;
              }
              li {
                margin-bottom: 0.5em;
                text-align: justify;
              }
              table {
                margin: 1.5em 0;
                width: 100%;
                border-collapse: collapse;
              }
              td, th {
                padding: 8px;
                border: 1px solid #ddd;
                font-size: 11pt;
              }
            </style>
          </head>
          <body>
            <div class="content">
      `;
      const postHtml = `
            </div>
          </body>
        </html>
      `;
      const html = preHtml + content + postHtml;

      try {
        console.log('Checking if window.htmlDocx is defined:', window.htmlDocx); 
        if (!window.htmlDocx) { 
            alert('html-docx-js library not loaded! DOCX download cannot proceed.');
            loadingOverlay.classList.add('d-none');
            return; 
        }
        const converted = window.htmlDocx.asBlob(html); 
        const url = URL.createObjectURL(converted);
        const downloadLink = document.createElement("a");
        downloadLink.href = url;
        downloadLink.download = `${filename}.docx`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        loadingOverlay.classList.add('d-none');
      } catch (error) {
        console.error('Erro ao gerar DOCX:', error);
        loadingOverlay.classList.add('d-none');
        alert('Erro ao gerar o arquivo DOCX. Por favor, tente novamente.');
      }
    }
  } catch (error) {
    console.error('Error downloading document:', error);
    loadingOverlay.classList.add('d-none');
    alert('Erro ao fazer o download do documento. Por favor, tente novamente.');
  }
}

function installDocument() {
  const loadingOverlay = document.getElementById('loading-overlay');
  loadingOverlay.classList.remove('d-none');
  
  const selectedFormat = document.getElementById('formatSelect').value;
  
  downloadDocument(selectedFormat);
}