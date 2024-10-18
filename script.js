let players = JSON.parse(localStorage.getItem('players')) || [];
    let currentUser = null;
    const maxDays = 15;

    document.getElementById('show-register').addEventListener('click', function () {
      document.getElementById('login-container').style.display = 'none';
      document.getElementById('register-container').style.display = 'block';
    });

    document.getElementById('show-login').addEventListener('click', function () {
      document.getElementById('login-container').style.display = 'block';
      document.getElementById('register-container').style.display = 'none';
    });
    document.getElementById('login-form').addEventListener('submit', function (e) {
      e.preventDefault();
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;

      currentUser = players.find(player => player.username === username && player.password === password);
      if (currentUser) {
        startGame();
      } else {
        alert('Usuário ou senha incorretos!');
      }
    });

    document.getElementById('register-form').addEventListener('submit', function (e) {
      e.preventDefault();
      const newUsername = document.getElementById('new-username').value;
      const newPassword = document.getElementById('new-password').value;

      if (players.find(player => player.username === newUsername)) {
        alert('Nome de usuário já existe!');
      } else {
        currentUser = { username: newUsername, password: newPassword, money: 1000, lifeQuality: 50, day: 1 };
        players.push(currentUser);
        localStorage.setItem('players', JSON.stringify(players));
        startGame();
      }
    });

    function startGame() {
      document.getElementById('login-container').style.display = 'none';
      document.getElementById('register-container').style.display = 'none';
      document.getElementById('game-container').style.display = 'block';
      gameState = {
        money: 1000,
        safe: 0,
        lifeQuality: 50,
        time: 100,
        day: 1,
        currentScene: 'home',
        employees: 0,
        investments: [],
        calendarEvents: []
      };
      updateDisplay();
      updateCalendarEvents();
      showScene(gameState.currentScene);
      initializeSafeControls();
    }


    function endGame() {
        alert('O jogo acabou!');
        currentUser.money = gameState.money;
        currentUser.lifeQuality = gameState.lifeQuality;
        localStorage.setItem('players', JSON.stringify(players));
        showRanking();
        
    }
    
    function showRanking() {
        players.sort((a, b) => {
            if (b.money === a.money) {
                return b.lifeQuality - a.lifeQuality;
            }
            return b.money - a.money;
        });
    
        document.getElementById('game-container').style.display = 'none';
        document.getElementById('ranking-container').style.display = 'block';
    
        const rankingList = document.getElementById('ranking-list');
        rankingList.innerHTML = '';

        players.forEach((player, index) => {
            const listItem = document.createElement('li');

            listItem.textContent = `${index + 1}. ${player.username} - Dinheiro: R$${player.money}, Qualidade de Vida: ${player.lifeQuality}%`;

            if (index === 0) {
                listItem.style.color = 'gold';
                listItem.style.fontWeight = 'bold';
            } else if (index === 1) {
                listItem.style.color = 'silver';
                listItem.style.fontWeight = 'bold';
            } else if (index === 2) {
                listItem.style.color = '#cd7f32';
                listItem.style.fontWeight = 'bold';
            }
    
            rankingList.appendChild(listItem);
        });
        document.getElementById('restart-game').addEventListener('click', function () {
            showRestartConfirmation();
        });
        
    }
    
    function showRestartConfirmation() {
        const modal = document.createElement('div');
        modal.style.position = 'fixed';
        modal.style.left = '0';
        modal.style.top = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        modal.style.display = 'flex';
        modal.style.justifyContent = 'center';
        modal.style.alignItems = 'center';
        
        const content = document.createElement('div');
        content.style.backgroundColor = 'white';
        content.style.padding = '20px';
        content.style.borderRadius = '10px';
        content.style.textAlign = 'center';
        
        const message = document.createElement('p');
        message.textContent = 'Deseja continuar o jogo atual?';
        content.appendChild(message);
        
        const continueButton = document.createElement('button');
        continueButton.textContent = 'Sim';
        continueButton.onclick = () => {
            document.body.removeChild(modal);
            document.getElementById('ranking-container').style.display = 'none';
            document.getElementById('game-container').style.display = 'block';
            showScene(gameState.currentScene);
        };
        content.appendChild(continueButton);

        const logoutButton = document.createElement('button');
        logoutButton.textContent = 'Não';
        logoutButton.onclick = () => {
            resetGameState();
            document.body.removeChild(modal);
            document.getElementById('ranking-container').style.display = 'none';
            document.getElementById('login-container').style.display = 'block';
        };
        content.appendChild(logoutButton);
        
        modal.appendChild(content);
        document.body.appendChild(modal);
    }
    
    function resetGameState() {
        gameState = {
            money: GG_ALL_GAME_CONFIG.initialMoney,
            safe: GG_ALL_GAME_CONFIG.initialSafe,
            lifeQuality: GG_ALL_GAME_CONFIG.initialLifeQuality,
            time: GG_ALL_GAME_CONFIG.initialTime,
            day: 1,
            currentScene: 'home',
            employees: 0,
            investments: [],
            calendarEvents: []
        };

        updateDisplay();
        updateCalendarEvents();
    }
    


    // function endGame() {
    //   alert('O jogo acabou!');
    //   currentUser.money = gameState.money;
    //   currentUser.lifeQuality = gameState.lifeQuality;
    //   localStorage.setItem('players', JSON.stringify(players));
    //   showRanking();
    // }

    // function showRanking() {
    //   document.getElementById('game-container').style.display = 'none';
    //   document.getElementById('ranking-container').style.display = 'block';
    //   const rankingList = document.getElementById('ranking-list');
    //   rankingList.innerHTML = players.map(p => `<li>${p.username} - Dinheiro: R$${p.money}, Qualidade de Vida: ${p.lifeQuality}%</li>`).join('');
    // }

    function endDay() {
      if (gameState.day >= maxDays) {
        endGame();
      }
    }

    let GG_ALL_GAME_CONFIG = {
      initialMoney: 1000,
      initialSafe: 0,
      initialLifeQuality: 50,
      maxLifeQuality: 100,
      minLifeQuality: 0,
      initialTime: 100,
      maxTime: 100,
      timeCost: 20,
      moveCost: 5,
      dayIncrement: 1,
      billDueInterval: 8,
      scenes: [{
          id: 'home',
          emoji: '🏠',
          description: 'Você está em casa. O que deseja fazer?',
          choices: [{
              text: 'Ir ao mercado',
              nextScene: 'market'
            },
            {
              text: 'Ir ao banco',
              nextScene: 'bank'
            },
            {
              text: 'Gerenciar lanchonete',
              nextScene: 'snackBar'
            },
            {
              text: 'Descansar',
              action: 'rest'
            }
          ]
        },
        {
          id: 'market',
          emoji: '🛒',
          description: 'Você está no mercado. O que deseja comprar?',
          choices: [{
              text: 'Comprar comida (R$ 50)',
              action: 'buyFood'
            },
            {
              text: 'Comprar roupas (R$ 100)',
              action: 'buyClothes'
            },
            {
              text: 'Voltar para casa',
              nextScene: 'home'
            }
          ]
        },
        {
          id: 'bank',
          emoji: '🏦',
          description: 'Você está no banco. O que deseja fazer?',
          choices: [{
              text: 'Pagar contas (R$ 200)',
              action: 'payBills'
            },
            {
              text: 'Investir (R$ 100)',
              action: 'invest'
            },
            {
              text: 'Voltar para casa',
              nextScene: 'home'
            }
          ]
        },
        {
          id: 'snackBar',
          emoji: '🍔',
          description: 'Você está na sua lanchonete. Você tem ${gameState.employees} funcionário(s). O que deseja fazer?',
          choices: [{
              text: 'Trabalhar no caixa',
              action: 'workCashier'
            },
            {
              text: 'Contratar funcionário (R$ 500)',
              action: 'hireEmployee'
            },
            {
              text: 'Voltar para casa',
              nextScene: 'home'
            }
          ]
        }
      ],
      tips: [
        "Lembre-se de sempre pagar suas contas em dia para evitar multas!",
        "Compre apenas o necessário para evitar desperdício de dinheiro e alimentos.",
        "Investir seu dinheiro pode trazer retornos nos próximos dias.",
        "Equilibre trabalho e descanso para manter uma boa qualidade de vida.",
        "Contratar funcionários pode aumentar a renda da sua lanchonete, mas também aumenta as despesas."
      ]
    };
    let gameState = {
      money: GG_ALL_GAME_CONFIG.initialMoney,
      safe: GG_ALL_GAME_CONFIG.initialSafe,
      lifeQuality: GG_ALL_GAME_CONFIG.initialLifeQuality,
      time: GG_ALL_GAME_CONFIG.initialTime,
      day: 1,
      currentScene: 'home',
      employees: 0,
      investments: [],
      calendarEvents: []
    };

    function updateDisplay() {
      document.getElementById('money').textContent = gameState.money;
      document.getElementById('safe').textContent = gameState.safe;
      document.getElementById('life-quality').textContent = gameState.lifeQuality;
      document.getElementById('day').textContent = gameState.day;
      document.getElementById('time').textContent = gameState.time;
      document.getElementById('time-fill').style.width = `${gameState.time}%`;
      document.getElementById('employees').textContent = gameState.employees;
      updateMap();
      updateCalendar();
    }

    function initializeSafeControls() {
      const depositButton = document.getElementById('deposit-button');
      const withdrawButton = document.getElementById('withdraw-button');
      const amountInput = document.getElementById('safe-amount');
      depositButton.addEventListener('click', () => {
        const amount = parseInt(amountInput.value);
        if (isNaN(amount) || amount <= 0) {
          showMessage("Por favor, insira um valor válido.");
          return;
        }
        if (amount > gameState.money) {
          showMessage("Você não tem dinheiro suficiente para depositar essa quantia.");
          return;
        }
        gameState.money -= amount;
        gameState.safe += amount;
        updateDisplay();
        showMessage(`Você depositou R$ ${amount} no cofre.`);
        amountInput.value = '';
      });
      withdrawButton.addEventListener('click', () => {
        const amount = parseInt(amountInput.value);
        if (isNaN(amount) || amount <= 0) {
          showMessage("Por favor, insira um valor válido.");
          return;
        }
        if (amount > gameState.safe) {
          showMessage("Você não tem essa quantia no cofre.");
          return;
        }
        gameState.safe -= amount;
        gameState.money += amount;
        updateDisplay();
        showMessage(`Você retirou R$ ${amount} do cofre.`);
        amountInput.value = '';
      });
    }

    function updateCalendar() {
      const calendarElement = document.getElementById('calendar');
      calendarElement.innerHTML = '<h3>Calendário</h3>';
      const currentEvents = gameState.calendarEvents.filter(event => event.day >= gameState.day);
      currentEvents.slice(0, 5).forEach(event => {
        const eventElement = document.createElement('div');
        eventElement.className = `calendar-item ${event.type}`;
        eventElement.textContent = `Dia ${event.day}: ${event.description}`;
        calendarElement.appendChild(eventElement);
      });
    }

    function updateMap() {
      const mapElement = document.getElementById('map');
      mapElement.innerHTML = '';
      GG_ALL_GAME_CONFIG.scenes.forEach(scene => {
        const locationElement = document.createElement('div');
        locationElement.textContent = scene.emoji;
        locationElement.className = 'map-location';
        locationElement.title = scene.id;
        if (scene.id === gameState.currentScene) {
          locationElement.classList.add('current-location');
        }
        locationElement.onclick = () => moveToLocation(scene.id);
        mapElement.appendChild(locationElement);
      });
    }

    function moveToLocation(sceneId) {
      if (gameState.time >= 5) {
        gameState.time -= 5;
        showScene(sceneId);
        updateDisplay();
      } else {
        showMessage("Você não tem tempo suficiente para se mover. O dia está acabando!");
      }
    }

    function showScene(sceneId) {
      const scene = GG_ALL_GAME_CONFIG.scenes.find(s => s.id === sceneId);
      document.getElementById('scene').textContent = scene.description;
      const choicesElement = document.getElementById('choices');
      choicesElement.innerHTML = '';
      scene.choices.forEach(choice => {
        const button = document.createElement('button');
        button.textContent = choice.text;
        button.onclick = () => makeChoice(choice);
        choicesElement.appendChild(button);
      });
      gameState.currentScene = sceneId;
      updateDisplay();
      showRandomTip();
    }

    function makeChoice(choice) {
      if (gameState.time >= GG_ALL_GAME_CONFIG.timeCost) {
        if (choice.action) {
          performAction(choice.action);
        }
        gameState.time -= GG_ALL_GAME_CONFIG.timeCost;
        updateDisplay();
        if (gameState.time <= 0) {
          endDay();
        }
      } else {
        endDay();
      }
    }


    function endDay() {
        const previousMoney = gameState.money;
        const previousLifeQuality = gameState.lifeQuality;
        
        gameState.day += GG_ALL_GAME_CONFIG.dayIncrement;
        gameState.time = GG_ALL_GAME_CONFIG.maxTime;
    
        let dailyReport = `Dia ${gameState.day - 1} finalizado!\n\n`;
        dailyReport += `Dinheiro inicial: R$ ${previousMoney}\n`;
        dailyReport += `Qualidade de vida inicial: ${previousLifeQuality}%\n\n`;
    
        if (gameState.lifeQuality < 30) {
            gameState.money -= 100;
            dailyReport += "Sua qualidade de vida está muito baixa! Você gastou R$100 em cuidados médicos.\n";
        } else if (gameState.lifeQuality > 70) {
            gameState.money += 100;
            dailyReport += "Sua qualidade de vida está excelente! Você recebeu um bônus de R$100.\n";
        }
        if (gameState.money < 0) {
            gameState.lifeQuality = Math.max(gameState.lifeQuality - 10, GG_ALL_GAME_CONFIG.minLifeQuality);
            dailyReport += "Você está endividado! Sua qualidade de vida diminuiu.\n";
        }

        if (gameState.employees > 0) {
            const salary = gameState.employees * 50;
            gameState.money -= salary;
            dailyReport += `Você pagou R$ ${salary} de salários para seus funcionários.\n`;
        }

        const dailyProfit = 50 + (gameState.employees * 30);
        gameState.money += dailyProfit;
        dailyReport += `Sua lanchonete lucrou R$ ${dailyProfit} hoje.\n`;
    
        for (let i = gameState.investments.length - 1; i >= 0; i--) {
            const investment = gameState.investments[i];
            investment.daysLeft--;
            if (investment.daysLeft === 0) {
                gameState.money += investment.returnAmount;
                dailyReport += `Seu investimento de R$ ${investment.amount} em ${investment.name} rendeu! Você ganhou R$ ${investment.returnAmount - investment.amount} de lucro.\n`;
                gameState.investments.splice(i, 1);
            }
        }
    
        dailyReport += `\nResultados finais:\n`;
        dailyReport += `Dinheiro final: R$ ${gameState.money}\n`;
        dailyReport += `Qualidade de vida final: ${gameState.lifeQuality}%\n\n`;

        showEndDayModal(dailyReport);

        if (gameState.day >= 5) {
            showRanking();
        }
    }
    


    // function endDay() {
    //     const previousMoney = gameState.money;
    //     const previousLifeQuality = gameState.lifeQuality;
        
    //     // Incrementa o dia
    //     gameState.day += GG_ALL_GAME_CONFIG.dayIncrement;
    //     gameState.time = GG_ALL_GAME_CONFIG.maxTime;
        
    //     let dailyReport = `Dia ${gameState.day - 1} finalizado!\n\n`;
    //     dailyReport += `Dinheiro inicial: R$ ${previousMoney}\n`;
    //     dailyReport += `Qualidade de vida inicial: ${previousLifeQuality}%\n\n`;
    
    //     // Verifica se o jogador está endividado
    //     if (gameState.money < 0) {
    //         gameState.lifeQuality = Math.max(gameState.lifeQuality - 10, GG_ALL_GAME_CONFIG.minLifeQuality);
    //         dailyReport += "Você está endividado! Sua qualidade de vida diminuiu.\n";
    //     }
        
    //     // Paga salários dos funcionários
    //     if (gameState.employees > 0) {
    //         const salary = gameState.employees * 50;
    //         gameState.money -= salary;
    //         dailyReport += `Você pagou R$ ${salary} de salários para seus funcionários.\n`;
    //     }
    
    //     // Lucro diário da lanchonete
    //     const dailyProfit = 50 + (gameState.employees * 30);
    //     gameState.money += dailyProfit;
    //     dailyReport += `Sua lanchonete lucrou R$ ${dailyProfit} hoje.\n`;
    
    //     // Processa investimentos
    //     for (let i = gameState.investments.length - 1; i >= 0; i--) {
    //         const investment = gameState.investments[i];
    //         investment.daysLeft--;
    //         if (investment.daysLeft === 0) {
    //             gameState.money += investment.returnAmount;
    //             dailyReport += `Seu investimento de R$ ${investment.amount} em ${investment.name} rendeu! Você ganhou R$ ${investment.returnAmount - investment.amount} de lucro.\n`;
    //             gameState.investments.splice(i, 1);
    //         }
    //     }
    
    //     dailyReport += `\nResultados finais:\n`;
    //     dailyReport += `Dinheiro final: R$ ${gameState.money}\n`;
    //     dailyReport += `Qualidade de vida final: ${gameState.lifeQuality}%\n\n`;
    
    //     dailyReport += "Dicas para o próximo dia:\n";
    //     if (gameState.money < previousMoney) {
    //         dailyReport += "- Tente reduzir seus gastos ou aumentar sua renda.\n";
    //     }
    //     if (gameState.lifeQuality < previousLifeQuality) {
    //         dailyReport += "- Priorize atividades que melhorem sua qualidade de vida.\n";
    //     }
    //     if (gameState.investments.length === 0) {
    //         dailyReport += "- Considere fazer alguns investimentos para ganhos futuros.\n";
    //     }
    //     if (gameState.employees === 0) {
    //         dailyReport += "- Contratar funcionários pode aumentar a renda da sua lanchonete.\n";
    //     }
    
    //     // Exibe o ranking a partir do 5º dia
    //     if (gameState.day >= 5) {
    //         showRanking();  // Mostra o ranking automaticamente
    //     } else {
    //         updateCalendarEvents();
    //         showEndDayModal(dailyReport);  // Continua o jogo até o 5º dia
    //     }
    // }
    





    // function endDay() {
    //   const previousMoney = gameState.money;
    //   const previousLifeQuality = gameState.lifeQuality;
    //   gameState.day += GG_ALL_GAME_CONFIG.dayIncrement;
    //   gameState.time = GG_ALL_GAME_CONFIG.maxTime;
    //   let dailyReport = `Dia ${gameState.day - 1} finalizado!\n\n`;
    //   dailyReport += `Dinheiro inicial: R$ ${previousMoney}\n`;
    //   dailyReport += `Qualidade de vida inicial: ${previousLifeQuality}%\n\n`;
    //   if (gameState.money < 0) {
    //     gameState.lifeQuality = Math.max(gameState.lifeQuality - 10, GG_ALL_GAME_CONFIG.minLifeQuality);
    //     dailyReport += "Você está endividado! Sua qualidade de vida diminuiu.\n";
    //   }
    //   if (gameState.employees > 0) {
    //     const salary = gameState.employees * 50;
    //     gameState.money -= salary;
    //     dailyReport += `Você pagou R$ ${salary} de salários para seus funcionários.\n`;
    //   }
    //   const dailyProfit = 50 + (gameState.employees * 30);
    //   gameState.money += dailyProfit;
    //   dailyReport += `Sua lanchonete lucrou R$ ${dailyProfit} hoje.\n`;
    //   for (let i = gameState.investments.length - 1; i >= 0; i--) {
    //     const investment = gameState.investments[i];
    //     investment.daysLeft--;
    //     if (investment.daysLeft === 0) {
    //       gameState.money += investment.returnAmount;
    //       dailyReport += `Seu investimento de R$ ${investment.amount} em ${investment.name} rendeu! Você ganhou R$ ${investment.returnAmount - investment.amount} de lucro.\n`;
    //       gameState.investments.splice(i, 1);
    //     }
    //   }
    //   dailyReport += `\nResultados finais:\n`;
    //   dailyReport += `Dinheiro final: R$ ${gameState.money}\n`;
    //   dailyReport += `Qualidade de vida final: ${gameState.lifeQuality}%\n\n`;
    //   dailyReport += "Dicas para o próximo dia:\n";
    //   if (gameState.money < previousMoney) {
    //     dailyReport += "- Tente reduzir seus gastos ou aumentar sua renda.\n";
    //   }
    //   if (gameState.lifeQuality < previousLifeQuality) {
    //     dailyReport += "- Priorize atividades que melhorem sua qualidade de vida.\n";
    //   }
    //   if (gameState.investments.length === 0) {
    //     dailyReport += "- Considere fazer alguns investimentos para ganhos futuros.\n";
    //   }
    //   if (gameState.employees === 0) {
    //     dailyReport += "- Contratar funcionários pode aumentar a renda da sua lanchonete.\n";
    //   }
    //   updateCalendarEvents();
    //   showEndDayModal(dailyReport);
    // }

    function updateCalendarEvents() {
      const existingEvents = gameState.calendarEvents.filter(event => event.day > gameState.day);
      const newEvents = [];
      const nextBillDay = gameState.day + (8 - (gameState.day % 8));
      newEvents.push({
        day: nextBillDay,
        type: 'bill',
        description: 'Vencimento das contas'
      });
      gameState.investments.forEach(investment => {
        const returnDay = gameState.day + investment.daysLeft;
        newEvents.push({
          day: returnDay,
          type: 'investment',
          description: `Retorno do investimento em ${investment.name}`
        });
      });
      gameState.calendarEvents = [...existingEvents, ...newEvents];
      gameState.calendarEvents.sort((a, b) => a.day - b.day);
    }

    function showEndDayModal(report) {
      const modal = document.createElement('div');
      modal.style.position = 'fixed';
      modal.style.left = '0';
      modal.style.top = '0';
      modal.style.width = '100%';
      modal.style.height = '100%';
      modal.style.backgroundColor = 'rgba(0,0,0,0.5)';
      modal.style.display = 'flex';
      modal.style.justifyContent = 'center';
      modal.style.alignItems = 'center';
      const content = document.createElement('div');
      content.style.backgroundColor = 'white';
      content.style.padding = '20px';
      content.style.borderRadius = '10px';
      content.style.maxWidth = '80%';
      content.style.maxHeight = '80%';
      content.style.overflow = 'auto';
      const reportPre = document.createElement('pre');
      reportPre.textContent = report;
      content.appendChild(reportPre);
      const button = document.createElement('button');
      button.textContent = 'Iniciar Próximo Dia';
      button.onclick = () => {
        document.body.removeChild(modal);
        updateDisplay();
        showScene('home');
        if (gameState.day >= maxDays) {
          endGame();
        }
      };
      content.appendChild(button);
      modal.appendChild(content);
      document.body.appendChild(modal);
    }



    function performAction(action) {
        switch (action) {
            case 'rest':
                gameState.lifeQuality = Math.min(gameState.lifeQuality + 10, GG_ALL_GAME_CONFIG.maxLifeQuality);
                showMessage("Você descansou e sua qualidade de vida melhorou!");
                break;
            case 'buyFood':
                if (gameState.money >= 50) {
                    gameState.money -= 50;
                    gameState.lifeQuality = Math.min(gameState.lifeQuality + 5, GG_ALL_GAME_CONFIG.maxLifeQuality);
                    showMessage("Você comprou comida e sua qualidade de vida melhorou um pouco!");
                } else {
                    showMessage("Você não tem dinheiro suficiente para comprar comida.");
                }
                break;
            case 'buyClothes':
                if (gameState.money >= 100) {
                    gameState.money -= 100;
                    gameState.lifeQuality = Math.min(gameState.lifeQuality + 8, GG_ALL_GAME_CONFIG.maxLifeQuality);
                    showMessage("Você comprou roupas novas e sua qualidade de vida melhorou!");
                } else {
                    showMessage("Você não tem dinheiro suficiente para comprar roupas.");
                }
                break;
            case 'workCashier':
                let earnings = 100 + (gameState.employees * 50);
                if (gameState.lifeQuality < 30) {
                    earnings = Math.round(earnings * 0.8);
                    showMessage(`Sua qualidade de vida está baixa. Você trabalhou no caixa e ganhou R$ ${earnings}.`);
                } 
                else if (gameState.lifeQuality > 70) {
                    earnings = Math.round(earnings * 1.2); 
                    showMessage(`Você trabalhou no caixa e ganhou R$ ${earnings}. Sua qualidade de vida alta está melhorando seus resultados.`);
                } 
                else {
                    showMessage(`Você trabalhou no caixa e ganhou R$ ${earnings}.`);
                }
    
                gameState.money += earnings;
                gameState.lifeQuality = Math.max(gameState.lifeQuality - 5, GG_ALL_GAME_CONFIG.minLifeQuality);
                break;
            case 'hireEmployee':
                if (gameState.money >= 500) {
                    gameState.money -= 500;
                    gameState.employees++;
                    showMessage(`Você contratou um novo funcionário! Agora você tem ${gameState.employees} funcionário(s).`);
                } else {
                    showMessage("Você não tem dinheiro suficiente para contratar um funcionário.");
                }
                break;
        }
    }
    


    // function performAction(action) {
    //   switch (action) {
    //     case 'rest':
    //       gameState.lifeQuality = Math.min(gameState.lifeQuality + 10, GG_ALL_GAME_CONFIG.maxLifeQuality);
    //       showMessage("Você descansou e sua qualidade de vida melhorou!");
    //       break;
    //     case 'buyFood':
    //       if (gameState.money >= 50) {
    //         gameState.money -= 50;
    //         gameState.lifeQuality = Math.min(gameState.lifeQuality + 5, GG_ALL_GAME_CONFIG.maxLifeQuality);
    //         showMessage("Você comprou comida e sua qualidade de vida melhorou um pouco!");
    //       } else {
    //         showMessage("Você não tem dinheiro suficiente para comprar comida.");
    //       }
    //       break;
    //     case 'buyClothes':
    //       if (gameState.money >= 100) {
    //         gameState.money -= 100;
    //         gameState.lifeQuality = Math.min(gameState.lifeQuality + 8, GG_ALL_GAME_CONFIG.maxLifeQuality);
    //         showMessage("Você comprou roupas novas e sua qualidade de vida melhorou!");
    //       } else {
    //         showMessage("Você não tem dinheiro suficiente para comprar roupas.");
    //       }
    //       break;
    //     case 'payBills':
    //       if (gameState.money >= 200) {
    //         gameState.money -= 200;
    //         gameState.lifeQuality = Math.min(gameState.lifeQuality + 3, GG_ALL_GAME_CONFIG.maxLifeQuality);
    //         showMessage("Você pagou suas contas. Sua qualidade de vida melhorou um pouco por estar em dia!");
    //       } else {
    //         showMessage("Você não tem dinheiro suficiente para pagar as contas. Cuidado com as multas!");
    //         gameState.lifeQuality = Math.max(gameState.lifeQuality - 5, GG_ALL_GAME_CONFIG.minLifeQuality);
    //       }
    //       break;
    //     case 'invest':
    //       showInvestmentOptions();
    //       break;
    //     case 'workCashier':
    //       gameState.money += 100 + (gameState.employees * 50);
    //       gameState.lifeQuality = Math.max(gameState.lifeQuality - 5, GG_ALL_GAME_CONFIG.minLifeQuality);
    //       showMessage(`Você trabalhou no caixa e ganhou R$ ${100 + (gameState.employees * 50)}. Sua qualidade de vida diminuiu um pouco devido ao cansaço.`);
    //       break;
    //     case 'hireEmployee':
    //       if (gameState.money >= 500) {
    //         gameState.money -= 500;
    //         gameState.employees++;
    //         showMessage(`Você contratou um novo funcionário! Agora você tem ${gameState.employees} funcionário(s). Isso aumentará a renda da sua lanchonete.`);
    //       } else {
    //         showMessage("Você não tem dinheiro suficiente para contratar um funcionário.");
    //       }
    //       break;
    //   }
    // }

    function showMessage(message) {
      alert(message);
    }

    function showRandomTip() {
      const tipElement = document.getElementById('tip');
      const randomTip = GG_ALL_GAME_CONFIG.tips[Math.floor(Math.random() * GG_ALL_GAME_CONFIG.tips.length)];
      tipElement.textContent = "Dica: " + randomTip;
    }

    function showInvestmentOptions() {
      const investments = [{
          name: "Poupança",
          description: "Investimento de baixo risco e baixo retorno. Seu dinheiro fica disponível para saque a qualquer momento.",
          minAmount: 50,
          returnRate: 0.01,
          risk: "Baixo",
          period: 2
        },
        {
          name: "CDB",
          description: "Certificado de Depósito Bancário. Renda fixa com retorno um pouco maior que a poupança.",
          minAmount: 100,
          returnRate: 0.02,
          risk: "Baixo",
          period: 3
        },
        {
          name: "Tesouro Direto",
          description: "Títulos públicos do governo. Boa opção para investimento a longo prazo, mas pode ser resgatado antes do prazo.",
          minAmount: 200,
          returnRate: 0.03,
          risk: "Baixo a Médio",
          period: 5
        },
        {
          name: "Ações",
          description: "Compra de parte de empresas na bolsa de valores. Alto risco, mas com potencial de alto retorno.",
          minAmount: 300,
          returnRate: 0.05,
          risk: "Alto",
          period: 4
        }
      ];
      const modal = document.createElement('div');
      modal.style.position = 'fixed';
      modal.style.left = '0';
      modal.style.top = '0';
      modal.style.width = '100%';
      modal.style.height = '100%';
      modal.style.backgroundColor = 'rgba(0,0,0,0.5)';
      modal.style.display = 'flex';
      modal.style.justifyContent = 'center';
      modal.style.alignItems = 'center';
      const content = document.createElement('div');
      content.style.backgroundColor = 'white';
      content.style.padding = '20px';
      content.style.borderRadius = '10px';
      content.style.maxWidth = '80%';
      content.style.maxHeight = '80%';
      content.style.overflow = 'auto';
      investments.forEach(inv => {
        const invDiv = document.createElement('div');
        invDiv.style.marginBottom = '20px';
        invDiv.style.padding = '10px';
        invDiv.style.border = '1px solid #ccc';
        invDiv.style.borderRadius = '5px';
        const nameEl = document.createElement('h3');
        nameEl.textContent = inv.name;
        invDiv.appendChild(nameEl);
        const descEl = document.createElement('p');
        descEl.textContent = inv.description;
        invDiv.appendChild(descEl);
        const detailsEl = document.createElement('p');
        detailsEl.innerHTML = `Valor mínimo: R$ ${inv.minAmount}<br>
Taxa de retorno: ${inv.returnRate * 100}%<br>
Risco: ${inv.risk}<br>
Período: ${inv.period} dias`;
        invDiv.appendChild(detailsEl);
        const amountInput = document.createElement('input');
        amountInput.type = 'number';
        amountInput.min = inv.minAmount;
        amountInput.value = inv.minAmount;
        amountInput.style.marginRight = '10px';
        invDiv.appendChild(amountInput);
        const investButton = document.createElement('button');
        investButton.textContent = 'Investir';
        investButton.onclick = () => {
          const amount = parseInt(amountInput.value);
          if (isNaN(amount) || amount < inv.minAmount) {
            showMessage(`O valor mínimo para este investimento é R$ ${inv.minAmount}.`);
            return;
          }
          if (gameState.money >= amount) {
            gameState.money -= amount;
            const returnAmount = Math.round(amount * (1 + inv.returnRate));
            gameState.investments.push({
              name: inv.name,
              amount: amount,
              returnAmount: returnAmount,
              daysLeft: inv.period,
              canWithdrawEarly: inv.name === "Tesouro Direto"
            });
            gameState.time -= GG_ALL_GAME_CONFIG.timeCost;
            document.body.removeChild(modal);
            showMessage(`Você investiu R$ ${amount} em ${inv.name}. O retorno esperado é de R$ ${returnAmount} em ${inv.period} dias.`);
            updateDisplay();
          } else {
            showMessage("Você não tem dinheiro suficiente para fazer esse investimento.");
          }
        };
        invDiv.appendChild(investButton);
        content.appendChild(invDiv);
      });
      const closeButton = document.createElement('button');
      closeButton.textContent = 'Fechar';
      closeButton.onclick = () => {
        document.body.removeChild(modal);
      };
      content.appendChild(closeButton);
      modal.appendChild(content);
      document.body.appendChild(modal);
    }
    
    // Iniciar o jogo
    updateCalendarEvents();
    updateDisplay();
    showScene(gameState.currentScene);
    initializeSafeControls();