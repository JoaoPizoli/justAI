document.addEventListener('DOMContentLoaded', function() {
    // Função para gerar controle de cache dinâmico
    function getVersionParam() {
        // Usar a data atual como parâmetro de versão para evitar cache
        return '?v=' + new Date().getTime();
    }

    // Função para redirecionar com controle de cache
    function redirectWithNoCache(url) {
        window.location.href = url + getVersionParam();
    }

    document.body.classList.add('fade-in');
    
    const loadingOverlay = document.getElementById('loading-overlay');
    loadingOverlay.classList.add('d-none');
    loadingOverlay.style.opacity = '0';

    sessionStorage.removeItem('searchData');
    sessionStorage.removeItem('apiResponse');

    // Section toggle
    const sectionTitles = document.querySelectorAll('.section-title');
    sectionTitles.forEach(title => {
        title.addEventListener('click', function() {
            this.classList.toggle('collapsed');
            const content = this.nextElementSibling;
            content.style.display = content.style.display === 'none' ? 'block' : 'none';
        });
    });
    
    const form = document.getElementById('searchForm');
    const inputs = document.querySelectorAll('input:not(.tribunal-input), textarea, select');
    const tribunalInputs = document.querySelectorAll('.tribunal-input');
    const todosCheckbox = document.getElementById('todos');
    const selectedCount = document.getElementById('selectedCount');
    const dropdownButton = document.querySelector('.tribunal-dropdown-btn');
    const tribunalOptions = document.querySelectorAll('.tribunal-option .tribunal-input');
    const searchInput = document.querySelector('.tribunal-search input');
    const backdrop = document.getElementById('dropdown-backdrop');
    const dropdownMenu = document.querySelector('.tribunal-dropdown-menu');

    const allTribunals = ['stf', 'stj', 'tst', 'tse', 'stm', 'tcu', 'tnu', 'tru', 'cnj', 'carf', 'tj', 'tfr', 'trt', 'tre', 'tjm', 'tce'];

    // Dicionário de nomes completos para os tribunais
    const tribunalNames = {
        'stf': 'Supremo Tribunal Federal (STF)',
        'stj': 'Supremo Tribunal de Justiça (STJ)',
        'tst': 'Tribunal Superior do Trabalho (TST)',
        'tse': 'Tribunal Superior Eleitoral (TSE)',
        'stm': 'Superior Tribunal Militar (STM)',
        'tcu': 'Tribunal de Contas da União (TCU)',
        'tnu': 'Turma Nacional de Uniformização (TNU)',
        'tru': 'Turma Regional de Uniformização (TRU)',
        'cnj': 'Conselho Nacional de Justiça (CNJ)',
        'carf': 'Conselho Administrativo de Recursos Fiscais (CARF)',
        'tj': 'Tribunal de Justiça (TJ)',
        'tfr': 'Tribunal Federal Regional (TFR)',
        'trt': 'Tribunal Regional do Trabalho (TRT)',
        'tre': 'Tribunal Regional Eleitoral (TRE)',
        'tjm': 'Tribunal de Justiça Militar (TJM)',
        'tce': 'Tribunal de Contas do Estado (TCE)'
    };

    // Agrupar tribunais para criar separadores
    const tribunalGroups = [
        { name: "Tribunais Superiores", ids: ['stf', 'stj', 'tst', 'tse', 'stm'] },
        { name: "Tribunais Especiais", ids: ['tcu', 'tnu', 'tru', 'cnj', 'carf'] },
        { name: "Tribunais Regionais/Estaduais", ids: ['tj', 'tfr', 'trt', 'tre', 'tjm', 'tce'] }
    ];
    
    // Adicionar separadores entre grupos de tribunais
    function addTribunalSeparators() {
        const tribunalsContainer = document.querySelector('.tribunal-options');
        if (!tribunalsContainer) return;

        // Remover os tribunais existentes, exceto a opção "Selecionar Todos"
        const allOption = document.querySelector('.select-all-option');
        tribunalsContainer.innerHTML = '';
        tribunalsContainer.appendChild(allOption);
        
        // Adicionar grupos com separadores
        tribunalGroups.forEach((group, index) => {
            // Adicionar separador com texto clicável para todos os grupos
            const separator = document.createElement('div');
            separator.className = 'tribunal-separator';
            separator.innerHTML = `<hr><span class="separator-text">${group.name}</span><hr>`;
            tribunalsContainer.appendChild(separator);
            
            // Adicionar evento de clique no separador
            separator.addEventListener('click', function() {
                const checksInGroup = group.ids.map(id => document.getElementById(id));
                // Verificar se todos estão selecionados para alternar
                const allChecked = checksInGroup.every(check => check && check.checked);
                checksInGroup.forEach(check => {
                    if (check) check.checked = !allChecked;
                });
                
                // Atualizar estado global
                const allTribunalCheckboxes = Array.from(document.querySelectorAll('.tribunal-option .tribunal-input')).filter(input => input.id !== 'todos');
                todosCheckbox.checked = allTribunalCheckboxes.every(input => input.checked);
                updateTribunalState();
                validateTribunals();
                validateForm();
            });
            
            // Adicionar tribunais do grupo
            group.ids.forEach(id => {
                const option = document.createElement('div');
                option.className = 'tribunal-option';
                option.innerHTML = `
                    <input type="checkbox" id="${id}" class="tribunal-input" value="${id}">
                    <label for="${id}" class="tribunal-label">${tribunalNames[id]}</label>
                `;
                tribunalsContainer.appendChild(option);
                
                // Adicionar evento de mudança para cada checkbox
                const checkbox = option.querySelector('input');
                checkbox.addEventListener('change', function() {
                    const tribunalCheckboxes = Array.from(document.querySelectorAll('.tribunal-option .tribunal-input')).filter(input => input.id !== 'todos');
                    const allChecked = tribunalCheckboxes.every(input => input.checked);
                    const anyChecked = tribunalCheckboxes.some(input => input.checked);
                    
                    todosCheckbox.checked = allChecked;
                    updateTribunalState();
                    validateTribunals();
                    validateForm();
                });
            });
        });
    }
    
    // Aplicar os separadores quando o documento estiver pronto
    addTribunalSeparators();

    if (dropdownButton) {
        dropdownButton.textContent = 'Selecione...';
    }

    if (todosCheckbox) {
        todosCheckbox.checked = false;
        updateTribunalState();
    }

    function updateTribunalState() {
        const tribunalCheckboxes = Array.from(document.querySelectorAll('.tribunal-option .tribunal-input')).filter(input => input.id !== 'todos');
        const checkedTribunals = tribunalCheckboxes.filter(input => input.checked);
        const checkedCount = checkedTribunals.length;

        if (!dropdownButton || !selectedCount) return;

        if (todosCheckbox.checked) {
            dropdownButton.textContent = 'Todos os Tribunais';
            selectedCount.textContent = 'Todos os tribunais selecionados';
        } else {
            if (checkedCount === 0) {
                dropdownButton.textContent = 'Selecione...';
                selectedCount.textContent = 'Nenhum tribunal selecionado';
            } else {
                const tribunalText = checkedCount === 1 ? 'tribunal' : 'tribunais';
                selectedCount.textContent = `${checkedCount} ${tribunalText} selecionado${checkedCount > 1 ? 's' : ''}`;

                if (checkedCount <= 2) {
                    dropdownButton.textContent = checkedTribunals
                        .map(input => input.value.toUpperCase())
                        .join(', ');
                } else {
                    dropdownButton.textContent = `${checkedCount} tribunais selecionados`;
                }
            }
        }

        if (selectedCount) {
            selectedCount.style.animation = 'none';
            selectedCount.offsetHeight; 
            selectedCount.style.animation = 'fadeIn 0.3s ease-in-out';
        }
    }

    if (todosCheckbox) {
        todosCheckbox.addEventListener('change', function() {
            const tribunalCheckboxes = Array.from(document.querySelectorAll('.tribunal-option .tribunal-input')).filter(input => input.id !== 'todos');
            
            // Se o checkbox "todos" for marcado, marcar todos os outros checkboxes
            tribunalCheckboxes.forEach(input => {
                input.checked = todosCheckbox.checked;
            });
            
            updateTribunalState();
            validateTribunals();
            validateForm();
        });
    }

    // Corrigir a gestão do dropdown
    function handleDropdownToggle(e) {
        e.preventDefault();
        e.stopPropagation();
        
        if (!dropdownMenu) return;
        
        const isOpen = dropdownMenu.classList.contains('show');
        dropdownMenu.style.display = isOpen ? 'none' : 'block';
        dropdownMenu.classList.toggle('show');
        
        if (dropdownButton) {
            dropdownButton.setAttribute('aria-expanded', !isOpen);
        }

        if (backdrop && window.innerWidth <= 768) {
            backdrop.style.display = isOpen ? 'none' : 'block';
            backdrop.classList.toggle('show');
        }
    }

    if (dropdownButton) {
        dropdownButton.addEventListener('click', handleDropdownToggle);
    }

    document.addEventListener('click', function(e) {
        if (dropdownMenu && dropdownButton && 
            !dropdownMenu.contains(e.target) && 
            !dropdownButton.contains(e.target)) {

            dropdownMenu.style.display = 'none';
            dropdownMenu.classList.remove('show');

            if (backdrop) {
                backdrop.style.display = 'none';
                backdrop.classList.remove('show');
            }

            if (dropdownButton) {
                dropdownButton.setAttribute('aria-expanded', 'false');
            }
        }
    });

    if (dropdownMenu) {
        dropdownMenu.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }

    if (backdrop) {
        backdrop.addEventListener('click', function() {
            if (dropdownMenu) {
                dropdownMenu.style.display = 'none';
                dropdownMenu.classList.remove('show');
            }
            backdrop.style.display = 'none';
            backdrop.classList.remove('show');

            if (dropdownButton) {
                dropdownButton.setAttribute('aria-expanded', 'false');
            }
        });
    }

    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.style.transform = 'translateY(-2px)';
            this.parentElement.style.transition = 'transform 0.3s ease';
        });

        input.addEventListener('blur', function() {
            this.parentElement.style.transform = 'translateY(0)';
        });
    });

    let currentRequestController = null;
    let requestInProgress = false;

    window.addEventListener("beforeunload", function(e) {
        if (requestInProgress) {
            e.preventDefault();
            e.returnValue = "A consulta está em andamento. Recarregar a página cancelará a requisição. Deseja continuar?";
        }
    });

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const topic = document.getElementById('topic').value.trim();
        const description = document.getElementById('description').value.trim();
        
        // Validação rigorosa para todos os campos obrigatórios
        if (!topic) {
            alert('Por favor, preencha o campo Tópico.');
            document.getElementById('topic').focus();
            return;
        }
        
        if (!description) {
            alert('Por favor, preencha o campo Descrição.');
            document.getElementById('description').focus();
            return;
        }

        const selectedTribunals = todosCheckbox.checked 
            ? allTribunals 
            : Array.from(document.querySelectorAll('.tribunal-option .tribunal-input:checked'))
                .map(input => input.value)
                .filter(value => value !== undefined);

        if (selectedTribunals.length === 0) {
            alert('Por favor, selecione ao menos um Tribunal.');
            dropdownButton.focus();
            return;
        }
        
        // Continua com a submissão após validação completa
        loadingOverlay.style.opacity = '0';
        loadingOverlay.classList.remove('d-none');
        document.body.style.overflow = 'hidden'; 
        loadingOverlay.offsetHeight;
        loadingOverlay.style.opacity = '1';
        loadingOverlay.style.transition = 'opacity 0.3s ease';

        const formData = {
            topic: topic,
            description: description,
            tribunals: selectedTribunals,
            source: document.getElementById('source').value
        };
        
        sessionStorage.setItem('searchData', JSON.stringify(formData));
        currentRequestController = new AbortController();
        const signal = currentRequestController.signal;
        requestInProgress = true;
        
        fetch('http://172.16.5.57:5000/api/data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                topico: topic, 
                descricao: description, 
                tribunais: selectedTribunals, 
                ordenar: document.getElementById('source').value
            }),
            signal: signal
        })
        .then(response => {
            // Verificar se a resposta é ok (código 200-299)
            if (!response.ok) {
                // Para erros HTTP, lemos o conteúdo como texto primeiro
                return response.text().then(text => {
                    try {
                        // Tentamos converter para JSON se possível
                        const errorData = JSON.parse(text);
                        throw new Error(errorData.error || 'Erro no servidor');
                    } catch (jsonError) {
                        // Se não conseguir analisar como JSON, use o texto bruto
                        throw new Error(`Erro ${response.status}: ${text || response.statusText}`);
                    }
                });
            }
            return response.json();
        })
        .then(data => {
            requestInProgress = false;
            sessionStorage.setItem('apiResponse', JSON.stringify(data));
            
            // Store the URLs from backend in searchData
            const searchData = JSON.parse(sessionStorage.getItem('searchData'));
            
            // Handle first URL
            if (data.url) {
                searchData.url = data.url;
            } else {
                // If backend doesn't provide URL directly, check if it's part of the response
                if (searchData.url) {
                    // URL already exists in searchData, maintain it
                } else {
                    // If no URL is provided anywhere, store a default message
                    searchData.url = 'URL não disponível';
                }
            }

            // Handle second URL - store in the same searchData object
            if (data.url2) {
                searchData.url2 = data.url2;
            } else {
                // If backend doesn't provide URL directly, check if it's part of the response
                if (searchData.url2) {
                    // URL already exists in searchData, maintain it
                } else {
                    // If no URL is provided anywhere, store a default message
                    searchData.url2 = 'URL não disponível';
                }
            }

            // Save the updated searchData with both URLs
            sessionStorage.setItem('searchData', JSON.stringify(searchData));

            setTimeout(() => {
                redirectWithNoCache('result.html');
            }, 1000);
        })
        .catch(error => {
            requestInProgress = false;
            console.error('Erro:', error);
            
            // Se o erro for de cancelamento, podemos ignorar
            if (error.name === "AbortError") {
                console.log("Requisição cancelada");
            } else {
                // Para outros erros, exibir mensagem amigável
                alert(`Ocorreu um erro na requisição: ${error.message}`);
            }
            
            loadingOverlay.style.opacity = '0';
            setTimeout(() => {
                loadingOverlay.classList.add('d-none');
                document.body.style.overflow = 'auto';
            }, 300);
        });
    });


    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            const options = document.querySelectorAll('.tribunal-option');
            const separators = document.querySelectorAll('.tribunal-separator, .tribunal-group-title');
            
            // Ocultar/mostrar separadores baseado na busca
            let visibleOptions = 0;
            let lastVisibleGroupIndex = -1;
            
            options.forEach(option => {
                const label = option.querySelector('.tribunal-label')?.textContent.toLowerCase();
                if (label && label.includes(searchTerm)) {
                    option.style.display = '';
                    visibleOptions++;

                    // Determinar a qual grupo este tribunal pertence
                    const tribunalId = option.querySelector('.tribunal-input')?.id;
                    if (tribunalId) {
                        tribunalGroups.forEach((group, index) => {
                            if (group.ids.includes(tribunalId)) {
                                lastVisibleGroupIndex = Math.max(lastVisibleGroupIndex, index);
                            }
                        });
                    }
                } else {
                    option.style.display = 'none';
                }
            });
            
            // Mostrar/ocultar separadores relevantes
            separators.forEach((separator, index) => {
                if (visibleOptions === 0 || index > lastVisibleGroupIndex) {
                    separator.style.display = 'none';
                } else {
                    separator.style.display = '';
                }
            });
        });

        searchInput.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }

    if (dropdownButton) {
        dropdownButton.addEventListener('click', function() {
            if (dropdownMenu && !dropdownMenu.classList.contains('show')) {
                if (searchInput) {
                    searchInput.value = '';
                }
                document.querySelectorAll('.tribunal-option').forEach(option => {
                    option.style.display = '';
                });
                document.querySelectorAll('.tribunal-separator, .tribunal-group-title').forEach(sep => {
                    sep.style.display = '';
                });
            }
        });
    }

    // Adicionar estilos CSS para os separadores
    const style = document.createElement('style');
    style.textContent = `
        .tribunal-separator {
            display: flex;
            align-items: center;
            margin: 10px 0;
            cursor: pointer;
        }
        
        .tribunal-separator hr {
            flex: 1;
            height: 1px;
            background-color: #ccc;
            border: none;
        }
        
        .separator-text {
            padding: 0 10px;
            color: #666;
            font-size: 12px;
        }
        
        .tribunal-separator:hover .separator-text {
            color: #0088cc;
        }
        
        .tribunal-separator:hover hr {
            background-color: #0088cc;
        }
        
        .tribunal-group-title {
            margin: 5px 0;
            font-size: 12px;
            color: #666;
            font-weight: bold;
            padding-left: 5px;
        }
    `;
    document.head.appendChild(style);

    // Validation for topic and description inputs
    const topicInput = document.getElementById('topic');
    const descriptionInput = document.getElementById('description');
    const tribunalDropdownBtn = document.querySelector('.tribunal-dropdown-btn');

    function validateInput(input) {
        if (input && input.value.trim()) {
            input.classList.add('valid');
        } else if (input) {
            input.classList.remove('valid');
        }
    }

    function validateTribunals() {
        if (!tribunalDropdownBtn) return;

        if (todosCheckbox.checked || Array.from(document.querySelectorAll('.tribunal-option .tribunal-input')).some(input => input.checked && input.id !== 'todos')) {
            tribunalDropdownBtn.classList.add('valid');
        } else {
            tribunalDropdownBtn.classList.remove('valid');
        }
    }

    // Add input event listeners
    if (topicInput) {
        topicInput.addEventListener('input', () => validateInput(topicInput));
    }
    if (descriptionInput) {
        descriptionInput.addEventListener('input', () => validateInput(descriptionInput));
    }

    // Add validation to tribunal selection
    if (todosCheckbox) {
        todosCheckbox.addEventListener('change', validateTribunals);
    }
    document.querySelectorAll('.tribunal-option .tribunal-input').forEach(input => {
        if (input.id !== 'todos') {
            input.addEventListener('change', validateTribunals);
        }
    });

    // Initial validation
    if (topicInput) validateInput(topicInput);
    if (descriptionInput) validateInput(descriptionInput);
    validateTribunals();

    // Adicionar validação ao botão de submit
    function validateForm() {
        if (!topicInput || !descriptionInput) return;

        const topic = topicInput.value.trim();
        const description = descriptionInput.value.trim();
        const hasTribunals = todosCheckbox && todosCheckbox.checked || 
            Array.from(document.querySelectorAll('.tribunal-option .tribunal-input:checked'))
                .filter(input => input.id !== 'todos').length > 0;

        const submitButton = document.querySelector('button[type="submit"]');
        if (submitButton) {
            if (topic && description && hasTribunals) {
                submitButton.removeAttribute('disabled');
            } else {
                submitButton.setAttribute('disabled', 'disabled');
            }
        }
    }

    // Adicionar listeners para validação em tempo real
    if (topicInput) {
        topicInput.addEventListener('input', validateForm);
    }
    if (descriptionInput) {
        descriptionInput.addEventListener('input', validateForm);
    }

    document.querySelectorAll('.tribunal-option .tribunal-input').forEach(input => {
        input.addEventListener('change', validateForm);
    });

    if (todosCheckbox) {
        todosCheckbox.addEventListener('change', validateForm);
    }

    // Initial validation
    if (topicInput) validateInput(topicInput);
    if (descriptionInput) validateInput(descriptionInput);
    validateTribunals();
    validateForm();

    // Auto-focus next field functionality
    const sourceSelect = document.getElementById('source');

    // Define a ordem dos elementos focáveis
    const focusableElements = [
        topicInput, 
        descriptionInput, 
        tribunalDropdownBtn, 
        sourceSelect
    ].filter(el => el !== null);

    // Variável para controlar se o usuário mudou manualmente o foco
    let preventAutoFocus = false;

    // Função para focar no próximo elemento apenas quando apropriado
    function focusNextElement(currentElement) {
        // Se o usuário mudou manualmente o foco, não fazer nada
        if (preventAutoFocus) {
            return;
        }

        const currentIndex = focusableElements.indexOf(currentElement);
        if (currentIndex !== -1 && currentIndex < focusableElements.length - 1) {
            const nextElement = focusableElements[currentIndex + 1];
            nextElement.focus();
        }
    }

    // Capturar eventos de mousedown para detectar quando o usuário está ativamente
    // mudando o foco com mouse/clique
    document.addEventListener('mousedown', function(e) {
        const clickedElement = e.target;

        // Verificar se o elemento clicado é um dos campos de entrada ou relacionado a eles
        if (
            (topicInput && clickedElement === topicInput) || 
            (descriptionInput && clickedElement === descriptionInput) || 
            (tribunalDropdownBtn && clickedElement === tribunalDropdownBtn) ||
            (sourceSelect && clickedElement === sourceSelect) ||
            clickedElement.closest('.form-group') // Para labels e outros elementos dentro do grupo do formulário
        ) {
            preventAutoFocus = true;

            // Resetar a flag após um curto período para permitir autofoco em eventos futuros
            setTimeout(() => {
                preventAutoFocus = false;
            }, 500);
        }
    });

    // Adicionar eventos de blur para os elementos de entrada
    if (topicInput) {
        topicInput.addEventListener('blur', function() {
            if (this.value.trim() && !preventAutoFocus) {
                setTimeout(() => focusNextElement(this), 100);
            }
        });
    }

    if (descriptionInput) {
        descriptionInput.addEventListener('blur', function() {
            if (this.value.trim() && !preventAutoFocus) {
                setTimeout(() => focusNextElement(this), 100);
            }
        });
    }

    if (tribunalDropdownBtn) {
        tribunalDropdownBtn.addEventListener('blur', function(e) {
            // Verificar se não estamos clicando dentro do dropdown
            const tribunalDropdown = document.querySelector('.tribunal-dropdown-menu');
            if (tribunalDropdown && !tribunalDropdown.contains(document.activeElement) && 
                Array.from(document.querySelectorAll('.tribunal-option .tribunal-input'))
                .some(input => input.checked) && 
                !preventAutoFocus) {
                setTimeout(() => focusNextElement(this), 100);
            }
        });
    }

    // Modificar os links de redirecionamento para usar a função de controle de cache
    document.querySelectorAll('a[href="index.html"]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            redirectWithNoCache('index.html');
        });
    });

    document.querySelectorAll('a[href="result.html"]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            redirectWithNoCache('result.html');
        });
    });
});